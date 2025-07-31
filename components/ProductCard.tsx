"use client";

import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { useShoppingCart } from "../helpers/useShoppingCart";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  id: string;
  title: string;
  image: string;
  category: string;
  price: {
    dp: number; // Dealer Price
    mrp: number; // Maximum Retail Price
  };
  stock?: number;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  image,
  category,
  price,
  stock,
  className,
}) => {
  const { addItem, isInCart } = useShoppingCart();
  
  const discountPercentage = Math.round(((price.mrp - price.dp) / price.mrp) * 100);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      productId: id,
      title,
      price,
      image,
    });
  };
  
  const getStockStatus = () => {
    if (stock === undefined) return null;
    
    if (stock <= 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    
    if (stock < 5) {
      return <Badge variant="secondary">Low Stock</Badge>;
    }
    
    return <Badge>In Stock</Badge>;
  };

  return (
    <div className={`${styles.card} ${className || ""}`}>
      <Link to={`/products/${id}`} className={styles.cardLink}>
        <div className={styles.imageContainer}>
          <img src={image} alt={title} className={styles.image} />
          {discountPercentage > 0 && (
            <div className={styles.discountBadge}>
              {discountPercentage}% OFF
            </div>
          )}
          <button className={styles.wishlistButton}>
            <Heart size={18} />
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.category}>{category}</div>
          <h3 className={styles.title}>{title}</h3>
          
          <div className={styles.priceContainer}>
            <div className={styles.priceInfo}>
              <span className={styles.dp}>₹{price.dp.toLocaleString()}</span>
              {price.mrp > price.dp && (
                <span className={styles.mrp}>₹{price.mrp.toLocaleString()}</span>
              )}
            </div>
            {getStockStatus()}
          </div>
          
          <Button 
            variant={isInCart(id) ? "secondary" : "primary"}
            className={styles.addToCartButton}
            onClick={handleAddToCart}
            disabled={stock !== undefined && stock <= 0}
          >
            <ShoppingCart size={16} />
            {isInCart(id) ? "Added to Cart" : "Add to Cart"}
          </Button>
        </div>
      </Link>
    </div>
  );
};