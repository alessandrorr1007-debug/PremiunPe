import React from 'react';
import { CheckCircle2, XCircle, EyeOff, Trash2, X } from 'lucide-react';

export default function BulkActionBar({ 
  selectedIds, 
  onClear, 
  onBulkAvailable, 
  onBulkUnavailable, 
  onBulkVisible, 
  onBulkHidden, 
  onBulkDelete 
}) {
  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92%] sm:w-auto">
      <div className="rounded-[20px] bg-cardBg/95 border border-borderCream px-4 py-3 shadow-2xl backdrop-blur-2xl flex flex-wrap items-center justify-between gap-3 text-cream">
        <div className="flex items-center gap-2 pr-3 border-r border-borderCream">
          <span className="w-5 h-5 rounded-full bg-aji text-night text-xs font-black flex items-center justify-center font-mono">
            {selectedIds.length}
          </span>
          <span className="text-xs font-semibold text-cream">
            seleccionados
          </span>
          <button
            onClick={onClear}
            className="p-1 rounded-md text-muted hover:text-cream transition-colors ml-1"
            title="Deseleccionar todos"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => onBulkAvailable(selectedIds)}
            className="px-2.5 py-1.5 rounded-lg bg-lime/15 hover:bg-lime/25 border border-lime/30 text-lime text-xs font-semibold flex items-center gap-1 transition-colors"
            title="Marcar disponibles en tienda"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Disponible</span>
          </button>

          <button
            onClick={() => onBulkUnavailable(selectedIds)}
            className="px-2.5 py-1.5 rounded-lg bg-rocoto/15 hover:bg-rocoto/25 border border-rocoto/30 text-rocoto text-xs font-semibold flex items-center gap-1 transition-colors"
            title="Marcar como agotados"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Agotado</span>
          </button>

          <button
            onClick={() => onBulkHidden(selectedIds)}
            className="px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-borderCream text-muted hover:text-cream text-xs font-semibold flex items-center gap-1 transition-colors"
            title="Ocultar del catálogo"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ocultar</span>
          </button>

          <button
            onClick={() => onBulkDelete(selectedIds)}
            className="px-2.5 py-1.5 rounded-lg bg-rocoto hover:bg-rocoto/90 text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-sm ml-1"
            title="Eliminar seleccionados"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
