import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Settings as SettingsIcon, 
  ExternalLink, 
  LogOut, 
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAdminStore } from '../../context/AdminStoreContext';

export default function Sidebar({ activeTab, onTabChange }) {
  const { user, logout } = useAuth();
  const { isLive, products } = useAdminStore();
  const clientStoreUrl = import.meta.env.VITE_CLIENT_STORE_URL || 'http://localhost:5173';

  const navItems = [
    {
      id: 'summary',
      label: 'Resumen',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'products',
      label: 'Productos',
      icon: Package,
      badge: products.length,
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: SettingsIcon,
      badge: null,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-borderCream bg-[#09090b] fixed inset-y-0 left-0 z-30 select-none">
      {/* Cabecera / Marca */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-borderCream">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-aji text-night flex items-center justify-center font-sora font-extrabold text-lg shadow-[0_0_15px_rgba(0,0,0,0.35)]">
            P
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-sora font-bold text-sm text-cream tracking-tight">
                Premium<span className="text-aji">Pe</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-aji/15 text-aji border border-aji/30">
                Admin
              </span>
            </div>
          </div>
        </div>

        {/* Indicador de conexión */}
        <div 
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
            isLive 
              ? 'bg-lime/10 border-lime/30 text-lime' 
              : 'bg-aji/10 border-aji/30 text-aji'
          }`}
          title={isLive ? "Sincronizado con Supabase PostgreSQL" : "Modo local"}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-lime' : 'bg-aji'} animate-pulse`} />
          <span>{isLive ? 'Live' : 'Local'}</span>
        </div>
      </div>

      {/* Navegación Principal */}
      <div className="flex-1 py-5 px-3 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
          Gestión de Tienda
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all min-h-[44px] ${
                isActive
                  ? 'bg-white/[0.08] text-cream font-semibold shadow-sm border border-borderCream'
                  : 'text-muted hover:text-cream hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-aji' : 'text-muted'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono tabular-nums ${
                  isActive ? 'bg-aji/20 text-aji border border-aji/30 font-bold' : 'bg-white/[0.05] text-muted'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-5 px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
          Accesos Externos
        </div>

        <a
          href={clientStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-muted hover:text-cream hover:bg-white/[0.04] transition-colors group min-h-[44px]"
        >
          <div className="flex items-center gap-2.5">
            <ExternalLink className="w-4 h-4 text-muted group-hover:text-aji transition-colors" />
            <span>Ver Tienda Pública</span>
          </div>
          <span className="text-[10px] text-muted group-hover:text-aji font-mono">↗</span>
        </a>
      </div>

      {/* Pie de Sidebar: Admin info y Logout */}
      <div className="p-3 border-t border-borderCream bg-[#09090b]">
        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-borderCream flex items-center justify-between gap-2">
          <div className="truncate text-left">
            <span className="text-[10px] uppercase font-semibold text-muted block">
              Conectado como
            </span>
            <span className="text-xs font-mono font-medium text-cream truncate block">
              {user?.email || 'admin@premiumpe.com'}
            </span>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-muted hover:text-rocoto hover:bg-rocoto/10 transition-colors shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Cerrar Sesión"
            aria-label="Cerrar Sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
