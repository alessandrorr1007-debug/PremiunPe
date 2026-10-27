import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  const { settings } = useStore();
  const currentYear = new Date().getFullYear();

  const socialLinks = settings?.social_links || {};

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
          {/* Redes Sociales */}
          <div className="flex items-center gap-3">
            {socialLinks.instagram && (
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-cream transition-colors p-1"
                aria-label="Instagram de PremiumPe"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {socialLinks.facebook && (
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-cream transition-colors p-1"
                aria-label="Facebook de PremiumPe"
              >
                <Facebook className="w-4 h-4" />
              </a>
            )}
            {socialLinks.tiktok && (
              <a
                href={socialLinks.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-cream transition-colors p-1 font-mono font-bold text-[11px]"
                aria-label="TikTok de PremiumPe"
              >
                TT
              </a>
            )}
          </div>

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
