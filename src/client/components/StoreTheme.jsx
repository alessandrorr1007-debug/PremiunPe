import React, { createContext, useContext, useLayoutEffect } from 'react';

const ThemeContext = createContext(null);

export function StoreThemeProvider({ children }) {
  const theme = 'light';
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.storeTheme = theme;
    return () => { delete root.dataset.storeTheme; };
  }, []);
  return <ThemeContext.Provider value={{ theme, toggleTheme: () => {} }}>{children}</ThemeContext.Provider>;
}

export function useStoreTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useStoreTheme requiere StoreThemeProvider');
  return context;
}
