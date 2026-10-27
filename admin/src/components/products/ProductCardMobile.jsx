import React from 'react';
import QuickPriceEdit from '../QuickPriceEdit';
import Toggle from '../common/Toggle';
import { 
  getProductMonogram, 
  DELIVERY_TYPE_LABELS 
} from '../../lib/mockData';
import { Edit3, Copy, Trash2, Star, ChevronUp, ChevronDown } from 'lucide-react';

export default function ProductCardMobile({
  product,
  isSelected,
  onToggleSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleAvailability,
  onToggleVisibility,
  onToggleFeatured,
  onReorder,
  canMoveUp,
  canMoveDown,
}) {
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
    <div
      className={`md:hidden rounded-[22px] bg-cardBg border p-4 shadow-card space-y-3.5 transition-colors ${
        isSelected ? 'border-aji/40 bg-aji/[0.04]' : 'border-borderCream'
      }`}
    >
      {/* Cabecera de la tarjeta: Checkbox, Miniatura/Monograma, Título y Reordenar */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(product.id)}
            className="w-4 h-4 rounded border-borderCream bg-white/5 text-aji focus:ring-aji/40 cursor-pointer shrink-0"
            aria-label={`Seleccionar ${product.name}`}
          />

          <div
            className={`w-11 h-11 rounded-2xl bg-night border flex items-center justify-center font-sora font-extrabold text-sm shrink-0 overflow-hidden shadow-inner ${
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

          <div className="min-w-0">
            <h4 className="text-sm font-sora font-bold text-cream truncate">
              {product.name}
            </h4>
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/[0.05] border border-borderCream text-muted">
                {product.category}
              </span>
              <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${getAccentBadge(product.accent)}`}>
                {deliveryLabel}
              </span>
              {!product.available && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rocoto/15 border border-rocoto/30 text-rocoto">
                  Agotado
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Botones de Reordenar (móvil) */}
        <div className="flex flex-col gap-1 shrink-0">
          <button
            onClick={() => onReorder(product.id, 'up')}
            disabled={!canMoveUp}
            className="w-8 h-8 rounded-lg bg-white/[0.04] text-muted hover:text-cream flex items-center justify-center disabled:opacity-20 active:scale-95"
            aria-label="Subir orden"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => onReorder(product.id, 'down')}
            disabled={!canMoveDown}
            className="w-8 h-8 rounded-lg bg-white/[0.04] text-muted hover:text-cream flex items-center justify-center disabled:opacity-20 active:scale-95"
            aria-label="Bajar orden"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {product.description && (
        <p className="text-xs text-muted line-clamp-2 leading-relaxed">
          {product.description}
        </p>
      )}

      {/* Precio y Toggles en Móvil */}
      <div className="pt-2 border-t border-borderCream/60 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] uppercase font-semibold text-muted block font-sora">
            Precio
          </span>
          <QuickPriceEdit product={product} />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-muted mb-0.5">Disp.</span>
            <Toggle
              checked={product.available}
              onChange={() => onToggleAvailability(product.id)}
              activeColor="lime"
              size="sm"
            />
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-muted mb-0.5">Vis.</span>
            <Toggle
              checked={product.visible !== false}
              onChange={() => onToggleVisibility(product.id)}
              activeColor="aji"
              size="sm"
            />
          </div>

          <button
            onClick={() => onToggleFeatured(product.id)}
            className={`w-9 h-9 rounded-xl transition-colors flex items-center justify-center ${
              product.featured
                ? 'text-aji bg-aji/10 border border-aji/30'
                : 'text-muted/40 bg-white/[0.03] border border-borderCream'
            }`}
            title="Destacado"
            aria-label="Destacar producto"
          >
            <Star className={`w-4 h-4 ${product.featured ? 'fill-aji' : ''}`} />
          </button>
        </div>
      </div>

      {/* Botones de acción móvil (mínimo 44px de alto para cumplir touch target) */}
      <div className="pt-2 border-t border-borderCream/60 grid grid-cols-3 gap-2">
        <button
          onClick={() => onEdit(product)}
          className="min-h-[44px] rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-borderCream text-cream text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-95 font-sora"
        >
          <Edit3 className="w-4 h-4 text-muted" />
          <span>Editar</span>
        </button>

        <button
          onClick={() => onDuplicate(product.id)}
          className="min-h-[44px] rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-borderCream text-aji text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-95 font-sora"
        >
          <Copy className="w-4 h-4 text-aji" />
          <span>Duplicar</span>
        </button>

        <button
          onClick={() => onDelete(product)}
          className="min-h-[44px] rounded-xl bg-rocoto/10 hover:bg-rocoto/20 border border-rocoto/20 text-rocoto text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-95 font-sora"
        >
          <Trash2 className="w-4 h-4 text-rocoto" />
          <span>Eliminar</span>
        </button>
      </div>
    </div>
  );
}
