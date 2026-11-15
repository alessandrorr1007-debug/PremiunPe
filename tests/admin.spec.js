import { expect, test } from '@playwright/test';
import { mockStore } from './store-fixture.js';

test('un usuario de demo falsificado no abre el panel', async ({ page }) => {
  await mockStore(page);
  await page.addInitScript(() => localStorage.setItem('premiumpe_demo_admin', JSON.stringify({
    email: 'admin@premiumpe.com', user_metadata: { role: 'admin' },
  })));
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible();
});

test('sesión administrativa verificada, CRUD aislado y cierre de sesión', async ({ page }) => {
  const state = await mockStore(page);
  const user = {
    id: '00000000-0000-4000-8000-000000000001',
    email: 'admin@premiumpe.com',
    email_confirmed_at: '2026-01-01T00:00:00Z',
    aud: 'authenticated',
  };
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const token = [encode({ alg: 'HS256' }), encode({ sub: user.id }), 'test'].join('.');
  const expiry = Math.floor(Date.now() / 1000) + 3600;
  const headers = { 'access-control-allow-origin': '*' };

  await page.route('https://premiumpe-qa.invalid/auth/v1/**', route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/token')) return route.fulfill({
      headers, json: { access_token: token, refresh_token: 'qa-only', expires_in: 3600, expires_at: expiry, token_type: 'bearer', user },
    });
    if (path.endsWith('/user')) return route.fulfill({ headers, json: user });
    if (path.endsWith('/logout')) return route.fulfill({ headers, status: 204 });
    return route.fallback();
  });
  await page.route('https://premiumpe-qa.invalid/rest/v1/products**', route => {
    const request = route.request();
    const method = request.method();
    const id = new URL(request.url()).searchParams.get('id')?.replace(/^eq\./, '');
    if (method === 'POST') {
      const item = { ...request.postDataJSON()[0], id: 'qa-created' };
      state.products.push(item);
      return route.fulfill({ headers, status: 201, json: [item] });
    }
    if (method === 'PATCH') {
      const product = state.products.find(item => item.id === id);
      Object.assign(product, request.postDataJSON());
      return route.fulfill({ headers, json: product });
    }
    if (method === 'DELETE') {
      state.products = state.products.filter(item => item.id !== id);
      return route.fulfill({ headers, json: { id } });
    }
    return route.fallback();
  });

  await page.goto('/login');
  await page.getByPlaceholder('Ingresa tu usuario o correo').fill(user.email);
  await page.locator('input[type=password]').fill('isolated-test-password');
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole('button', { name: /^Productos/ }).click();
  await page.getByRole('button', { name: /^Nuevo Producto/ }).click();
  await page.getByPlaceholder('ej. Disney+ Premium').fill('Servicio creado en QA');
  await page.getByRole('button', { name: /Precio y Estado/ }).click();
  await page.getByPlaceholder('12.00').fill('19.75');
  await page.getByRole('button', { name: /^Crear Producto/ }).click();
  await expect.poll(() => state.products.some(product => product.name === 'Servicio creado en QA')).toBe(true);
  const initialRow = page.getByRole('row').filter({ hasText: 'Servicio creado en QA' });
  await initialRow.getByRole('button', { name: 'Editar producto' }).click();
  await page.getByPlaceholder('ej. Disney+ Premium').fill('Servicio editado en QA');
  await page.getByRole('button', { name: /Precio y Estado/ }).click();
  await page.getByPlaceholder('12.00').fill('25.50');
  await page.getByRole('button', { name: 'Guardar Cambios' }).click();
  const updatedRow = page.getByRole('row').filter({ hasText: 'Servicio editado en QA' });
  await expect(updatedRow).toContainText(/25[.,]50/);

  const storefront = await page.context().newPage();
  await mockStore(storefront, state);
  await storefront.goto('/');
  await expect(storefront.getByRole('heading', { name: 'Servicio editado en QA', exact: true })).toBeVisible();
  await storefront.close();

  await updatedRow.getByRole('button', { name: 'Eliminar producto' }).click();
  await page.getByRole('button', { name: 'Confirmar Eliminación' }).click();
  await expect(updatedRow).toHaveCount(0);
  await page.reload();
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole('button', { name: 'Cerrar Sesión', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Servicio editado en QA', exact: true })).toHaveCount(0);
});
