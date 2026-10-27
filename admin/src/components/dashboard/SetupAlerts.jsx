import React from 'react';
import { MessageSquare, ImageOff, ListChecks, ArrowRight } from 'lucide-react';

export default function SetupAlerts({ settings, products, onGoToSettings, onFilterNoImage, onFilterNoIncludes }) {
  const alerts = [];

  // 1. Alerta WhatsApp
  if (!settings?.whatsapp_number || settings.whatsapp_number.length < 9) {
    alerts.push({
      id: 'whatsapp-missing',
      type: 'warning',
      icon: MessageSquare,
      title: 'WhatsApp no configurado',
      desc: 'Configura el número oficial de WhatsApp para que tus clientes puedan pedir desde la tienda.',
      actionText: 'Configurar WhatsApp',
      onClick: onGoToSettings,
    });
  }

  // 2. Alerta productos sin "Qué incluye"
  const productsWithoutIncludes = products.filter(
    (p) => !p.includes || !Array.isArray(p.includes) || p.includes.filter(Boolean).length === 0
  );
  if (productsWithoutIncludes.length > 0) {
    alerts.push({
      id: 'includes-missing',
      type: 'info',
      icon: ListChecks,
      title: `${productsWithoutIncludes.length} ${productsWithoutIncludes.length === 1 ? 'producto sin viñetas' : 'productos sin viñetas'}`,
      desc: 'Agrega las viñetas de "Qué incluye" para que se muestren en el reverso de la tarjeta al hacer clic.',
      actionText: 'Revisar productos',
      onClick: () => (onFilterNoIncludes ? onFilterNoIncludes() : onGoToSettings()),
    });
  }

  // 3. Alerta productos sin imagen
  const productsWithoutImage = products.filter((p) => !p.image_url || p.image_url.trim() === '');
  if (productsWithoutImage.length > 0 && productsWithoutImage.length !== products.length) {
    alerts.push({
      id: 'images-missing',
      type: 'info',
      icon: ImageOff,
      title: `${productsWithoutImage.length} ${productsWithoutImage.length === 1 ? 'producto sin imagen' : 'productos sin imagen'}`,
      desc: 'Puedes subir una carátula o dejar que el sistema genere el monograma estilizado.',
      actionText: 'Ver productos',
      onClick: () => onFilterNoImage && onFilterNoImage(),
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {alerts.map((alert) => {
        const Icon = alert.icon;
        return (
          <div
            key={alert.id}
            className="rounded-[20px] bg-aji/10 border border-aji/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-cream text-left"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-aji/20 border border-aji/40 flex items-center justify-center shrink-0 mt-0.5 text-aji">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-sora font-bold text-cream leading-snug">
                  {alert.title}
                </h4>
                <p className="text-xs text-muted mt-0.5 leading-relaxed">
                  {alert.desc}
                </p>
              </div>
            </div>

            <button
              onClick={alert.onClick}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-aji hover:text-night border border-borderCream text-cream text-xs font-sora font-semibold flex items-center gap-1.5 self-start sm:self-auto shrink-0 transition-all min-h-[44px]"
            >
              <span>{alert.actionText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
