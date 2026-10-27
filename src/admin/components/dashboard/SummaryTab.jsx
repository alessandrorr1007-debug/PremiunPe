import React, { useMemo } from 'react';
import { Package, CheckCircle2, AlertTriangle, Sparkles, Plus, MessageSquare, ExternalLink, ArrowRight } from 'lucide-react';
import StatCard from './StatCard';
import SetupAlerts from './SetupAlerts';
import RestockQuickList from './RestockQuickList';

export default function SummaryTab({ 
  products, 
  settings, 
  onOpenCreate, 
  onGoToSettings, 
  onGoToProducts, 
  onFilterNoImage,
  onToggleAvailability 
}) {
  const clientStoreUrl = import.meta.env.VITE_CLIENT_STORE_URL || 'http://localhost:5173';

  const stats = useMemo(() => {
    const total = products.length;
    const available = products.filter((p) => p.available !== false).length;
    const outOfStock = total - available;
    const featured = products.filter((p) => p.featured).length;
    const visible = products.filter((p) => p.visible !== false).length;
    return { total, available, outOfStock, featured, visible };
  }, [products]);

  return (
    <div className="space-y-6">
      {/* Alertas amigables */}
      <SetupAlerts 
        settings={settings} 
        products={products} 
        onGoToSettings={onGoToSettings} 
        onFilterNoImage={onFilterNoImage} 
        onFilterNoIncludes={onGoToProducts}
      />

      {/* 4 Tarjetas de Métricas (8 / 8 / 0 / 4) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Productos Totales"
          count={stats.total}
          subtitle={`${stats.visible} visibles en la tienda`}
          icon={Package}
          color="brand"
        />
        <StatCard
          title="Disponibles"
          count={stats.available}
          subtitle="Listos para entrega"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Agotados"
          count={stats.outOfStock}
          subtitle={stats.outOfStock === 0 ? 'Sin faltantes' : 'Requieren reposición'}
          icon={AlertTriangle}
          color="rose"
        />
        <StatCard
          title="Destacados"
          count={stats.featured}
          subtitle="En el mazo de portada"
          icon={Sparkles}
          color="purple"
        />
      </div>

      {/* Acciones Rápidas */}
      <div className="rounded-[20px] bg-[#121216]/90 border border-borderCream p-5 sm:p-6 shadow-admin-card text-left">
        <h3 className="text-xs font-sora font-bold uppercase tracking-wider text-muted mb-4">
          Acciones Rápidas
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={onOpenCreate}
            className="p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-borderCream flex items-center justify-between text-left group transition-all min-h-[44px]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-aji/15 border border-aji/30 flex items-center justify-center text-aji">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-sora font-semibold text-cream">Nuevo Producto</h4>
                <p className="text-[11px] text-muted">Agregar servicio o plan</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted group-hover:text-cream transition-colors" />
          </button>

          <button
            type="button"
            onClick={onGoToSettings}
            className="p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-borderCream flex items-center justify-between text-left group transition-all min-h-[44px]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-whatsapp/15 border border-whatsapp/30 flex items-center justify-center text-whatsapp">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-sora font-semibold text-cream">Editar WhatsApp</h4>
                <p className="text-[11px] text-muted">Número de atención</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted group-hover:text-cream transition-colors" />
          </button>

          <a
            href={clientStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-borderCream flex items-center justify-between text-left group transition-all min-h-[44px]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-lime/15 border border-lime/30 flex items-center justify-center text-lime">
                <ExternalLink className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-sora font-semibold text-cream">Ver Tienda</h4>
                <p className="text-[11px] text-muted">Abrir como cliente</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted group-hover:text-cream transition-colors" />
          </a>
        </div>
      </div>

      {/* Reposición de Agotados */}
      <RestockQuickList 
        products={products} 
        onToggleAvailability={onToggleAvailability} 
      />
    </div>
  );
}
