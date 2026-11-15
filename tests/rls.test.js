import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const db = new PGlite();
const schema = await readFile(new URL('../supabase/schema.sql', import.meta.url), 'utf8');
const admin = { email: 'admin@premiumpe.com', role: 'authenticated' };
const stranger = { email: 'buyer@example.test', role: 'authenticated', user_metadata: { role: 'admin' } };

before(async () => {
  await db.exec(`
    CREATE ROLE anon;
    CREATE ROLE authenticated;
    CREATE SCHEMA auth;
    CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS
      'SELECT current_setting(''request.jwt.claims'', true)::jsonb';
    CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS
      'SELECT auth.jwt() ->> ''role''';
    CREATE SCHEMA storage;
    CREATE TABLE storage.buckets (id text PRIMARY KEY, name text, public boolean);
    CREATE TABLE storage.objects (id uuid DEFAULT gen_random_uuid(), bucket_id text, name text);
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    GRANT USAGE ON SCHEMA auth, storage TO anon, authenticated;
  `);
  await db.exec(schema);
  await db.exec('GRANT SELECT, INSERT, UPDATE, DELETE ON public.products, public.settings, storage.objects TO anon, authenticated');
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

test('reaplicar el esquema conserva el catálogo y la configuración editados', async () => {
  await db.query("UPDATE settings SET store_name = 'Personalizada'");
  const previous = await db.query('SELECT id, name, price FROM products ORDER BY id');
  await db.exec(schema);
  assert.deepEqual((await db.query('SELECT id, name, price FROM products ORDER BY id')).rows, previous.rows);
  assert.equal((await db.query('SELECT store_name FROM settings')).rows[0].store_name, 'Personalizada');
});
