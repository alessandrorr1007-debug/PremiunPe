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

async function mockAdminAuth(page) {
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

  return async () => {
    await page.goto('/login');
    await page.getByPlaceholder('Ingresa tu usuario o correo').fill(user.email);
    await page.locator('input[type=password]').fill('isolated-test-password');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await expect(page).toHaveURL(/\/admin$/);
  };
}

test('sesión administrativa verificada, CRUD aislado y cierre de sesión', async ({ page }) => {
  const state = await mockStore(page);
  const login = await mockAdminAuth(page);
  const headers = { 'access-control-allow-origin': '*' };
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

  await login();
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

test('Configuración permite editar, previsualizar, activar, pausar y eliminar una promoción', async ({ page }) => {
  await mockStore(page);
  const login = await mockAdminAuth(page);
  const headers = { 'access-control-allow-origin': '*' };
  let saved;
  await page.route('https://premiumpe-qa.invalid/rest/v1/promotions?**', route => {
    const method = route.request().method();
    if (method === 'GET') return route.fulfill({ headers, json: saved ? [saved] : [] });
    const id = saved.id;
    if (method === 'PATCH') Object.assign(saved, route.request().postDataJSON());
    if (method === 'DELETE') saved = undefined;
    return route.fulfill({ headers, json: { id } });
  });
  await page.route('https://premiumpe-qa.invalid/rest/v1/rpc/save_promotion', route => {
    const { p_id, p_details, p_products } = route.request().postDataJSON();
    saved = { ...p_details, product_ids: p_products, id: p_id ?? 'qa-promo' };
    return route.fulfill({ headers, json: saved.id });
  });

  await login();
  await page.getByRole('button', { name: /^(Configuración|Ajustes)/ }).filter({ visible: true }).click();
  const section = page.getByRole('region', { name: 'Promociones' });
  await section.getByRole('button', { name: 'Nueva promoción' }).click();
  await section.getByLabel('Nombre del combo').fill('Oferta QA');
  await section.getByLabel('Precio promocional (PEN)').fill('15.50');
  await section.getByLabel('Descripción (opcional)').fill('Incluye dos servicios.');
  await section.getByLabel(/Inicio \(opcional/).fill('2025-11-15T10:30');
  await section.getByRole('checkbox', { name: /Servicio Ámbar/ }).check();
  await section.getByRole('checkbox', { name: /Servicio Jade/ }).check();
  await section.getByRole('button', { name: 'Ver vista previa' }).click();
  await expect(section.getByRole('article')).toContainText(/Ahorras S\/ 6[.,]25/);
  await section.getByRole('button', { name: 'Guardar promoción' }).click();
  await expect(section.getByText(/Inactiva/)).toBeVisible();
  expect(saved.product_ids).toEqual(['qa-1', 'qa-2']);
  expect(saved.starts_at).toBe('2025-11-15T15:30:00.000Z');
  await section.getByRole('button', { name: 'Editar', exact: true }).click();
  await expect(section.getByLabel(/Inicio \(opcional/)).toHaveValue('2025-11-15T10:30');
  await section.getByLabel('Precio promocional (PEN)').fill('14');
  await section.getByRole('checkbox', { name: 'Activar promoción' }).check();
  await section.getByRole('button', { name: 'Guardar promoción' }).click();
  await expect(section.getByText(/Publicada/)).toBeVisible();
  expect(saved.price).toBe(14);
  await section.getByRole('button', { name: 'Desactivar' }).click();
  await expect(section.getByText(/Inactiva/)).toBeVisible();
  await section.getByRole('button', { name: 'Eliminar', exact: true }).click();
  await section.getByRole('button', { name: 'Confirmar eliminación' }).click();
  await expect(section.getByText('Todavía no hay promociones.')).toBeVisible();
});
