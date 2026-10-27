import React, { useState, useMemo, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import ProductCard from './ProductCard';
import { Search, AlertTriangle, RefreshCw, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Catalog() {
  const { products, loading, error, retryLoad } = useStore();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const carouselRef = useRef(null);
  const carouselId = useId();
  const reduceMotion = useReducedMotion();
  const [carouselEdges, setCarouselEdges] = useState({ start: true, end: false });


  // Contadores dinámicos para los chips de filtro
  const counts = useMemo(() => {
    const list = products.filter(p => p.visible);
    return {
      Todos: list.length,
      Streaming: list.filter(p => p.category === 'Streaming').length,
      Herramientas: list.filter(p => p.category === 'Herramientas').length,
      IA: list.filter(p => p.category === 'IA').length,
    };
  }, [products]);

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

  useEffect(() => {
    const element = carouselRef.current;
    if (!element) return;
    const updateEdges = () => setCarouselEdges({
      start: element.scrollLeft <= 2,
      end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2,
    });
    updateEdges();
    const observer = new ResizeObserver(updateEdges);
    observer.observe(element);
    const childrenObserver = new MutationObserver(updateEdges);
    childrenObserver.observe(element, { childList: true });
    element.addEventListener('scroll', updateEdges, { passive: true });
    return () => { observer.disconnect(); childrenObserver.disconnect(); element.removeEventListener('scroll', updateEdges); };
  }, [filteredProducts, loading, error]);

  useEffect(() => {
    carouselRef.current?.scrollTo({ left: 0, behavior: 'instant' });
  }, [selectedCategory, searchQuery]);

  const moveCarousel = direction => {
    const element = carouselRef.current;
    if (!element) return;
    const card = element.firstElementChild;
    const step = (card?.offsetWidth || element.clientWidth) + 24;
    element.scrollBy({ left: step * direction, behavior: reduceMotion ? 'instant' : 'smooth' });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="catalogo">
      
      {/* AVISO VISIBLE SOBRE EL CATÁLOGO (Streaming: perfiles con PIN) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="catalog-notice mb-8 p-4 rounded-2xl bg-aji/10 border border-aji/30 flex items-center gap-3 text-cream shadow-sm"
      >
        <span className="text-xl shrink-0" role="img" aria-label="Aviso">
          ⓘ
        </span>
        <div className="text-xs sm:text-sm font-medium">
          <strong className="text-aji">Streaming:</strong> son perfiles individuales con PIN, no cuentas completas.
        </div>
      </motion.div>

      {/* CONTROLES DE FILTRO Y BUSCADOR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-5">
        
        {/* Chips de Categoría con Contador */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Todos */}
          <button
            type="button"
            data-category="Todos"
            aria-pressed={selectedCategory === 'Todos'}
            onClick={() => setSelectedCategory('Todos')}
            className={`filter-btn px-4 py-2 rounded-full font-sora font-bold text-xs transition-all min-h-[44px] ${
              selectedCategory === 'Todos'
                ? 'bg-aji text-night shadow-sm'
                : 'bg-ink/[0.05] border border-borderCream text-cream hover:border-cream/30'
            }`}
          >
            Todos ({counts.Todos})
          </button>

          {/* Streaming */}
          <button
            type="button"
            data-category="Streaming"
            aria-pressed={selectedCategory === 'Streaming'}
            onClick={() => setSelectedCategory('Streaming')}
            className={`filter-btn px-4 py-2 rounded-full font-sora font-semibold text-xs flex items-center gap-1.5 transition-all min-h-[44px] ${
              selectedCategory === 'Streaming'
                ? 'bg-action text-actionInk shadow-sm'
                : 'bg-ink/[0.05] border border-borderCream text-cream hover:border-rocoto hover:text-rocoto'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rocoto" />
            Streaming ({counts.Streaming})
          </button>

          {/* Herramientas */}
          <button
            type="button"
            data-category="Herramientas"
            aria-pressed={selectedCategory === 'Herramientas'}
            onClick={() => setSelectedCategory('Herramientas')}
            className={`filter-btn px-4 py-2 rounded-full font-sora font-semibold text-xs flex items-center gap-1.5 transition-all min-h-[44px] ${
              selectedCategory === 'Herramientas'
                ? 'bg-lime text-night shadow-sm'
                : 'bg-ink/[0.05] border border-borderCream text-cream hover:border-lime hover:text-lime'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-lime" />
            Herramientas ({counts.Herramientas})
          </button>

          {/* IA */}
          <button
            type="button"
            data-category="IA"
            aria-pressed={selectedCategory === 'IA'}
            onClick={() => setSelectedCategory('IA')}
            className={`filter-btn px-4 py-2 rounded-full font-sora font-semibold text-xs flex items-center gap-1.5 transition-all min-h-[44px] ${
              selectedCategory === 'IA'
                ? 'bg-aji text-night shadow-sm'
                : 'bg-ink/[0.05] border border-borderCream text-cream hover:border-aji hover:text-aji'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-aji" />
            IA ({counts.IA})
          </button>
        </div>

        {/* Buscador en Línea */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Filtrar servicios del catálogo"
            placeholder="Filtrar catálogo..."
            className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-ink/[0.04] border border-borderCream text-xs text-cream placeholder:text-muted focus:outline-none focus:border-aji transition-all min-h-[44px]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-cream"
              title="Limpiar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mb-6 min-h-[44px]">
        <p role="status" aria-live="polite" aria-atomic="true" className="text-xs text-muted">
          {loading ? 'Cargando servicios…' : error ? 'Catálogo no disponible' : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'resultado' : 'resultados'}${selectedCategory === 'Todos' ? '' : ` en ${selectedCategory}`}`}
        </p>
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="sm:hidden flex items-center gap-1">
            <button type="button" aria-label="Ver servicio anterior" aria-controls={carouselId} disabled={carouselEdges.start} onClick={() => moveCarousel(-1)} className="min-w-[44px] min-h-[44px] rounded-xl border border-borderCream flex items-center justify-center text-cream hover:bg-ink/5 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button type="button" aria-label="Ver siguiente servicio" aria-controls={carouselId} disabled={carouselEdges.end} onClick={() => moveCarousel(1)} className="min-w-[44px] min-h-[44px] rounded-xl border border-borderCream flex items-center justify-center text-cream hover:bg-ink/5 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ESTADO DE ERROR */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-[390px] rounded-[24px] bg-ink/[0.03] border border-borderCream p-6 flex flex-col justify-between animate-pulse"
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

      {/* GRID DE PRODUCTOS (Desktop: cuadrícula 4 cols; Móvil: carrusel horizontal con snap) */}
      {!loading && !error && filteredProducts.length > 0 && (
        <div className="relative">
          <motion.div
            ref={carouselRef}
            id={carouselId}
            role="region"
            aria-label="Servicios del catálogo"
            tabIndex={0}
            layout
            className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto sm:overflow-visible pt-3 snap-x snap-mandatory pb-6 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, idx) => (
                <motion.div
                  key={product.id || idx}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: reduceMotion ? 0 : 0.25, delay: reduceMotion ? 0 : Math.min(idx, 5) * 0.025 }}
                  className="w-[280px] sm:w-auto shrink-0 sm:shrink snap-center"
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </section>
  );
}
