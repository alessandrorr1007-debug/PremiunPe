import { chromium, devices, expect } from '@playwright/test';

const url = 'https://premiunpee.netlify.app/';
const browser = await chromium.launch({ channel: process.env.PREMIUMPE_BROWSER_CHANNEL || undefined });

try {
  for (const device of ['Desktop Chrome', 'iPhone 13']) {
    const page = await browser.newPage(devices[device]);
    const errors = [];
    const failedResponses = [];
    page.on('pageerror', error => errors.push(error.name));
    page.on('response', response => {
      if (response.status() >= 400) failedResponses.push(response.status());
    });
    await page.route('**/*', route => {
      const host = new URL(route.request().url()).hostname;
      const allowed = host === 'premiunpee.netlify.app' || host.endsWith('.supabase.co') ||
        ['fonts.googleapis.com', 'fonts.gstatic.com'].includes(host);
      return allowed && route.request().method() === 'GET' ? route.continue() : route.abort();
    });
    await page.routeWebSocket('**/*', socket => socket.close());
    await page.addInitScript(() => {
      window.lab = { lcpMs: null, cls: 0 };
      new PerformanceObserver(list => {
        window.lab.lcpMs = list.getEntries().at(-1)?.startTime ?? null;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver(list => {
        window.lab.cls += list.getEntries().filter(entry => !entry.hadRecentInput).reduce((sum, entry) => sum + entry.value, 0);
      }).observe({ type: 'layout-shift', buffered: true });
    });

    const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
    const catalog = page.locator('#catalogo');
    await expect(catalog.getByRole('heading', { level: 3 }).first()).toBeVisible();
    const cart = page.getByRole('complementary', { name: 'Tu combo de servicios' });
    const snapshot = () => cart.evaluate(el => Number(el.textContent.match(/Tu combo · (\d+) servicios?/)?.[1]));
    const before = await snapshot();
    await page.waitForTimeout(1000);
    const lab = await page.evaluate(() => ({
      ...window.lab,
      overflowPx: document.documentElement.scrollWidth - innerWidth,
    }));

    const available = catalog.getByRole('button', { name: /agregar.*combo|^\+ Agregar$/i }).first();
    await available.click();
    await expect.poll(snapshot).toBe(before + 1);
    const review = cart.getByRole('button', { name: /Revisar (mi combo|pedido)/ });
    const blockedByBadge = await review.evaluate(button => {
      const { x, y, width, height } = button.getBoundingClientRect();
      return document.elementFromPoint(x + width / 2, y + height / 2)?.id === 'nl-badge-frame';
    });
    if (blockedByBadge) {
      console.log(JSON.stringify({ device, status: response.status(), before, afterAdd: await snapshot(), blockedByBadge, lab, errors, failedResponses }));
      process.exitCode = 1;
      await page.close();
      continue;
    }
    await review.click({ timeout: 10000 });
    const dialog = page.getByRole('dialog');
    const whatsapp = dialog.getByRole('link', { name: /WhatsApp/i });
    await expect(whatsapp).toHaveAttribute('href', /^https:\/\/wa\.me\//);
    await page.getByRole('button', { name: 'Seguir eligiendo' }).click();
    const expand = cart.getByRole('button', { name: /Tu combo ·/ });
    if (await expand.isVisible()) await expand.click();
    await cart.getByRole('button', { name: /Eliminar .* del combo/ }).last().click();
    await expect.poll(snapshot).toBe(before);
    console.log(JSON.stringify({ device, status: response.status(), before, after: await snapshot(), lab, errors, failedResponses }));
    await page.close();
  }
} finally {
  await browser.close();
}
