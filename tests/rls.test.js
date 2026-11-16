import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const db = new PGlite();
const schema = await readFile(new URL('../supabase/schema.sql', import.meta.url), 'utf8');
const promotionsMigration = await readFile(new URL('../supabase/migrations/20261116005849_promotions.sql', import.meta.url), 'utf8');
const admin = { sub: '00000000-0000-0000-0000-000000000001', email: 'admin@premiumpe.com', role: 'authenticated' };
const stranger = { sub: '00000000-0000-0000-0000-000000000002', email: 'buyer@example.test', role: 'authenticated', user_metadata: { role: 'admin' } };

before(async () => {
  await db.exec(`
    CREATE ROLE anon;
    CREATE ROLE authenticated;
    CREATE SCHEMA auth;
    CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS
      'SELECT current_setting(''request.jwt.claims'', true)::jsonb';
    CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS
      'SELECT auth.jwt() ->> ''role''';
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
      'SELECT (auth.jwt() ->> ''sub'')::uuid';
    CREATE SCHEMA storage;
    CREATE TABLE storage.buckets (id text PRIMARY KEY, name text, public boolean);
    CREATE TABLE storage.objects (id uuid DEFAULT gen_random_uuid(), bucket_id text, name text);
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    GRANT USAGE ON SCHEMA auth, storage TO anon, authenticated;
  `);
  await db.exec(schema);
  await db.exec('GRANT SELECT, INSERT, UPDATE, DELETE ON public.products, public.settings, storage.objects TO anon, authenticated');
  await db.exec(promotionsMigration);
});
after(() => db.close());

const as = (role, claims, run) => db.transaction(async tx => {
  await tx.exec(`SET LOCAL ROLE ${role}`);
  await tx.query("SELECT set_config('request.jwt.claims', $1, true)", [JSON.stringify(claims)]);
  return run(tx);
});

test('anon ve solo los productos visibles y la configuración pública', async () => {
  const id = (await db.query("INSERT INTO products (name, category, price, visible) VALUES ('Oculto', 'IA', 1, false) RETURNING id")).rows[0].id;
  await as('anon', { role: 'anon' }, async tx => {
    assert.equal((await tx.query('SELECT id FROM products WHERE id = $1', [id])).rows.length, 0);
    assert.equal((await tx.query('SELECT id FROM settings')).rows.length, 1);
  });
});

test('un usuario ordinario no escribe aunque declare rol admin en sus metadatos', async () => {
  await assert.rejects(as('authenticated', stranger, tx =>
    tx.query("INSERT INTO products (name, category, price) VALUES ('Intruso', 'IA', 1)")), { code: '42501' });
  await as('authenticated', stranger, async tx => {
    assert.equal((await tx.query("UPDATE products SET price = 1 RETURNING id")).rows.length, 0);
    assert.equal((await tx.query("DELETE FROM products RETURNING id")).rows.length, 0);
    assert.equal((await tx.query("UPDATE settings SET store_name = 'Intruso' RETURNING id")).rows.length, 0);
  });
});

test('el administrador crea, actualiza y elimina y el cliente ve el cambio', async () => {
  const insert = await as('authenticated', admin, tx =>
    tx.query("INSERT INTO products (name, category, price) VALUES ('QA inicial', 'IA', 1) RETURNING id"));
  const id = insert.rows[0].id;
  await as('authenticated', admin, tx =>
    tx.query("UPDATE products SET name = 'QA renombrado', price = 14.25 WHERE id = $1", [id]));
  const read = await as('anon', { role: 'anon' }, tx =>
    tx.query('SELECT name, price FROM products WHERE id = $1', [id]));
  assert.deepEqual(read.rows, [{ name: 'QA renombrado', price: '14.25' }]);
  const deleted = await as('authenticated', admin, tx =>
    tx.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]));
  assert.equal(deleted.rows.length, 1);
});

test('Storage limita escrituras al administrador y al bucket de productos', async () => {
  const insert = bucket => [ 'INSERT INTO storage.objects (bucket_id, name) VALUES ($1, $2)', [bucket, 'test.png'] ];
  await assert.rejects(as('authenticated', stranger, tx => tx.query(...insert('product-images'))), { code: '42501' });
  await assert.rejects(as('authenticated', admin, tx => tx.query(...insert('other'))), { code: '42501' });
  await as('authenticated', admin, tx => tx.query(...insert('product-images')));
  assert.equal((await as('anon', { role: 'anon' }, tx => tx.query('SELECT name FROM storage.objects'))).rows.length, 1);
});

