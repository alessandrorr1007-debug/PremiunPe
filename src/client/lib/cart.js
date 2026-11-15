export const COMBO_STORAGE_KEY = 'premiumpe_user_combo_v2';
export const LEGACY_COMBO_KEY = 'premiumpe_user_combo_v1';

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
