export const COMBO_STORAGE_KEY = 'premiumpe_user_combo_v2';
export const LEGACY_COMBO_KEY = 'premiumpe_user_combo_v1';
export const PROMOTION_CART_KEY = 'premiumpe_promotion_cart_v1';

export function readPromotionCart(storage) {
  try {
    const entries = JSON.parse(storage.getItem(PROMOTION_CART_KEY) ?? '[]');
    if (!Array.isArray(entries)) return new Map();
    return new Map(entries.filter(entry => Array.isArray(entry) && typeof entry[0] === 'string' &&
      Number.isInteger(entry[1]) && entry[1] >= 1 && entry[1] <= 99));
  } catch {
    return new Map();
  }
}

export function lineTotal(item) {
  return Math.round(Number(item.price) * 100) * (item.quantity ?? 1) / 100;
}

export function cartTotal(items) {
  return items.reduce((cents, item) => cents + Math.round(lineTotal(item) * 100), 0) / 100;
}

export function matchesQuote(item, line) {
  return item.id === line?.id && (item.kind ?? 'product') === (line.kind ?? 'product') &&
    item.name === line.name && Number(item.price) === Number(line.price) &&
    (item.quantity ?? 1) === (line.quantity ?? 1) &&
    (item.delivery_type ?? null) === (line.delivery_type ?? null) &&
    (item.products?.length ?? 0) === (line.products?.length ?? 0) &&
    (item.products ?? []).every((product, index) => {
      const quoted = line.products[index];
      return product.id === quoted.id && product.name === quoted.name && product.delivery_type === quoted.delivery_type;
    });
}

export function readCombo(storage) {
  try {
    const current = storage.getItem(COMBO_STORAGE_KEY);
    const saved = JSON.parse(current ?? storage.getItem(LEGACY_COMBO_KEY) ?? '[]');
    if (!Array.isArray(saved)) return [];
    const ids = saved.map(item => current === null ? item?.id : item);
    // The previous version persisted its demo pair even without user interaction.
    if (current === null && ids.join(',') === 'prod-disney,prod-canva') return [];
    return [...new Set(ids.filter(id => typeof id === 'string' && id.trim()))];
  } catch {
    return [];
  }
}

export function canBuy(product) {
  return Boolean(product?.id && product.visible && product.available &&
    product.price != null && product.price !== '' &&
    Number.isFinite(Number(product.price)) && Number(product.price) >= 0);
}
