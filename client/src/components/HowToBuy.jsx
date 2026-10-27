import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, MessageCircle, CreditCard } from 'lucide-react';

export default function HowToBuy() {
  const steps = [
    {
      number: '1',
      title: 'Elige tus servicios',
      description:
        'Selecciona tus plataformas individuales o agrégalas al creador de combos para pedir todo junto.',
      icon: CheckCircle2,
      accentColor: 'text-aji',
      bgAccent: 'bg-aji/20'
    },
    {
      number: '2',
      title: 'Escríbenos por WhatsApp',
      description:
        'Toca el botón y tu pedido se redactará automáticamente con los servicios y precios seleccionados.',
      icon: MessageCircle,
      accentColor: 'text-secondary',
      bgAccent: 'bg-whatsapp/20'
    },
    {
      number: '3',
      title: 'Paga y recibe tus accesos',
      description:
        'Transfiere con Yape o Plin de forma directa y recibe tus credenciales o la activación en tu cuenta.',
      icon: CreditCard,
      accentColor: 'text-lime',
      bgAccent: 'bg-lime/20'
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-borderCream" id="como-comprar">
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-xs font-mono uppercase text-aji font-bold tracking-widest">
          Sencillo y rápido
        </span>
        <h2 className="font-sora text-3xl font-extrabold text-cream mt-1">
          ¿Cómo comprar en 3 pasos?
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="store-step p-8 rounded-[24px] bg-ink/[0.04] border border-borderCream flex flex-col justify-between hover:border-cream/20 transition-all"
            >
              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-2xl ${step.bgAccent} ${step.accentColor} font-sora font-bold text-xl flex items-center justify-center shadow-sm`}
                  >
                    {step.number}
                  </div>
                  <Icon className={`w-5 h-5 ${step.accentColor} opacity-75`} />
                </div>

                <h3 className="font-sora font-bold text-lg text-cream">
                  {step.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
