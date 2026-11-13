import React from 'react';
import { Check, Clapperboard, LayoutGrid, Paintbrush, Plus, ShoppingCart, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useStoreDialogs } from './StoreDialogs';
import { formatPriceNumber } from '../lib/mockData';

const covers = import.meta.glob('../assets/covers/*.webp', {
  eager: true,
  import: 'default',
});

const serviceBrands = ['disney', 'hbo', 'vix', 'prime', 'canva', 'office', 'gemini', 'chatgpt'];
const categoryIcons = { Streaming: Clapperboard, Herramientas: Paintbrush, IA: Sparkles };

export default function ProductCard({ product }) {
  const { addToCombo, combo } = useStore();
  const { openProductDetails, reviewProductOrder } = useStoreDialogs();
  const available = product.available !== false;
  const inCombo = combo.some(item => item.id === product.id || item.name === product.name);
  const name = product.name.toLowerCase();
  const brand = serviceBrands.find(service => name.includes(service));
  const cover = covers[`../assets/covers/${brand}.webp`];
  const CategoryIcon = categoryIcons[product.category] || LayoutGrid;

  return (
    <article className="market-card">
      <button type="button" className="market-cover" data-brand={brand} data-category={product.category}
        onClick={() => openProductDetails(product)} aria-haspopup="dialog" aria-label={`Ver detalles de ${product.name}`}>
        {cover
          ? <img src={cover} alt="" loading="lazy" decoding="async" />
          : <CategoryIcon className="market-cover-icon" aria-hidden="true" />}
        <span>{product.name}</span>
      </button>
      <div className="market-card-body">
        <h3>{product.name}</h3>
        <p className="market-description">{product.description}</p>
        <div className="market-price"><strong>S/ {formatPriceNumber(product.price)}</strong> <span>/ mes</span></div>
        <div className="market-card-actions">
          <button type="button" className="market-primary" disabled={!available}
            onClick={() => reviewProductOrder(product)} aria-haspopup="dialog">
            <ShoppingCart size={16} aria-hidden="true" />{available ? 'Pedir' : 'Agotado'}
          </button>
          <button type="button" className="market-add" disabled={!available || inCombo}
            onClick={() => addToCombo(product)}
            aria-label={inCombo ? `${product.name} ya está en tu combo` : `Agregar ${product.name} al combo`}
            title={inCombo ? 'En tu combo' : 'Agregar al combo'}>
            {inCombo ? <Check size={16} /> : <Plus size={16} />}
          </button>
        </div>
      </div>
    </article>
  );
}
