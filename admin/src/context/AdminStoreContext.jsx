import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_PRODUCTS, DEFAULT_SETTINGS } from '../lib/mockData';

const AdminStoreContext = createContext(null);

export function AdminStoreProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  const loadProducts = useCallback(async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
        setIsLive(true);
      } catch (err) {
        setIsLive(false);
        showToast('No se pudieron cargar los productos de Supabase.', 'error');
      }
    } else {
      fallbackLocalProducts();
    }
  }, [showToast]);

  const fallbackLocalProducts = () => {
    const saved = localStorage.getItem('premiumpe_products');
    if (saved) {
      try {
        setProducts(JSON.parse(saved));
      } catch {
        setProducts(INITIAL_PRODUCTS);
      }
    } else {
      setProducts(INITIAL_PRODUCTS);
    }
    setIsLive(false);
  };

  const loadSettings = useCallback(async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 1)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (data) {
          setSettings(data);
        }
      } catch (err) {
        showToast('No se pudo cargar la configuración de Supabase.', 'error');
      }
    } else {
      fallbackLocalSettings();
    }
  }, [showToast]);

  const fallbackLocalSettings = () => {
    const saved = localStorage.getItem('premiumpe_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch {
        setSettings(DEFAULT_SETTINGS);
      }
    } else {
      setSettings(DEFAULT_SETTINGS);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadProducts(), loadSettings()]);
      setLoading(false);
    };

    init();

    if (isSupabaseConfigured() && supabase) {
      const channel = supabase
        .channel('admin-db-changes')
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
  }, [loadProducts, loadSettings]);

  const persistLocalProducts = (updated) => {
    setProducts(updated);
    localStorage.setItem('premiumpe_products', JSON.stringify(updated));
  };

  const persistLocalSettings = (updated) => {
    setSettings(updated);
    localStorage.setItem('premiumpe_settings', JSON.stringify(updated));
  };

  // 1. Edición rápida de precio
  const quickUpdatePrice = async (id, newPrice) => {
    const parsedPrice = Number(newPrice);
    if (String(newPrice ?? '').trim() === '' || !Number.isFinite(parsedPrice) || parsedPrice < 0 || parsedPrice > 99999999.99) {
      showToast('El precio debe ser un número válido y no negativo.', 'error');
      return false;
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('products')
          .update({ price: parsedPrice })
          .eq('id', id).select('id').single();

        if (error) throw error;
        showToast('Precio actualizado en Supabase.', 'success');
        await loadProducts();
        return true;
      } catch (err) {
        showToast('Error al actualizar precio: ' + err.message, 'error');
        return false;
      }
    } else {
      const updated = products.map((p) =>
        p.id === id ? { ...p, price: parsedPrice } : p
      );
      persistLocalProducts(updated);
      showToast('Precio actualizado (modo demo).', 'success');
      return true;
    }
  };

  // 2. Disponibilidad
  const toggleProductAvailability = async (id) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const nextStatus = !product.available;

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('products')
          .update({ available: nextStatus })
          .eq('id', id).select('id').single();

        if (error) throw error;
        showToast(`Marcado como ${nextStatus ? 'Disponible' : 'Agotado'}.`, 'success');
        await loadProducts();
      } catch (err) {
        showToast('Error al cambiar disponibilidad: ' + err.message, 'error');
      }
    } else {
      const updated = products.map((p) =>
        p.id === id ? { ...p, available: nextStatus } : p
      );
      persistLocalProducts(updated);
      showToast(`Marcado como ${nextStatus ? 'Disponible' : 'Agotado'}.`, 'success');
    }
  };

  // 3. Visibilidad
  const toggleProductVisibility = async (id) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const nextVisible = !product.visible;

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('products')
          .update({ visible: nextVisible })
          .eq('id', id).select('id').single();

        if (error) throw error;
        showToast(`Visibilidad ${nextVisible ? 'activada' : 'oculta'} en el catálogo.`, 'info');
        await loadProducts();
      } catch (err) {
        showToast('Error al cambiar visibilidad: ' + err.message, 'error');
      }
    } else {
      const updated = products.map((p) =>
        p.id === id ? { ...p, visible: nextVisible } : p
      );
      persistLocalProducts(updated);
      showToast(`Visibilidad ${nextVisible ? 'activada' : 'oculta'}.`, 'info');
    }
  };

  // 4. Destacado
  const toggleProductFeatured = async (id) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const nextFeatured = !product.featured;

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('products')
          .update({ featured: nextFeatured })
          .eq('id', id).select('id').single();

        if (error) throw error;
        showToast(`Producto ${nextFeatured ? 'destacado' : 'normal'}.`, 'info');
        await loadProducts();
      } catch (err) {
        showToast('Error al cambiar destacado: ' + err.message, 'error');
      }
    } else {
      const updated = products.map((p) =>
        p.id === id ? { ...p, featured: nextFeatured } : p
      );
      persistLocalProducts(updated);
      showToast(`Producto ${nextFeatured ? 'destacado' : 'normal'}.`, 'info');
    }
  };

  // 5. Crear
  const addProduct = async (productData) => {
    const price = Number(productData.price);
    if (!productData.name?.trim() || String(productData.price ?? '').trim() === '' ||
        !Number.isFinite(price) || price < 0 || price > 99999999.99) {
      throw new Error('Ingresa un nombre y un precio válido.');
    }
    const cleanData = {
      name: productData.name.trim(),
      description: productData.description?.trim() || '',
      category: productData.category || 'Streaming',
      delivery_type: productData.delivery_type || 'perfil',
      includes: Array.isArray(productData.includes) ? productData.includes.slice(0, 3) : [],
      accent: productData.accent || 'aji',
      price,
      image_url: productData.image_url?.trim() || '',
      available: productData.available ?? true,
      visible: productData.visible ?? true,
      featured: productData.featured ?? false,
      sort_order: parseInt(productData.sort_order, 10) || 0,
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .insert([cleanData])
          .select();

        if (error) throw error;
        showToast('¡Producto creado con éxito!', 'success');
        await loadProducts();
        return data?.[0];
      } catch (err) {
        showToast('Error al crear producto: ' + err.message, 'error');
        throw err;
      }
    } else {
      const newProduct = {
        ...cleanData,
        id: 'prod-' + Date.now(),
        created_at: new Date().toISOString(),
      };
      const updated = [newProduct, ...products];
      persistLocalProducts(updated);
      showToast('¡Producto creado con éxito!', 'success');
      return newProduct;
    }
  };

  // 6. Editar
  const updateProduct = async (id, productData) => {
    const price = Number(productData.price);
    if (!productData.name?.trim() || String(productData.price ?? '').trim() === '' ||
        !Number.isFinite(price) || price < 0 || price > 99999999.99) {
      throw new Error('Ingresa un nombre y un precio válido.');
    }
    const cleanData = {
      name: productData.name.trim(),
      description: productData.description?.trim() || '',
      category: productData.category || 'Streaming',
      delivery_type: productData.delivery_type || 'perfil',
      includes: Array.isArray(productData.includes) ? productData.includes.slice(0, 3) : [],
      accent: productData.accent || 'aji',
      price,
      image_url: productData.image_url?.trim() || '',
      available: productData.available ?? true,
      visible: productData.visible ?? true,
      featured: productData.featured ?? false,
      sort_order: parseInt(productData.sort_order, 10) || 0,
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .update(cleanData)
          .eq('id', id)
          .select().single();

        if (error) throw error;
        showToast('¡Producto actualizado con éxito!', 'success');
        await loadProducts();
        return data;
      } catch (err) {
        showToast('Error al actualizar: ' + err.message, 'error');
        throw err;
      }
    } else {
      const updated = products.map((p) =>
        p.id === id ? { ...p, ...cleanData } : p
      );
      persistLocalProducts(updated);
      showToast('¡Producto actualizado con éxito!', 'success');
      return { id, ...cleanData };
    }
  };

  // 7. Eliminar
  const deleteProduct = async (id) => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id).select('id').single();

        if (error) throw error;
        showToast('Producto eliminado.', 'info');
        await loadProducts();
        return true;
      } catch (err) {
        showToast('Error al eliminar: ' + err.message, 'error');
        return false;
      }
    } else {
      const updated = products.filter((p) => p.id !== id);
      persistLocalProducts(updated);
      showToast('Producto eliminado.', 'info');
      return true;
    }
  };

  // 7b. Duplicar producto
  const duplicateProduct = async (id) => {
    const original = products.find((p) => p.id === id);
    if (!original) return null;

    const copyData = {
      name: `${original.name} (Copia)`,
      description: original.description || '',
      category: original.category,
      delivery_type: original.delivery_type || 'perfil',
      includes: Array.isArray(original.includes) ? [...original.includes] : [],
      accent: original.accent || 'aji',
      price: original.price,
      image_url: original.image_url || '',
      available: original.available,
      visible: false, // Por seguridad, visible en falso hasta que el admin decida publicarlo
      featured: false,
      sort_order: (original.sort_order || 0) + 1,
    };

    return await addProduct(copyData);
  };

  // 7c. Acciones masivas
  const bulkUpdateAvailability = async (ids, available) => {
    if (!ids || ids.length === 0) return;

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .update({ available })
          .in('id', ids).select('id');

        if (error) throw error;
        if (data.length !== new Set(ids).size) {
          await loadProducts();
          throw new Error('La operación no se aplicó a todos los productos.');
        }
        showToast(`${ids.length} productos marcados como ${available ? 'Disponibles' : 'Agotados'}.`, 'success');
        await loadProducts();
      } catch (err) {
        showToast('Error en acción masiva: ' + err.message, 'error');
      }
    } else {
      const updated = products.map((p) =>
        ids.includes(p.id) ? { ...p, available } : p
      );
      persistLocalProducts(updated);
      showToast(`${ids.length} productos marcados como ${available ? 'Disponibles' : 'Agotados'}.`, 'success');
    }
  };

  const bulkUpdateVisibility = async (ids, visible) => {
    if (!ids || ids.length === 0) return;

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .update({ visible })
          .in('id', ids).select('id');

        if (error) throw error;
        if (data.length !== new Set(ids).size) {
          await loadProducts();
          throw new Error('La operación no se aplicó a todos los productos.');
        }
        showToast(`${ids.length} productos marcados como ${visible ? 'Visibles' : 'Ocultos'}.`, 'info');
        await loadProducts();
      } catch (err) {
        showToast('Error en acción masiva: ' + err.message, 'error');
      }
    } else {
      const updated = products.map((p) =>
        ids.includes(p.id) ? { ...p, visible } : p
      );
      persistLocalProducts(updated);
      showToast(`${ids.length} productos marcados como ${visible ? 'Visibles' : 'Ocultos'}.`, 'info');
    }
  };

  const bulkDelete = async (ids) => {
    if (!ids || ids.length === 0) return;

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .delete()
          .in('id', ids).select('id');

        if (error) throw error;
        if (data.length !== new Set(ids).size) {
          await loadProducts();
          throw new Error('La operación no se aplicó a todos los productos.');
        }
        showToast(`${ids.length} productos eliminados con éxito.`, 'info');
        await loadProducts();
        return true;
      } catch (err) {
        showToast('Error al eliminar en lote: ' + err.message, 'error');
        return false;
      }
    } else {
      const updated = products.filter((p) => !ids.includes(p.id));
      persistLocalProducts(updated);
      showToast(`${ids.length} productos eliminados con éxito.`, 'info');
      return true;
    }
  };

  const reorderAllProducts = async (orderedProducts) => {
    const included = new Set(orderedProducts.map(product => product.id));
    let next = 0;
    const merged = products.map(product => included.has(product.id) ? orderedProducts[next++] : product);
    const updated = merged.map((product, index) => ({ ...product, sort_order: index + 1 }));

    if (!isSupabaseConfigured() || !supabase) {
      persistLocalProducts(updated);
      return;
    }

    const previousOrders = new Map(products.map(product => [product.id, product.sort_order]));
    const changed = updated.filter(product => previousOrders.get(product.id) !== product.sort_order);
    try {
      const results = await Promise.all(changed.map(product => supabase
        .from('products')
        .update({ sort_order: product.sort_order })
        .eq('id', product.id)
        .select('id')
        .single()));
      if (results.some(result => result.error)) {
        showToast('No se pudo aplicar todo el orden. Revisa el catálogo actualizado.', 'error');
      }
    } catch {
      showToast('No se pudo guardar el orden.', 'error');
    } finally {
      await loadProducts();
    }
  };

  const reorderProduct = async (id, direction) => {
    const index = products.findIndex(product => product.id === id);
    const target = direction === 'up' ? index - 1 : index + 1;
    if (index === -1 || target < 0 || target >= products.length) return;

    const ordered = [...products];
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    await reorderAllProducts(ordered);
  };

  // 8. Configuración
  const updateSettings = async (newSettings) => {
    const cleanSettings = {
      id: 1,
      whatsapp_number: newSettings.whatsapp_number?.replace(/[^\d]/g, '') || '51942990279',
      store_name: newSettings.store_name?.trim() || 'PremiumPe',
      hero_badge: newSettings.hero_badge?.trim() || 'Perú Express',
      hero_title: newSettings.hero_title?.trim() || 'Tus plataformas favoritas, al precio justo',
      hero_subtitle: newSettings.hero_subtitle?.trim() || 'Elige, combina y pide por WhatsApp en minutos.',
      support_hours: newSettings.support_hours?.trim() || '',
      response_time: newSettings.response_time?.trim() || '',
      payment_methods: newSettings.payment_methods?.trim() || 'Yape y Plin',
      warranty_text: newSettings.warranty_text?.trim() || '',
      faq: Array.isArray(newSettings.faq) ? newSettings.faq : DEFAULT_SETTINGS.faq,
      currency: newSettings.currency?.trim() || 'S/',
      social_links: newSettings.social_links || DEFAULT_SETTINGS.social_links,
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('settings')
          .upsert(cleanSettings).select('id').single();

        if (error) throw error;
        setSettings(cleanSettings);
        showToast('Configuración guardada en Supabase.', 'success');
        return true;
      } catch (err) {
        showToast('Error al guardar configuración: ' + err.message, 'error');
        return false;
      }
    } else {
      persistLocalSettings(cleanSettings);
      showToast('Configuración guardada al instante.', 'success');
      return true;
    }
  };

  const value = {
    products,
    settings,
    loading,
    isLive,
    toast,
    showToast,
    loadProducts,
    loadSettings,
    quickUpdatePrice,
    toggleProductAvailability,
    toggleProductVisibility,
    toggleProductFeatured,
    addProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    bulkUpdateAvailability,
    bulkUpdateVisibility,
    bulkDelete,
    reorderProduct,
    reorderAllProducts,
    updateSettings,
  };

  return <AdminStoreContext.Provider value={value}>{children}</AdminStoreContext.Provider>;
}

export function useAdminStore() {
  const context = useContext(AdminStoreContext);
  if (!context) {
    throw new Error('useAdminStore debe ser usado dentro de un AdminStoreProvider');
  }
  return context;
}
