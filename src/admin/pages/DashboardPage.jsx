import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import SummaryTab from '../components/dashboard/SummaryTab';
import ProductsTab from '../components/products/ProductsTab';
import SettingsTab from '../components/SettingsTab';
import PromotionsSettings from '../components/PromotionsSettings';
import ProductDrawer from '../components/products/ProductDrawer';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { AdminStoreProvider, useAdminStore } from '../context/AdminStoreContext';

export default function DashboardPage() {
  const { isAdmin, loading } = useAuth();

  if (loading) return <p role="status">Verificando credenciales administrativas…</p>;
  if (!isAdmin) return <Navigate to="/login" replace />;
  return <AdminStoreProvider><DashboardContent /></AdminStoreProvider>;
}

function DashboardContent() {
  const { 
    products, 
    settings,
    toggleProductAvailability, 
    toggleProductVisibility, 
    toggleProductFeatured,
    duplicateProduct,
    reorderProduct,
    reorderAllProducts,
    bulkUpdateAvailability,
    bulkUpdateVisibility,
    bulkDelete
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState('summary');

  // Estado del drawer de producto (Crear / Editar)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  // Estado del modal de eliminación
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState([]);

  // Acciones de apertura de Drawer
  const handleOpenCreate = () => {
    setProductToEdit(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (product) => {
    setProductToEdit(product);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setProductToEdit(null);
  };

  // Acciones de eliminación
  const handleOpenSingleDelete = (product) => {
    setProductToDelete(product);
    setBulkDeleteIds([]);
    setIsDeleteModalOpen(true);
  };

  const handleOpenBulkDelete = (ids) => {
    setBulkDeleteIds(ids);
    setProductToDelete(null);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
    setBulkDeleteIds([]);
  };

  return (
    <AdminLayout 
      activeTab={activeTab} 
      onTabChange={setActiveTab} 
      onOpenCreate={handleOpenCreate}
    >
      {/* 1. VISTA DE RESUMEN */}
      {activeTab === 'summary' && (
        <SummaryTab
          products={products}
          settings={settings}
          onOpenCreate={handleOpenCreate}
          onOpenPromotion={() => {
            setActiveTab('promotions');
            window.scrollTo({ top: 0, behavior: 'instant' });
          }}
          onGoToSettings={() => setActiveTab('settings')}
          onGoToProducts={() => setActiveTab('products')}
          onFilterNoImage={() => setActiveTab('products')}
          onToggleAvailability={toggleProductAvailability}
        />
      )}

      {/* 2. VISTA DE PRODUCTOS */}
      {activeTab === 'products' && (
        <ProductsTab
          products={products}
          onOpenCreate={handleOpenCreate}
          onOpenEdit={handleOpenEdit}
          onOpenDelete={handleOpenSingleDelete}
          onDuplicate={duplicateProduct}
          onToggleAvailability={toggleProductAvailability}
          onToggleVisibility={toggleProductVisibility}
          onToggleFeatured={toggleProductFeatured}
          onReorder={reorderProduct}
          onReorderAll={reorderAllProducts}
          onBulkAvailable={(ids) => bulkUpdateAvailability(ids, true)}
          onBulkUnavailable={(ids) => bulkUpdateAvailability(ids, false)}
          onBulkVisible={(ids) => bulkUpdateVisibility(ids, true)}
          onBulkHidden={(ids) => bulkUpdateVisibility(ids, false)}
          onBulkDelete={handleOpenBulkDelete}
        />
      )}

      {/* 3. VISTA DE CONFIGURACIÓN */}
      {activeTab === 'settings' && <SettingsTab />}

      {activeTab === 'promotions' && <PromotionsSettings />}

      {/* DRAWER LATERAL: CREAR / EDITAR PRODUCTO */}
      <ProductDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        productToEdit={productToEdit}
      />

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN (INDIVIDUAL Y MASIVA) */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        product={productToDelete}
        productIds={bulkDeleteIds}
        onConfirmBulk={bulkDelete}
      />
    </AdminLayout>
  );
}
