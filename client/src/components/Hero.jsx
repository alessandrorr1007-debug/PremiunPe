import React, { useState, useRef, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { getBenefitPreview } from '../content/productBenefits';
import { useStoreDialogs } from './StoreDialogs';
import { useStore } from '../context/StoreContext';
import { getProductMonogram, formatPriceNumber, DELIVERY_TYPE_LABELS } from '../lib/mockData';
import { Check, RotateCw, PlusCircle, Sparkles } from 'lucide-react';

export default function Hero() {
  const { settings, products, addToCombo } = useStore();
  const { openProductDetails } = useStoreDialogs();
  const shouldReduceMotion = useReducedMotion();
  const heroRef = useRef(null);

  // Foco de luz que sigue al cursor del mouse
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isHoveringHero, setIsHoveringHero] = useState(false);

  // Estados de volteo para cada tarjeta del mazo
  const [flippedCards, setFlippedCards] = useState({});

  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const toggleFlip = (id, e) => {
    e.stopPropagation();
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Obtener los 5 productos destacados del mazo
  const deckProducts = useMemo(() => {
    const featuredList = products.filter(p => p.featured && p.visible);
    // Asegurar los 5 servicios icónicos en orden de abanico si existen
    const preferredOrder = ['disney', 'canva', 'chatgpt', 'gemini', 'hbo'];
    const matched = [];
    const remaining = [...featuredList];

    preferredOrder.forEach(key => {
      const idx = remaining.findIndex(p => p.name.toLowerCase().includes(key));
      if (idx !== -1) {
        matched.push(remaining[idx]);
        remaining.splice(idx, 1);
      }
    });

    // Rellenar con los que queden hasta tener 5
    while (matched.length < 5 && remaining.length > 0) {
      matched.push(remaining.shift());
    }

    return matched.slice(0, 5);
  }, [products]);

  // Configuraciones de abanico (-12° a +12°)
  const deckConfigs = [
    {
      rotate: -12,
      xOffset: -300,
      yOffset: 25,
      zIndex: 10,
      width: 'w-[180px]',
      height: 'h-[285px]',
      floatDelay: 0
    },
    {
      rotate: -6,
      xOffset: -150,
      yOffset: 12,
      zIndex: 15,
      width: 'w-[180px]',
      height: 'h-[285px]',
      floatDelay: 0.4
    },
    {
      rotate: 0,
      xOffset: 0,
      yOffset: 0,
      zIndex: 25,
      width: 'w-[215px]',
      height: 'h-[315px]',
      isCenter: true,
      floatDelay: 0.2
    },
    {
      rotate: 6,
      xOffset: 150,
      yOffset: 12,
      zIndex: 15,
      width: 'w-[180px]',
      height: 'h-[285px]',
      floatDelay: 0.6
    },
    {
      rotate: 12,
      xOffset: 300,
      yOffset: 25,
      zIndex: 10,
      width: 'w-[180px]',
      height: 'h-[285px]',
      floatDelay: 0.8
    }
  ];

  const getAccentStyles = (accent) => {
    switch (accent) {
      case 'rocoto':
        return {
          bg: 'bg-rocoto/20',
          text: 'text-rocoto',
          border: 'border-rocoto/40',
          glow: 'shadow-[0_15px_35px_rgba(0,0,0,0.3)]',
          badgeBg: 'bg-rocoto/20 text-rocoto',
          accentColor: '#d4d4d8'
        };
      case 'lime':
        return {
          bg: 'bg-lime/20',
          text: 'text-lime',
          border: 'border-lime/40',
          glow: 'shadow-[0_15px_35px_rgba(0,0,0,0.3)]',
          badgeBg: 'bg-lime/20 text-lime',
          accentColor: '#d4d4d8'
        };
      case 'aji':
      default:
        return {
          bg: 'bg-aji/20',
          text: 'text-aji',
          border: 'border-aji/40',
          glow: 'shadow-[0_20px_45px_rgba(0,0,0,0.35)]',
          badgeBg: 'bg-aji/20 text-aji',
          accentColor: '#f4f4f5'
        };
    }
  };

  const heroBadge = settings?.hero_badge || 'Perú Express';
  const heroTitle = settings?.hero_title || 'Tus plataformas favoritas, al precio justo';
  const heroSubtitle = settings?.hero_subtitle || 'Elige, combina y pide por WhatsApp en minutos.';

  // Resaltar la última palabra del título con el SVG underline
  const titleParts = heroTitle.trim().split(' ');
  const highlightedWord = titleParts.pop() || 'justo';
  const mainTitleText = titleParts.join(' ');

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHoveringHero(true)}
      onMouseLeave={() => setIsHoveringHero(false)}
      className="store-hero relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 sm:pt-40 pb-20 flex flex-col items-center text-center overflow-hidden"
    >
      {/* Foco de Luz Radial que sigue al mouse */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: isHoveringHero ? 0.7 : 0.35,
          background: `radial-gradient(650px circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(244,244,245,0.035), transparent 80%)`
        }}
      />

      {/* Halo dorado ambiente central */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[680px] h-[380px] bg-ink/[0.025] rounded-full blur-[130px] pointer-events-none" />

      {/* Pill Badge Editable */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ink/[0.05] border border-borderCream text-xs text-cream mb-6 backdrop-blur-md shadow-sm"
      >
        <span className="w-2 h-2 rounded-full bg-zinc-400" />
        <span className="text-aji font-semibold uppercase tracking-wider">{heroBadge}</span>
        <span className="text-muted">• Entrega y atención por WhatsApp</span>
      </motion.div>

      {/* Sora Headline con Underline SVG estilizado */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="max-w-4xl relative z-10"
      >
        <h1 className="font-sora text-4xl sm:text-6xl lg:text-[72px] font-semibold tracking-tight text-cream leading-[1.06]">
          {mainTitleText}{' '}
          <span className="relative inline-block text-aji">
            {highlightedWord}
            <svg
              className="hidden"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 230 18"
            >
              <path
                d="M4 12C60 4 175 3 226 10C165 14 68 16 11 15"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="4.5"
              />
            </svg>
          </span>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-muted max-w-xl mx-auto font-normal">
          {heroSubtitle}
        </p>
      </motion.div>

      {/* Pista Interactiva de Arrastre / Volteo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="hero-deck-hint mt-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ink/[0.06] border border-borderCream text-xs text-cream/90 shadow-sm z-10"
      >
        <Sparkles className="w-4 h-4 text-aji" />
        <span>Arrastra las tarjetas o haz clic para voltear</span>
      </motion.div>

      {/* MAZO EN ABANICO DE 5 TARJETAS FÍSICAS */}
      <div className="hero-deck relative w-full max-w-[960px] h-[390px] mt-8 flex items-center justify-center z-20">
        {deckProducts.map((prod, idx) => {
          const config = deckConfigs[idx] || deckConfigs[2];
          const isFlipped = Boolean(flippedCards[prod.id]);
          const accentStyle = getAccentStyles(prod.accent);
          const monogram = getProductMonogram(prod.name, prod.monogram);
          const includesList = getBenefitPreview(prod);

          return (
            <motion.div
              key={prod.id || idx}
              data-category={prod.category}
              drag={!shouldReduceMotion}
              dragConstraints={{ left: -100, right: 100, top: -70, bottom: 70 }}
              dragElastic={0.25}
              whileDrag={{ scale: 1.08, zIndex: 60, cursor: 'grabbing' }}
              whileHover={shouldReduceMotion ? {} : {
                y: -8,
                scale: 1.02,
                zIndex: 50,
                transition: { duration: 0.25 }
              }}
              animate={shouldReduceMotion ? {} : {
                y: [0, -6, 0],
                transition: {
                  duration: 4.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: config.floatDelay
                }
              }}
              style={{
                x: config.xOffset,
                y: config.yOffset,
                rotate: config.rotate,
                zIndex: config.zIndex,
                position: 'absolute'
              }}
              onClick={(e) => toggleFlip(prod.id, e)}
              className={`hero-card cursor-pointer ${config.width} ${config.height} perspective-1000 select-none group`}
            >
              {/* Contenedor 3D rotativo */}
              <div
                className={`relative w-full h-full transform-style-3d transition-transform duration-500 rounded-[24px] ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* CARA FRONTAL */}
                <div
                  className={`hero-front backface-hidden absolute inset-0 rounded-[24px] bg-surface/95 border ${
                    config.isCenter ? 'border-aji/50 glow-aji' : 'border-borderCream'
                  } p-5 flex flex-col justify-between shadow-[0_20px_40px_rgba(0,0,0,0.85)] overflow-hidden`}
                >
                  {/* Top Bar con Monograma y Categoría */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-10 h-10 rounded-2xl ${accentStyle.bg} ${accentStyle.text} font-sora font-extrabold text-base flex items-center justify-center border ${accentStyle.border}`}
                    >
                      {monogram}
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${accentStyle.badgeBg}`}
                    >
                      {prod.category}
                    </span>
                  </div>

                  {/* Nombre y Precio */}
                  <div className="text-left space-y-1">
                    {config.isCenter && (
                      <span className="text-[10px] text-aji font-mono font-semibold uppercase tracking-wider block">
                        Favorito Perú
                      </span>
                    )}
                    <h4 className="font-sora font-bold text-cream text-base truncate">
                      {prod.name}
                    </h4>
                    <div className="font-sora font-extrabold text-2xl text-cream flex items-baseline gap-1">
                      <span className={config.isCenter ? 'text-aji text-3xl font-black' : ''}>
                        S/ {formatPriceNumber(prod.price)}
                      </span>
                      <span className="text-xs text-muted font-normal">/mes</span>
                    </div>
                  </div>

                  <button type="button" aria-haspopup="dialog" onClick={event => { event.stopPropagation(); openProductDetails(prod); }}
                    className="min-h-[44px] text-[11px] text-muted hover:text-cream transition-colors rounded-lg w-full">
                    Ver detalles completos
                  </button>

                  {/* Botón o Pista de Volteo */}
                  {config.isCenter ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCombo(prod);
                      }}
                      className="w-full py-2 rounded-xl bg-aji text-night font-sora font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:brightness-110 active:scale-95 transition-all shadow-md"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Al Combo</span>
                    </button>
                  ) : (
                    <div className="text-[10px] text-muted flex items-center gap-1.5 justify-center py-1 rounded-lg bg-ink/[0.04]">
                      <RotateCw className="w-3 h-3 text-muted group-hover:text-cream transition-colors" />
                      <span>Toca voltear</span>
                    </div>
                  )}
                </div>

                {/* CARA TRASERA ("Qué incluye") */}
                <div
                  className={`backface-hidden rotate-y-180 absolute inset-0 rounded-[24px] bg-surface border ${accentStyle.border} p-5 flex flex-col justify-between shadow-[0_20px_40px_rgba(0,0,0,0.9)] overflow-hidden`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-borderCream mb-3">
                      <span className="text-[10px] font-mono text-aji uppercase font-semibold">
                        Qué incluye
                      </span>
                      <RotateCw className="w-3 h-3 text-muted" />
                    </div>
                    <h5 className="font-sora font-bold text-cream text-xs text-left mb-2">
                      {prod.name}
                    </h5>
                    <ul className="space-y-2 text-left text-[11px] text-cream/90">
                      {includesList.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className={`w-3.5 h-3.5 ${accentStyle.text} shrink-0 mt-0.5`} />
                          <span className="leading-tight">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCombo(prod);
                    }}
                    className="w-full py-2 rounded-xl bg-ink/10 hover:bg-ink/20 text-cream font-sora font-semibold text-xs flex items-center justify-center gap-1 transition-all active:scale-95"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Agregar</span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
