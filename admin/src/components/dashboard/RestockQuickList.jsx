import React from 'react';
import { CheckCircle2, PackageCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function RestockQuickList({ products, onToggleAvailability }) {
  const outOfStock = products.filter((p) => !p.available);

  const handleRestock = async (product) => {
    await onToggleAvailability(product.id);
    toast.success(`${product.name} marcado como disponible`);
  };

  const getMonogram = (name) => {
    if (!name) return 'P';
    const clean = name.trim();
    if (clean.toLowerCase().includes('disney')) return 'D+';
    if (clean.toLowerCase().includes('hbo') || clean.toLowerCase().includes('max')) return 'M';
    if (clean.toLowerCase().includes('vix')) return 'V';
    if (clean.toLowerCase().includes('prime')) return 'PV';
    if (clean.toLowerCase().includes('canva')) return 'CP';
    if (clean.toLowerCase().includes('office')) return 'O';
    if (clean.toLowerCase().includes('chatgpt') || clean.toLowerCase().includes('gpt')) return 'GPT';
    if (clean.toLowerCase().includes('gemini')) return 'G';
    return clean.slice(0, 2).toUpperCase();
  };

  return (
    <div className="rounded-[20px] bg-[#121216]/90 border border-borderCream p-5 sm:p-6 shadow-admin-card text-left">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-borderCream">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rocoto animate-pulse" />
          <h3 className="text-sm font-sora font-bold text-cream tracking-tight">
            Productos Agotados ({outOfStock.length})
          </h3>
        </div>
        <span className="text-xs text-muted">
          Reposición en 1 clic
        </span>
      </div>

      {outOfStock.length === 0 ? (
        <div className="py-8 text-center flex flex-col items-center justify-center text-muted">
          <div className="w-12 h-12 rounded-2xl bg-lime/10 border border-lime/30 flex items-center justify-center text-lime mb-3">
            <PackageCheck className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-sora font-bold text-cream">¡Todo con stock!</h4>
          <p className="text-xs text-muted mt-1 max-w-sm">
            Actualmente todas tus suscripciones están marcadas como disponibles en la tienda.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-borderCream -mx-1">
          {outOfStock.map((prod) => (
            <div
              key={prod.id}
              className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-white/[0.02] rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-rocoto/20 border border-rocoto/30 text-rocoto flex items-center justify-center text-xs font-sora font-extrabold shrink-0 overflow-hidden">
                  {prod.image_url ? (
                    <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                  ) : (
                    getMonogram(prod.name)
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-sora font-semibold text-cream truncate">
                    {prod.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-muted font-mono">
                    <span>{prod.category}</span>
                    <span>•</span>
                    <span className="text-cream font-semibold tabular-nums">
                      S/ {Number(prod.price).toFixed(2)} /mes
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRestock(prod)}
                className="px-3 py-1.5 rounded-xl bg-lime/15 hover:bg-lime/25 border border-lime/30 text-lime text-xs font-sora font-semibold flex items-center gap-1.5 shrink-0 transition-colors min-h-[44px]"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Marcar disponible</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
