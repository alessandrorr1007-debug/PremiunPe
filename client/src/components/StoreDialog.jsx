import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';

export default function StoreDialog({ title, subtitle, viewKey, onClose, children, footer }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const titleId = useId();
  const subtitleId = useId();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      const target = previousFocus?.isConnected ? previousFocus : document.querySelector('[aria-label="Buscar servicios"]');
      target?.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => { closeRef.current?.focus({ preventScroll: true }); }, [viewKey]);

  return createPortal(
    <dialog ref={dialogRef} aria-labelledby={titleId} aria-describedby={subtitle ? subtitleId : undefined}
      onCancel={event => { event.preventDefault(); onClose(); }}
      onClick={event => { if (event.target === event.currentTarget) onClose(); }}
      className="m-auto w-[calc(100%_-_2rem)] max-w-2xl max-h-[calc(100dvh_-_2rem)] p-0 rounded-3xl border border-borderCream bg-surface text-cream shadow-admin-modal backdrop:bg-black/75 backdrop:backdrop-blur-md">
      <motion.div initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.18 }}
        className="flex flex-col max-h-[calc(100dvh_-_2rem)]">
        <header className="flex items-start justify-between gap-4 px-5 sm:px-7 pt-5 pb-4 border-b border-borderCream shrink-0">
          <div className="min-w-0">
            <h2 id={titleId} className="font-sora text-xl sm:text-2xl font-semibold break-words">{title}</h2>
            {subtitle && <p id={subtitleId} className="text-xs sm:text-sm text-muted mt-1.5">{subtitle}</p>}
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Cerrar ventana" className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-muted hover:text-cream hover:bg-ink/5 transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </header>
        <div className="min-h-0 overflow-y-auto overscroll-contain px-5 sm:px-7 py-5 space-y-6">{children}</div>
        <footer className="shrink-0 px-5 sm:px-7 py-4 border-t border-borderCream">{footer}</footer>
      </motion.div>
    </dialog>, document.body
  );
}
