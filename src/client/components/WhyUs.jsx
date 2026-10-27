import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { MessageSquare, ShieldCheck, QrCode, BadgeCheck } from 'lucide-react';

export default function WhyUs() {
  const { settings } = useStore();

  const supportHours = settings?.support_hours;
  const responseTime = settings?.response_time;
  const paymentMethods = settings?.payment_methods || 'Yape o Plin';
  const warrantyText = settings?.warranty_text;

  // Determinar los bloques que tienen contenido válido para renderizar
  const blocks = [];

  // Bloque 1: Soporte por WhatsApp
  if (supportHours || responseTime) {
    blocks.push({
      id: 'support',
      span: 'md:col-span-2',
      icon: MessageSquare,
      badgeText: responseTime ? responseTime : 'Atención Directa',
      accentColor: 'text-secondary',
      bgAccent: 'bg-whatsapp/20',
      title: `Soporte por WhatsApp${supportHours ? ` (${supportHours})` : ''}`,
      description:
        'Atención personalizada para resolver dudas técnicas, coordinar accesos y gestionar renovaciones de tus servicios.',
      extraIndicator: responseTime ? (
        <div className="mt-6 flex items-center gap-2 text-xs text-cream">
          <span className="w-2.5 h-2.5 rounded-full bg-whatsapp animate-pulse" />
          <span>{responseTime}</span>
        </div>
      ) : null
    });
  }

  // Bloque 2: Precios claros
  blocks.push({
    id: 'pricing',
    span: 'md:col-span-1',
    icon: ShieldCheck,
    badgeText: 'Tarifas Transparentes',
    accentColor: 'text-aji',
    bgAccent: 'bg-aji/20',
    title: 'Precios claros sin sorpresas',
    description:
      'El monto en soles mostrado es exactamente lo que pagas por tu periodo mensual, sin costos ocultos.'
  });

  // Bloque 3: Métodos de Pago (Yape o Plin)
  if (paymentMethods) {
    blocks.push({
      id: 'payment',
      span: 'md:col-span-1',
      icon: QrCode,
      badgeText: 'Fácil y Seguro',
      accentColor: 'text-rocoto',
      bgAccent: 'bg-rocoto/20',
      title: `Pago con ${paymentMethods}`,
      description:
        `Paga escaneando QR o transfiriendo por número de celular con ${paymentMethods} de forma directa.`
    });
  }

  // Bloque 4: Reposición según condiciones
  if (warrantyText) {
    blocks.push({
      id: 'warranty',
      span: 'md:col-span-2',
      icon: BadgeCheck,
      badgeText: 'Garantía de Servicio',
      accentColor: 'text-lime',
      bgAccent: 'bg-lime/20',
      title: 'Reposición según condiciones',
      description: warrantyText
    });
  }

  if (blocks.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-borderCream" id="por-que-nosotros">
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-xs font-mono uppercase text-aji font-bold tracking-widest">
          Transparencia
        </span>
        <h2 className="font-sora text-3xl font-extrabold text-cream mt-1">
          Por qué elegirnos
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {blocks.map((block, idx) => {
          const Icon = block.icon;
          return (
            <motion.div
              key={block.id || idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className={`store-benefit ${block.span} p-8 rounded-[24px] bg-ink/[0.04] border border-borderCream flex flex-col justify-between hover:border-cream/20 transition-all`}
            >
              <div className="space-y-3 text-left">
                <div
                  className={`w-12 h-12 rounded-2xl ${block.bgAccent} ${block.accentColor} flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-[11px] font-mono ${block.accentColor} font-bold uppercase tracking-wider block`}>
                  {block.badgeText}
                </span>
                <h3 className="font-sora font-bold text-xl text-cream">
                  {block.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {block.description}
                </p>
              </div>

              {block.extraIndicator}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
