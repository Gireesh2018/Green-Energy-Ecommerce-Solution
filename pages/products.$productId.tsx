"use client";

import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  Share2,
  Minus,
  Plus,
  Check,
  ArrowLeft,
  Battery,
  Shield,
  Truck
} from "lucide-react";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { Separator } from "../components/Separator";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from "../components/Breadcrumb";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from "../components/Carousel";
import { ProductCard } from "../components/ProductCard";
import { useProductData } from "../helpers/useProductData";
import { useShoppingCart } from "../helpers/useShoppingCart";
import styles from "./products.$productId.module.css";

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const { getProductById, products } = useProductData();
  const { addItem, isInCart, getItemQuantity, updateQuantity } = useShoppingCart();

  const [quantity, setQuantity] = useState(1);

  const product = getProductById(productId || "");

  if (!product) {
    return (
      <div className={styles.notFound}>
        <h1>Product Not Found</h1>
        <p>The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/products">
          <Button>
            <ArrowLeft size={16} /> Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  const discountPercentage = Math.round(
    ((product.price.mrp - product.price.dp) / product.price.mrp) * 100
  );

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const handleAddToCart = () => {
    addItem(
      {
        productId: product.id.toString(),
        title: product.title,
        price: product.price,
        image: product.imageUrl || ''
      },
      quantity
    );
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
      if (isInCart(product.id.toString())) {
        updateQuantity(product.id.toString(), newQuantity);
      }
    }
  };

  const displayQuantity = isInCart(product.id.toString())
    ? getItemQuantity(product.id.toString())
    : quantity;

  return (
    <div className={styles.productPage}>
      {/* ... rest of the component unchanged ... */}
    </div>
  );
}