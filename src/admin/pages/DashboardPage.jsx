import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import SummaryTab from '../components/dashboard/SummaryTab';
import ProductsTab from '../components/products/ProductsTab';
import SettingsTab from '../components/SettingsTab';
import ProductDrawer from '../components/products/ProductDrawer';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { useAdminStore } from '../context/AdminStoreContext';

export default function DashboardPage() {
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

  const [activeTab, setActiveTab] = useState('summary'); // summary | products | settings

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
