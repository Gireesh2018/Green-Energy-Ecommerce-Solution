"use client";

import { useState, useEffect } from "react";

// Define types for cart items
export interface CartItem {
  productId: string;
  title: string;
  price: {
    dp: number; // Dealer Price
    mrp: number; // Maximum Retail Price
  };
  quantity: number;
  image: string;
}

// Interface for the shopping cart
interface ShoppingCart {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  savings: number;
}

// Initial empty cart state
const initialCart: ShoppingCart = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  savings: 0,
};

export function useShoppingCart() {
  // Initialize cart state from localStorage if available
  const [cart, setCart] = useState<ShoppingCart>(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("shoppingCart");
      return savedCart ? JSON.parse(savedCart) : initialCart;
    }
    return initialCart;
  });

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("shoppingCart", JSON.stringify(cart));
    }
  }, [cart]);

  // Calculate cart totals
  const calculateTotals = (items: CartItem[]): Pick<ShoppingCart, "totalItems" | "subtotal" | "savings"> => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + (item.price.dp * item.quantity), 0);
    const savings = items.reduce((sum, item) => sum + ((item.price.mrp - item.price.dp) * item.quantity), 0);
    
    return {
      totalItems,
      subtotal,
      savings,
    };
  };

  // Add an item to the cart
  const addItem = (item: Omit<CartItem, "quantity">, quantity = 1) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.items.findIndex(
        cartItem => cartItem.productId === item.productId
      );

      let newItems;
      
      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        newItems = [...prevCart.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity,
        };
      } else {
        // Item doesn't exist, add new item
        newItems = [...prevCart.items, { ...item, quantity }];
      }

      return {
        items: newItems,
        ...calculateTotals(newItems),
      };
    });
  };

  // Remove an item from the cart
  const removeItem = (productId: string) => {
    setCart(prevCart => {
      const newItems = prevCart.items.filter(item => item.productId !== productId);
      
      return {
        items: newItems,
        ...calculateTotals(newItems),
      };
    });
  };

  // Update the quantity of an item in the cart
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setCart(prevCart => {
      const newItems = prevCart.items.map(item => 
        item.productId === productId 
          ? { ...item, quantity } 
          : item
      );
      
      return {
        items: newItems,
        ...calculateTotals(newItems),
      };
    });
  };

  // Clear the entire cart
  const clearCart = () => {
    setCart(initialCart);
  };

  // Check if an item is in the cart
  const isInCart = (productId: string): boolean => {
    return cart.items.some(item => item.productId === productId);
  };

  // Get the quantity of an item in the cart
  const getItemQuantity = (productId: string): number => {
    const item = cart.items.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };

  return {
    // Cart state
    cart,
    
    // Cart methods
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
  };
}