test('los enlaces guardados por el administrador se publican y se pueden borrar', async () => {
  const published = { tiktok: 'https://www.tiktok.com/@premiumpe-qa', instagram: '', facebook: '' };
  const save = (role, claims, links) => as(role, claims, tx => tx.query(
    'UPDATE settings SET social_links = $1 WHERE id = 1 RETURNING id', [JSON.stringify(links)]
  ));
  const read = () => as('anon', { role: 'anon' }, tx =>
    tx.query('SELECT social_links FROM settings WHERE id = 1')
  );

  assert.equal((await save('authenticated', admin, published)).rows.length, 1);
  assert.equal((await save('authenticated', stranger, {})).rows.length, 0);
  assert.deepEqual((await read()).rows, [{ social_links: published }]);
  assert.equal((await save('authenticated', admin, {})).rows.length, 1);
  assert.deepEqual((await read()).rows, [{ social_links: {} }]);
});

test('reaplicar el esquema conserva el catálogo y la configuración editados', async () => {
  await db.query("UPDATE settings SET store_name = 'Personalizada'");
  const previous = await db.query('SELECT id, name, price FROM products ORDER BY id');
  await db.exec(schema);
  assert.deepEqual((await db.query('SELECT id, name, price FROM products ORDER BY id')).rows, previous.rows);
  assert.equal((await db.query('SELECT store_name FROM settings')).rows[0].store_name, 'Personalizada');
});

const anon = { role: 'anon' };
const saveOffer = (tx, ids, details = {}, id = null) =>
  tx.query('SELECT public.save_promotion($1, $2, $3) AS id', [id, {
    name: 'Combo de prueba', active: true, price: 11.25, ...details
  }, ids]);
const offerCatalog = () => as('anon', anon, tx => tx.query('SELECT * FROM public.current_promotions'));
const quote = lines => as('anon', anon, async tx => (await tx.query(
  'SELECT public.quote_promotion_order($1) AS quote', [JSON.stringify(lines)]
)).rows[0].quote);

