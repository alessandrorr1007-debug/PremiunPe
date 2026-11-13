import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

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
            <span role="img" aria-label="Instagram de PremiumPe" className="text-muted p-1">
              <Instagram className="w-4 h-4" />
            </span>
            <span role="img" aria-label="Facebook de PremiumPe" className="text-muted p-1">
              <Facebook className="w-4 h-4" />
            </span>
            <span role="img" aria-label="TikTok de PremiumPe" className="text-muted p-1 font-mono font-bold text-[11px]">
              TT
            </span>
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
