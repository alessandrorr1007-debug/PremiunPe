import React, { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';

const ThemeContext = createContext(null);
const THEME_KEY = 'premiumpe_theme';
const readTheme = () => {
  try { return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'; }
  catch { return 'light'; }
};

export function StoreThemeProvider({ children }) {
  const [theme, setTheme] = useState(readTheme);
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.storeTheme = theme;
    return () => { delete root.dataset.storeTheme; };
  }, [theme]);
  useEffect(() => {
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* The toggle also works without storage. */ }
  }, [theme]);
  useEffect(() => {
    const sync = event => {
      if (event.key === THEME_KEY || event.key === null) setTheme(event.newValue === 'dark' ? 'dark' : 'light');
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  return <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme(current => current === 'dark' ? 'light' : 'dark') }}>{children}</ThemeContext.Provider>;
}

export function useStoreTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useStoreTheme requiere StoreThemeProvider');
  return context;
}
