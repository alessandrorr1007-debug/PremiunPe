import React from 'react';

export default function NotFound({ onGoHome }) {
  return (
    <div className="min-h-screen bg-night text-cream flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-aji text-night flex items-center justify-center font-sora font-extrabold text-3xl shadow-[0_0_30px_rgba(0,0,0,0.4)] mb-6">
        404
      </div>
      <h1 className="font-sora text-3xl sm:text-4xl font-extrabold text-cream mb-2">
        Página no encontrada
      </h1>
      <p className="text-muted text-sm max-w-md mb-8">
        La página o servicio que buscas no existe o fue movido. Puedes regresar al catálogo principal de suscripciones.
      </p>
      <button
        type="button"
        onClick={() => {
          if (onGoHome) onGoHome();
          else window.location.href = '/';
        }}
        className="px-6 py-3 rounded-2xl bg-aji text-night font-sora font-bold text-sm shadow-md hover:brightness-110 active:scale-95 transition-all min-h-[44px]"
      >
        Volver al Catálogo
      </button>
    </div>
  );
}
