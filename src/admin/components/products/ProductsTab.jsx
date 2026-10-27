import React, { useState, useMemo, useEffect, useRef } from 'react';
import ProductTable from './ProductTable';
import ProductCardMobile from './ProductCardMobile';
import BulkActionBar from './BulkActionBar';
import { PRODUCT_CATEGORIES } from '../../lib/mockData';
import { Search, Plus, ArrowUpDown, PackageX } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductsTab({
  products,
  onOpenCreate,
  onOpenEdit,
  onOpenDelete,
  onDuplicate,
  onToggleAvailability,
  onToggleVisibility,
  onToggleFeatured,
  onReorder,
  onReorderAll,
  onBulkAvailable,
  onBulkUnavailable,
  onBulkVisible,
  onBulkHidden,
  onBulkDelete,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('all'); // all | available | out_of_stock | hidden
  const [sortBy, setSortBy] = useState('order'); // order | name | price_asc | price_desc | recent
  const [selectedIds, setSelectedIds] = useState([]);

  const searchInputRef = useRef(null);

  // Atajos de teclado en escritorio: "/" enfoca buscador, "N" o "n" crea producto
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        onOpenCreate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenCreate]);

  // Filtrado y ordenación
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Categoría (Streaming, Herramientas, IA)
        if (selectedCategory !== 'Todos' && p.category !== selectedCategory) {
          return false;
        }

        // Estado
        if (statusFilter === 'available' && !p.available) return false;
        if (statusFilter === 'out_of_stock' && p.available) return false;
        if (statusFilter === 'hidden' && p.visible !== false) return false;

        // Búsqueda
        if (searchTerm.trim() !== '') {
          const q = searchTerm.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description?.toLowerCase().includes(q);
          const matchCat = p.category?.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchCat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'price_asc') return parseFloat(a.price) - parseFloat(b.price);
        if (sortBy === 'price_desc') return parseFloat(b.price) - parseFloat(a.price);
        if (sortBy === 'recent') {
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        }
        return (a.sort_order || 0) - (b.sort_order || 0);
      });
  }, [products, selectedCategory, statusFilter, searchTerm, sortBy]);

  // Selección individual
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Seleccionar / Deseleccionar todos
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const handleDuplicateWithFeedback = async (id) => {
    const res = await onDuplicate(id);
    if (res) {
      toast.success('Producto duplicado como copia');
    }
  };

  return (
    <div className="space-y-5">
      {/* Barra de Filtros, Búsqueda y Creación */}
      <div className="rounded-[22px] bg-cardBg border border-borderCream p-4 sm:p-5 shadow-card space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Campo de búsqueda con atajo "/" */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o descripción... (presiona /)"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-night border border-borderCream text-cream placeholder-muted/60 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-aji/50 transition-all font-sans"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-cream text-xs p-1"
                aria-label="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          {/* Botón Nuevo Producto (desktop) */}
          <button
            onClick={onOpenCreate}
            className="hidden sm:inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl admin-button-primary text-xs font-bold shrink-0 shadow-sm font-sora min-h-[44px]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nuevo Producto</span>
            <kbd className="hidden lg:inline px-1.5 py-0.5 rounded bg-night/20 text-[10px] font-mono">
              N
            </kbd>
          </button>
        </div>

        {/* Fila de Selectores: Categoría, Estado y Orden */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-borderCream/60 text-xs">
          {/* Categoría fija: Streaming, Herramientas, IA */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted hidden sm:inline font-sora">Categoría:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-night border border-borderCream text-cream text-xs focus:outline-none focus:ring-1 focus:ring-aji font-sans cursor-pointer"
            >
              <option value="Todos">Todas las categorías</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Estado: Todos, Disponibles, Agotados, Ocultos */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted hidden sm:inline font-sora">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-night border border-borderCream text-cream text-xs focus:outline-none focus:ring-1 focus:ring-aji font-sans cursor-pointer"
            >
              <option value="all">Todos los estados</option>
              <option value="available">🟢 Solo disponibles</option>
              <option value="out_of_stock">🔴 Solo agotados</option>
              <option value="hidden">⚪ Solo ocultos</option>
            </select>
          </div>

          {/* Orden: nombre, precio o fecha */}
          <div className="flex items-center gap-1.5 sm:ml-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-muted" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-night border border-borderCream text-cream text-xs focus:outline-none focus:ring-1 focus:ring-aji font-sans cursor-pointer"
            >
              <option value="order">Orden manual</option>
              <option value="name">Alfabético (A-Z)</option>
              <option value="price_asc">Menor precio</option>
              <option value="price_desc">Mayor precio</option>
              <option value="recent">Más recientes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resultados / Contador */}
      <div className="flex items-center justify-between text-xs text-muted px-1 font-mono">
        <span>
          Mostrando <strong className="text-cream tabular-nums">{filteredProducts.length}</strong> de {products.length} productos
        </span>
        {selectedIds.length > 0 && (
          <span className="text-aji font-semibold">
            {selectedIds.length} seleccionados
          </span>
        )}
      </div>

      {/* Vista de Tabla Desktop con Drag and Drop */}
      <ProductTable
        products={filteredProducts}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onEdit={onOpenEdit}
        onDuplicate={handleDuplicateWithFeedback}
        onDelete={onOpenDelete}
        onToggleAvailability={onToggleAvailability}
        onToggleVisibility={onToggleVisibility}
        onToggleFeatured={onToggleFeatured}
        onReorder={onReorder}
        onReorderAll={onReorderAll}
      />

      {/* Vista de Tarjetas Móvil */}
      <div className="space-y-3 md:hidden">
        {filteredProducts.map((p, idx) => (
          <ProductCardMobile
            key={p.id}
            product={p}
            isSelected={selectedIds.includes(p.id)}
            onToggleSelect={handleToggleSelect}
            onEdit={onOpenEdit}
            onDuplicate={handleDuplicateWithFeedback}
            onDelete={onOpenDelete}
            onToggleAvailability={onToggleAvailability}
            onToggleVisibility={onToggleVisibility}
            onToggleFeatured={onToggleFeatured}
            onReorder={onReorder}
            canMoveUp={idx > 0}
            canMoveDown={idx < filteredProducts.length - 1}
          />
        ))}
      </div>

      {/* Estado Vacío */}
      {filteredProducts.length === 0 && (
        <div className="py-16 text-center rounded-[24px] bg-cardBg border border-borderCream p-8 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-borderCream flex items-center justify-center text-muted mb-3">
            <PackageX className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold font-sora text-cream">No se encontraron productos</h3>
          <p className="text-xs text-muted mt-1 max-w-sm">
            Ningún producto coincide con el filtro o término de búsqueda aplicado.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('Todos');
              setStatusFilter('all');
            }}
            className="mt-4 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-borderCream text-xs font-semibold text-cream transition-colors min-h-[44px]"
          >
            Restablecer filtros
          </button>
        </div>
      )}

      {/* Barra de Acciones Masivas Flotante */}
      <BulkActionBar
        selectedIds={selectedIds}
        onClear={() => setSelectedIds([])}
        onBulkAvailable={(ids) => {
          onBulkAvailable(ids);
          setSelectedIds([]);
        }}
        onBulkUnavailable={(ids) => {
          onBulkUnavailable(ids);
          setSelectedIds([]);
        }}
        onBulkVisible={(ids) => {
          onBulkVisible(ids);
          setSelectedIds([]);
        }}
        onBulkHidden={(ids) => {
          onBulkHidden(ids);
          setSelectedIds([]);
        }}
        onBulkDelete={(ids) => {
          onBulkDelete(ids);
          setSelectedIds([]);
        }}
      />
    </div>
  );
}
