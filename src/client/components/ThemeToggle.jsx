import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useStoreTheme } from './StoreTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useStoreTheme();
  const label = theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro';
  const Icon = theme === 'dark' ? Sun : Moon;
  return (
    <button type="button" onClick={toggleTheme} aria-label={label} title={label}
      className="min-w-[44px] min-h-[44px] shrink-0 rounded-xl border border-borderCream bg-ink/[0.04] text-muted hover:text-cream hover:bg-ink/[0.08] active:scale-95 transition-all flex items-center justify-center">
      <Icon className="w-4 h-4" aria-hidden="true" />
    </button>
  );
}
