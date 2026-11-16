import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_PRODUCTS, DEFAULT_SETTINGS } from '../lib/mockData';
import {
  COMBO_STORAGE_KEY, LEGACY_COMBO_KEY, PROMOTION_CART_KEY, canBuy, matchesQuote, readCombo, readPromotionCart
} from '../lib/cart';

const StoreContext = createContext(null);
const liveCatalog = Boolean(supabase && isSupabaseConfigured());

export function StoreProvider({ children }) {
  // Cargar productos locales con fallback a INITIAL_PRODUCTS
  const [products, setProducts] = useState(() => {
    if (liveCatalog) return [];
    try {
      const saved = localStorage.getItem('premiumpe_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.warn('Error al leer productos locales:', err);
    }
    return INITIAL_PRODUCTS;
  });

  // Cargar settings locales con fallback a DEFAULT_SETTINGS
  const [settings, setSettings] = useState(() => {
    if (liveCatalog) return DEFAULT_SETTINGS;
    try {
      const saved = localStorage.getItem('premiumpe_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (err) {
      console.warn('Error al leer configuración local:', err);
    }
    return DEFAULT_SETTINGS;
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [hasSparkled, setHasSparkled] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  const [comboIds, setComboIds] = useState(() => {
    try {
      return readCombo(window.localStorage);
    } catch {
      return [];
    }
  });
  const pendingCatalog = useRef(null);
  const pendingPromotions = useRef(null);
  const [promotions, setPromotions] = useState([]);
  const [promotionCart, setPromotionCart] = useState(() => {
    try {
      return readPromotionCart(window.localStorage);
    } catch {
      return new Map();
    }
  });
  const combo = useMemo(() => {
    const current = new Map(products.filter(canBuy).map(product => [product.id, product]));
    const offers = promotions.filter(offer => promotionCart.has(offer.id)).map(offer => ({
      ...offer, kind: 'promotion', available: true, quantity: promotionCart.get(offer.id)
    }));
    return [...comboIds.map(id => current.get(id)).filter(Boolean), ...offers];
  }, [comboIds, products, promotions, promotionCart]);

  useEffect(() => {
    try {
      localStorage.setItem(COMBO_STORAGE_KEY, JSON.stringify(comboIds));
      localStorage.removeItem(LEGACY_COMBO_KEY);
    } catch {
      // In private or restricted storage the current selection still works.
    }
  }, [comboIds]);

  useEffect(() => {
    try {
      localStorage.setItem(PROMOTION_CART_KEY, JSON.stringify([...promotionCart]));
    } catch {
      // The current selection still works without storage.
    }
  }, [promotionCart]);

  useEffect(() => {
    if (loading || error) return;
    const availableIds = new Set(products.filter(canBuy).map(product => product.id));
    setComboIds(ids => ids.every(id => availableIds.has(id)) ? ids : ids.filter(id => availableIds.has(id)));
  }, [products, loading, error]);

  // Escuchar eventos en vivo desde el Admin en la misma pestaña y entre pestañas
  useEffect(() => {
    if (liveCatalog) return;
    const handleProductsUpdate = (e) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setProducts(e.detail);
      } else {
        try {
          const saved = localStorage.getItem('premiumpe_products');
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setProducts(parsed);
        } catch (err) {
          console.warn(err);
        }
      }
    };

    const handleSettingsUpdate = (e) => {
      if (e?.detail) {
        setSettings(prev => ({ ...prev, ...e.detail }));
      } else {
        try {
          const saved = localStorage.getItem('premiumpe_settings');
          if (saved) setSettings(prev => ({ ...prev, ...JSON.parse(saved) }));
        } catch (err) {
          console.warn(err);
        }
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === 'premiumpe_products') handleProductsUpdate({});
      if (e.key === 'premiumpe_settings') handleSettingsUpdate({});
    };

    window.addEventListener('premiumpe_products_changed', handleProductsUpdate);
    window.addEventListener('premiumpe_settings_changed', handleSettingsUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('premiumpe_products_changed', handleProductsUpdate);
      window.removeEventListener('premiumpe_settings_changed', handleSettingsUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const loadProducts = useCallback(async () => {
    if (!liveCatalog) return null;
    if (pendingCatalog.current) return pendingCatalog.current;

    const request = (async () => {
      try {
        const { data, error: requestError } = await supabase
          .from('products')
          .select('*')
          .eq('visible', true)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false })
          .abortSignal(AbortSignal.timeout(10000));

        if (requestError) throw requestError;
        setProducts(data);
        setError(null);
        return data;
      } catch {
        setError('No pudimos actualizar el catálogo. Intenta nuevamente.');
        return null;
      } finally {
        pendingCatalog.current = null;
      }
    })();
    pendingCatalog.current = request;
    return request;
  }, []);

  // Cargar configuración de tienda desde Supabase
  const loadSettings = useCallback(async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error: supaErr } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 1)
          .abortSignal(AbortSignal.timeout(10000))
          .maybeSingle();

        if (supaErr) throw supaErr;
        setSettings(prev => ({
          ...prev,
          ...data,
          social_links: data?.social_links ?? {},
          faq: Array.isArray(data?.faq) && data.faq.length > 0 ? data.faq : prev.faq
        }));
      } catch (err) {
        console.warn('Usando configuración fallback:', err);
      }
    }
  }, []);

  const loadPromotions = useCallback(async () => {
    if (!liveCatalog) return;
    if (pendingPromotions.current) return pendingPromotions.current;
    const request = (async () => {
      try {
        const { data, error: requestError } = await supabase.from('current_promotions')
          .select('*').order('name').order('id').abortSignal(AbortSignal.timeout(10000));
        if (requestError) throw requestError;
        setPromotions(data);
        setPromotionCart(cart => {
          const available = new Set(data.map(offer => offer.id));
          const valid = [...cart].filter(([id]) => available.has(id));
          return valid.length === cart.size ? cart : new Map(valid);
        });
      } catch {
        setPromotions([]);
      } finally {
        pendingPromotions.current = null;
      }
    })();
    pendingPromotions.current = request;
    return request;
  }, []);

  useEffect(() => {
    const deadlines = promotions.filter(offer => offer.ends_at).map(offer => Date.parse(offer.ends_at));
    if (!deadlines.length) return;
    const delay = Math.max(0, Math.min(...deadlines) - Date.now());
    if (delay > 30000) return;
    const timer = window.setTimeout(() => {
      setPromotions(offers => offers.filter(offer => !offer.ends_at || Date.parse(offer.ends_at) > Date.now()));
      loadPromotions();
    }, delay);
    return () => window.clearTimeout(timer);
  }, [loadPromotions, promotions]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      loadPromotions();
      await Promise.all([loadProducts(), loadSettings()]);
    } catch (err) {
      setError(err.message || 'Error cargando datos de la tienda');
    } finally {
      setLoading(false);
    }
  }, [loadProducts, loadSettings, loadPromotions]);

  useEffect(() => {
    fetchData();

    // Sincronización en tiempo real (PostgreSQL changes)
    if (isSupabaseConfigured() && supabase) {
      const refresh = () => {
        if (document.visibilityState === 'hidden') return;
        loadProducts();
        loadSettings();
        loadPromotions();
      };
      const channel = supabase
        .channel('public-store-sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          () => {
            loadProducts();
            loadPromotions();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'settings' },
          () => {
            loadSettings();
          }
        )
        .subscribe(status => {
          if (status === 'SUBSCRIBED') refresh();
        });

      const interval = window.setInterval(refresh, 30000);
      window.addEventListener('focus', refresh);

      return () => {
        window.clearInterval(interval);
        window.removeEventListener('focus', refresh);
        supabase.removeChannel(channel);
      };
    }
  }, [fetchData, loadProducts, loadSettings, loadPromotions]);

  const addToCombo = useCallback((product) => {
    const current = products.find(item => item.id === product?.id);
    if (loading || error || !canBuy(current)) return;
    setComboIds(ids => ids.includes(current.id) ? ids : [...ids, current.id]);
  }, [products, loading, error]);

  useEffect(() => {
    if (combo.length === 2 && !hasSparkled) {
      setShowSparkles(true);
      setHasSparkled(true);
    }
  }, [combo.length, hasSparkled]);

  useEffect(() => {
    if (!showSparkles) return;
    const timer = setTimeout(() => setShowSparkles(false), 2500);
    return () => clearTimeout(timer);
  }, [showSparkles]);

  const removeFromCombo = useCallback((id) => {
    setComboIds(ids => ids.filter(item => item !== id));
  }, []);

  const setPromotionQuantity = useCallback((id, quantity) => {
    setPromotionCart(cart => {
      const next = new Map(cart);
      if (quantity === 0) next.delete(id);
      else next.set(id, Math.min(99, Math.max(1, quantity)));
      return next;
    });
  }, []);

  const clearCombo = useCallback(() => {
    setComboIds([]);
    setPromotionCart(new Map());
  }, []);

  const validateOrder = async (items) => {
    if (items.some(item => item.kind === 'promotion')) {
      try {
        const { data, error: quoteError } = await supabase.rpc('quote_promotion_order', {
          p_lines: items.map(item => ({ id: item.id, kind: item.kind ?? 'product', quantity: item.quantity ?? 1 }))
        }).abortSignal(AbortSignal.timeout(10000));
        if (quoteError) throw quoteError;
        if (Array.isArray(data) && data.length === items.length && items.every((item, index) => matchesQuote(item, data[index]))) {
          return { quote: data };
        }
        await Promise.all([loadProducts(), loadPromotions()]);
        return 'El precio, el contenido o la disponibilidad cambió. Revisa el pedido actualizado.';
      } catch {
        return 'No pudimos verificar el pedido. Intenta nuevamente.';
      }
    }
    const current = liveCatalog ? await loadProducts() : products;
    if (!current) return 'No pudimos verificar el pedido. Intenta nuevamente.';
    for (const item of items) {
      const latest = current.find(product => product.id === item.id);
      if (!canBuy(latest)) return 'Cambió la disponibilidad. Revisa tu pedido.';
      if (Number(latest.price) !== Number(item.price) || latest.name !== item.name) {
        return 'El pedido cambió. Revisa los datos actualizados antes de continuar.';
      }
    }
    return null;
  };

  const value = {
    products,
    promotions,
    promotionCart,
    setPromotionQuantity,
    settings,
    loading,
    error,
    retryLoad: fetchData,
    validateOrder,
    combo,
    addToCombo,
    removeFromCombo,
    clearCombo,
    showSparkles,
    commandPaletteOpen,
    setCommandPaletteOpen
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore debe ser usado dentro de un StoreProvider');
  }
  return context;
}
