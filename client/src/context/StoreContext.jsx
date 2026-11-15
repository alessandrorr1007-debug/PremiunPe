import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_PRODUCTS, DEFAULT_SETTINGS } from '../lib/mockData';
import { COMBO_STORAGE_KEY, LEGACY_COMBO_KEY, canBuy, readCombo } from '../lib/cart';

const StoreContext = createContext(null);
const liveCatalog = Boolean(supabase && isSupabaseConfigured());

export function StoreProvider({ children }) {
  const [products, setProducts] = useState(() => liveCatalog ? [] : INITIAL_PRODUCTS);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
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
  const combo = useMemo(() => {
    const current = new Map(products.filter(canBuy).map(product => [product.id, product]));
    return comboIds.map(id => current.get(id)).filter(Boolean);
  }, [comboIds, products]);

  useEffect(() => {
    try {
      localStorage.setItem(COMBO_STORAGE_KEY, JSON.stringify(comboIds));
      localStorage.removeItem(LEGACY_COMBO_KEY);
    } catch {
      // In private or restricted storage the current selection still works.
    }
  }, [comboIds]);

  useEffect(() => {
    if (loading || error) return;
    const availableIds = new Set(products.filter(canBuy).map(product => product.id));
    setComboIds(ids => ids.every(id => availableIds.has(id)) ? ids : ids.filter(id => availableIds.has(id)));
  }, [products, loading, error]);

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
          .single();

        if (supaErr && supaErr.code !== 'PGRST116') throw supaErr;
        if (data) {
          setSettings(prev => ({
            ...prev,
            ...data,
            // Fallback de social_links y faq si vienen nulos
            social_links: data.social_links || prev.social_links,
            faq: data.faq && Array.isArray(data.faq) && data.faq.length > 0 ? data.faq : prev.faq
          }));
        }
      } catch (err) {
        console.warn('Usando configuración fallback:', err);
      }
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadProducts(), loadSettings()]);
    } catch (err) {
      setError(err.message || 'Error cargando datos de la tienda');
    } finally {
      setLoading(false);
    }
  }, [loadProducts, loadSettings]);

  useEffect(() => {
    fetchData();

    // Sincronización en tiempo real (PostgreSQL changes)
    if (isSupabaseConfigured() && supabase) {
      const channel = supabase
        .channel('public-store-sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          () => {
            loadProducts();
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
          if (status === 'SUBSCRIBED') loadProducts();
        });

      const refreshOnFocus = () => loadProducts();
      window.addEventListener('focus', refreshOnFocus);

      return () => {
        window.removeEventListener('focus', refreshOnFocus);
        supabase.removeChannel(channel);
      };
    }
  }, [fetchData, loadProducts, loadSettings]);

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

  const clearCombo = useCallback(() => setComboIds([]), []);

  const validateOrder = async (items) => {
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
