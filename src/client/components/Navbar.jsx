import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../../admin/context/AuthContext';
import { Search, MessageCircle, Menu, X, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import { useStoreNavigation } from '../hooks/useStoreNavigation';
import { formatWhatsAppNumber } from '../lib/mockData';
import AdminLoginModal from './AdminLoginModal';

export default function Navbar() {
  const { settings, setCommandPaletteOpen } = useStore();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { activeSection, headerRef, menuButtonRef } = useStoreNavigation(mobileMenuOpen, setMobileMenuOpen);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const whatsappNumber = formatWhatsAppNumber(settings?.whatsapp_number);
  const generalWhatsAppUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola PremiumPe! Deseo información sobre sus servicios.')}`;

  // Barra de progreso de scroll en el top
  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const scrolled = (window.scrollY / docHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, scrolled)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAdminAction = () => {
    if (isAdmin) {
      navigate('/admin');
    } else {
      setLoginModalOpen(true);
    }
  };

  return (
    <>
      {/* Top Scroll Progress Bar (Ají Amarillo) */}
      <div className="fixed top-0 left-0 w-full h-px bg-ink/5 z-50 pointer-events-none">
        <div
          className="h-full bg-aji transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Header Fijo Translúcido */}
      <header ref={headerRef} className="fixed top-0 inset-x-0 h-20 bg-canvas/80 backdrop-blur-xl border-b border-borderCream z-40">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo PremiumPe */}
          <a href="#" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 group" aria-label="Ir al inicio de PremiumPe">
            <div className="w-11 h-11 rounded-2xl bg-aji text-night flex items-center justify-center font-sora font-extrabold text-2xl shadow-[0_0_20px_rgba(0,0,0,0.45)] group-hover:scale-105 transition-transform duration-200">
              P
            </div>
            <span className="hidden min-[480px]:inline font-sora font-bold text-base sm:text-xl tracking-tight text-cream">
              Premium<span className="text-aji">Pe</span>
            </span>
          </a>

          {/* Navegación de Escritorio */}
          <nav className="hidden xl:flex items-center gap-1 text-sm font-medium text-muted">
            <a
              href="#catalogo"
              aria-current={activeSection === 'catalogo' ? 'location' : undefined}
              className="px-4 py-2 rounded-xl hover:text-cream hover:bg-ink/5 transition-all"
            >
              Catálogo
            </a>
            <a
              href="#como-comprar"
              aria-current={activeSection === 'como-comprar' ? 'location' : undefined}
              className="px-4 py-2 rounded-xl hover:text-cream hover:bg-ink/5 transition-all"
            >
              Cómo comprar
            </a>
            <a
              href="#por-que-nosotros"
              aria-current={activeSection === 'por-que-nosotros' ? 'location' : undefined}
              className="px-4 py-2 rounded-xl hover:text-cream hover:bg-ink/5 transition-all"
            >
              Por qué nosotros
            </a>
            <a
              href="#preguntas"
              aria-current={activeSection === 'preguntas' ? 'location' : undefined}
              className="px-4 py-2 rounded-xl hover:text-cream hover:bg-ink/5 transition-all"
            >
              Preguntas
            </a>
          </nav>

          {/* Buscador, Configuración & WhatsApp */}
          <div className="flex items-center gap-1 sm:gap-2.5">
            <ThemeToggle />
            {/* Gatillo de Paleta de Comandos (Ctrl+K) */}
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              aria-label="Buscar servicios"
              className="flex items-center justify-center min-h-[44px] min-w-[44px] gap-2.5 px-2 sm:px-3.5 py-2 rounded-xl bg-ink/[0.04] border border-borderCream text-muted hover:text-cream hover:border-cream/20 transition-all text-xs"
              title="Buscar servicio (Ctrl+K o /)"
            >
              <Search className="w-4 h-4 text-muted" />
              <span className="hidden 2xl:inline">Buscar servicio...</span>
              <kbd className="hidden 2xl:inline px-1.5 py-0.5 rounded bg-ink/10 text-[10px] text-cream font-mono">
                Ctrl+K
              </kbd>
            </button>

            {/* BOTÓN DE CONFIGURACIÓN / ACCESO ADMIN */}
            <button
              type="button"
              onClick={handleAdminAction}
              className="relative p-2.5 rounded-xl bg-ink/[0.04] hover:bg-ink/[0.08] border border-borderCream hover:border-aji/40 text-muted hover:text-aji transition-all min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer group"
              title={isAdmin ? "Panel de Administración (Conectado)" : "Configuración y Administración"}
              aria-label="Configuración de administrador"
            >
              <Settings className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45" />
              {isAdmin && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-aji rounded-full ring-2 ring-night" />
              )}
            </button>

            {/* Botón Verde Directo de WhatsApp */}
            <a
              href={generalWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-action text-actionInk font-sora font-semibold text-xs tracking-wide shadow-[0_0_20px_rgba(0,0,0,0.35)] hover:brightness-110 active:scale-95 transition-all min-h-[44px]"
            >
              <MessageCircle className="w-4 h-4 fill-none" />
              <span className="hidden md:inline">WhatsApp</span>
            </a>

            {/* Botón Menú Hamburguesa para Móvil */}
            <button
              type="button"
              ref={menuButtonRef}
              aria-expanded={mobileMenuOpen}
              aria-controls="store-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2.5 rounded-xl text-cream hover:bg-ink/5 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Menú Desplegable Móvil */}
        <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div id="store-mobile-menu" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden xl:hidden bg-night/95 backdrop-blur-2xl border-b border-borderCream px-4 py-5 space-y-3">
            <nav className="flex flex-col space-y-1 text-sm font-medium text-muted">
              <a
                href="#catalogo"
              aria-current={activeSection === 'catalogo' ? 'location' : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl hover:text-cream hover:bg-ink/5 transition-all"
              >
                Catálogo
              </a>
              <a
                href="#como-comprar"
              aria-current={activeSection === 'como-comprar' ? 'location' : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl hover:text-cream hover:bg-ink/5 transition-all"
              >
                Cómo comprar
              </a>
              <a
                href="#por-que-nosotros"
              aria-current={activeSection === 'por-que-nosotros' ? 'location' : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl hover:text-cream hover:bg-ink/5 transition-all"
              >
                Por qué nosotros
              </a>
              <a
                href="#preguntas"
              aria-current={activeSection === 'preguntas' ? 'location' : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl hover:text-cream hover:bg-ink/5 transition-all"
              >
                Preguntas
              </a>

              {/* Opción de Configuración en Móvil */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleAdminAction();
                }}
                className="px-4 py-3 rounded-xl text-left text-muted hover:text-cream hover:bg-ink/5 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Settings className="w-4 h-4 text-aji" />
                <span>Configuración y Administración</span>
              </button>
            </nav>
          </motion.div>
        )}
        </AnimatePresence>
      </header>

      {/* Modal de acceso administrativo */}
      <AdminLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </>
  );
}
