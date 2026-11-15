import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const networks = [
  { key: 'instagram', name: 'Instagram', Icon: Instagram },
  { key: 'facebook', name: 'Facebook', Icon: Facebook },
  { key: 'tiktok', name: 'TikTok' },
];

function httpsUrl(value) {
  if (typeof value !== 'string' || !/^https:\/\//i.test(value.trim())) return null;
  try {
    const url = new URL(value.trim());
    return url.username || url.password ? null : url.href;
  } catch {
    return null;
  }
}

export default function Footer() {
  const { settings } = useStore();
  const currentYear = new Date().getFullYear();
  const socialLinks = networks
    .map(network => ({ ...network, href: httpsUrl(settings.social_links?.[network.key]) }))
    .filter(link => link.href);

  return (
    <footer className="store-footer w-full border-t border-borderCream mt-16 bg-canvas py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-aji text-night flex items-center justify-center font-sora font-extrabold text-lg shadow-sm">
            P
          </div>
          <span className="font-sora font-bold text-cream text-sm">
            Premium<span className="text-aji">Pe</span>
          </span>
        </div>

        {/* Descargo de Responsabilidad */}
        <p className="text-xs text-muted text-center max-w-xl leading-relaxed">
          Las marcas pertenecen a sus respectivos dueños. Servicio independiente en el Perú.
        </p>

        {/* Redes y Derechos con Año Automático */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-muted">
          {socialLinks.length > 0 && (
            <nav aria-label="Redes sociales" className="flex items-center gap-3">
              {socialLinks.map(({ key, name, Icon, href }) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name + ' de PremiumPe'}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded text-muted hover:text-aji focus-visible:outline focus-visible:outline-2 focus-visible:outline-aji"
                >
                  {Icon ? <Icon className="w-4 h-4" aria-hidden="true" /> : (
                    <span className="font-mono font-bold text-[11px]" aria-hidden="true">TT</span>
                  )}
                </a>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-3">
            <span>Lima, Perú • © {currentYear} PremiumPe</span>
            <span>•</span>
            <Link
              to="/login"
              className="text-muted hover:text-aji transition-colors inline-flex items-center gap-1"
              title="Panel Administrativo"
            >
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
