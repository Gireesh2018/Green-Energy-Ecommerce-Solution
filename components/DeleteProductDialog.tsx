import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./Dialog";
import { Button } from "./Button";
import { postProductsDelete } from "../endpoints/products/delete_POST.schema";
import { AlertTriangle } from "lucide-react";
import styles from "./DeleteProductDialog.module.css";

interface DeleteProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number | null;
  productTitle: string;
  onSuccess: () => void;
}

export const DeleteProductDialog: React.FC<DeleteProductDialogProps> = ({
  isOpen,
  onClose,
  productId,
  productTitle,
  onSuccess,
}) => {
  const queryClient = useQueryClient();

  console.log("DeleteProductDialog: Rendering with productId:", productId, "title:", productTitle);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => postProductsDelete({ productId: id }),
    onSuccess: () => {
      console.log("DeleteProductDialog: Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onSuccess();
      onClose();
    },
    onError: (error) => {
      console.error("DeleteProductDialog: Error deleting product:", error);
      // You could add a toast notification here
    },
  });

  const handleDelete = () => {
    if (productId) {
      console.log("DeleteProductDialog: Deleting product with ID:", productId);
      deleteMutation.mutate(productId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <div className={styles.headerContent}>
            <AlertTriangle className={styles.warningIcon} />
            <div>
              <DialogTitle>Delete Product</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{productTitle}"? This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className={styles.warningMessage}>
          <p>This will permanently remove the product from your inventory. The product will no longer be visible to customers.</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};