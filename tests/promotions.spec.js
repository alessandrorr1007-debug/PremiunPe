import { expect, test } from '@playwright/test';
import { add, cart, catalog, count, mockStore, review } from './store-fixture.js';

async function mockPromotions(page) {
  const state = await mockStore(page);
  const products = catalog.map(({ id, name, delivery_type }) => ({
    id, name, delivery_type, image_url: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
  }));
  const offer = { id: 'qa-promo', name: 'Oferta Ámbar y Jade', price: 16.50, original_price: 21.75, products };
  let published = true;
  const headers = { 'access-control-allow-origin': '*' };
  await page.route('https://premiumpe-qa.invalid/rest/v1/current_promotions?**', route =>
    route.fulfill({ headers, json: published ? [offer] : [] }));
  await page.route('https://premiumpe-qa.invalid/rest/v1/rpc/quote_promotion_order', route => {
    const { p_lines } = route.request().postDataJSON();
    expect(p_lines.every(line => Object.keys(line).sort().join() === 'id,kind,quantity')).toBe(true);
    const quote = published ? p_lines.map(line => {
      const item = line.kind === 'promotion' ? offer : catalog.find(product => product.id === line.id);
      return { ...line, name: item.name, price: item.price,
        delivery_type: item.delivery_type ?? null, products: item.products ?? null };
    }) : null;
    return route.fulfill({ headers, body: JSON.stringify(quote), contentType: 'application/json' });
  });
  return { state, offer, unpublish: () => { published = false; } };
}

test('oferta antes del catálogo, cantidades persistidas y pedido mixto confirmado por WhatsApp', async ({ page }) => {
  const { state, offer } = await mockPromotions(page);
  await page.goto('/');
  const section = page.getByRole('region', { name: /Promociones especiales/ });
  const covers = section.locator('img');
  await expect(covers).toHaveCount(2);
  expect(await covers.evaluateAll(images => {
    const [left, right] = images.map(image => image.getBoundingClientRect());
    return left.width > 0 && Math.abs(left.width - right.width) < 1 &&
      Math.abs(left.right - right.left) < 1 && left.top === right.top;
  })).toBe(true);
  await expect(page.getByRole('button', { name: `Ver detalles de ${catalog[0].name}` })).toHaveText('');
  await expect(page.getByRole('heading', { name: catalog[0].name, exact: true })).toBeVisible();
  await expect(section).toContainText(/Ahorras S\/ 5[.,]25 \(24 %\)/);
  expect(await section.evaluate(element =>
    Boolean(element.compareDocumentPosition(document.getElementById('catalogo')) & Node.DOCUMENT_POSITION_FOLLOWING)
  )).toBe(true);
  await section.getByRole('button', { name: `Agregar promoción ${offer.name}` }).click();
  await expect(section.getByRole('button', { name: `${offer.name} ya está en tu combo` })).toBeDisabled();
  await add(page, catalog[0].name);
  await count(page, 2);
  const expand = cart(page).getByRole('button', { name: /Tu combo ·/ });
  if (await expand.isVisible()) await expand.click();
  await cart(page).getByRole('button', { name: `Aumentar cantidad de ${offer.name}` }).click();
  await expect(cart(page)).toContainText(/45[.,]50/);

  await page.reload();
  await count(page, 2);
  await review(page).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText(/2 × S\/ 16[.,]50/);
  await expect(dialog).toContainText('Servicio Jade');
  await expect(dialog).toContainText(/45[.,]50/);
  await dialog.getByRole('button', { name: 'Continuar en WhatsApp' }).click();
  await expect.poll(() => state.orders.length).toBe(1);
  const order = state.orders[0].searchParams.get('text');
  expect(order).toContain('2 × Oferta Ámbar y Jade [Servicio Ámbar, Servicio Jade]');
  expect(order).toMatch(/Total: S\/ 45[.,]50/);
});

test('precio cambiado obliga a revisar y oferta retirada impide abrir WhatsApp', async ({ page }) => {
  const { state, offer, unpublish } = await mockPromotions(page);
  await page.goto('/');
  const section = page.getByRole('region', { name: /Promociones especiales/ });
  await section.getByRole('button', { name: `Agregar promoción ${offer.name}` }).click();
  await review(page).click();
  const dialog = page.getByRole('dialog');
  const checkout = dialog.getByRole('button', { name: 'Continuar en WhatsApp' });
  offer.price = 15.25;
  await checkout.click();
  await expect(dialog.getByRole('alert')).toContainText('cambió');
  await expect(dialog).toContainText(/15[.,]25/);
  await expect.poll(() => state.orders.length).toBe(0);
  await dialog.getByRole('button', { name: 'Seguir eligiendo' }).click();
  await review(page).click();
  offer.price = 14.25;
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(dialog.getByRole('alert')).toContainText('Tu pedido se actualizó');
  await expect(dialog).toContainText(/14[.,]25/);
  unpublish();
  await checkout.click();
  await expect(section).toHaveCount(0);
  await expect(checkout).toBeDisabled();
  expect(state.orders).toHaveLength(0);
});
