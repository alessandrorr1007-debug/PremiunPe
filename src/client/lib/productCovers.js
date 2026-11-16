const covers = import.meta.glob('../assets/covers/*.webp', { eager: true, import: 'default' });
const brands = ['disney', 'hbo', 'vix', 'prime', 'canva', 'office', 'gemini', 'chatgpt'];

export function productCover(name) {
  const brand = brands.find(service => name.toLowerCase().includes(service));
  return { brand, cover: covers[`../assets/covers/${brand}.webp`] };
}