test('el administrador publica, programa, edita, desactiva y elimina combos de 2, 3 y 4 productos', async () => {
  const { rows } = await db.query(`
    INSERT INTO products (name, category, price)
    VALUES ('Uno', 'IA', 10), ('Dos', 'IA', 20), ('Tres', 'IA', 30), ('Cuatro', 'IA', 40)
    RETURNING id
  `);
  const ids = rows.map(row => row.id);
  const pair = await as('authenticated', admin, tx => saveOffer(tx, ids.slice(0, 2)));
  const trio = await as('authenticated', admin, tx => saveOffer(tx, ids.slice(0, 3), { starts_at: '2999-11-15T05:00:00Z' }));
  const four = await as('authenticated', admin, tx => saveOffer(tx, ids, { active: false }));
  const pairId = pair.rows[0].id;
  const trioId = trio.rows[0].id;
  const fourId = four.rows[0].id;

  assert.deepEqual((await offerCatalog()).rows.map(row => row.id), [pairId]);
  const publicItems = await as('anon', anon, tx => tx.query('SELECT promotion_id FROM promotion_items'));
  assert.deepEqual(publicItems.rows.map(row => row.promotion_id), [pairId, pairId]);
  await as('authenticated', admin, tx => saveOffer(tx, ids.slice(0, 3), {
    name: 'Trío', starts_at: '2000-01-01T05:00:00Z', ends_at: '2999-01-01T05:00:00Z'
  }, trioId));
  await as('authenticated', admin, tx => saveOffer(tx, ids, {}, fourId));
  assert.deepEqual((await offerCatalog()).rows.map(row => row.products.length).sort(), [2, 3, 4]);

  await assert.rejects(as('authenticated', admin, tx => saveOffer(tx, [ids[1], ids[0]])), { code: '23505' });
  for (const selected of [[ids[0]], [ids[0], ids[0]], [ids[0], '00000000-0000-0000-0000-000000000100']]) {
    await assert.rejects(as('authenticated', admin, tx => saveOffer(tx, selected)), { code: '22023' });
  }
  for (const price of [-1, 200, 'NaN', 1.125]) {
    await assert.rejects(as('authenticated', admin, tx => saveOffer(tx, ids, { price }, fourId)), { code: '22023' });
  }
  await assert.rejects(as('authenticated', admin, tx => saveOffer(tx, ids, {
    starts_at: '2026-03-01T05:00:00Z', ends_at: '2026-02-01T05:00:00Z'
  }, fourId)), { code: '23514' });
  await assert.rejects(as('anon', anon, tx => saveOffer(tx, ids, {}, fourId)), { code: '42501' });
  await assert.rejects(as('authenticated', stranger, tx => saveOffer(tx, ids, {}, fourId)), { code: '42501' });
  await assert.rejects(as('authenticated', admin, tx =>
    tx.query('DELETE FROM promotion_items WHERE promotion_id = $1', [fourId])), { code: '42501' });
  await assert.rejects(as('authenticated', admin, tx =>
    tx.query('UPDATE promotions SET active = true WHERE id = $1', [fourId])), { code: '42501' });
  assert.equal((await as('authenticated', stranger, tx =>
    tx.query('DELETE FROM promotions WHERE id = $1 RETURNING id', [fourId]))).rows.length, 0);

  await as('authenticated', admin, tx => tx.query('UPDATE promotions SET active = false WHERE id = $1', [pairId]));
  await as('authenticated', admin, tx => tx.query('DELETE FROM promotions WHERE id = $1', [fourId]));
  await as('authenticated', admin, tx => saveOffer(tx, ids.slice(0, 3), {
    starts_at: '2000-01-01T05:00:00Z', ends_at: '2001-01-01T05:00:00Z'
  }, trioId));
  assert.equal((await offerCatalog()).rows.length, 0);
  assert.equal((await db.query('SELECT * FROM promotion_items WHERE promotion_id = $1', [fourId])).rows.length, 0);
});

test('cotización mixta usa datos actuales, rechaza duplicados y oculta un combo incompleto', async () => {
  const { rows } = await db.query(`
    INSERT INTO products (name, category, price)
    VALUES ('A', 'IA', 8), ('B', 'IA', 9), ('C', 'IA', 10) RETURNING id
  `);
  const ids = rows.map(row => row.id);
  const saved = await as('authenticated', admin, tx => saveOffer(tx, ids));
  const id = saved.rows[0].id;
  const lines = [
    { kind: 'product', id: ids[0], quantity: 1, price: 0 },
    { kind: 'promotion', id, quantity: 2, price: 0, products: [] }
  ];
  const initial = await quote(lines);
  assert.deepEqual(initial.map(line => line.price), [8, 11.25]);
  assert.equal(initial[1].quantity, 2);
  assert.equal(initial[1].products.length, 3);
  assert.equal(await quote([...lines, lines[1]]), null);
  assert.equal(await quote([lines[0], { ...lines[1], quantity: 100 }]), null);

  await db.query("UPDATE products SET name = 'A actualizado', price = 7 WHERE id = $1", [ids[0]]);
  await as('authenticated', admin, tx => saveOffer(tx, ids, { price: 9.5 }, id));
  const updated = await quote(lines);
  assert.deepEqual(updated.map(line => line.price), [7, 9.5]);
  assert.equal(updated[1].products.find(product => product.id === ids[0]).name, 'A actualizado');
  assert.equal((await offerCatalog()).rows.find(offer => offer.id === id).original_price, '26.00');

  await db.query('UPDATE products SET available = false WHERE id = $1', [ids[1]]);
  assert.equal(await quote(lines), null);
  await db.query('UPDATE products SET available = true WHERE id = $1', [ids[1]]);
  await db.query('DELETE FROM products WHERE id = $1', [ids[2]]);
  assert.equal(await quote(lines), null);
  assert.equal((await offerCatalog()).rows.some(offer => offer.id === id), false);
  assert.equal((await db.query('SELECT * FROM promotion_items WHERE promotion_id = $1', [id])).rows.length, 2);
});
