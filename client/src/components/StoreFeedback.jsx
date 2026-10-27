import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

// Observe the existing selection without changing how the cart works.
export default function StoreFeedback() {
  const { combo } = useStore();
  const previous = useRef(combo);
  const [notice, setNotice] = useState(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const same = (a, b) => a.id === b.id || a.name === b.name;
    const added = combo.filter(item => !previous.current.some(old => same(old, item)));
    const removed = previous.current.filter(item => !combo.some(current => same(current, item)));
    previous.current = combo;
    if (added.length) {
      setNotice({ text: added.length === 1 ? `${added[0].name} agregado a tu combo` : `${added.length} servicios agregados a tu combo` });
    } else if (removed.length) {
      setNotice({ text: removed.length === 1 ? `${removed[0].name} eliminado del combo` : 'Se actualizó tu combo' });
    }
  }, [combo]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 3200);
    return () => clearTimeout(timer);
  }, [notice]);

  return (
    <div className="store-notice fixed left-4 right-20 sm:left-auto sm:right-24 z-40 pointer-events-none max-w-sm" role="status" aria-live="polite" aria-atomic="true">
      <AnimatePresence>
        {notice && (
          <motion.div key={notice.text} initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.18 }}
            className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-surface border border-borderCream px-4 py-3 shadow-card-dark text-xs text-cream">
            <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{notice.text}</span>
            <button type="button" onClick={() => setNotice(null)} aria-label="Cerrar aviso" className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-ink/5 -my-2 -mr-2">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
