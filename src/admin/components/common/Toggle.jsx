import React from 'react';

export default function Toggle({ checked, onChange, label, ariaLabel, activeColor = 'brand', disabled = false, size = 'md' }) {
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
    ? { track: 'w-9 h-5', dot: 'size-3.5', translate: 'translate-x-3.5' }
    : { track: 'w-11 h-6', dot: 'size-4', translate: 'translate-x-5' };

  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer select-none min-h-[36px] py-1 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <div className="relative">
        <input
          type="checkbox"
          className="peer sr-only"
          aria-label={ariaLabel}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span aria-hidden="true" className={`${sizeClasses.track} flex items-center rounded-full border px-[3px] transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-aji ${
          checked ? `${activeBg} border-transparent` : 'bg-ink/10 border-muted'
        }`}>
          <span className={`${sizeClasses.dot} shrink-0 rounded-full transition-transform ${
            checked ? `bg-night ${sizeClasses.translate}` : 'bg-muted'
          }`} />
        </span>
      </div>
      {label && <span className="text-xs text-cream/90 font-medium">{label}</span>}
    </label>
  );
}
