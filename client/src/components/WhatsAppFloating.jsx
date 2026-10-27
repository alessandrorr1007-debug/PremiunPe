import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { MessageCircle } from 'lucide-react';
import { formatWhatsAppNumber } from '../lib/mockData';

export default function WhatsAppFloating() {
  const { settings } = useStore();
  const [showTooltip, setShowTooltip] = useState(false);
  const reduceMotion = useReducedMotion();
  const cleanPhone = formatWhatsAppNumber(settings?.whatsapp_number);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hola PremiumPe! Deseo hacer una consulta sobre los servicios.')}`;

  return (
    <div className="store-whatsapp fixed right-4 sm:right-6 z-40 flex items-center gap-2"
      onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}
      onFocusCapture={() => setShowTooltip(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setShowTooltip(false); }}
      onKeyDown={event => { if (event.key === 'Escape') setShowTooltip(false); }}>
      <AnimatePresence>
        {showTooltip && (
          <motion.div initial={{ opacity: 0, x: reduceMotion ? 0 : 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className="hidden sm:flex px-3.5 py-2 rounded-xl bg-surface border border-borderCream text-cream text-xs font-sora font-medium shadow-xl pointer-events-none">
            Atención por WhatsApp
          </motion.div>
        )}
      </AnimatePresence>
      <motion.a href={whatsappUrl} target="_blank" rel="noopener noreferrer" whileHover={{ scale: reduceMotion ? 1 : 1.04 }} whileTap={{ scale: reduceMotion ? 1 : 0.96 }}
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-whatsapp text-white flex items-center justify-center shadow-[0_0_25px_rgba(0,0,0,0.45)] relative shrink-0"
        aria-label="Contactar por WhatsApp">
        <MessageCircle className="w-6 h-6 fill-white" />
      </motion.a>
    </div>
  );
}
