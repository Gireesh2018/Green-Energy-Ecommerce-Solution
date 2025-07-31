import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "../components/AdminLayout";
import { ProductsTable } from "../components/ProductsTable";
import { ProductForm } from "../components/ProductForm";
import { DeleteProductDialog } from "../components/DeleteProductDialog";
import { getProductsList } from "../endpoints/products/list_GET.schema";
import styles from "./admin.products.module.css";

export default function AdminProductsPage() {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<{ id: number; title: string } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  console.log("AdminProductsPage: Rendering with refreshTrigger:", refreshTrigger);

  // Get product data for delete confirmation
  const { data: productsData } = useQuery({
    queryKey: ["products", "list", { page: 1, limit: 1000 }],
    queryFn: () => getProductsList({ page: 1, limit: 1000 }),
    staleTime: 30000,
  });

  const handleCreateProduct = () => {
    console.log("AdminProductsPage: Opening create product form");
    setIsCreateFormOpen(true);
  };

  const handleEditProduct = (productId: number) => {
    console.log("AdminProductsPage: Opening edit form for product:", productId);
    setEditingProductId(productId);
  };

  const handleDeleteProduct = (productId: number) => {
    console.log("AdminProductsPage: Opening delete dialog for product:", productId);
    const product = productsData?.products.find(p => p.id === productId);
    if (product) {
      setDeletingProduct({ id: productId, title: product.title });
    }
  };

  const handleFormSuccess = () => {
    console.log("AdminProductsPage: Form operation successful, triggering refresh");
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDeleteSuccess = () => {
    console.log("AdminProductsPage: Delete operation successful, triggering refresh");
    setRefreshTrigger(prev => prev + 1);
  };

  const closeCreateForm = () => {
    console.log("AdminProductsPage: Closing create form");
    setIsCreateFormOpen(false);
  };

  const closeEditForm = () => {
    console.log("AdminProductsPage: Closing edit form");
    setEditingProductId(null);
  };

  const closeDeleteDialog = () => {
    console.log("AdminProductsPage: Closing delete dialog");
    setDeletingProduct(null);
  };

  return (
    <>
      <Helmet>
        <title>Products Management - Green Energy Solutions Admin</title>
        <meta name="description" content="Manage products, inventory, and pricing for Green Energy Solutions" />
      </Helmet>

      <AdminLayout>
        <div className={styles.pageContainer}>
          <ProductsTable
            onCreateProduct={handleCreateProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            refreshTrigger={refreshTrigger}
          />

          {/* Create Product Form */}
          <ProductForm
            isOpen={isCreateFormOpen}
            onClose={closeCreateForm}
            onSuccess={handleFormSuccess}
          />

          {/* Edit Product Form */}
          <ProductForm
            isOpen={!!editingProductId}
            onClose={closeEditForm}
            productId={editingProductId || undefined}
            onSuccess={handleFormSuccess}
          />

          {/* Delete Product Dialog */}
          <DeleteProductDialog
            isOpen={!!deletingProduct}
            onClose={closeDeleteDialog}
            productId={deletingProduct?.id || null}
            productTitle={deletingProduct?.title || ""}
            onSuccess={handleDeleteSuccess}
          />
        </div>
      </AdminLayout>
    </>
  );
}