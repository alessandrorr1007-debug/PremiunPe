import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../../context/AdminStoreContext';
import { 
  PRODUCT_CATEGORIES, 
  DELIVERY_TYPES, 
  ACCENTS, 
  getProductMonogram, 
  formatPriceNumber, 
  DELIVERY_TYPE_LABELS 
} from '../../lib/mockData';
import ImageUploader from '../common/ImageUploader';
import Toggle from '../common/Toggle';
import { 
  X, 
  Check, 
  Eye, 
  ShieldAlert, 
  Info, 
  Plus, 
  Trash2, 
  RotateCw, 
  MessageCircle, 
  CheckCircle2 
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProductDrawer({ isOpen, onClose, productToEdit }) {
  const { addProduct, updateProduct, settings } = useAdminStore();
  const currency = settings?.currency || 'S/';

  const initialForm = {
    name: '',
    description: '',
    category: 'Streaming',
    delivery_type: 'perfil',
    includes: [
      'Perfil individual con clave PIN',
      'Transmisión en alta definición',
      'Soporte técnico directo por WhatsApp'
    ],
    accent: 'aji',
    price: '',
    image_url: '',
    available: true,
    visible: true,
    featured: false,
    sort_order: 0,
  };

  const [formData, setFormData] = useState(initialForm);
  const [initialSnapshot, setInitialSnapshot] = useState('');
  const [activeSection, setActiveSection] = useState('info'); // info | delivery | includes | pricing | image | preview
  const [submitting, setSubmitting] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [previewFlipped, setPreviewFlipped] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      const data = {
        name: productToEdit.name || '',
        description: productToEdit.description || '',
        category: productToEdit.category || 'Streaming',
        delivery_type: productToEdit.delivery_type || 'perfil',
        includes: Array.isArray(productToEdit.includes) && productToEdit.includes.length > 0
          ? [...productToEdit.includes].slice(0, 3)
          : [
              'Acceso verificado para tus dispositivos',
              'Soporte técnico directo por WhatsApp',
              'Opción de renovación sin pérdida de datos'
            ],
        accent: productToEdit.accent || 'aji',
        price: productToEdit.price !== undefined ? String(productToEdit.price) : '',
        image_url: productToEdit.image_url || '',
        available: productToEdit.available ?? true,
        visible: productToEdit.visible ?? true,
        featured: productToEdit.featured ?? false,
        sort_order: productToEdit.sort_order || 0,
      };
      setFormData(data);
      setInitialSnapshot(JSON.stringify(data));
    } else {
      setFormData(initialForm);
      setInitialSnapshot(JSON.stringify(initialForm));
    }
    setActiveSection('info');
    setShowDiscardConfirm(false);
    setPreviewFlipped(false);
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const isDirty = JSON.stringify(formData) !== initialSnapshot;

  const handleRequestClose = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const handleIncludeChange = (index, value) => {
    const updated = [...formData.includes];
    updated[index] = value;
    setFormData({ ...formData, includes: updated });
  };

  const handleAddInclude = () => {
    if (formData.includes.length < 3) {
      setFormData({
        ...formData,
        includes: [...formData.includes, '']
      });
    }
  };

  const handleRemoveInclude = (index) => {
    const updated = formData.includes.filter((_, idx) => idx !== index);
    setFormData({ ...formData, includes: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('El nombre del producto es obligatorio.');
      setActiveSection('info');
      return;
    }

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error('Ingresa un precio válido (mayor o igual a 0).');
      setActiveSection('pricing');
      return;
    }

    // Limpiar viñetas vacías
    const cleanIncludes = formData.includes
      .map(item => item.trim())
      .filter(Boolean)
      .slice(0, 3);

    const payload = {
      ...formData,
      price: priceNum,
      includes: cleanIncludes.length > 0 ? cleanIncludes : [
        'Acceso verificado para tus dispositivos',
        'Soporte técnico directo por WhatsApp',
        'Opción de renovación sin pérdida de datos'
      ]
    };

    try {
      setSubmitting(true);
      if (productToEdit) {
        await updateProduct(productToEdit.id, payload);
        toast.success(`"${formData.name}" actualizado.`);
      } else {
        await addProduct(payload);
        toast.success(`"${formData.name}" agregado al catálogo.`);
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Datos para la Live Preview idéntica a la tienda
  const previewMonogram = getProductMonogram(formData.name);
  const previewDeliveryLabel = DELIVERY_TYPE_LABELS[formData.delivery_type] || 'Perfil individual';
  
  const getPreviewAccent = (accent) => {
    switch (accent) {
      case 'rocoto':
        return {
          text: 'text-rocoto',
          border: 'border-rocoto/30',
          bg: 'bg-rocoto/20',
          chip: 'bg-rocoto/20 text-rocoto border border-rocoto/30',
          btnBg: 'bg-rocoto text-white',
        };
      case 'lime':
        return {
          text: 'text-lime',
          border: 'border-lime/30',
          bg: 'bg-lime/20',
          chip: 'bg-lime/20 text-lime border border-lime/30',
          btnBg: 'bg-lime text-night',
        };
      case 'aji':
      default:
        return {
          text: 'text-aji',
          border: 'border-aji/30',
          bg: 'bg-aji/20',
          chip: 'bg-aji/20 text-aji border border-aji/30',
          btnBg: 'bg-aji text-night',
        };
    }
  };

  const previewAccent = getPreviewAccent(formData.accent);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-night/80 backdrop-blur-md animate-fadeIn">
      {/* Fondo clickeable para cerrar */}
      <div className="absolute inset-0" onClick={handleRequestClose} />

      {/* Drawer deslizante (pantalla completa en celular, max-w-2xl en desktop) */}
      <div className="relative w-full max-w-2xl h-full bg-cardBg border-l border-borderCream shadow-2xl flex flex-col z-10 animate-slideInRight text-cream">
        {/* Cabecera */}
        <div className="p-4 sm:p-5 border-b border-borderCream flex items-center justify-between bg-night/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-aji/15 border border-aji/30 flex items-center justify-center font-sora font-extrabold text-aji text-sm">
              {productToEdit ? '✎' : '+'}
            </div>
            <div>
              <h3 className="text-base font-sora font-bold text-cream tracking-tight">
                {productToEdit ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <p className="text-[11px] text-muted">
                {productToEdit ? 'Modifica detalles, precio y tipo de entrega' : 'Agrega un nuevo servicio al catálogo'}
              </p>
            </div>
          </div>

          <button
            onClick={handleRequestClose}
            className="w-9 h-9 rounded-xl text-muted hover:text-cream hover:bg-white/[0.06] transition-colors flex items-center justify-center"
            aria-label="Cerrar panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Navegación Rápida interna */}
        <div className="flex border-b border-borderCream bg-night/40 px-3 sm:px-4 text-xs font-sora overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveSection('info')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors ${
              activeSection === 'info'
                ? 'border-aji text-cream font-bold'
                : 'border-transparent text-muted hover:text-cream'
            }`}
          >
            1. Información
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('delivery')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors ${
              activeSection === 'delivery'
                ? 'border-aji text-cream font-bold'
                : 'border-transparent text-muted hover:text-cream'
            }`}
          >
            2. Entrega y Viñetas
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('pricing')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors ${
              activeSection === 'pricing'
                ? 'border-aji text-cream font-bold'
                : 'border-transparent text-muted hover:text-cream'
            }`}
          >
            3. Precio y Estado
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('image')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors ${
              activeSection === 'image'
                ? 'border-aji text-cream font-bold'
                : 'border-transparent text-muted hover:text-cream'
            }`}
          >
            4. Imagen y Acento
          </button>
        </div>

        {/* Formulario con Scroll */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* SECCIÓN 1: INFORMACIÓN */}
          {activeSection === 'info' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-sora font-semibold text-cream mb-1.5">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ej. Disney+ Premium"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-night border border-borderCream text-cream placeholder-muted/60 text-sm focus:outline-none focus:ring-2 focus:ring-aji/50 font-sans"
                />
                <p className="text-[11px] text-muted mt-1">
                  Nombre visible para el comprador en la tienda.
                </p>
              </div>

              <div>
                <label className="block text-xs font-sora font-semibold text-cream mb-1.5">
                  Categoría Fija *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const newCat = e.target.value;
                    // Si cambia a Streaming, asegurar que delivery_type sea perfil por defecto
                    setFormData({
                      ...formData,
                      category: newCat,
                      delivery_type: newCat === 'Streaming' ? 'perfil' : formData.delivery_type
                    });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-night border border-borderCream text-cream text-sm focus:outline-none focus:ring-2 focus:ring-aji/50 font-sans cursor-pointer"
                >
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted mt-1">
                  Las categorías del catálogo son exclusivamente: Streaming, Herramientas, IA.
                </p>
              </div>

              <div>
                <label className="block text-xs font-sora font-semibold text-cream mb-1.5">
                  Descripción Corta y Genérica
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="ej. Películas, series y documentales para toda la familia en alta definición."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-night border border-borderCream text-cream placeholder-muted/60 text-sm focus:outline-none focus:ring-2 focus:ring-aji/50 leading-relaxed font-sans"
                />
                <p className="text-[11px] text-muted mt-1">
                  Sin nombres de ligas, torneos, modelos de IA ni cifras técnicas no verificadas.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSection('delivery')}
                  className="w-full py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-xs font-sora font-semibold text-cream transition-colors min-h-[44px]"
                >
                  Siguiente: Entrega y Viñetas →
                </button>
              </div>
            </div>
          )}

          {/* SECCIÓN 2: ENTREGA Y VIÑETAS */}
          {activeSection === 'delivery' && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <label className="block text-xs font-sora font-semibold text-cream mb-2">
                  Tipo de Entrega *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {DELIVERY_TYPES.map((dt) => {
                    const isSelected = formData.delivery_type === dt.value;
                    return (
                      <button
                        key={dt.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, delivery_type: dt.value })}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-aji/15 border-aji text-cream font-bold ring-1 ring-aji'
                            : 'bg-night/60 border-borderCream text-muted hover:text-cream hover:bg-night'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-sora">{dt.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-aji" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* NOTA OBLIGATORIA SI ES STREAMING / PERFIL */}
              {formData.delivery_type === 'perfil' && (
                <div className="p-3.5 rounded-xl bg-aji/10 border border-aji/30 flex items-start gap-2.5 text-cream text-xs leading-relaxed animate-fadeIn">
                  <Info className="w-4 h-4 text-aji shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-aji block font-sora">Aviso de modalidad de perfil:</strong>
                    <span>En la tienda se avisa que son perfiles, no cuentas completas.</span>
                  </div>
                </div>
              )}

              {/* VIÑETAS: QUÉ INCLUYE (HASTA 3) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-sora font-semibold text-cream">
                    Qué incluye el servicio (hasta 3 viñetas)
                  </label>
                  {formData.includes.length < 3 && (
                    <button
                      type="button"
                      onClick={handleAddInclude}
                      className="text-xs text-aji hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar viñeta</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {formData.includes.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-white/[0.05] border border-borderCream text-[11px] font-mono text-muted flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleIncludeChange(idx, e.target.value)}
                        placeholder={`Característica ${idx + 1} (ej. Perfil individual con clave PIN)`}
                        className="flex-1 px-3 py-2 rounded-xl bg-night border border-borderCream text-cream placeholder-muted/60 text-xs focus:outline-none focus:ring-1 focus:ring-aji font-sans"
                      />
                      {formData.includes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveInclude(idx)}
                          className="p-2 rounded-lg text-muted hover:text-rocoto hover:bg-rocoto/10 transition-colors"
                          title="Quitar viñeta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-muted">
                  Estas viñetas aparecen en el reverso de la tarjeta cuando el cliente hace clic en "Qué incluye".
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSection('pricing')}
                  className="w-full py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-xs font-sora font-semibold text-cream transition-colors min-h-[44px]"
                >
                  Siguiente: Precio y Estado →
                </button>
              </div>
            </div>
          )}

          {/* SECCIÓN 3: PRECIO Y ESTADO */}
          {activeSection === 'pricing' && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <label className="block text-xs font-sora font-semibold text-cream mb-1.5">
                  Precio mensual en Soles ({currency}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-aji font-mono font-bold text-sm">
                    {currency}
                  </span>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="12.00"
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-night border border-borderCream text-cream placeholder-muted/60 text-sm font-mono font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-aji/50"
                  />
                </div>
                <p className="text-[11px] text-muted mt-1">
                  Monto mensual final sin comisiones extras.
                </p>
              </div>

              {/* Toggles de Estado */}
              <div className="rounded-2xl bg-night/70 border border-borderCream p-4 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-sora font-bold text-cream">Disponible</h4>
                    <p className="text-[11px] text-muted leading-snug">
                      Si se apaga, se muestra el sello "Agotado" y se bloquea el pedido.
                    </p>
                  </div>
                  <Toggle
                    checked={formData.available}
                    onChange={(val) => setFormData({ ...formData, available: val })}
                    activeColor="lime"
                  />
                </div>

                <div className="pt-3 border-t border-borderCream/60 flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-sora font-bold text-cream">Visible en Tienda</h4>
                    <p className="text-[11px] text-muted leading-snug">
                      Si se desactiva, el producto se oculta por completo del catálogo público.
                    </p>
                  </div>
                  <Toggle
                    checked={formData.visible}
                    onChange={(val) => setFormData({ ...formData, visible: val })}
                    activeColor="aji"
                  />
                </div>

                <div className="pt-3 border-t border-borderCream/60 flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-sora font-bold text-cream">Destacado en Portada</h4>
                    <p className="text-[11px] text-muted leading-snug">
                      Resalta este producto en la sección principal de recomendaciones.
                    </p>
                  </div>
                  <Toggle
                    checked={formData.featured}
                    onChange={(val) => setFormData({ ...formData, featured: val })}
                    activeColor="aji"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSection('image')}
                  className="w-full py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-xs font-sora font-semibold text-cream transition-colors min-h-[44px]"
                >
                  Siguiente: Imagen y Acento →
                </button>
              </div>
            </div>
          )}

          {/* SECCIÓN 4: IMAGEN Y COLOR DE ACENTO */}
          {activeSection === 'image' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Selector de Acento */}
              <div>
                <label className="block text-xs font-sora font-semibold text-cream mb-2">
                  Color de Acento Visual
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {ACCENTS.map((acc) => {
                    const isSelected = formData.accent === acc.value;
                    return (
                      <button
                        key={acc.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, accent: acc.value })}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-white/10 border-white ring-1 ring-white text-cream'
                            : 'bg-night/60 border-borderCream text-muted hover:text-cream'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full shadow-md"
                          style={{ backgroundColor: acc.color }}
                        />
                        <span className="text-[11px] font-sora font-medium">{acc.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subir Imagen */}
              <div>
                <label className="block text-xs font-sora font-semibold text-cream mb-1.5">
                  Imagen o Carátula (Opcional - Monograma por defecto)
                </label>
                <ImageUploader
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                />
                <p className="text-[11px] text-muted mt-1.5">
                  Si no subes imagen, la tienda genera automáticamente un monograma minimalista con su inicial.
                </p>
              </div>
            </div>
          )}

          {/* VISTA PREVIA EN VIVO DE LA TARJETA (RÉPLICA EXACTA DE LA TIENDA) */}
          <div className="pt-6 border-t border-borderCream">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-sora font-bold text-cream">
                <Eye className="w-4 h-4 text-aji" />
                <span>Vista Previa en Vivo (Tarjeta de la Tienda)</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewFlipped(!previewFlipped)}
                className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-sora text-muted hover:text-cream flex items-center gap-1.5 transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>{previewFlipped ? 'Ver Frente' : 'Ver Reverso'}</span>
              </button>
            </div>

            {/* Tarjeta de demostración */}
            <div className="relative w-full max-w-[320px] mx-auto select-none rounded-[24px]">
              {!previewFlipped ? (
                /* Frente */
                <div
                  className={`rounded-[24px] bg-white/[0.04] border ${previewAccent.border} p-6 flex flex-col justify-between shadow-card relative overflow-hidden h-[380px]`}
                >
                  <div className="absolute inset-0 specular-shine pointer-events-none opacity-40" />

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-2xl ${previewAccent.bg} border ${previewAccent.border} ${previewAccent.text} font-sora font-extrabold text-lg flex items-center justify-center shadow-sm`}
                      >
                        {formData.image_url ? (
                          <img
                            src={formData.image_url}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        ) : (
                          <span>{previewMonogram}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {!formData.available ? (
                          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-zinc-500/20 text-zinc-400 border border-zinc-500/30">
                            Agotado
                          </span>
                        ) : (
                          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${previewAccent.chip}`}>
                            {previewDeliveryLabel}
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="font-sora font-bold text-cream text-lg text-left truncate">
                      {formData.name || 'Nombre del Servicio'}
                    </h3>

                    <p className="mt-2 text-xs text-muted leading-relaxed text-left line-clamp-3">
                      {formData.description || 'Descripción breve del plan o servicio que verá el cliente.'}
                    </p>
                  </div>

                  <div>
                    <div className="mb-4 text-left">
                      <div className="flex items-baseline gap-1">
                        <span className={`font-sora font-extrabold text-3xl ${formData.accent === 'lime' ? 'text-lime' : formData.accent === 'aji' ? 'text-aji' : 'text-cream'}`}>
                          S/ {formatPriceNumber(formData.price || 0)}
                        </span>
                        <span className="text-xs text-muted">/mes</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        className="py-2.5 px-3 rounded-xl bg-white/10 text-cream text-xs font-sora font-semibold flex items-center justify-center gap-1.5"
                      >
                        <span>+ Agregar</span>
                      </button>

                      <div className="py-2.5 px-3 rounded-xl bg-whatsapp text-white text-xs font-sora font-semibold flex items-center justify-center gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5 fill-white" />
                        <span>Pedir</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Reverso ("Qué incluye") */
                <div
                  className={`rounded-[24px] bg-[#121216] border ${previewAccent.border} p-6 flex flex-col justify-between shadow-card relative overflow-hidden h-[380px]`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 border-b border-borderCream pb-2">
                      <span className={`text-[10px] font-mono ${previewAccent.text} uppercase font-semibold`}>
                        REVERSO: QUÉ INCLUYE
                      </span>
                      <span className="text-xs text-muted">Vista previa</span>
                    </div>

                    <h4 className="font-sora font-bold text-cream text-base text-left mb-3 truncate">
                      {formData.name || 'Servicio'}
                    </h4>

                    <ul className="space-y-2.5 text-xs text-cream/90 text-left">
                      {formData.includes.filter(Boolean).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className={`w-4 h-4 ${previewAccent.text} shrink-0 mt-0.5`} />
                          <span className="leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="mb-3 text-left">
                      <div className="flex items-baseline gap-1">
                        <span className={`font-sora font-extrabold text-2xl ${previewAccent.text}`}>
                          S/ {formatPriceNumber(formData.price || 0)}
                        </span>
                        <span className="text-xs text-muted">/mes</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewFlipped(false)}
                      className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-cream text-xs font-sora font-semibold flex items-center justify-center transition-all min-h-[44px]"
                    >
                      Volver al frente
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Pie de acciones de guardado */}
        <div className="p-4 border-t border-borderCream bg-night flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleRequestClose}
            className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-muted hover:text-cream text-xs font-sora font-semibold transition-colors min-h-[44px]"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl admin-button-primary text-xs font-sora font-bold shadow-md flex items-center gap-2 disabled:opacity-50 min-h-[44px]"
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-night/40 border-t-night rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{productToEdit ? 'Guardar Cambios' : 'Crear Producto'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Diálogo de advertencia si intenta cerrar con cambios sin guardar */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-[24px] bg-cardBg border border-aji/40 p-5 shadow-2xl text-left space-y-4">
            <div className="flex items-center gap-2.5 text-aji">
              <ShieldAlert className="w-5 h-5" />
              <h4 className="font-sora font-bold text-sm text-cream">¿Descartar cambios?</h4>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Tienes modificaciones sin guardar en este producto. Si sales ahora, se perderán los cambios realizados.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="px-3.5 py-2.5 rounded-xl text-xs font-sora font-semibold text-muted hover:text-cream transition-colors min-h-[44px]"
              >
                Continuar editando
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDiscardConfirm(false);
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl bg-rocoto hover:bg-rocoto/90 text-white text-xs font-sora font-bold transition-colors min-h-[44px]"
              >
                Descartar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
