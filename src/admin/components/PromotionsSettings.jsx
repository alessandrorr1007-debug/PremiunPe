import React, { useCallback, useEffect, useState } from 'react';
import { Gift, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminStore } from '../context/AdminStoreContext';
import { supabase } from '../lib/supabase';
import { canBuy, cartTotal } from '../../client/lib/cart';
import { formatPriceNumber } from '../../client/lib/mockData';
import PromotionCard from '../../client/components/PromotionCard';

const blank = {
  name: '', description: '', price: '', image_url: '', starts_at: '', ends_at: '', active: false, product_ids: []
};
const input = 'w-full min-h-11 rounded-xl bg-night border border-borderCream px-3 py-2 text-cream focus-visible:outline-aji';
const button = 'min-h-11 rounded-xl border border-borderCream px-3 py-2 font-semibold text-cream hover:border-aji disabled:opacity-50';
const primary = 'min-h-11 rounded-xl bg-aji px-4 py-2 font-semibold text-night disabled:opacity-50';
const limaDate = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit'
});
const dateInput = value => value ? limaDate.format(new Date(value)).replace(' ', 'T') : '';
const toTimestamp = value => value ? new Date(`${value}-05:00`).toISOString() : null;

function status(offer, products) {
  if (!offer.active) return 'Inactiva';
  if (offer.ends_at && Date.parse(offer.ends_at) <= Date.now()) return 'Finalizada';
  const included = offer.product_ids.map(id => products.find(product => product.id === id));
  if (!included.every(canBuy) || cartTotal(included) <= Number(offer.price)) return 'No disponible';
  if (offer.starts_at && Date.parse(offer.starts_at) > Date.now()) return 'Programada';
  return 'Publicada';
}

function promotionError(error) {
  if (error.code === '23505') return 'Ya existe una promoción con esta combinación de productos.';
  if (error.code === '22023') return error.message;
  if (error.code === '23503') return 'La selección de productos cambió. Revisa los productos disponibles.';
  return 'No se pudo guardar el cambio. Revisa los datos e inténtalo nuevamente.';
}

