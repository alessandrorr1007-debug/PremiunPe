import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../context/AdminStoreContext';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function DeleteConfirmModal({ isOpen, onClose, product, productIds, onConfirmBulk }) {
  const { deleteProduct } = useAdminStore();
  const [deleting, setDeleting] = useState(false);
  const [confirmationWord, setConfirmationWord] = useState('');

  const isBulk = Array.isArray(productIds) && productIds.length > 0;
  const count = isBulk ? productIds.length : 1;

  useEffect(() => {
    if (isOpen) {
      setConfirmationWord('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (isBulk && confirmationWord !== 'ELIMINAR') return;

    try {
      setDeleting(true);
      if (isBulk && onConfirmBulk) {
        await onConfirmBulk(productIds);
        toast.success(`${count} productos eliminados.`);
      } else if (product) {
        await deleteProduct(product.id);
        toast.success(`"${product.name}" eliminado del catálogo.`);
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const isButtonDisabled = deleting || (isBulk && confirmationWord !== 'ELIMINAR');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-md rounded-[24px] bg-cardBg border border-rocoto/40 shadow-2xl p-6 text-left text-cream">
        <div className="flex items-center justify-between pb-3 border-b border-borderCream">
          <div className="flex items-center gap-3 text-rocoto">
            <div className="p-2.5 rounded-xl bg-rocoto/15 border border-rocoto/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-sora font-bold text-cream">
              {isBulk ? `¿Eliminar ${count} productos?` : `¿Eliminar ${product?.name || 'producto'}?`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted hover:text-cream hover:bg-white/5 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-4 text-sm text-cream/90 leading-relaxed font-sans">
          {isBulk ? (
            <>
              Estás a punto de eliminar permanentemente <strong className="text-cream font-mono">{count} productos</strong> del catálogo de PremiumPe.
            </>
          ) : (
            <>
              Estás a punto de eliminar <strong className="text-cream">"{product?.name}"</strong>. Esta acción no se puede deshacer.
            </>
          )}
        </p>

        {isBulk && (
          <div className="mt-4 p-3.5 rounded-xl bg-rocoto/10 border border-rocoto/25 space-y-2">
            <label className="block text-xs font-sora font-semibold text-rocoto">
              Para confirmar la eliminación masiva, escribe <span className="font-mono font-bold text-cream underline">ELIMINAR</span>:
            </label>
            <input
              type="text"
              value={confirmationWord}
              onChange={(e) => setConfirmationWord(e.target.value)}
              placeholder="Escribe ELIMINAR"
              className="w-full px-3 py-2 rounded-lg bg-night border border-rocoto/40 text-cream placeholder-muted/60 text-xs font-mono font-bold tracking-wider focus:outline-none focus:ring-1 focus:ring-rocoto"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-borderCream">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-muted hover:text-cream font-sora font-semibold text-xs transition-colors min-h-[44px]"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isButtonDisabled}
            className="px-5 py-2.5 rounded-xl bg-rocoto hover:bg-rocoto/90 text-white font-sora font-bold text-xs shadow-md shadow-rocoto/30 flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer min-h-[44px]"
          >
            {deleting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isBulk ? `Eliminar ${count} productos` : 'Confirmar Eliminación'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
