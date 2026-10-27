import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../context/AdminStoreContext';
import { 
  Settings as SettingsIcon, 
  Save, 
  MessageCircle, 
  Store, 
  Type, 
  ShieldCheck, 
  Share2, 
  ExternalLink, 
  AlertCircle, 
  Plus, 
  Trash2, 
  HelpCircle,
  Clock,
  CreditCard
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsTab() {
  const { settings, updateSettings } = useAdminStore();

  const [form, setForm] = useState({
    store_name: '',
    whatsapp_number: '',
    hero_badge: '',
    hero_title: '',
    hero_subtitle: '',
    support_hours: '',
    response_time: '',
    payment_methods: 'Yape y Plin',
    warranty_text: '',
    currency: 'S/',
    faq: [],
    instagram: '',
    tiktok: '',
    facebook: '',
  });

  const [initialSnapshot, setInitialSnapshot] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      let initialFaq = [];
      if (Array.isArray(settings.faq)) {
        initialFaq = settings.faq;
      } else if (typeof settings.faq === 'string') {
        try {
          initialFaq = JSON.parse(settings.faq);
        } catch {
          initialFaq = [];
        }
      }

      const data = {
        store_name: settings.store_name || 'PremiumPe',
        whatsapp_number: settings.whatsapp_number || '51942990279',
        hero_badge: settings.hero_badge || 'Perú Express',
        hero_title: settings.hero_title || 'Tus plataformas favoritas, al precio justo',
        hero_subtitle: settings.hero_subtitle || 'Elige, combina y pide por WhatsApp en minutos.',
        support_hours: settings.support_hours || '',
        response_time: settings.response_time || '',
        payment_methods: settings.payment_methods || 'Yape y Plin',
        warranty_text: settings.warranty_text || '',
        currency: settings.currency || 'S/',
        faq: initialFaq,
        instagram: settings.social_links?.instagram || '',
        tiktok: settings.social_links?.tiktok || '',
        facebook: settings.social_links?.facebook || '',
      };
      setForm(data);
      setInitialSnapshot(JSON.stringify(data));
    }
  }, [settings]);

  const isDirty = JSON.stringify(form) !== initialSnapshot;

  // Extraer 9 dígitos de Perú
  const cleanDigits = (form.whatsapp_number || '').replace(/[^\d]/g, '');
  const phoneNineDigits = cleanDigits.startsWith('51') && cleanDigits.length === 11 
    ? cleanDigits.slice(2) 
    : cleanDigits.slice(-9);

  const previewWhatsAppUrl = `https://wa.me/51${phoneNineDigits}?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20las%20suscripciones`;

  // Manejo de FAQ
  const handleFaqChange = (index, field, value) => {
    const updated = [...form.faq];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, faq: updated });
  };

  const handleAddFaq = () => {
    setForm({
      ...form,
      faq: [
        ...form.faq,
        { question: '', answer: '' }
      ]
    });
  };

  const handleRemoveFaq = (index) => {
    const updated = form.faq.filter((_, idx) => idx !== index);
    setForm({ ...form, faq: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isDirty || saving) return;

    if (phoneNineDigits.length !== 9) {
      toast.error('El número de WhatsApp debe tener exactamente 9 dígitos peruanos.');
      return;
    }

    setSaving(true);

    // Filtrar preguntas vacías
    const cleanFaq = (form.faq || [])
      .filter(item => item.question?.trim() && item.answer?.trim())
      .map(item => ({
        question: item.question.trim(),
        answer: item.answer.trim()
      }));

    const payload = {
      store_name: form.store_name.trim(),
      whatsapp_number: `51${phoneNineDigits}`,
      hero_badge: form.hero_badge.trim(),
      hero_title: form.hero_title.trim(),
      hero_subtitle: form.hero_subtitle.trim(),
      support_hours: form.support_hours.trim(),
      response_time: form.response_time.trim(),
      payment_methods: form.payment_methods.trim() || 'Yape y Plin',
      warranty_text: form.warranty_text.trim(),
      faq: cleanFaq,
      currency: form.currency.trim() || 'S/',
      social_links: {
        instagram: form.instagram.trim(),
        tiktok: form.tiktok.trim(),
        facebook: form.facebook.trim(),
      },
    };

    try {
      const success = await updateSettings(payload);
      if (success) {
        setInitialSnapshot(JSON.stringify({
          ...form,
          whatsapp_number: `51${phoneNineDigits}`,
          faq: cleanFaq
        }));
        toast.success('Configuración guardada con éxito.');
      }
    } catch (err) {
      toast.error('Error al guardar configuración: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-borderCream">
        <div>
          <h2 className="text-lg sm:text-xl font-sora font-bold text-cream tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-aji" />
            Configuración de la Tienda
          </h2>
          <p className="text-xs text-muted mt-0.5 font-sans">
            Personaliza el número de WhatsApp, textos de portada, condiciones y redes de PremiumPe
          </p>
        </div>

        {isDirty && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-aji/10 border border-aji/30 text-aji text-xs font-sora font-semibold animate-fadeIn self-start sm:self-auto">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Tienes cambios sin guardar</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-sm">
        {/* SECCIÓN 1: DATOS DE LA TIENDA Y WHATSAPP */}
        <div className="rounded-[24px] bg-cardBg border border-borderCream p-5 sm:p-7 shadow-card space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-borderCream">
            <Store className="w-4 h-4 text-aji" />
            <h3 className="text-xs font-sora font-bold uppercase tracking-wider text-cream">
              1. Datos de la Tienda y WhatsApp
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sora font-semibold text-cream mb-1.5">
                Nombre de la Tienda *
              </label>
              <input
                type="text"
                required
                value={form.store_name}
                onChange={(e) => setForm({ ...form, store_name: e.target.value })}
                placeholder="PremiumPe"
                className="w-full px-3.5 py-2.5 rounded-xl bg-night border border-borderCream text-cream text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-aji/50 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-sora font-semibold text-cream mb-1.5">
                Número de WhatsApp (Perú) *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs font-mono font-bold text-aji select-none">
                  +51
                </span>
                <input
                  type="text"
                  required
                  value={phoneNineDigits}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d]/g, '').slice(0, 9);
                    setForm({ ...form, whatsapp_number: `51${val}` });
                  }}
                  placeholder="942990279"
                  maxLength={9}
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-night border border-borderCream text-cream font-mono text-xs sm:text-sm font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-aji/50"
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-muted">
                <span className="text-[11px] font-mono">9 dígitos (inicial: 942990279)</span>
                <a
                  href={previewWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lime hover:underline flex items-center gap-1 font-sora font-semibold text-[11px] transition-colors"
                  title="Abrir chat de prueba en wa.me"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Probar enlace</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-sora font-semibold text-cream mb-1.5">
                Símbolo de Moneda
              </label>
              <input
                type="text"
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                placeholder="S/"
                className="w-full px-3.5 py-2.5 rounded-xl bg-night border border-borderCream text-cream font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-aji/50 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-sora font-semibold text-cream mb-1.5">
                Métodos de Pago
              </label>
              <input
                type="text"
                value={form.payment_methods}
                onChange={(e) => setForm({ ...form, payment_methods: e.target.value })}
                placeholder="Yape y Plin"
                className="w-full px-3.5 py-2.5 rounded-xl bg-night border border-borderCream text-cream text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-aji/50 font-sans"
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: TEXTOS DE PORTADA */}
        <div className="rounded-[24px] bg-cardBg border border-borderCream p-5 sm:p-7 shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-borderCream">
            <Type className="w-4 h-4 text-aji" />
            <h3 className="text-xs font-sora font-bold uppercase tracking-wider text-cream">
              2. Textos de Portada (Hero del Catálogo)
            </h3>
          </div>

          <div>
            <label className="block text-xs font-sora font-semibold text-cream mb-1.5">
              Etiqueta / Badge del Hero
            </label>
            <input
              type="text"
              value={form.hero_badge}
              onChange={(e) => setForm({ ...form, hero_badge: e.target.value })}
              placeholder="Perú Express"
              className="w-full px-3.5 py-2.5 rounded-xl bg-night border border-borderCream text-cream font-semibold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-aji/50 font-sans"
            />
            <span className="text-[11px] text-muted mt-1 block">
              Si lo dejas vacío, no se muestra en la tienda.
            </span>
          </div>

          <div>
            <label className="block text-xs font-sora font-semibold text-cream mb-1.5">
              Título Principal del Hero *
            </label>
            <input
              type="text"
              required
              value={form.hero_title}
              onChange={(e) => setForm({ ...form, hero_title: e.target.value })}
              placeholder="Tus plataformas favoritas, al precio justo"
              className="w-full px-3.5 py-2.5 rounded-xl bg-night border border-borderCream text-cream font-semibold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-aji/50 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-sora font-semibold text-cream mb-1.5">
              Subtítulo del Hero
            </label>
            <textarea
              rows={2}
              value={form.hero_subtitle}
              onChange={(e) => setForm({ ...form, hero_subtitle: e.target.value })}
              placeholder="Elige, combina y pide por WhatsApp en minutos."
              className="w-full px-3.5 py-2.5 rounded-xl bg-night border border-borderCream text-cream text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-aji/50 leading-relaxed font-sans"
            />
            <span className="text-[11px] text-muted mt-1 block">
              Si lo dejas vacío, no se muestra en la tienda.
            </span>
          </div>
        </div>

        {/* SECCIÓN 3: CONDICIONES DEL SERVICIO */}
        <div className="rounded-[24px] bg-cardBg border border-borderCream p-5 sm:p-7 shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-borderCream">
            <ShieldCheck className="w-4 h-4 text-lime" />
            <h3 className="text-xs font-sora font-bold uppercase tracking-wider text-cream">
              3. Condiciones del Servicio y Soporte
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sora font-semibold text-cream mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-aji" />
                Horario de Soporte (Opcional)
              </label>
              <input
                type="text"
                value={form.support_hours}
                onChange={(e) => setForm({ ...form, support_hours: e.target.value })}
                placeholder="Ej. Atención por WhatsApp"
                className="w-full px-3.5 py-2.5 rounded-xl bg-night border border-borderCream text-cream text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-aji/50 font-sans"
              />
              <span className="text-[11px] text-muted mt-1 block">
                Si lo dejas vacío, no se muestra en la tienda.
              </span>
            </div>

            <div>
              <label className="block text-xs font-sora font-semibold text-cream mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-lime" />
                Tiempo de Respuesta (Opcional)
              </label>
              <input
                type="text"
                value={form.response_time}
                onChange={(e) => setForm({ ...form, response_time: e.target.value })}
                placeholder="Ej. Respuesta por orden de llegada"
                className="w-full px-3.5 py-2.5 rounded-xl bg-night border border-borderCream text-cream text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-aji/50 font-sans"
              />
              <span className="text-[11px] text-muted mt-1 block">
                Si lo dejas vacío, no se muestra en la tienda.
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-sora font-semibold text-cream mb-1.5">
              Texto de Garantía y Reposición (Opcional)
            </label>
            <input
              type="text"
              value={form.warranty_text}
              onChange={(e) => setForm({ ...form, warranty_text: e.target.value })}
              placeholder="Ej. Reposición y soporte activo durante todo el periodo contratado"
              className="w-full px-3.5 py-2.5 rounded-xl bg-night border border-borderCream text-cream text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-aji/50 font-sans"
            />
            <span className="text-[11px] text-muted mt-1 block">
              Si lo dejas vacío, no se muestra en la tienda.
            </span>
          </div>
        </div>

        {/* SECCIÓN 4: PREGUNTAS FRECUENTES (FAQ) */}
        <div className="rounded-[24px] bg-cardBg border border-borderCream p-5 sm:p-7 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-borderCream">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-aji" />
              <h3 className="text-xs font-sora font-bold uppercase tracking-wider text-cream">
                4. Preguntas Frecuentes (FAQ)
              </h3>
            </div>
            <button
              type="button"
              onClick={handleAddFaq}
              className="px-3 py-1.5 rounded-xl bg-aji/15 hover:bg-aji/25 border border-aji/30 text-aji text-xs font-sora font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar pregunta</span>
            </button>
          </div>

          <div className="space-y-3.5">
            {form.faq.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-night/70 border border-borderCream space-y-3 relative group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-aji">
                    Pregunta #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFaq(idx)}
                    className="p-1.5 rounded-lg text-muted hover:text-rocoto hover:bg-rocoto/10 transition-colors"
                    title="Eliminar pregunta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <input
                    type="text"
                    value={item.question}
                    onChange={(e) => handleFaqChange(idx, 'question', e.target.value)}
                    placeholder="¿Cuál es la pregunta?"
                    className="w-full px-3 py-2 rounded-xl bg-cardBg border border-borderCream text-cream text-xs font-sora font-semibold focus:outline-none focus:ring-1 focus:ring-aji"
                  />
                </div>

                <div>
                  <textarea
                    rows={2}
                    value={item.answer}
                    onChange={(e) => handleFaqChange(idx, 'answer', e.target.value)}
                    placeholder="Respuesta detallada para tus clientes..."
                    className="w-full px-3 py-2 rounded-xl bg-cardBg border border-borderCream text-cream text-xs focus:outline-none focus:ring-1 focus:ring-aji leading-relaxed"
                  />
                </div>
              </div>
            ))}

            {form.faq.length === 0 && (
              <p className="text-xs text-muted text-center py-4 italic">
                No hay preguntas configuradas. Haz clic en "Agregar pregunta" para añadir una.
              </p>
            )}
          </div>
        </div>

        {/* SECCIÓN 5: REDES SOCIALES */}
        <div className="rounded-[24px] bg-cardBg border border-borderCream p-5 sm:p-7 shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-borderCream">
            <Share2 className="w-4 h-4 text-aji" />
            <h3 className="text-xs font-sora font-bold uppercase tracking-wider text-cream">
              5. Redes Sociales (Enlaces del Footer)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-sora font-semibold text-cream mb-1.5">
                Instagram URL
              </label>
              <input
                type="url"
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                placeholder="https://instagram.com/tu_cuenta"
                className="w-full px-3 py-2.5 rounded-xl bg-night border border-borderCream text-cream text-xs focus:outline-none focus:ring-2 focus:ring-aji/50 font-sans"
              />
              <span className="text-[11px] text-muted mt-1 block">
                Si lo dejas vacío, no se muestra en la tienda.
              </span>
            </div>

            <div>
              <label className="block text-xs font-sora font-semibold text-cream mb-1.5">
                TikTok URL
              </label>
              <input
                type="url"
                value={form.tiktok}
                onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
                placeholder="https://tiktok.com/@tu_cuenta"
                className="w-full px-3 py-2.5 rounded-xl bg-night border border-borderCream text-cream text-xs focus:outline-none focus:ring-2 focus:ring-aji/50 font-sans"
              />
              <span className="text-[11px] text-muted mt-1 block">
                Si lo dejas vacío, no se muestra en la tienda.
              </span>
            </div>

            <div>
              <label className="block text-xs font-sora font-semibold text-cream mb-1.5">
                Facebook URL
              </label>
              <input
                type="url"
                value={form.facebook}
                onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                placeholder="https://facebook.com/tu_pagina"
                className="w-full px-3 py-2.5 rounded-xl bg-night border border-borderCream text-cream text-xs focus:outline-none focus:ring-2 focus:ring-aji/50 font-sans"
              />
              <span className="text-[11px] text-muted mt-1 block">
                Si lo dejas vacío, no se muestra en la tienda.
              </span>
            </div>
          </div>
        </div>

        {/* Botón de Guardar: Activo SOLO si hay modificaciones (isDirty) */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={!isDirty || saving}
            className="w-full sm:w-auto px-8 py-3 rounded-xl admin-button-primary text-xs font-sora font-bold shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer min-h-[44px]"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-night/40 border-t-night rounded-full animate-spin" />
                <span>Guardando cambios...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
