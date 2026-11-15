import { expect } from '@playwright/test';

export const oldStorage = 'premiumpe_user_combo_v1';
export const storage = 'premiumpe_user_combo_v2';
export const catalog = [
  { id: 'qa-1', name: 'Servicio Ámbar', price: 12.50 },
  { id: 'qa-2', name: 'Servicio Jade', price: 9.25 },
].map(item => ({
  ...item, visible: true, available: true, category: 'Streaming',
  delivery_type: 'perfil', description: 'Servicio para pruebas aisladas.',
}));

export async function mockStore(page, state = { products: catalog.map(item => ({ ...item })), offline: false, orders: [] }) {
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1') return route.continue();
    if (url.hostname === 'wa.me') {
      state.orders.push(url);
      return route.fulfill({ body: 'Pedido interceptado' });
    }
    if (url.hostname !== 'premiumpe-qa.invalid') return route.abort();
    const headers = { 'access-control-allow-origin': '*' };
    if (url.pathname === '/rest/v1/settings') return route.fulfill({ json: { id: 1 }, headers });
    if (url.pathname === '/rest/v1/products' && route.request().method() === 'GET') {
      if (state.offline) return route.fulfill({ status: 503, json: { message: 'Unavailable' }, headers });
      return route.fulfill({ json: state.products.filter(product => product.visible), headers });
    }
    return route.fulfill({ status: 401, json: { message: 'Unauthorized' }, headers });
  });
  await page.routeWebSocket('wss://premiumpe-qa.invalid/**', socket => socket.close());
  return state;
}

export const cart = page => page.getByRole('complementary', { name: 'Tu combo de servicios' });
export const review = page => cart(page).getByRole('button', { name: /Revisar (mi combo|pedido)/ });
export const catalogSearch = page => page.getByRole('textbox', { name: 'Filtrar servicios del catálogo' });
export const addButton = page => page.getByRole('button', { name: '+ Agregar', exact: true }).first();

export async function count(page, number) {
  await expect(cart(page).getByText(new RegExp(`Tu combo · ${number} servicios?`)).filter({visible:true})).toBeVisible();
}

export async function add(page, name) {
  await catalogSearch(page).fill(name);
  const product = page.locator('.product-card').filter({ has: page.getByRole('heading', { name, exact: true }) });
  await product.getByRole('button', { name: '+ Agregar', exact: true }).click();
}
