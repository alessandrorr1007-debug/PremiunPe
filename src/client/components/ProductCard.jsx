import React from 'react';
import { Check, Plus, ShoppingCart } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useStoreDialogs } from './StoreDialogs';
import { formatPriceNumber } from '../lib/mockData';

export default function ProductCard({ product }) {
  const { addToCombo, combo } = useStore();
  const { openProductDetails, reviewProductOrder } = useStoreDialogs();
  const available = product.available !== false;
  const inCombo = combo.some(item => item.id === product.id || item.name === product.name);
  const name = product.name.toLowerCase();
  const brand = ['disney', 'canva', 'prime', 'chatgpt'].find(service => name.includes(service)) || 'default';

  return (
    <article className="market-card">
      <button type="button" className="market-cover" data-brand={brand} data-category={product.category}
        onClick={() => openProductDetails(product)} aria-haspopup="dialog" aria-label={`Ver detalles de ${product.name}`}>
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
