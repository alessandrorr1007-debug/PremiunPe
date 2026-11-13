import React, { useState, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { Layers, Send, Sparkles, X, ChevronDown } from 'lucide-react';
import { useStoreDialogs } from './StoreDialogs';
import { formatPriceNumber } from '../lib/mockData';

export default function ComboBar() {
  const { combo, removeFromCombo, addToCombo, showSparkles } = useStore();
  const { reviewComboOrder } = useStoreDialogs();
  const [isDragOver, setIsDragOver] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const overlayRef = useRef(null);
  const selectionId = useId();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const element = overlayRef.current;
    if (!element) return;
    const measure = () => {
      const rect = element.getBoundingClientRect();
      document.documentElement.style.setProperty('--store-overlay-space', `${Math.ceil(window.innerHeight - rect.top)}px`);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener('resize', measure);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
      document.documentElement.style.removeProperty('--store-overlay-space');
    };
  }, []);

  // Total acumulado mensual
  const total = combo.reduce((acc, curr) => acc + Number(curr.price || 0), 0);
  const totalFormatted = formatPriceNumber(total);


  // Soporte de zona drop para arrastrar tarjetas desde cualquier parte
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        const product = JSON.parse(dataStr);
        addToCombo(product);
      }
    } catch (err) {
      console.warn('Error en drop de producto:', err);
    }
  };

  const getChipAccentBorder = (accent) => {
    switch (accent) {
      case 'rocoto':
        return 'border-rocoto/40 text-rocoto bg-rocoto';
      case 'lime':
        return 'border-lime/40 text-lime bg-lime';
      case 'aji':
      default:
        return 'border-aji/40 text-aji bg-aji';
    }
  };

  return (
    <aside id="tu-combo" tabIndex={-1} ref={overlayRef} aria-label="Tu combo de servicios" className="store-combo fixed inset-x-0 z-40 max-w-5xl mx-auto px-3 sm:px-4 pointer-events-none">
      <motion.div layout={!reduceMotion} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
        className={`pointer-events-auto p-3 sm:p-5 rounded-[24px] bg-surface/95 backdrop-blur-2xl border transition-colors duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 ${isDragOver ? 'border-aji' : 'border-aji/30'}`}>
        <div className="flex items-start gap-3 w-full sm:flex-1 min-w-0">
          <div className="hidden sm:flex w-11 h-11 shrink-0 rounded-2xl bg-aji/20 text-aji items-center justify-center border border-aji/30">
            <Layers className="w-5 h-5" />
          </div>
          <div className="w-full min-w-0 text-left">
            <button type="button" aria-expanded={expanded} aria-controls={selectionId} onClick={() => setExpanded(current => !current)}
              className="sm:hidden flex items-center justify-between gap-3 w-full min-h-[44px] rounded-xl text-cream text-xs font-semibold">
              <span className="flex items-center gap-2"><Layers className="w-4 h-4" /> Tu combo · {combo.length} {combo.length === 1 ? 'servicio' : 'servicios'}</span>
              <span className="flex items-center gap-1 text-muted">{expanded ? 'Ocultar' : 'Ver'}<ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} /></span>
            </button>
            <div className="hidden sm:flex items-center gap-2 mb-2 text-[11px] font-mono uppercase text-muted tracking-wide">
              Tu combo · {combo.length} {combo.length === 1 ? 'servicio' : 'servicios'}
              {showSparkles && <span className="text-aji inline-flex items-center gap-1"><Sparkles className="w-3 h-3" /> Combo doble</span>}
            </div>
            <div id={selectionId} className={`${expanded ? 'block' : 'hidden'} sm:block`}>
              <div className="flex flex-wrap items-center gap-2 max-h-32 overflow-y-auto pr-1">
                {combo.length === 0 ? (
                  <span className="text-xs text-muted py-2">Elige un servicio para comenzar.</span>
                ) : (
                  <AnimatePresence initial={false}>
                    {combo.map(item => {
                      const accentStyles = getChipAccentBorder(item.accent);
                      return (
                        <motion.span key={item.id || item.name} layout={!reduceMotion} initial={{ scale: reduceMotion ? 1 : 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: reduceMotion ? 1 : 0.95, opacity: 0 }}
                          className={`inline-flex max-w-full items-center gap-1.5 pl-3 pr-1 min-h-[44px] rounded-xl bg-ink/[0.06] border text-cream text-xs font-medium ${accentStyles.split(' ')[0]}`}>
                          <span className={`w-2 h-2 rounded-full shrink-0 ${accentStyles.split(' ')[2]}`} />
                          <span className="min-w-0 truncate">{item.name}</span>
                          <span className="text-muted text-[11px] shrink-0">S/ {formatPriceNumber(item.price)}</span>
                          <button type="button" onClick={() => removeFromCombo(item.id || item.name)} aria-label={`Eliminar ${item.name} del combo`}
                            className="text-muted hover:text-rocoto shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-ink/5 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </motion.span>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 w-full sm:w-auto sm:shrink-0 border-t sm:border-t-0 border-borderCream pt-3 sm:pt-0">
          <div className="text-left sm:text-right shrink-0">
            <span className="text-[10px] uppercase font-mono text-muted block">Total mensual</span>
            <div className="flex items-baseline gap-1">
              <span className="font-sora font-bold text-xl sm:text-2xl text-aji tabular-nums">S/ {totalFormatted}</span>
              <span className="text-[10px] text-muted">/mes</span>
            </div>
          </div>
          <button type="button" onClick={reviewComboOrder} disabled={combo.length === 0} aria-haspopup="dialog"
            className={`px-4 py-3 rounded-2xl bg-action text-actionInk font-sora font-bold text-xs sm:text-sm shadow-[0_0_25px_rgba(0,0,0,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[44px] ${combo.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
            <span className="sm:hidden">Revisar pedido</span><span className="hidden sm:inline">Revisar mi combo</span>
            <Send className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </motion.div>
    </aside>
  );
}
