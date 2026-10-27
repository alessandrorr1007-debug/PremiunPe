import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import QuickPriceEdit from '../QuickPriceEdit';
import Toggle from '../common/Toggle';
import { 
  getProductMonogram, 
  DELIVERY_TYPE_LABELS 
} from '../../lib/mockData';
import { 
  Edit3, 
  Copy, 
  Trash2, 
  Star, 
  ChevronUp, 
  ChevronDown, 
  GripVertical 
} from 'lucide-react';

function SortableRow({
  product,
  idx,
  totalProducts,
  isSelected,
  onToggleSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleAvailability,
  onToggleVisibility,
  onToggleFeatured,
  onReorder,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.7 : 1,
  };

  const monogram = getProductMonogram(product.name, product.monogram);
  const deliveryLabel = DELIVERY_TYPE_LABELS[product.delivery_type] || 'Perfil individual';

  const getAccentBadge = (accent) => {
    switch (accent) {
      case 'rocoto':
        return 'bg-rocoto/15 text-rocoto border-rocoto/30';
      case 'lime':
        return 'bg-lime/15 text-lime border-lime/30';
      case 'aji':
      default:
        return 'bg-aji/15 text-aji border-aji/30';
    }
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`group transition-colors border-b border-borderCream/60 ${
        isSelected ? 'bg-aji/[0.08]' : 'hover:bg-white/[0.02]'
      } ${isDragging ? 'bg-cardBg shadow-2xl ring-1 ring-aji/40' : ''}`}
    >
      {/* Checkbox */}
      <td className="py-3 pl-4 pr-2 w-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(product.id)}
          className="rounded border-borderCream bg-white/5 text-aji focus:ring-aji/40 cursor-pointer w-4 h-4"
          aria-label={`Seleccionar ${product.name}`}
        />
      </td>

      {/* Reordenar: Agarre dnd-kit + Flechas arriba/abajo */}
      <td className="py-3 px-2 text-center w-20">
        <div className="inline-flex items-center gap-1">
          <button
            {...attributes}
            {...listeners}
            className="p-1 rounded text-muted hover:text-cream cursor-grab active:cursor-grabbing hover:bg-white/[0.06] transition-colors"
            title="Arrastrar para reordenar"
            aria-label="Arrastrar para reordenar"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <div className="inline-flex flex-col gap-0.5">
            <button
              onClick={() => onReorder(product.id, 'up')}
              disabled={idx === 0}
              className="p-0.5 rounded hover:bg-white/10 text-muted hover:text-cream disabled:opacity-20 disabled:hover:bg-transparent"
              title="Subir orden"
            >
              <ChevronUp className="w-3 h-3" />
            </button>
            <button
              onClick={() => onReorder(product.id, 'down')}
              disabled={idx === totalProducts - 1}
              className="p-0.5 rounded hover:bg-white/10 text-muted hover:text-cream disabled:opacity-20 disabled:hover:bg-transparent"
              title="Bajar orden"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </td>

      {/* Producto: Monograma/Miniatura + Nombre + Descripción */}
      <td className="py-3 px-3 min-w-[220px]">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl bg-night border flex items-center justify-center font-sora font-extrabold text-xs shrink-0 overflow-hidden shadow-inner ${
              product.accent === 'rocoto'
                ? 'border-rocoto/40 text-rocoto bg-rocoto/10'
                : product.accent === 'lime'
                ? 'border-lime/40 text-lime bg-lime/10'
                : 'border-aji/40 text-aji bg-aji/10'
            }`}
          >
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <span>{monogram}</span>
            )}
          </div>

          <div className="min-w-0 max-w-xs">
            <div className="flex items-center gap-2">
              <span className="font-sora font-bold text-cream truncate block text-sm">
                {product.name}
              </span>
              {!product.available && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rocoto/15 border border-rocoto/30 text-rocoto">
                  Agotado
                </span>
              )}
            </div>
            {product.description && (
              <p className="text-[11px] text-muted truncate mt-0.5 font-normal">
                {product.description}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Categoría */}
      <td className="py-3 px-3">
        <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-borderCream text-[11px] font-medium text-cream/90 whitespace-nowrap">
          {product.category}
        </span>
      </td>

      {/* Tipo de Entrega */}
      <td className="py-3 px-3">
        <span className={`px-2.5 py-1 rounded-full border text-[10px] font-semibold whitespace-nowrap ${getAccentBadge(product.accent)}`}>
          {deliveryLabel}
        </span>
      </td>

      {/* Precio Editable Inline */}
      <td className="py-3 px-3">
        <QuickPriceEdit product={product} />
      </td>

      {/* Toggle Disponible */}
      <td className="py-3 px-3 text-center">
        <Toggle
          checked={product.available}
          onChange={() => onToggleAvailability(product.id)}
          activeColor="lime"
          size="sm"
        />
      </td>

      {/* Toggle Visible */}
      <td className="py-3 px-3 text-center">
        <Toggle
          checked={product.visible !== false}
          onChange={() => onToggleVisibility(product.id)}
          activeColor="aji"
          size="sm"
        />
      </td>

      {/* Toggle Destacado */}
      <td className="py-3 px-3 text-center">
        <button
          onClick={() => onToggleFeatured(product.id)}
          className={`p-1.5 rounded-lg transition-colors ${
            product.featured
              ? 'text-aji hover:bg-aji/10'
              : 'text-muted/40 hover:text-muted hover:bg-white/5'
          }`}
          title={product.featured ? 'Destacado en portada' : 'No destacado'}
        >
          <Star className={`w-4 h-4 ${product.featured ? 'fill-aji' : ''}`} />
        </button>
      </td>

      {/* Acciones */}
      <td className="py-3 pr-4 pl-3 text-right">
        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(product)}
            className="p-1.5 rounded-lg text-muted hover:text-cream hover:bg-white/[0.08] transition-colors"
            title="Editar producto"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDuplicate(product.id)}
            className="p-1.5 rounded-lg text-muted hover:text-aji hover:bg-aji/10 transition-colors"
            title="Duplicar producto"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(product)}
            className="p-1.5 rounded-lg text-muted hover:text-rocoto hover:bg-rocoto/10 transition-colors"
            title="Eliminar producto"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function ProductTable({
  products,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleAvailability,
  onToggleVisibility,
  onToggleFeatured,
  onReorder,
  onReorderAll,
}) {
  const allSelected = products.length > 0 && selectedIds.length === products.length;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = products.findIndex((p) => p.id === active.id);
    const newIndex = products.findIndex((p) => p.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      const newItems = arrayMove(products, oldIndex, newIndex);
      if (onReorderAll) {
        onReorderAll(newItems);
      }
    }
  };

  return (
    <div className="hidden md:block rounded-[24px] bg-cardBg border border-borderCream overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-night border-b border-borderCream text-[11px] uppercase tracking-wider text-muted font-sora font-semibold select-none z-10">
              <tr>
                <th className="py-3.5 pl-4 pr-2 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onToggleSelectAll}
                    className="rounded border-borderCream bg-white/5 text-aji focus:ring-aji/40 cursor-pointer w-4 h-4"
                    aria-label="Seleccionar todos los productos"
                  />
                </th>
                <th className="py-3.5 px-2 w-20 text-center">Orden</th>
                <th className="py-3.5 px-3 min-w-[220px]">Producto</th>
                <th className="py-3.5 px-3">Categoría</th>
                <th className="py-3.5 px-3">Entrega</th>
                <th className="py-3.5 px-3">Precio</th>
                <th className="py-3.5 px-3 text-center">Disponible</th>
                <th className="py-3.5 px-3 text-center">Visible</th>
                <th className="py-3.5 px-3 text-center">Destacado</th>
                <th className="py-3.5 pr-4 pl-3 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-borderCream/40 text-xs">
              <SortableContext
                items={products.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                {products.map((product, idx) => (
                  <SortableRow
                    key={product.id}
                    product={product}
                    idx={idx}
                    totalProducts={products.length}
                    isSelected={selectedIds.includes(product.id)}
                    onToggleSelect={onToggleSelect}
                    onEdit={onEdit}
                    onDuplicate={onDuplicate}
                    onDelete={onDelete}
                    onToggleAvailability={onToggleAvailability}
                    onToggleVisibility={onToggleVisibility}
                    onToggleFeatured={onToggleFeatured}
                    onReorder={onReorder}
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </DndContext>
      </div>
    </div>
  );
}
