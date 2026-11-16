import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as root from '../src/client/lib/cart.js';
import * as standalone from '../client/src/lib/cart.js';
import storeCurrency from '../netlify/functions/store-currency.mjs';

test('la moneda se resuelve por país y el respaldo siempre es PEN', async t => {
  const request = new Request('https://premiunpee.netlify.app/.netlify/functions/store-currency');
  const lookup = country => storeCurrency(request, { geo: { country: { code: country } } });
  const fetch = t.mock.method(globalThis, 'fetch', async url => {
    assert.match(url, /\/v2\/rate\/PEN\/BOB$/);
    return Response.json({ base: 'PEN', quote: 'BOB', rate: 2 });
  });
  assert.deepEqual(await (await lookup('PE')).json(), { currency: 'PEN', rate: 1 });
  assert.equal(fetch.mock.callCount(), 0);
  const response = await lookup('BO');
  assert.deepEqual(await response.json(), { currency: 'BOB', rate: 2, country: 'BO' });
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  await lookup('BO');
  assert.equal(fetch.mock.callCount(), 1);

  fetch.mock.mockImplementation(async () => Response.json({ base: 'USD', quote: 'BRL', rate: 5 }));
  assert.deepEqual(await (await lookup('BR')).json(), { currency: 'PEN', rate: 1 });
  assert.deepEqual(await (await lookup(undefined)).json(), { currency: 'PEN', rate: 1 });
});

function storageFor(entries) {
  const data = new Map(entries);
  return {
    getItem: key => data.get(key) ?? null,
    set: (key, value) => data.set(key, value),
  };
}

for (const [entry, cart] of Object.entries({ root, standalone })) {
  test(`${entry}: selección inicial vacía y almacenamiento dañado o bloqueado`, () => {
    assert.deepEqual(cart.readCombo(storageFor()), []);
    assert.deepEqual(cart.readCombo(storageFor([[cart.COMBO_STORAGE_KEY, '{']])), []);
    assert.deepEqual(cart.readCombo({ getItem() { throw new Error('blocked'); } }), []);
  });

  test(`${entry}: descarta el par demo y conserva IDs heredados válidos`, () => {
    const store = storageFor([[cart.LEGACY_COMBO_KEY, JSON.stringify([{ id: 'prod-disney' }, { id: 'prod-canva' }])]]);
    assert.deepEqual(cart.readCombo(store), []);
    store.set(cart.LEGACY_COMBO_KEY, JSON.stringify([{ id: 'one' }, { id: 'one' }, {}, { id: 'two' }]));
    assert.deepEqual(cart.readCombo(store), ['one', 'two']);
    store.set(cart.COMBO_STORAGE_KEY, '[]');
    assert.deepEqual(cart.readCombo(store), []);
  });

  test(`${entry}: disponibilidad, visibilidad y precio finito no negativo`, () => {
    const product = { id: 'one', visible: true, available: true, price: '0.00' };
    assert.equal(cart.canBuy(product), true);
    for (const data of [{ price: null }, { price: Infinity }, { price: -1 }, { visible: false }, { available: false }]) {
      assert.equal(cart.canBuy({ ...product, ...data }), false);
    }
  });
}
