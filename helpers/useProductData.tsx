"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProductsList } from "../endpoints/products/list_GET.schema";
import { getProducts } from "../endpoints/products/get_GET.schema";

// Define types for product data - updating to match API response
export interface Product {
  id: number;
  title: string;
  description: string | null;
  category: string;
  brand: string;
  imageUrl: string | null;
  price: {
    dp: number; // Dealer Price
    mrp: number; // Maximum Retail Price
  };
  stock: number;
  stockStatus: "in_stock" | "out_of_stock";
  specifications: Record<string, string>;
  tags: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Interface for filter options
interface FilterOptions {
  categories?: string[];
  brands?: string[];
  priceRange?: {
    min?: number;
    max?: number;
  };
  tags?: string[];
  search?: string;
}

// Interface for sort options
type SortOption = "price-asc" | "price-desc" | "name-asc" | "name-desc";

// Interface for pagination
interface PaginationOptions {
  page: number;
  limit: number;
}

export function useProductData() {
  // State for filters, sorting, and pagination
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortBy, setSortBy] = useState<SortOption>("price-asc");
  const [pagination, setPagination] = useState<PaginationOptions>({
    page: 1,
    limit: 10,
  });
  
  // Convert our sort options to API format
  const getApiSortParams = (sortOption: SortOption) => {
    switch (sortOption) {
      case "price-asc":
        return { sortBy: "price" as const, sortOrder: "asc" as const };
      case "price-desc":
        return { sortBy: "price" as const, sortOrder: "desc" as const };
      case "name-asc":
        return { sortBy: "name" as const, sortOrder: "asc" as const };
      case "name-desc":
        return { sortBy: "name" as const, sortOrder: "desc" as const };
      default:
        return { sortBy: "price" as const, sortOrder: "asc" as const };
    }
  };

  // Build API parameters from current state
  const apiParams = useMemo(() => {
    const { sortBy: apiSortBy, sortOrder } = getApiSortParams(sortBy);
    
    return {
      // Filtering
      category: filters.categories?.[0], // API takes single category
      brand: filters.brands?.[0], // API takes single brand
      minPrice: filters.priceRange?.min,
      maxPrice: filters.priceRange?.max,
      tags: filters.tags,
      search: filters.search,
      
      // Sorting
      sortBy: apiSortBy,
      sortOrder,
      
      // Pagination
      page: pagination.page,
      limit: pagination.limit,
    };
  }, [filters, sortBy, pagination]);

  // Fetch products using React Query
  const {
    data: apiResponse,
    isLoading,
    isFetching,
    error
  } = useQuery({
    queryKey: ['products', apiParams],
    queryFn: () => getProductsList(apiParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Transform API response to match our Product interface
  const products = useMemo(() => {
    if (!apiResponse?.products) return [];
    
    return apiResponse.products.map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      category: product.category,
      brand: product.brand,
      imageUrl: product.imageUrl,
      price: {
        dp: product.dpPrice,
        mrp: product.mrpPrice,
      },
      stock: product.stock,
      stockStatus: product.stockStatus,
      specifications: product.specifications || {},
      tags: product.tags,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));
  }, [apiResponse]);

  // Get pagination info from API response
  const paginationInfo = apiResponse?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: pagination.limit,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  // Get all unique categories from current products
  const categories = useMemo(() => {
    const categorySet = new Set(products.map(product => product.category));
    return Array.from(categorySet);
  }, [products]);
  
  // Get all unique brands from current products
  const brands = useMemo(() => {
    const brandSet = new Set(products.map(product => product.brand));
    return Array.from(brandSet);
  }, [products]);
  
  // Get all unique tags from current products
  const tags = useMemo(() => {
    const tagSet = new Set(products.flatMap(product => product.tags));
    return Array.from(tagSet);
  }, [products]);
  
  // Get a single product by ID using separate API call
  const getProductById = (id: string): Product | undefined => {
    // First check if product is in current list
    const numericId = parseInt(id, 10);
    const productInList = products.find(product => product.id === numericId);
    
    if (productInList) {
      return productInList;
    }
    
    // If not in current list, would need a separate query
    // For now, return undefined to maintain compatibility
    return undefined;
  };
  
  // Update filters
  const updateFilters = (newFilters: FilterOptions) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  // Update sort option
  const updateSort = (option: SortOption) => {
    setSortBy(option);
  };
  
  // Update pagination
  const goToPage = (page: number) => {
    if (page >= 1 && page <= paginationInfo.totalPages) {
      setPagination(prev => ({ ...prev, page }));
    }
  };
  
  // Change items per page
  const setItemsPerPage = (limit: number) => {
    setPagination({ page: 1, limit });
  };
  
  return {
    // Data
    products,
    filteredCount: paginationInfo.totalCount,
    totalCount: paginationInfo.totalCount,
    totalPages: paginationInfo.totalPages,
    currentPage: paginationInfo.currentPage,
    itemsPerPage: pagination.limit,
    categories,
    brands,
    tags,
    isLoading: isFetching, // Use isFetching for loading state
    
    // Methods
    getProductById,
    updateFilters,
    clearFilters,
    updateSort,
    goToPage,
    setItemsPerPage,
    
    // Additional React Query states
    error,
  };
}

// Hook for getting a single product by ID
export function useProduct(id: string | number) {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  
  return useQuery({
    queryKey: ['product', numericId],
    queryFn: () => getProducts({ id: numericId.toString() }),
    enabled: !!numericId && numericId > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}