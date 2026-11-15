import { expect, test } from '@playwright/test';
import { add, cart, catalog, count, mockStore, review } from './store-fixture.js';

test('CART-13 · catálogo, carrito y controles en el ancho del dispositivo', async ({ page }) => {
  await mockStore(page);
  await page.goto('/');
  await add(page, catalog[0].name);
  await count(page, 1);
  const width = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(width).toBeLessThanOrEqual(1);
  if (await page.evaluate(() => innerWidth < 640)) {
    await page.evaluate(() => {
      const badge = document.createElement('iframe');
      badge.id = 'nl-badge-frame';
      badge.title = 'Insignia de hosting simulada';
      badge.style.cssText = 'position:fixed;right:0;bottom:0;width:197px;height:64px;z-index:2147483645';
      document.body.append(badge);
    });
  }
  await review(page).click();
  await expect(page.getByRole('dialog')).toContainText(catalog[0].name);
  await page.getByRole('button', { name: 'Seguir eligiendo' }).click();
  const expand = cart(page).getByRole('button', { name: /Tu combo ·/ });
  if (await expand.isVisible()) await expand.click();
  await cart(page).getByRole('button', { name: /Eliminar Servicio Ámbar/ }).click();
  await count(page, 0);
});
