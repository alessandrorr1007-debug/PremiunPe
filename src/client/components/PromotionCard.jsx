import React from 'react';
import { Package } from 'lucide-react';
import { formatPriceNumber } from '../lib/mockData';
import { productCover } from '../lib/productCovers';

export default function PromotionCard({ offer, children }) {
  const original = Number(offer.original_price);
  const savings = Math.round((original - Number(offer.price)) * 100) / 100;
  const percent = original > 0 ? Math.round(savings / original * 100) : 0;
  const splitCover = offer.products.length === 2;

  return (
    <article className="flex flex-col min-w-0 overflow-hidden rounded-2xl bg-surface border border-borderCream">
      {offer.image_url ? (
        <img className="w-full h-28 object-cover" src={offer.image_url} alt="" loading="lazy" />
      ) : (
        <div className={splitCover ? 'grid h-24 grid-cols-2 bg-ink/5 sm:h-auto sm:aspect-[1.65]' : 'flex flex-wrap items-center gap-2 p-4 bg-ink/5'}>
          {offer.products.map(product => {
            const image = product.image_url?.trim() || productCover(product.name).cover;
            return (
              <div key={product.id} className={`overflow-hidden flex items-center justify-center ${splitCover ? 'relative min-w-0' : 'w-11 h-11 rounded-lg bg-surface'}`}>
                {image ? <img className={`w-full h-full object-cover ${splitCover ? 'absolute inset-0' : ''}`} src={image} alt="" loading="lazy" />
                  : <Package className="w-5 h-5 text-muted" aria-hidden="true" />}
              </div>
            );
          })}
        </div>
      )}
      <div className="flex flex-col flex-1 items-start gap-2 p-4 break-words">
        <span className="rounded-full bg-aji/15 text-aji px-2.5 py-1 text-xs font-semibold">Oferta especial</span>
        <h3 className="font-sora font-bold text-cream text-lg w-full">{offer.name || 'Nombre del combo'}</h3>
        <ul aria-label="Productos incluidos" className="text-xs text-muted list-disc pl-4 w-full">
          {offer.products.map(product => <li key={product.id}>{product.name}</li>)}
        </ul>
        {offer.description && <p className="text-sm text-muted w-full whitespace-pre-line">{offer.description}</p>}
        <p className="flex flex-wrap items-baseline gap-x-2">
          <del aria-label="Precio original combinado" className="text-sm text-muted">S/ {formatPriceNumber(original)}</del>
          <strong className="font-sora text-xl text-cream">S/ {formatPriceNumber(offer.price)}</strong>
          <span className="text-xs text-muted">/ mes</span>
        </p>
        {savings > 0 && <p className="text-sm font-medium text-success">Ahorras S/ {formatPriceNumber(savings)} ({percent} %)</p>}
        {children}
      </div>
    </article>
  );
}
