import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Toaster } from 'sonner';
import Sidebar from './layout/Sidebar';
import TopHeader from './layout/TopHeader';
import BottomNav from './layout/BottomNav';
import InactivityGuard from './InactivityGuard';
import { ShieldCheck } from 'lucide-react';

export default function AdminLayout({ children, activeTab, onTabChange, onOpenCreate }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-night flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-aji/20 border border-aji/30 flex items-center justify-center animate-pulse mb-4">
          <ShieldCheck className="w-6 h-6 text-aji" />
        </div>
        <p className="text-xs font-semibold text-muted tracking-wide uppercase font-sora">
          Verificando credenciales administrativas...
        </p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-night text-cream flex flex-col selection:bg-aji selection:text-night">
      {/* Guardia de inactividad de 30 minutos con advertencia a los 28m */}
      <InactivityGuard />

      {/* Notificaciones modernas con Sonner con tokens heredados */}
      <Toaster 
        theme="dark" 
        position="bottom-right" 
        richColors 
        closeButton 
        toastOptions={{
          style: {
            background: '#121216',
            border: '1px solid rgba(244, 244, 245, 0.1)',
            color: '#f4f4f5',
            borderRadius: '16px',
            fontFamily: 'Inter, sans-serif',
          }
        }} 
      />

      {/* Sidebar fijo en escritorio */}
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} />

      {/* Contenido principal desplazado para desktop */}
      <div className="md:ml-64 flex-1 flex flex-col min-w-0">
        <TopHeader activeTab={activeTab} onOpenCreate={onOpenCreate} />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
          {children}
        </main>
      </div>

      {/* Barra de navegación inferior fija para celular */}
      <BottomNav 
        activeTab={activeTab} 
        onTabChange={onTabChange} 
        onOpenCreate={onOpenCreate} 
      />
    </div>
  );
}
