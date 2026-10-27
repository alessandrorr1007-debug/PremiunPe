import React, { useState, useEffect } from 'react';
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
import NotFound from './components/NotFound';

export default function App() {
  const [is404, setIs404] = useState(false);

  useEffect(() => {
    // Si la ruta no es raíz, mostrar 404
    const path = window.location.pathname;
    if (path !== '/' && path !== '/index.html' && path !== '') {
      setIs404(true);
    }
  }, []);

  if (is404) {
    return <NotFound onGoHome={() => { window.history.pushState({}, '', '/'); setIs404(false); }} />;
  }

  return (
    <StoreProvider>
      <StoreThemeProvider>
      <MotionConfig reducedMotion="user">
      <StoreDialogsProvider>
      <div className="store-shell min-h-screen flex flex-col bg-night text-cream selection:bg-aji selection:text-night font-inter antialiased overflow-x-hidden relative">
        {/* 1. Header fijo translúcido y barra de scroll */}
        <Navbar />

        {/* Contenido principal */}
        <main className="store-main flex-1">
          {/* 2. Hero con título, badge y mazo en abanico de 5 tarjetas */}
          <Hero />

          {/* 3 & 4. Aviso visible sobre catálogo y Catálogo con chips, buscador y tarjetas con flip 3D */}
          <Catalog />

          {/* 5. ¿Cómo comprar en 3 pasos? */}
          <HowToBuy />

          {/* 6. Por qué elegirnos (Bento grid de 4 bloques condicionales) */}
          <WhyUs />

          {/* 7. Preguntas frecuentes en acordeón */}
          <FAQ />
        </main>

        {/* 8. Barra inferior fija "Arma tu combo" */}
        <ComboBar />

        {/* 9. Footer compacto con marcas, redes y año auto */}
        <Footer />

        {/* 10. Botón flotante de WhatsApp con pulso y tooltip "¿Hablamos?" a los 5s */}
        <WhatsAppFloating />
        <StoreFeedback />

        {/* Extra Interactivo: Paleta de comandos (Ctrl+K o /) */}
        <CommandPalette />
      </div>
    </StoreDialogsProvider>
    </MotionConfig>
    </StoreThemeProvider>
    </StoreProvider>
  );
}