export default function PromotionsSettings() {
  const { products } = useAdminStore();
  const [offers, setOffers] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [form, setForm] = useState(null);
  const [preview, setPreview] = useState(false);
  const [removeId, setRemoveId] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('promotions').select('*')
        .order('created_at', { ascending: false }).abortSignal(AbortSignal.timeout(10000));
      if (error) throw error;
      setOffers(data);
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoaded(true);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const startEditing = offer => {
    setRemoveId(null);
    setPreview(false);
    setForm(offer ? {
      ...offer,
      description: offer.description ?? '', image_url: offer.image_url ?? '',
      starts_at: dateInput(offer.starts_at), ends_at: dateInput(offer.ends_at)
    } : blank);
  };
  const update = (key, value) => {
    setPreview(false);
    setForm(current => ({ ...current, [key]: value }));
  };
  const selected = products.filter(product => form?.product_ids.includes(product.id));
  const original = cartTotal(selected);
  const amount = Number(form?.price);
  const missing = (form?.product_ids.length ?? 0) - selected.length;

  const save = async event => {
    event.preventDefault();
    if (missing || selected.length < 2) {
      toast.error('Selecciona al menos dos productos existentes.');
      return;
    }
    if (!form.name.trim() || !form.price.toString().trim() || !Number.isFinite(amount) || amount < 0) {
      toast.error('Ingresa un nombre y un precio válido.');
      return;
    }
    const { id, product_ids, ...details } = form;
    const starts_at = toTimestamp(details.starts_at);
    const ends_at = toTimestamp(details.ends_at);
    if (starts_at && ends_at && starts_at >= ends_at) {
      toast.error('La finalización debe ser posterior al inicio.');
      return;
    }
    if (details.image_url.trim() && !/^https:\/\/\S+$/.test(details.image_url.trim())) {
      toast.error('La imagen debe usar una dirección HTTPS.');
      return;
    }
    if (form.active && (!selected.every(canBuy) || amount >= original)) {
      toast.error('Para publicar, selecciona productos disponibles y un precio inferior al total individual.');
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.rpc('save_promotion', {
        p_id: id ?? null,
        p_details: { ...details, price: amount, starts_at, ends_at },
        p_products: product_ids
      });
      if (error) throw error;
      setForm(null);
      toast.success('Promoción guardada.');
      await load();
    } catch (error) {
      toast.error(promotionError(error));
    } finally {
      setBusy(false);
    }
  };

  const changeOffer = async (id, remove) => {
    setBusy(true);
    try {
      const request = remove ? supabase.from('promotions').delete() : supabase.from('promotions').update({ active: false });
      const { error } = await request.eq('id', id).select('id').single();
      if (error) throw error;
      if (form?.id === id) setForm(null);
      setRemoveId(null);
      toast.success(remove ? 'Promoción eliminada.' : 'Promoción desactivada.');
      await load();
    } catch (error) {
      toast.error(promotionError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-labelledby="admin-promotions" className="rounded-[24px] bg-cardBg border border-borderCream p-5 sm:p-7 space-y-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id="admin-promotions" className="font-sora font-bold text-base text-cream inline-flex items-center gap-2">
          <Gift size={18} className="text-aji" aria-hidden="true" /> Promociones
        </h3>
        <button type="button" className={primary + ' inline-flex items-center gap-2'} disabled={!loaded || loadError || busy}
          onClick={() => startEditing(null)}><Plus size={16} aria-hidden="true" /> Nueva promoción</button>
      </div>
      {!loaded && <p role="status" className="text-muted">Cargando promociones…</p>}
      {loadError && <p role="alert" className="text-muted">No se pudieron cargar las promociones. <button type="button" className={button} onClick={load}>Reintentar</button></p>}
      {loaded && !loadError && offers.length === 0 && !form && <p className="text-muted">Todavía no hay promociones.</p>}
      {offers.length > 0 && (
        <ul className="divide-y divide-borderCream">
          {offers.map(offer => (
            <li key={offer.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0 break-words">
                <p className="font-semibold text-cream">{offer.name}</p>
                <p className="text-xs text-muted">{status(offer, products)} · S/ {formatPriceNumber(offer.price)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={button} disabled={busy} onClick={() => startEditing(offer)}>Editar</button>
                {offer.active && <button type="button" className={button} disabled={busy} onClick={() => changeOffer(offer.id, false)}>Desactivar</button>}
                <button type="button" className={button} disabled={busy} onClick={() => setRemoveId(offer.id)}>Eliminar</button>
              </div>
              {removeId === offer.id && (
                <div className="w-full flex flex-wrap items-center gap-2 p-3 rounded-xl border border-rocoto/40">
                  <p className="flex-1 min-w-36">¿Eliminar la promoción «{offer.name}»?</p>
                  <button type="button" className={button} disabled={busy} onClick={() => setRemoveId(null)}>Cancelar</button>
                  <button type="button" className={button + ' text-rocoto'} disabled={busy} onClick={() => changeOffer(offer.id, true)}>Confirmar eliminación</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {form && (
        <form onSubmit={save} aria-labelledby="promotion-editor" className="border-t border-borderCream pt-4">
          <fieldset disabled={busy} className="space-y-4 min-w-0">
            <legend id="promotion-editor" className="font-sora font-semibold text-cream mb-3">{form.id ? 'Editar promoción' : 'Crear promoción'}</legend>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="space-y-1">Nombre del combo
                <input className={input} required maxLength={120} value={form.name} onChange={e => update('name', e.target.value)} />
              </label>
              <label className="space-y-1">Precio promocional (PEN)
                <input className={input} required type="number" min="0" max="99999999.99" step="0.01"
                  value={form.price} onChange={e => update('price', e.target.value)} />
              </label>
              <label className="space-y-1 sm:col-span-2">Descripción (opcional)
                <textarea className={input} rows={2} maxLength={1000} value={form.description} onChange={e => update('description', e.target.value)} />
              </label>
              <label className="space-y-1 sm:col-span-2">URL de imagen HTTPS (opcional)
                <input className={input} type="url" maxLength={2048} value={form.image_url} onChange={e => update('image_url', e.target.value)} />
              </label>
              <label className="space-y-1 min-w-0">Inicio (opcional, hora de Perú)
                <input className={input} type="datetime-local" step="1" value={form.starts_at} onChange={e => update('starts_at', e.target.value)} />
              </label>
              <label className="space-y-1 min-w-0">Finalización (opcional, hora de Perú)
                <input className={input} type="datetime-local" step="1" value={form.ends_at} onChange={e => update('ends_at', e.target.value)} />
              </label>
            </div>
            <fieldset className="min-w-0">
              <legend className="font-semibold mb-2">Productos del combo (elige al menos dos)</legend>
              {missing > 0 && (
                <p className="text-rocoto mb-2">Faltan {missing} productos de la selección original.{' '}
                  <button type="button" className={button} onClick={() => update('product_ids', selected.map(product => product.id))}>Quitar productos eliminados</button>
                </p>
              )}
              <div className="max-h-56 overflow-auto rounded-xl border border-borderCream divide-y divide-borderCream">
                {products.map(product => (
                  <label key={product.id} className="flex items-center gap-3 p-2.5 min-h-11">
                    <input type="checkbox" checked={form.product_ids.includes(product.id)} onChange={e =>
                      update('product_ids', e.target.checked ? [...form.product_ids, product.id] : form.product_ids.filter(id => id !== product.id))
                    } />
                    <span className="flex-1 min-w-0 break-words">{product.name}{!canBuy(product) && <span className="text-xs text-muted"> · No disponible</span>}</span>
                    <span className="shrink-0 text-muted">S/ {formatPriceNumber(product.price)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <p aria-live="polite" className="text-muted">
              Precio original combinado S/ {formatPriceNumber(original)} · Ahorro S/ {formatPriceNumber(Math.max(0, original - amount))}
            </p>
            <label className="flex items-center gap-3 min-h-11">
              <input type="checkbox" checked={form.active} onChange={e => update('active', e.target.checked)} />
              Activar promoción
            </label>
            {preview && (
              <div className="max-w-sm space-y-2">
                <h4 className="font-semibold">Vista previa</h4>
                <PromotionCard offer={{
                  ...form, products: selected, original_price: original,
                  image_url: /^https:\/\/\S+$/.test(form.image_url.trim()) ? form.image_url.trim() : null
                }} />
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <button type="button" className={button} onClick={() => setForm(null)}>Cancelar edición</button>
              <button type="button" className={button} aria-expanded={preview} onClick={() => setPreview(current => !current)}>
                {preview ? 'Ocultar vista previa' : 'Ver vista previa'}
              </button>
              <button type="submit" className={primary}>{busy ? 'Guardando…' : 'Guardar promoción'}</button>
            </div>
          </fieldset>
        </form>
      )}
    </section>
  );
}
