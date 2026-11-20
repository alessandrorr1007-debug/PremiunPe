import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { formatPriceNumber } from '../lib/mockData';

export const formatSoles = price => `S/ ${formatPriceNumber(price)}`;
const soles = { currency: 'PEN', formatPrice: formatSoles };
const CurrencyContext = createContext(soles);

export function StoreCurrencyProvider({ children }) {
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 4500);
    const load = async () => {
      try {
        const response = await fetch('/.netlify/functions/store-currency', {
          signal: controller.signal
        });
        if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) return;
        const data = await response.json();
        if (data.currency !== 'PEN' && /^[A-Z]{3}$/.test(data.currency) && /^[A-Z]{2}$/.test(data.country) &&
          Number.isFinite(data.rate) && data.rate > 0 && !controller.signal.aborted) {
          setQuote(data);
        }
      } catch {
        // Soles remain available when localization is unavailable.
      } finally {
        window.clearTimeout(timeout);
      }
    };
    load();
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const value = useMemo(() => {
    if (!quote) return soles;
    const formatter = new Intl.NumberFormat(`es-${quote.country}`, { style: 'currency', currency: quote.currency });
    return { currency: quote.currency, formatPrice: price => formatter.format(Number(price) * quote.rate) };
  }, [quote]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export const useStoreCurrency = () => useContext(CurrencyContext);

export function CurrencyNotice() {
  const { currency } = useStoreCurrency();
  if (currency === 'PEN') return null;
  return <p className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-2 text-xs text-muted">
    Precios referenciales en {currency}. El pago se realiza en soles peruanos (PEN).
  </p>;
}
