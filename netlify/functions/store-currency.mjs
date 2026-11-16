import countryToCurrency from 'country-to-currency';

const base = { currency: 'PEN', rate: 1 };
const rates = new Map();
const headers = { 'Cache-Control': 'no-store' };

export default async function storeCurrency(request, context) {
  if (request.method !== 'GET') return new Response(null, { status: 405, headers: { ...headers, Allow: 'GET' } });
  const country = context?.geo?.country?.code;
  const currency = /^[A-Z]{2}$/.test(country) ? countryToCurrency[country] : undefined;
  if (!currency || currency === base.currency) return Response.json(base, { headers });

  const cached = rates.get(currency);
  if (cached?.expires > Date.now()) return Response.json({ ...cached.quote, country }, { headers });

  try {
    const response = await fetch(`https://api.frankfurter.dev/v2/rate/PEN/${currency}`, {
      signal: AbortSignal.timeout(3000)
    });
    if (!response.ok) throw new Error('Exchange rate unavailable');
    const { base: source, quote: target, rate } = await response.json();
    if (source !== base.currency || target !== currency || !Number.isFinite(rate) || rate <= 0) {
      throw new Error('Invalid exchange rate');
    }
    const quote = { currency, rate };
    rates.set(currency, { quote, expires: Date.now() + 60 * 60 * 1000 });
    return Response.json({ ...quote, country }, { headers });
  } catch {
    return Response.json(base, { headers });
  }
}
