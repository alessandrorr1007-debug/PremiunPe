import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_PRODUCTS, DEFAULT_SETTINGS } from '../lib/mockData';

const StoreContext = createContext(null);
const COMBO_STORAGE_KEY = 'premiumpe_user_combo_v1';

export function StoreProvider({ children }) {
  // Cargar productos locales con fallback a INITIAL_PRODUCTS
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('premiumpe_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (err) {
      console.warn('Error al leer productos locales:', err);
    }
    return INITIAL_PRODUCTS;
  });

  // Cargar settings locales con fallback a DEFAULT_SETTINGS
  const [settings, setSettings] = useState(() => {
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

  // Combo persistente en localStorage con try/catch
  const [combo, setCombo] = useState(() => {
    try {
      const saved = localStorage.getItem(COMBO_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.warn('Error al leer el combo desde localStorage:', err);
    }
    // Combo inicial por defecto (Disney+ y Canva Pro para arrancar con demo)
    return [
      INITIAL_PRODUCTS.find(p => p.id === 'prod-disney') || INITIAL_PRODUCTS[0],
      INITIAL_PRODUCTS.find(p => p.id === 'prod-canva') || INITIAL_PRODUCTS[4]
    ].filter(Boolean);
  });

  // Guardar combo en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(COMBO_STORAGE_KEY, JSON.stringify(combo));
    } catch (err) {
      console.warn('Error al guardar el combo en localStorage:', err);
    }
  }, [combo]);

  // Escuchar eventos en vivo desde el Admin en la misma pestaña y entre pestañas
  useEffect(() => {
    const handleProductsUpdate = (e) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setProducts(e.detail);
      } else {
        try {
          const saved = localStorage.getItem('premiumpe_products');
          if (saved) setProducts(JSON.parse(saved));
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

  // Cargar productos visibles desde Supabase o localStorage
  const loadProducts = useCallback(async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error: supaErr } = await supabase
          .from('products')
          .select('*')
          .eq('visible', true)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (supaErr) throw supaErr;
        if (data && data.length > 0) {
          setProducts(data);
          setError(null);
        }
      } catch (err) {
        console.warn('Usando catálogo local por fallback:', err);
        try {
          const saved = localStorage.getItem('premiumpe_products');
          if (saved) setProducts(JSON.parse(saved));
        } catch (e) {
          // Mantener products
        }
      }
    } else {
      try {
        const saved = localStorage.getItem('premiumpe_products');
        if (saved) setProducts(JSON.parse(saved));
      } catch (e) {
        // Mantener products
      }
    }
  }, []);

  // Cargar configuración de tienda desde Supabase
  const loadSettings = useCallback(async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error: supaErr } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 1)
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
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchData, loadProducts, loadSettings]);

  // Manejador para agregar al combo
  const addToCombo = useCallback((product) => {
    if (!product || product.available === false) return;

    setCombo(prev => {
      // Evitar duplicados exactos si se desea o permitir añadir
      const exists = prev.some(item => item.id === product.id || item.name === product.name);
      if (exists) return prev; // ya está en el combo

      const updated = [...prev, product];
      // Destello especial al llegar o agregar el segundo servicio
      if (updated.length === 2 && !hasSparkled) {
        setShowSparkles(true);
        setHasSparkled(true);
        setTimeout(() => setShowSparkles(false), 2500);
      }
      return updated;
    });
  }, [hasSparkled]);

  // Manejador para quitar del combo
  const removeFromCombo = useCallback((identifier) => {
    setCombo(prev => prev.filter(item => item.id !== identifier && item.name !== identifier));
  }, []);

  const clearCombo = useCallback(() => {
    setCombo([]);
  }, []);

  const value = {
    products,
    settings,
    loading,
    error,
    retryLoad: fetchData,
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
