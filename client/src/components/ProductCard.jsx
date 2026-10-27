import React, { useState, useRef, useEffect, useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { getBenefitPreview } from '../content/productBenefits';
import { useStoreDialogs } from './StoreDialogs';
import { useStore } from '../context/StoreContext';
import { 
  getProductMonogram, 
  formatPriceNumber, 
  DELIVERY_TYPE_LABELS, 
} from '../lib/mockData';
import { Check, Plus, MessageCircle, RotateCw } from 'lucide-react';

export default function ProductCard({ product }) {
  const { addToCombo, combo } = useStore();
  const { openProductDetails, reviewProductOrder } = useStoreDialogs();
  const shouldReduceMotion = useReducedMotion();
  const [isFlipped, setIsFlipped] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const frontButtonRef = useRef(null);
  const backButtonRef = useRef(null);
  const previousFlipped = useRef(false);
  const detailsId = useId();

  useEffect(() => {
    if (previousFlipped.current === isFlipped) return;
    previousFlipped.current = isFlipped;
    (isFlipped ? backButtonRef : frontButtonRef).current?.focus({ preventScroll: true });
  }, [isFlipped]);

  const isAvailable = product.available !== false;
  const isInCombo = combo.some(item => item.id === product.id || item.name === product.name);
  const monogram = getProductMonogram(product.name, product.monogram);
  const deliveryLabel = DELIVERY_TYPE_LABELS[product.delivery_type] || 'Perfil individual';

  const includesList = getBenefitPreview(product);

  const getAccentDetails = (accent) => {
    switch (accent) {
      case 'rocoto':
        return {
          text: 'text-rocoto',
          border: 'border-rocoto/30',
          hoverBorder: 'hover:border-rocoto/60',
          bg: 'bg-rocoto/20',
          chip: 'bg-rocoto/20 text-rocoto border border-rocoto/30',
          shadowHover: 'hover:shadow-[0_15px_35px_rgba(0,0,0,0.25)]',
        };
      case 'lime':
        return {
          text: 'text-lime',
          border: 'border-lime/30',
          hoverBorder: 'hover:border-lime/60',
          bg: 'bg-lime/20',
          chip: 'bg-lime/20 text-lime border border-lime/30',
          shadowHover: 'hover:shadow-[0_15px_35px_rgba(0,0,0,0.25)]',
        };
      case 'aji':
      default:
        return {
          text: 'text-aji',
          border: 'border-aji/30',
          hoverBorder: 'hover:border-aji/60',
          bg: 'bg-aji/20',
          chip: 'bg-aji/20 text-aji border border-aji/30',
          shadowHover: 'hover:shadow-[0_15px_35px_rgba(0,0,0,0.25)]',
        };
    }
  };

  const accentDetails = getAccentDetails(product.accent);

  // Efecto de inclinación 3D en mouse move
  const handleMouseMove = (e) => {
    if (shouldReduceMotion || isFlipped) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -2;
    const rotateY = ((x - centerX) / centerX) * 2;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      data-category={product.category}
      onPointerMove={event => { if (event.pointerType === 'mouse') handleMouseMove(event); }}
      onKeyDown={event => { if (event.key === 'Escape' && isFlipped) { event.stopPropagation(); setIsFlipped(false); } }}
      onMouseLeave={handleMouseLeave}
      className={`product-card relative h-[390px] perspective-1000 select-none ${
        !isAvailable ? 'opacity-60 grayscale' : ''
      }`}
    >
      <motion.div
        animate={{
          rotateX: isFlipped ? 0 : tilt.x,
          rotateY: isFlipped ? 180 : tilt.y,
        }}
        transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', damping: 24, stiffness: 220 }}
        className="w-full h-full transform-style-3d relative rounded-[24px]"
      >
        {/* CARA FRONTAL */}
        <div
          inert={isFlipped ? '' : undefined}
          aria-hidden={isFlipped}
          className={`product-front backface-hidden absolute inset-0 rounded-[24px] bg-surface border border-borderCream p-6 flex flex-col justify-between overflow-hidden transition-all duration-300 ${accentDetails.hoverBorder} ${accentDetails.shadowHover} group`}
        >
          {/* Reflejo de luz specular shine al pasar el mouse */}
          <div className="absolute inset-0 specular-shine -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

          {/* Superior: Monograma y Chip de Entrega */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div
                className={`product-monogram w-12 h-12 rounded-2xl ${accentDetails.bg} border ${accentDetails.border} ${accentDetails.text} font-sora font-extrabold text-lg flex items-center justify-center shadow-sm`}
              >
                {monogram}
              </div>

              <div className="flex items-center gap-2">
                {!isAvailable ? (
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-soft/50 text-muted border border-strong">
                    Agotado
                  </span>
                ) : (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-success/5 text-success border border-success/20">
                    {deliveryLabel}
                  </span>
                )}

              </div>
            </div>

            {/* Nombre del Servicio */}
            <h3 className="font-sora font-bold text-cream text-lg text-left">
              {product.name}
            </h3>

            {/* Descripción Corta */}
            <p className="mt-2 text-xs text-muted leading-relaxed text-left line-clamp-3">
              {product.description}
            </p>
            <div className="flex items-center justify-between gap-2">
              <button type="button" onClick={() => openProductDetails(product)} aria-haspopup="dialog"
                className="inline-flex items-center min-h-[44px] text-xs text-muted hover:text-cream transition-colors rounded-lg">
                Ver detalles
              </button>
              <button type="button" ref={frontButtonRef} onClick={() => setIsFlipped(true)} aria-expanded={isFlipped} aria-controls={detailsId}
                aria-label={`Vista rápida de ${product.name}`} title="Voltear tarjeta: vista rápida"
                className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] text-muted hover:text-cream hover:bg-ink/5 transition-colors rounded-lg">
                <RotateCw className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Inferior: Precio y Acciones */}
          <div>
            <div className="mb-4 text-left">
              <div className="flex items-baseline gap-1">
                <span className={`font-sora font-extrabold text-3xl ${product.accent === 'lime' ? 'text-lime' : product.accent === 'aji' ? 'text-aji' : 'text-cream'}`}>
                  S/ {formatPriceNumber(product.price)}
                </span>
                <span className="text-xs text-muted">/mes</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Botón + Agregar al combo */}
              <button
                type="button"
                disabled={!isAvailable}
                onClick={(e) => {
                  e.stopPropagation();
                  addToCombo(product);
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-sora font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[44px] ${
                  isInCombo
                    ? 'bg-aji text-night font-bold shadow-md'
                    : 'bg-ink/10 hover:bg-ink/20 text-cream active:scale-95'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {isInCombo ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-night" />
                    <span>En Combo</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Agregar</span>
                  </>
                )}
              </button>

              {/* Botón Pedir por WhatsApp */}
              <button
                type="button"
                onClick={() => reviewProductOrder(product)}
                aria-haspopup="dialog"
                className="py-2.5 px-3 rounded-xl bg-action text-actionInk text-xs font-sora font-semibold flex items-center justify-center gap-1.5 hover:brightness-110 active:scale-95 transition-all min-h-[44px]"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-none" />
                <span>Pedir</span>
              </button>
            </div>
          </div>
        </div>

        {/* CARA TRASERA ("Qué incluye") */}
        <div
          id={detailsId}
          inert={!isFlipped ? '' : undefined}
          aria-hidden={!isFlipped}
          className={`backface-hidden rotate-y-180 absolute inset-0 rounded-[24px] bg-surface border ${accentDetails.border} p-6 flex flex-col justify-between overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.8)]`}
        >
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-borderCream pb-2">
              <span className={`text-[10px] font-mono ${accentDetails.text} uppercase font-semibold`}>
                VISTA RÁPIDA
              </span>
              <button
                type="button"
                ref={backButtonRef}
                aria-label="Volver al frente de la tarjeta"
                onClick={() => setIsFlipped(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded text-muted hover:text-cream transition-colors"
                title="Volver al frente"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <h4 className="font-sora font-bold text-cream text-base text-left mb-3">
              {product.name}
            </h4>

            <ul className="space-y-2.5 text-xs text-cream/90 text-left">
              {includesList.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className={`w-4 h-4 ${accentDetails.text} shrink-0 mt-0.5`} />
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-3 text-left">
              <div className="flex items-baseline gap-1">
                <span className={`font-sora font-extrabold text-2xl ${accentDetails.text}`}>
                  S/ {formatPriceNumber(product.price)}
                </span>
                <span className="text-xs text-muted">/mes</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={!isAvailable}
                onClick={() => {
                  addToCombo(product);
                  setIsFlipped(false);
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-sora font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[44px] ${
                  isInCombo ? 'bg-aji text-night' : 'bg-ink/10 hover:bg-ink/20 text-cream active:scale-95'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {isInCombo ? 'En Combo' : '+ Agregar'}
              </button>

              <button
                type="button"
                onClick={() => openProductDetails(product)}
                aria-haspopup="dialog"
                className="py-2.5 px-3 rounded-xl bg-ink/5 hover:bg-ink/10 text-cream text-xs font-sora font-semibold flex items-center justify-center transition-all min-h-[44px]"
              >
                Ver ficha completa
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
