import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./Button";
import { Skeleton } from "./Skeleton";
import { getUsersWishlist } from "../endpoints/users/wishlist_GET.schema";
import { postUsersWishlistRemove } from "../endpoints/users/wishlist/remove_POST.schema";
import { formatCurrency } from "../helpers/formatCurrency";
import styles from "./WishlistCard.module.css";

interface WishlistCardProps {
  className?: string;
}

export const WishlistCard: React.FC<WishlistCardProps> = ({ className }) => {
  const queryClient = useQueryClient();
  
  console.log("WishlistCard: Rendering wishlist");

  const { data, isLoading, error } = useQuery({
    queryKey: ["users", "wishlist"],
    queryFn: () => getUsersWishlist({ page: "1", limit: "6" }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: postUsersWishlistRemove,
    onSuccess: () => {
      console.log("Product removed from wishlist successfully");
      queryClient.invalidateQueries({ queryKey: ["users", "wishlist"] });
    },
    onError: (error) => {
      console.error("Failed to remove from wishlist:", error);
    }
  });

  const handleRemoveFromWishlist = (productId: number) => {
    console.log("Removing product from wishlist:", productId);
    removeFromWishlistMutation.mutate({ product_id: productId });
  };

  if (error) {
    console.error("WishlistCard: Error loading wishlist", error);
    return (
      <div className={`${styles.card} ${className || ""}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>Wishlist</h2>
        </div>
        <div className={styles.error}>
          <p>Failed to load wishlist</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${className || ""}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>Wishlist</h2>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/wishlist">View All</Link>
        </Button>
      </div>

      <div className={styles.content}>
        {isLoading ? (
          <div className={styles.loadingState}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className={styles.productSkeleton}>
                <Skeleton style={{ width: "100%", height: "120px" }} />
                <Skeleton style={{ width: "100%", height: "1rem" }} />
                <Skeleton style={{ width: "60%", height: "0.875rem" }} />
              </div>
            ))}
          </div>
        ) : data?.products.length === 0 ? (
          <div className={styles.emptyState}>
            <Heart size={48} className={styles.emptyIcon} />
            <p>Your wishlist is empty</p>
            <Button size="sm" asChild>
              <Link to="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className={styles.productGrid}>
            {data?.products.map((product) => (
              <div key={product.id} className={styles.productCard}>
                <div className={styles.imageContainer}>
                  <img 
                    src={product.imageUrl || "/placeholder-product.jpg"} 
                    alt={product.title}
                    className={styles.productImage}
                  />
                  <button
                    className={styles.removeButton}
                    onClick={() => handleRemoveFromWishlist(product.id)}
                    disabled={removeFromWishlistMutation.isPending}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <div className={styles.productInfo}>
                  <Link to={`/products/${product.id}`} className={styles.productLink}>
                    <h3 className={styles.productTitle}>{product.title}</h3>
                  </Link>
                  
                  <div className={styles.priceContainer}>
                    <span className={styles.dpPrice}>
                      {formatCurrency(product.dpPrice)}
                    </span>
                    {product.mrpPrice > product.dpPrice && (
                      <span className={styles.mrpPrice}>
                        {formatCurrency(product.mrpPrice)}
                      </span>
                    )}
                  </div>
                  
                  <Button size="sm" className={styles.addToCartButton}>
                    <ShoppingCart size={14} />
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};