import React from 'react';
import { Check, Plus } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import PromotionCard from './PromotionCard';

export default function Promotions() {
  const { promotions, promotionCart, setPromotionQuantity } = useStore();
  if (!promotions.length) return null;

  return (
    <section aria-labelledby="promociones-heading" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h2 id="promociones-heading" className="font-sora text-xl sm:text-2xl font-bold text-cream mb-4">
        🔥 Promociones especiales
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promotions.map(offer => {
          const inCart = promotionCart.has(offer.id);
          return (
            <PromotionCard key={offer.id} offer={offer}>
              <button type="button" className="market-primary w-full mt-auto disabled:opacity-60"
                aria-label={inCart ? `${offer.name} ya está en tu combo` : `Agregar promoción ${offer.name}`}
                disabled={inCart} onClick={() => setPromotionQuantity(offer.id, 1)}>
                {inCart ? <Check size={16} /> : <Plus size={16} />}
                {inCart ? 'En tu combo' : 'Agregar combo'}
              </button>
            </PromotionCard>
          );
        })}
      </div>
    </section>
  );
}
