import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './admin/context/AuthContext';
import { AdminStoreProvider } from './admin/context/AdminStoreContext';
import ClientStoreView from './client/App';
import DashboardPage from './admin/pages/DashboardPage';
import LoginPage from './admin/pages/LoginPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminStoreProvider>
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
        </AdminStoreProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
