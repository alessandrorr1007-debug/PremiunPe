import React, { useState, useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { ChevronDown } from 'lucide-react';

export default function FAQ() {
  const { settings } = useStore();
  const [openQuestions, setOpenQuestions] = useState([]);
  const faqId = useId();
  const reduceMotion = useReducedMotion();

  const faqList = Array.isArray(settings?.faq) && settings.faq.length > 0
    ? settings.faq
    : [
        {
          question: '¿Cómo me entregan el acceso una vez realizado el pago?',
          answer: 'Al enviar tu comprobante de pago por WhatsApp con tu pedido, se te envían las credenciales o se activa el servicio en tu cuenta según el tipo de entrega.'
        },
        {
          question: '¿Puedo renovar el mismo servicio para el siguiente mes?',
          answer: 'Sí, coordinamos contigo antes del vencimiento para que puedas renovar y conservar tus configuraciones y listas sin inconvenientes.'
        },
        {
          question: '¿Qué métodos de pago aceptan?',
          answer: 'Aceptamos pagos directos a través de Yape y Plin sin comisiones adicionales.'
        },
        {
          question: '¿Cómo funciona la reposición del servicio?',
          answer: 'Cada pase cuenta con respaldo técnico durante el periodo contratado para reponer tu acceso de forma prioritaria en caso de contingencias.'
        }
      ];

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-borderCream" id="preguntas">
      <div className="text-center mb-12">
        <span className="text-xs font-mono uppercase text-aji font-bold tracking-widest">
          Dudas frecuentes
        </span>
        <h2 className="font-sora text-3xl font-extrabold text-cream mt-1">
          Preguntas Frecuentes
        </h2>
      </div>

      <div className="space-y-4 text-sm text-left">
        {faqList.map((item, idx) => {
          const isOpen = openQuestions.includes(idx);
          const questionId = `${faqId}-question-${idx}`;
          const answerId = `${faqId}-answer-${idx}`;
          return (
            <motion.div key={idx} initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: reduceMotion ? 0 : 0.25 }}
              className={`store-faq-item rounded-2xl bg-ink/[0.04] border transition-colors ${isOpen ? 'border-aji/40' : 'border-borderCream'}`}>
              <h3>
                <button type="button" id={questionId} aria-expanded={isOpen} aria-controls={answerId}
                  onClick={() => setOpenQuestions(current => current.includes(idx) ? current.filter(index => index !== idx) : [...current, idx])}
                  className="w-full p-5 min-h-[56px] rounded-2xl font-sora font-semibold text-cream text-left flex items-center justify-between gap-3 hover:bg-ink/[0.02] transition-colors">
                  <span>{item.question}</span>
                  <ChevronDown aria-hidden="true" className={`w-4 h-4 text-muted transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
              </h3>
              <motion.div id={answerId} role="region" aria-labelledby={questionId} aria-hidden={!isOpen} inert={!isOpen ? '' : undefined}
                initial={false} animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.22, ease: 'easeInOut' }} className="overflow-hidden">
                <p className="px-5 pb-5 text-muted leading-relaxed text-xs sm:text-sm">{item.answer}</p>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
