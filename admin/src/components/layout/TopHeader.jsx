import React from 'react';
import { ExternalLink, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAdminStore } from '../../context/AdminStoreContext';

export default function TopHeader({ activeTab, onOpenCreate }) {
  const { user, logout } = useAuth();
  const { isLive } = useAdminStore();
  const clientStoreUrl = import.meta.env.VITE_CLIENT_STORE_URL || 'http://localhost:5173';

  const tabTitles = {
    summary: 'Resumen General',
    products: 'Gestión de Productos',
    settings: 'Configuración de la Tienda',
  };

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-borderCream bg-[#09090b]/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between">
      {/* Título de la sección activa */}
      <div className="flex items-center gap-3">
        {/* Monograma visible en móvil */}
        <div className="md:hidden w-8 h-8 rounded-xl bg-aji text-night flex items-center justify-center font-sora font-extrabold text-sm shadow-sm">
          P
        </div>
        <div className="text-left">
          <div className="text-[11px] text-muted font-medium hidden sm:block">
            Panel de Control
          </div>
          <h1 className="text-sm sm:text-base font-sora font-bold text-cream tracking-tight">
            {tabTitles[activeTab] || 'Dashboard'}
          </h1>
        </div>
      </div>

      {/* Controles y accesos rápidos */}
      <div className="flex items-center gap-3">
        {/* Atajo visual para desktop */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-muted bg-white/[0.03] border border-borderCream px-3 py-1.5 rounded-xl">
          <span>Atajos:</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] text-[10px] font-mono text-cream">
            /
          </kbd>
          <span>Buscar</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] text-[10px] font-mono text-cream">
            N
          </kbd>
          <span>Nuevo</span>
        </div>

        {/* Botón Ver Tienda */}
        <a
          href={clientStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-borderCream text-xs font-sora font-semibold text-cream transition-colors min-h-[44px]"
          title="Abrir la tienda pública de clientes en una pestaña nueva"
        >
          <span>Ver Tienda</span>
          <ExternalLink className="w-3.5 h-3.5 text-aji" />
        </a>

        {/* Botón Salir */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rocoto/10 hover:bg-rocoto/20 border border-rocoto/30 text-rocoto text-xs font-sora font-semibold transition-colors min-h-[44px]"
          title="Cerrar Sesión Segura"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
}
