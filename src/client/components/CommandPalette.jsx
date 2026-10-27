import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoreDialogs } from './StoreDialogs';
import { useStore } from '../context/StoreContext';
import { Search, Plus, MessageCircle, X } from 'lucide-react';
import { 
  getProductMonogram, 
  formatPriceNumber, 
  DELIVERY_TYPE_LABELS, 
} from '../lib/mockData';

export default function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, products, addToCombo } = useStore();
  const { reviewProductOrder } = useStoreDialogs();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Escuchar atajos globales de teclado Ctrl+K, Cmd+K o '/'
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      } else if (
        e.key === '/' &&
        !commandPaletteOpen &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        setCommandPaletteOpen(true);
      } else if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  // Enfocar el input al abrir
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  const filtered = products.filter(p => {
    if (!p.visible) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const handleKeyDownInList = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      addToCombo(filtered[selectedIndex]);
      setCommandPaletteOpen(false);
    }
  };

  const getAccentColorClass = (accent) => {
    switch (accent) {
      case 'rocoto':
        return 'bg-rocoto/30 text-rocoto';
      case 'lime':
        return 'bg-lime/30 text-lime';
      case 'aji':
      default:
        return 'bg-aji/30 text-aji';
    }
  };

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-start justify-center pt-20 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-xl rounded-2xl bg-surface border border-cream/20 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden"
          >
            {/* Cabecera del Buscador */}
            <div className="flex items-center gap-3 pb-3 border-b border-borderCream">
              <Search className="w-5 h-5 text-aji shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDownInList}
                placeholder="Escribe para buscar... (Disney, Canva, Office, GPT)"
                className="w-full bg-transparent border-0 text-cream placeholder:text-muted focus:ring-0 text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setCommandPaletteOpen(false)}
                className="text-xs text-muted hover:text-cream px-2 py-1 rounded bg-ink/5 font-mono"
              >
                ESC
              </button>
            </div>

            {/* Resultados Instantáneos */}
            <div className="pt-3 space-y-1 text-xs max-h-80 overflow-y-auto">
              <div className="px-3 py-1 text-muted uppercase font-mono text-[10px] tracking-wider text-left">
                Resultados instantáneos ({filtered.length})
              </div>

              {filtered.length === 0 ? (
                <div className="p-6 text-center text-muted text-xs">
                  No se encontraron servicios que coincidan con "{query}".
                </div>
              ) : (
                filtered.map((prod, idx) => {
                  const isSelected = idx === selectedIndex;
                  const monogram = getProductMonogram(prod.name, prod.monogram);
                  const accentColor = getAccentColorClass(prod.accent);
                  const deliveryLabel = DELIVERY_TYPE_LABELS[prod.delivery_type] || 'Perfil individual';

                  return (
                    <div
                      key={prod.id || idx}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-ink/10 border border-aji/30'
                          : 'bg-ink/[0.03] border border-transparent hover:bg-ink/[0.06]'
                      }`}
                    >
                      {/* Lado izquierdo: Monograma y Nombre */}
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-7 h-7 rounded-lg font-sora font-bold text-center leading-7 text-[10px] shrink-0 ${accentColor}`}
                        >
                          {monogram}
                        </span>
                        <div className="text-left min-w-0">
                          <span className="font-medium text-cream block truncate">
                            {prod.name}
                          </span>
                          <span className="text-[10px] text-muted">
                            {deliveryLabel}
                          </span>
                        </div>
                      </div>

                      {/* Lado derecho: Precio & Acciones Rápidas */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-aji font-sora font-semibold text-xs whitespace-nowrap">
                          S/ {formatPriceNumber(prod.price)} /mes
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCombo(prod);
                            setCommandPaletteOpen(false);
                          }}
                          className="px-2 py-1 rounded-lg bg-ink/10 hover:bg-aji hover:text-night text-cream text-[11px] font-sora font-medium transition-colors flex items-center gap-1"
                          title="Agregar al combo"
                        >
                          <Plus className="w-3 h-3" />
                          <span className="hidden sm:inline">Combo</span>
                        </button>

                        <button
                          type="button"
                          aria-haspopup="dialog"
                          onClick={() => { reviewProductOrder(prod); setCommandPaletteOpen(false); }}
                          className="px-2 py-1 rounded-lg bg-whatsapp text-white text-[11px] font-sora font-medium hover:brightness-110 transition-colors flex items-center gap-1"
                          title="Revisar pedido antes de continuar a WhatsApp"
                        >
                          <MessageCircle className="w-3 h-3 fill-white" />
                          <span className="hidden sm:inline">Pedir</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
