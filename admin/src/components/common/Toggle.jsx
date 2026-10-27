import React from 'react';

export default function Toggle({ checked, onChange, label, activeColor = 'brand', disabled = false, size = 'md' }) {
  const colorClasses = {
    brand: 'bg-aji',
    aji: 'bg-aji',
    emerald: 'bg-lime',
    lime: 'bg-lime',
    amber: 'bg-aji',
    rocoto: 'bg-rocoto',
    rose: 'bg-rocoto',
  };

  const activeBg = colorClasses[activeColor] || 'bg-aji';

  const sizeClasses = size === 'sm' 
    ? { switch: 'w-8 h-4.5', dot: 'w-3.5 h-3.5', translate: 'translate-x-3.5' }
    : { switch: 'w-10 h-5.5', dot: 'w-4 h-4', translate: 'translate-x-4.5' };

  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer select-none min-h-[36px] py-1 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`${sizeClasses.switch} rounded-full transition-colors duration-200 ease-in-out border border-borderCream ${
            checked ? activeBg : 'bg-white/10'
          }`}
        />
        <div
          className={`absolute left-0.5 top-0.5 ${sizeClasses.dot} rounded-full ${
            checked ? 'bg-night' : 'bg-cream'
          } transition-transform duration-200 ease-in-out shadow-sm ${
            checked ? sizeClasses.translate : 'translate-x-0'
          }`}
        />
      </div>
      {label && <span className="text-xs text-cream/90 font-medium">{label}</span>}
    </label>
  );
}
