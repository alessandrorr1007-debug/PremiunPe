import { expect, test } from '@playwright/test';
import { mockStore } from './store-fixture';

test('muestra los enlaces configurados y sincroniza altas, cambios y bajas', async ({ page, context }) => {
  await mockStore(page);
  let socialLinks = {
    tiktok: 'https://www.tiktok.com/@premiumpe-qa?ref=qa',
    facebook: '',
    instagram: '',
  };
  await page.route('**/rest/v1/settings?*', route => route.fulfill({
    json: [{ id: 1, social_links: socialLinks }],
    headers: { 'access-control-allow-origin': '*' },
  }));
  await context.route(/^https:\/\/www\.(tiktok|facebook|instagram)\.com\//, route =>
    route.fulfill({ body: 'Perfil de prueba' })
  );
  await page.goto('/');

  const navigation = page.getByRole('navigation', { name: 'Redes sociales' });
  const link = name => navigation.getByRole('link', { name: name + ' de PremiumPe' });
  const checkLink = async (name, url) => {
    const anchor = link(name);
    await expect(anchor).toHaveAttribute('href', url);
    await expect(anchor).toHaveAttribute('target', '_blank');
    await expect(anchor).toHaveAttribute('rel', 'noopener noreferrer');
    const [popup] = await Promise.all([page.waitForEvent('popup'), anchor.click()]);
    await expect(popup).toHaveURL(url);
    await expect(popup.getByText('Perfil de prueba')).toBeVisible();
    await popup.close();
  };

  await checkLink('TikTok', socialLinks.tiktok);
  await expect(navigation.getByRole('link')).toHaveCount(1);

  socialLinks = {
    tiktok: 'https://www.tiktok.com/@premiumpe-qa-actualizado',
    facebook: 'https://www.facebook.com/premiumpe-qa',
    instagram: 'https://www.instagram.com/premiumpe-qa/',
  };
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await checkLink('TikTok', socialLinks.tiktok);
  await checkLink('Facebook', socialLinks.facebook);
  await checkLink('Instagram', socialLinks.instagram);

  socialLinks = { facebook: 'http://facebook.com/no-seguro', instagram: 'javascript:void(0)' };
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(navigation).toHaveCount(0);
});
