import React, { useState, useEffect, useRef } from 'react';
import { useAdminStore } from '../context/AdminStoreContext';
import { Check, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

export default function QuickPriceEdit({ product }) {
  const { quickUpdatePrice, settings } = useAdminStore();
  const currency = settings?.currency || 'S/';

  const [isEditing, setIsEditing] = useState(false);
  const [priceInput, setPriceInput] = useState(Number(product.price).toFixed(2));
  const [showCheck, setShowCheck] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setPriceInput(Number(product.price).toFixed(2));
  }, [product.price]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const validatePrice = (val) => {
    // Validar que sea un número mayor o igual a 0 con máximo 2 decimales
    const num = parseFloat(val);
    if (isNaN(num) || num < 0) return false;
    const decimalParts = val.toString().split('.');
    if (decimalParts.length > 2) return false;
    if (decimalParts.length === 2 && decimalParts[1].length > 2) return false;
    return true;
  };

  const handleSave = async () => {
    if (!validatePrice(priceInput)) {
      toast.error('Ingresa un precio válido (≥ 0, máx 2 decimales).');
      setPriceInput(Number(product.price).toFixed(2));
      setIsEditing(false);
      return;
    }

    const parsed = parseFloat(priceInput);
    if (parsed === parseFloat(product.price)) {
      setIsEditing(false);
      return;
    }

    const success = await quickUpdatePrice(product.id, parsed);
    setIsEditing(false);
    if (success) {
      setShowCheck(true);
      toast.success(`Precio actualizado: ${currency} ${parsed.toFixed(2)}`);
      setTimeout(() => setShowCheck(false), 2000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setPriceInput(Number(product.price).toFixed(2));
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="inline-flex items-center gap-1 font-mono" onClick={(e) => e.stopPropagation()}>
        <span className="text-xs font-semibold text-aji select-none">
          {currency}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={priceInput}
          onChange={(e) => setPriceInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="w-20 px-2 py-1 rounded-lg text-xs font-mono font-bold bg-night border border-aji text-cream focus:outline-none focus:ring-2 focus:ring-aji/40 tabular-nums shadow-sm"
          placeholder="0.00"
        />
      </div>
    );
  }

  return (
    <button
      onClick={handleStartEdit}
      className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.08] transition-colors font-mono text-xs tabular-nums text-left border border-transparent hover:border-borderCream"
      title="Clic para editar precio (Enter guarda, Esc cancela)"
    >
      <span className="font-bold text-cream group-hover:text-aji">
        {currency} {Number(product.price).toFixed(2)}
      </span>

      {showCheck ? (
        <span className="p-0.5 rounded bg-lime/20 text-lime">
          <Check className="w-3 h-3" />
        </span>
      ) : (
        <Edit2 className="w-2.5 h-2.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
}
