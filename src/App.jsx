import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './admin/context/AuthContext';
import ClientStoreView from './client/App';

const DashboardPage = lazy(() => import('./admin/pages/DashboardPage'));
const LoginPage = lazy(() => import('./admin/pages/LoginPage'));

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<p role="status">Cargando…</p>}>
          <Routes>
            {/* 1. Ruta principal: Carga la tienda de clientes */}
            <Route path="/" element={<ClientStoreView />} />

            {/* 2. Rutas de Login Administrativo */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/login" element={<LoginPage />} />

            {/* 3. Panel de Administración */}
            <Route path="/admin" element={<DashboardPage />} />
            <Route path="/admin/*" element={<DashboardPage />} />

            {/* 4. Fallback a la tienda de clientes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
