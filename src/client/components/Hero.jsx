import React from 'react';
import { Smartphone } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import heroArt from '../assets/tienda-portada.webp';

export default function Hero() {
  const { settings } = useStore();
  const previousTitle = 'Tus plataformas favoritas, al precio justo';
  const title = settings?.hero_title;
  const subtitle = settings?.hero_subtitle;

  return (
    <section className="market-hero mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-labelledby="store-title">
      <div className="market-intro">
        <h1 id="store-title">{title && title !== previousTitle ? title : 'Elige tu próxima suscripción'}</h1>
        <p>{subtitle && subtitle !== 'Elige, combina y pide por WhatsApp en minutos.' ? subtitle : 'Membresías digitales premium al mejor precio en Perú.'}</p>
        <div className="market-payment"><Smartphone size={20} aria-hidden="true" /><span><strong>{settings?.payment_methods || 'Yape y Plin'}</strong> como medios de pago.</span></div>
      </div>
      <img className="market-hero-art" src={heroArt} alt="" fetchPriority="high" width="1000" height="550" />
    </section>
  );
}
