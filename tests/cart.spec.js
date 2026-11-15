import { expect, test } from '@playwright/test';
import { add, addButton, cart, catalog, catalogSearch, count, mockStore, oldStorage, review, storage } from './store-fixture.js';

test('CART-01/02 · visita nueva y recarga', async ({ page }) => {
  await mockStore(page);
  await page.goto('/');
  await expect(page.getByText(catalog[0].name).first()).toBeVisible();
  await count(page, 0);
  await expect(review(page)).toBeDisabled();
  await page.reload();
  await count(page, 0);
});

test('CART-03/04/05/06/07 · agregar, total, recargar, quitar y vaciar', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await mockStore(page);
  await page.goto('/');
  await add(page, catalog[0].name);
  await count(page, 1);
  await expect(cart(page)).toContainText(catalog[0].name);
  await add(page, catalog[1].name);
  await count(page, 2);
  await expect(cart(page)).toContainText(/21[.,]75/);
  await review(page).click();
  await expect(page.getByRole('dialog')).toContainText(catalog[1].name);
  await page.reload();
  await count(page, 2);
  await cart(page).getByRole('button', { name: /Eliminar Servicio Ámbar/ }).click();
  await count(page, 1);
  await expect(cart(page)).toContainText(/9[.,]25/);
  await cart(page).getByRole('button', { name: 'Vaciar combo' }).click();
  await count(page, 0);
  await page.reload();
  await count(page, 0);
  expect(errors).toEqual([]);
});

test('CART-08 · rechaza un producto eliminado antes de salir a WhatsApp', async ({ page }) => {
  const state = await mockStore(page);
  await page.goto('/');
  await add(page, catalog[0].name);
  await review(page).click();
  state.products.shift();
  await page.getByRole('button', { name: 'Continuar en WhatsApp' }).click();
  await expect(page.getByRole('alert')).toContainText('Cambió la disponibilidad');
  await count(page, 0);
  expect(state.orders).toHaveLength(0);
});

test('CART-09 · actualiza precio y nombre y pide revisar el cambio', async ({ page }) => {
  const state = await mockStore(page);
  await page.goto('/');
  await add(page, catalog[0].name);
  await review(page).click();
  Object.assign(state.products[0], { name: 'Servicio actualizado', price: 20.75 });
  const checkout = page.getByRole('button', { name: 'Continuar en WhatsApp' });
  await checkout.click();
  await expect(page.getByRole('alert')).toContainText('El pedido cambió');
  await expect(page.getByRole('dialog')).toContainText('Servicio actualizado');
  await expect(page.getByRole('dialog')).toContainText(/20[.,]75/);
  expect(state.orders).toHaveLength(0);
  await checkout.click();
  await expect.poll(() => state.orders.length).toBe(1);
  expect(state.orders[0].searchParams.get('text')).toContain('Servicio actualizado');
});

test('CART-10 · almacenamiento corrupto', async ({ page }) => {
  await mockStore(page);
  await page.addInitScript(key => localStorage.setItem(key, '{invalid'), storage);
  await page.goto('/');
  await count(page, 0);
  await add(page, catalog[0].name);
  await count(page, 1);
});

test('CART-11 · doble evento de agregar', async ({ page }) => {
  await mockStore(page);
  await page.goto('/');
  await catalogSearch(page).fill(catalog[0].name);
  await addButton(page).evaluate(button => {
    button.click();
    button.click();
  });
  await count(page, 1);
});

test('CART-12 · navegación y regreso', async ({ page }) => {
  await mockStore(page);
  await page.goto('/');
  await add(page, catalog[0].name);
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/');
  await count(page, 1);
});

test('CART-14 · error de red y recuperación con selección conservada', async ({ page }) => {
  const state = await mockStore(page);
  await page.goto('/');
  await add(page, catalog[0].name);
  state.offline = true;
  await page.reload();
  await expect(page.getByText('Catálogo no disponible').first()).toBeVisible();
  await expect(review(page)).toBeDisabled();
  state.offline = false;
  await page.getByRole('button', { name: /reintentar|intentar de nuevo/i }).click();
  await count(page, 1);
  await review(page).click();
  state.offline = true;
  await page.getByRole('button', { name: 'Continuar en WhatsApp' }).click();
  await expect(page.getByRole('alert')).toContainText('No pudimos verificar');
  expect(state.orders).toHaveLength(0);
});

test('CART-15 · migra IDs válidos, depura duplicados y obtiene datos actuales', async ({ page }) => {
  await mockStore(page);
  await page.addInitScript(({ key, product }) => localStorage.setItem(key, JSON.stringify([
    { ...product, name: 'Anterior', price: 1 }, product, { id: 'deleted' }, null,
  ])), { key: oldStorage, product: catalog[0] });
  await page.goto('/');
  await count(page, 1);
  await expect(cart(page)).toContainText(catalog[0].name);
  await expect(cart(page)).toContainText(/12[.,]50/);
  await expect.poll(() => page.evaluate(key => localStorage.getItem(key), storage)).toBe('["qa-1"]');
});

test('elimina el par demo heredado y respeta un catálogo remoto vacío', async ({ page }) => {
  const state = await mockStore(page);
  state.products = [];
  await page.addInitScript(key => {
    localStorage.setItem(key, JSON.stringify([{ id: 'prod-disney' }, { id: 'prod-canva' }]));
    localStorage.setItem('premiumpe_products', JSON.stringify([{ id: 'old', name: 'Catálogo obsoleto', visible: true }]));
  }, oldStorage);
  await page.goto('/');
  await count(page, 0);
  await expect(page.getByText('Catálogo obsoleto')).toHaveCount(0);
  await expect.poll(() => page.evaluate(key => localStorage.getItem(key), storage)).toBe('[]');
});
