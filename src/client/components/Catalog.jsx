import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import ProductCard from './ProductCard';
import { Search, AlertTriangle, RefreshCw, X, Play, Paintbrush, Sparkles } from 'lucide-react';

const categories = [
  { name: 'Todos' },
  { name: 'Streaming', Icon: Play },
  { name: 'Herramientas', Icon: Paintbrush },
  { name: 'IA', Icon: Sparkles },
];

export default function Catalog() {
  const { products, loading, error, retryLoad } = useStore();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  // Filtrado reactivo por categoría y búsqueda
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.visible) return false;
      const matchesCategory =
        selectedCategory === 'Todos' || p.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);


  return (
    <section className="market-catalog max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="catalogo" aria-label="Catálogo">
      <div className="market-search">
        <Search size={21} aria-hidden="true" />
        <input type="search" aria-label="Buscar servicio" placeholder="Buscar servicio"
          value={searchQuery} onChange={event => setSearchQuery(event.target.value)} />
        {searchQuery && <button type="button" onClick={() => setSearchQuery('')} aria-label="Limpiar búsqueda"><X size={18} /></button>}
      </div>
      <div className="market-filters" aria-label="Categorías">
        {categories.map(({ name, Icon }) => (
          <button type="button" key={name} aria-pressed={selectedCategory === name}
            onClick={() => setSelectedCategory(name)}>
            {Icon && <Icon size={16} aria-hidden="true" />}{name}
          </button>
        ))}
      </div>
      <p role="status" className="sr-only">{loading ? 'Cargando servicios' : error ? 'Catálogo no disponible' : `${filteredProducts.length} servicios`}</p>
      {selectedCategory === 'Streaming' && (
        <p className="market-notice">Los planes de streaming son perfiles individuales con PIN.</p>
      )}
      {error && (
        <div className="p-8 rounded-3xl bg-night/20 border border-zinc-500/30 text-center my-8">
          <AlertTriangle className="w-8 h-8 text-muted mx-auto mb-2" />
          <h3 className="font-sora font-bold text-cream text-base mb-1">
            No se pudo cargar el catálogo
          </h3>
          <p className="text-xs text-muted max-w-md mx-auto mb-4">{error}</p>
          <button
            type="button"
            onClick={retryLoad}
            className="px-5 py-2.5 rounded-xl bg-ink/10 hover:bg-ink/20 text-cream text-xs font-sora font-semibold inline-flex items-center gap-2 transition-all min-h-[44px]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reintentar</span>
          </button>
        </div>
      )}

      {/* ESTADO DE CARGA SHIMMER SKELETON */}
      {loading && !error && (
        <div className="market-grid">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-[24px] bg-ink/[0.03] border border-borderCream p-6 flex flex-col justify-between animate-pulse"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-ink/10" />
                  <div className="w-24 h-6 rounded-full bg-ink/10" />
                </div>
                <div className="w-3/4 h-5 rounded-lg bg-ink/10 mb-3" />
                <div className="w-full h-3 rounded bg-ink/5 mb-1.5" />
                <div className="w-4/5 h-3 rounded bg-ink/5" />
              </div>
              <div>
                <div className="w-28 h-8 rounded-lg bg-ink/10 mb-4" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-10 rounded-xl bg-ink/10" />
                  <div className="h-10 rounded-xl bg-ink/10" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ESTADO VACÍO AMIGABLE */}
      {!loading && !error && filteredProducts.length === 0 && (
        <div className="p-12 rounded-3xl bg-ink/[0.02] border border-borderCream text-center my-8">
          <Search className="w-10 h-10 text-muted mx-auto mb-3 opacity-60" />
          <h3 className="font-sora font-bold text-cream text-lg mb-1">
            No se encontraron servicios
          </h3>
          <p className="text-xs text-muted max-w-sm mx-auto mb-4">
            No hay productos que coincidan con "{searchQuery || selectedCategory}". Intenta buscar con otro término.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('Todos');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-aji text-night text-xs font-sora font-bold hover:brightness-110 transition-all min-h-[44px]"
          >
            Ver todos los servicios
          </button>
        </div>
      )}


      {!loading && !error && filteredProducts.length > 0 && (
        <div className="market-grid">
          {filteredProducts.map(product => <ProductCard key={product.id || product.name} product={product} />)}
        </div>
      )}
      {selectedCategory === 'Todos' && !loading && !error && filteredProducts.some(product => product.category === 'Streaming') && (
        <p className="market-notice market-notice-bottom">Los planes de streaming son perfiles individuales con PIN.</p>
      )}
    </section>
  );
}
