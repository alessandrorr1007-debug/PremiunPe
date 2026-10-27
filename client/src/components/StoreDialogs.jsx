import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Check, MessageCircle, Plus, ArrowLeft, Package } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { DELIVERY_TYPE_LABELS, formatPriceNumber, createComboWhatsAppUrl, createProductWhatsAppUrl } from '../lib/mockData';
import StoreDialog from './StoreDialog';
import { BENEFITS_REVIEWED_AT, getProductBenefitInfo } from '../content/productBenefits';

const DialogContext = createContext(null);
const primaryButton = 'min-h-[44px] rounded-xl px-4 py-3 bg-action text-actionInk text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed';
const secondaryButton = 'min-h-[44px] rounded-xl px-4 py-3 bg-ink/5 text-cream border border-borderCream text-xs sm:text-sm font-medium flex items-center justify-center gap-2 hover:bg-ink/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
const deliveryNotes = {
  perfil: 'Recibes un perfil individual; no una cuenta completa.',
  activacion_tu_cuenta: 'El servicio se activa en tu cuenta. Confirma los requisitos de activación por WhatsApp.',
  cuenta_entregada: 'La modalidad consiste en la entrega de una cuenta para este servicio.',
};

export function StoreDialogsProvider({ children }) {
  const { products, settings, combo, addToCombo } = useStore();
  const [dialog, setDialog] = useState(null);
  const openProductDetails = useCallback(product => setDialog({ view: 'details', product }), []);
  const reviewProductOrder = useCallback(product => setDialog({ view: 'product-order', product }), []);
  const reviewComboOrder = useCallback(() => setDialog({ view: 'combo-order' }), []);
  const closeDialog = useCallback(() => setDialog(null), []);
  const actions = useMemo(() => ({ openProductDetails, reviewProductOrder, reviewComboOrder }), [openProductDetails, reviewProductOrder, reviewComboOrder]);

  // Read existing store data; the dialog never creates a second cart or clears it.
  const selectedProduct = dialog?.product;
  const product = selectedProduct && (products.find(item =>
    (selectedProduct.id != null && item.id === selectedProduct.id) || item.name === selectedProduct.name
  ) || selectedProduct);
  const isDetails = dialog?.view === 'details';
  const isComboOrder = dialog?.view === 'combo-order';
  const items = isComboOrder ? combo : product ? [product] : [];
  const total = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const isInCombo = product && combo.some(item => item.id === product.id || item.name === product.name);
  const benefitInfo = getProductBenefitInfo(product);
  const includes = Array.isArray(product?.includes) ? product.includes.filter(item => typeof item === 'string' && item.trim()) : [];
  const whatsappUrl = isComboOrder ? createComboWhatsAppUrl(settings?.whatsapp_number, items) : createProductWhatsAppUrl(settings?.whatsapp_number, product);
  const canContinue = items.length > 0;

  return (
    <DialogContext.Provider value={actions}>
      {children}
      {dialog && (
        <StoreDialog title={isDetails ? product.name : 'Revisa tu pedido'} viewKey={dialog.view} onClose={closeDialog}
          subtitle={isDetails ? 'Beneficios, modalidad y condiciones disponibles' : isComboOrder ? 'Estos son los servicios de tu combo actual' : 'Estás pidiendo únicamente este servicio'}
          footer={isDetails ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button type="button" disabled={product.available === false || isInCombo} onClick={() => addToCombo(product)} className={secondaryButton}>
                {isInCombo ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{isInCombo ? 'En tu combo' : 'Agregar al combo'}
              </button>
              <button type="button" onClick={() => reviewProductOrder(product)} className={primaryButton}><MessageCircle className="w-4 h-4" />Revisar pedido individual</button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col-reverse sm:flex-row gap-2">
                <button type="button" onClick={closeDialog} className={secondaryButton}><ArrowLeft className="w-4 h-4" />Seguir eligiendo</button>
                <a href={canContinue ? whatsappUrl : undefined} target="_blank" rel="noopener noreferrer" aria-disabled={!canContinue} tabIndex={canContinue ? 0 : -1}
                  className={`${primaryButton} sm:flex-1 ${canContinue ? '' : 'opacity-40 pointer-events-none'}`}><MessageCircle className="w-4 h-4" />Continuar en WhatsApp</a>
              </div>
              <p className="text-[11px] text-muted text-center">Se abrirá WhatsApp con el pedido preparado para consultar disponibilidad y coordinar el pago.</p>
            </div>
          )}>
          {isDetails ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-xs text-muted mb-1">Precio mensual</p><p className="text-3xl font-semibold tabular-nums">S/ {formatPriceNumber(product.price)}<span className="text-xs text-muted font-normal"> /mes</span></p></div>
                <span className={`rounded-full px-3 py-1 text-xs border ${product.available === false ? 'text-muted border-borderCream' : 'text-success border-success/20 bg-success/5'}`}>{product.available === false ? 'Agotado' : 'Disponible'}</span>
              </div>
              {product.description && <p className="text-sm text-muted leading-relaxed whitespace-pre-line break-words">{product.description}</p>}
              {benefitInfo && (
                <section aria-label="Beneficios y extras del plan" className="space-y-4">
                  <div><h3 className="font-semibold text-sm">Beneficios y extras</h3><p className="text-xs text-muted mt-1">{benefitInfo.plan}</p></div>
                  <ul className="space-y-3">{benefitInfo.benefits.map((benefit, index) => (
                    <li key={index} className="flex gap-2.5 text-sm text-cream/90"><Check className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" /><span className="break-words min-w-0">{benefit}</span></li>
                  ))}</ul>
                  <div className="rounded-2xl border border-borderCream bg-ink/[0.03] p-4 space-y-2">
                    <h4 className="text-xs font-medium">Sobre este acceso</h4>
                    {benefitInfo.notes.map((note, index) => <p key={index} className="text-xs text-muted leading-relaxed">{note}</p>)}
                  </div>
                  <details className="text-xs text-muted">
                    <summary className="cursor-pointer min-h-[44px] flex items-center rounded-lg hover:text-cream transition-colors">Consultar fuentes oficiales</summary>
                    <ul className="space-y-1 pb-2">{benefitInfo.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center min-h-[44px] underline underline-offset-4 hover:text-cream">{source.label}</a></li>)}</ul>
                    <p className="text-[11px]">Revisado el {BENEFITS_REVIEWED_AT}. Los proveedores pueden actualizar sus funciones.</p>
                  </details>
                </section>
              )}
              <section aria-label="Beneficios del servicio">
                <h3 className="font-semibold text-sm mb-3">{benefitInfo ? 'Detalles de tu acceso' : 'Qué incluye'}</h3>
                {includes.length ? <ul className="space-y-3">{includes.map((item, index) => <li key={index} className="flex gap-2.5 text-sm text-cream/90"><Check className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" /><span className="break-words min-w-0">{item}</span></li>)}</ul> : <p className="text-sm text-muted">Los beneficios de este servicio no están detallados. Consúltalos por WhatsApp.</p>}
              </section>
              <section className="rounded-2xl border border-borderCream bg-ink/[0.03] p-4">
                <h3 className="font-semibold text-sm mb-2">Tipo de entrega</h3>
                <p className="text-sm">{DELIVERY_TYPE_LABELS[product.delivery_type] || 'Modalidad por confirmar'}</p>
                <p className="text-xs text-muted leading-relaxed mt-2">{deliveryNotes[product.delivery_type] || 'Consulta cómo se entrega o activa este servicio antes de realizar el pago.'}</p>
              </section>
              <section aria-label="Condiciones y soporte" className="space-y-3">
                <h3 className="font-semibold text-sm">Condiciones y soporte</h3>
                {settings?.warranty_text && <div><p className="text-xs font-medium mb-1">Garantía y reposición</p><p className="text-sm text-muted whitespace-pre-line break-words">{settings.warranty_text}</p></div>}
                {settings?.payment_methods && <div><p className="text-xs font-medium mb-1">Métodos de pago</p><p className="text-sm text-muted whitespace-pre-line break-words">{settings.payment_methods}</p></div>}
                {settings?.support_hours && <div><p className="text-xs font-medium mb-1">Horario de atención</p><p className="text-sm text-muted">{settings.support_hours}</p></div>}
                {settings?.response_time && <div><p className="text-xs font-medium mb-1">Tiempo de respuesta informado</p><p className="text-sm text-muted">{settings.response_time}</p></div>}
                <p className="text-xs text-muted leading-relaxed">Confirma por WhatsApp los requisitos y condiciones específicas del servicio antes de pagar.</p>
              </section>
            </>
          ) : (
            <>
              {items.length ? <ul className="divide-y divide-borderCream">{items.map((item, index) => (
                <li key={item.id || `${item.name}-${index}`} className="flex items-start justify-between gap-4 py-4 first:pt-0">
                  <div className="min-w-0"><h3 className="font-medium text-sm break-words">{item.name}</h3><p className="text-xs text-muted mt-1">{DELIVERY_TYPE_LABELS[item.delivery_type] || 'Modalidad por confirmar'}</p></div>
                  <p className="text-sm font-semibold tabular-nums shrink-0">S/ {formatPriceNumber(item.price)}<span className="block text-[11px] text-muted font-normal text-right">/mes</span></p>
                </li>
              ))}</ul> : <div className="text-center py-6"><Package className="w-8 h-8 text-muted mx-auto mb-3" /><p className="text-sm">Tu combo está vacío.</p><p className="text-xs text-muted mt-2">Vuelve al catálogo para elegir tus servicios.</p></div>}
              <div className="rounded-2xl bg-ink/[0.04] border border-borderCream p-4 flex items-center justify-between gap-4" aria-live="polite" aria-atomic="true">
                <div><p className="text-sm font-medium">Total mensual</p><p className="text-xs text-muted mt-1">{items.length} {items.length === 1 ? 'servicio' : 'servicios'}</p></div>
                <p className="text-2xl sm:text-3xl font-semibold tabular-nums">S/ {formatPriceNumber(total)}</p>
              </div>
            </>
          )}
        </StoreDialog>
      )}
    </DialogContext.Provider>
  );
}

export function useStoreDialogs() {
  const context = useContext(DialogContext);
  if (!context) throw new Error('useStoreDialogs requiere StoreDialogsProvider');
  return context;
}
