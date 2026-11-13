import React from 'react';
import './storefront.css';
import { StoreProvider } from './context/StoreContext';
import Navbar from './components/Navbar';
import { StoreThemeProvider } from './components/StoreTheme';
import StoreFeedback from './components/StoreFeedback';
import { StoreDialogsProvider } from './components/StoreDialogs';
import { MotionConfig } from 'framer-motion';
import Hero from './components/Hero';
import Catalog from './components/Catalog';
import HowToBuy from './components/HowToBuy';
import WhyUs from './components/WhyUs';
import FAQ from './components/FAQ';
import ComboBar from './components/ComboBar';
import Footer from './components/Footer';
import WhatsAppFloating from './components/WhatsAppFloating';
import CommandPalette from './components/CommandPalette';

export default function ClientStoreView() {
  return (
    <StoreProvider>
      <StoreThemeProvider>
      <MotionConfig reducedMotion="user">
      <StoreDialogsProvider>
      <div className="store-shell min-h-screen flex flex-col bg-night text-cream selection:bg-aji selection:text-night font-inter antialiased overflow-x-hidden relative">
        {/* 1. Header fijo translúcido con botón de configuración y scroll */}
        <Navbar />

        {/* Contenido principal */}
        <main className="store-main flex-1">
          {/* Portada */}
          <Hero />

          {/* Catálogo */}
          <Catalog />

          {/* 5. ¿Cómo comprar en 3 pasos? */}
          <HowToBuy />

          {/* 6. Por qué elegirnos */}
          <WhyUs />

          {/* 7. Preguntas frecuentes */}
          <FAQ />
        </main>

        {/* 8. Barra inferior fija "Arma tu combo" */}
        <ComboBar />

        {/* 9. Footer compacto con marcas, redes y enlace de acceso admin */}
        <Footer />

        {/* 10. Botón flotante de WhatsApp */}
        <WhatsAppFloating />
        <StoreFeedback />

        {/* Paleta de comandos (Ctrl+K o /) */}
        <CommandPalette />
      </div>
    </StoreDialogsProvider>
    </MotionConfig>
    </StoreThemeProvider>
    </StoreProvider>
  );
}
