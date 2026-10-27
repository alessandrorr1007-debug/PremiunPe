import React from 'react';
import { LayoutDashboard, Package, Settings as SettingsIcon, Plus } from 'lucide-react';

export default function BottomNav({ activeTab, onTabChange, onOpenCreate }) {
  const tabs = [
    { id: 'summary', label: 'Resumen', icon: LayoutDashboard },
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'settings', label: 'Ajustes', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Botón flotante (+) en móvil para crear producto rápidamente con el pulgar */}
      <button
        onClick={onOpenCreate}
        className="md:hidden fixed bottom-20 right-5 z-40 w-14 h-14 rounded-full bg-aji text-night shadow-[0_0_25px_rgba(0,0,0,0.45)] flex items-center justify-center p-3.5 focus:outline-none active:scale-95 transition-transform"
        aria-label="Crear Nuevo Producto"
      >
        <Plus className="w-7 h-7 text-night stroke-[2.5]" />
      </button>

      {/* Barra de navegación inferior fija */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 border-t border-borderCream bg-[#09090b]/95 backdrop-blur-2xl z-40 flex items-center justify-around px-4 select-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center min-w-[64px] h-12 rounded-xl transition-all min-h-[44px] ${
                isActive
                  ? 'text-aji font-bold scale-105'
                  : 'text-muted hover:text-cream'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
