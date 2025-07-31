import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProductsList } from "../endpoints/products/list_GET.schema";
import { Button } from "./Button";
import { Input } from "./Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select";
import { Edit, Trash2, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./ProductsTable.module.css";

interface ProductsTableProps {
  onEditProduct: (productId: number) => void;
  onDeleteProduct: (productId: number) => void;
  onCreateProduct: () => void;
  refreshTrigger?: number;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({
  onEditProduct,
  onDeleteProduct,
  onCreateProduct,
  refreshTrigger
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [sortBy, setSortBy] = useState<"price" | "name" | "created_at">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  console.log("ProductsTable: Rendering with refreshTrigger:", refreshTrigger);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["products", "list", {
      search: searchTerm,
      category: categoryFilter,
      brand: brandFilter,
      sortBy,
      sortOrder,
      page: currentPage,
      limit: 20
    }, refreshTrigger],
    queryFn: () => getProductsList({
      search: searchTerm || undefined,
      category: categoryFilter || undefined,
      brand: brandFilter || undefined,
      sortBy,
      sortOrder,
      page: currentPage,
      limit: 20
    }),
    staleTime: 30000,
  });

  console.log("ProductsTable: Query state - loading:", isLoading, "fetching:", isFetching, "error:", error);

  const handleSearch = (value: string) => {
    console.log("ProductsTable: Search term changed:", value);
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (value: string) => {
    console.log("ProductsTable: Category filter changed:", value);
    setCategoryFilter(value === "__all" ? "" : value);
    setCurrentPage(1);
  };

  const handleBrandFilter = (value: string) => {
    console.log("ProductsTable: Brand filter changed:", value);
    setBrandFilter(value);
    setCurrentPage(1);
  };

  const handleSort = (field: "price" | "name" | "created_at") => {
    console.log("ProductsTable: Sort changed:", field);
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    console.log("ProductsTable: Clearing all filters");
    setSearchTerm("");
    setCategoryFilter("");
    setBrandFilter("");
    setSortBy("created_at");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStockStatusColor = (stock: number) => {
    if (stock === 0) return styles.stockOut;
    if (stock < 10) return styles.stockLow;
    return styles.stockGood;
  };

  if (error) {
    console.error("ProductsTable: Error loading products:", error);
    return (
      <div className={styles.errorContainer}>
        <p>Failed to load products. Please try again.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>Products Management</h2>
          <p className={styles.subtitle}>
            {data ? `${data.pagination.totalCount} total products` : "Loading..."}
          </p>
        </div>
        <Button onClick={onCreateProduct} className={styles.createButton}>
          Add New Product
        </Button>
      </div>

      {/* Search and Filters */}
      <div className={styles.filtersSection}>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={styles.filterToggle}
        >
          <Filter size={16} />
          Filters
        </Button>
      </div>

      {showFilters && (
        <div className={styles.filtersContainer}>
          <Select value={categoryFilter || "__all"} onValueChange={handleCategoryFilter}>
            <SelectTrigger className={styles.filterSelect}>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">All Categories</SelectItem>
              <SelectItem value="Two-Wheeler Batteries">Two-Wheeler Batteries</SelectItem>
              <SelectItem value="Four-Wheeler Batteries">Four-Wheeler Batteries</SelectItem>
              <SelectItem value="Inverters">Inverters</SelectItem>
              <SelectItem value="Solar PCU">Solar PCU</SelectItem>
              <SelectItem value="UPS Battery">UPS Battery</SelectItem>
              <SelectItem value="Inverter Trolley">Inverter Trolley</SelectItem>
              <SelectItem value="Battery Tray">Battery Tray</SelectItem>
              <SelectItem value="Others">Others</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Filter by brand..."
            value={brandFilter}
            onChange={(e) => handleBrandFilter(e.target.value)}
            className={styles.filterInput}
          />

          <Button variant="ghost" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Table */}
      <div className={styles.tableContainer}>
        {(isLoading || isFetching) && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingSpinner}>Loading products...</div>
          </div>
        )}
        
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Image</th>
              <th 
                className={styles.sortableHeader}
                onClick={() => handleSort("name")}
              >
                Product Name
                {sortBy === "name" && (
                  <span className={styles.sortIndicator}>
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th>Category</th>
              <th>Brand</th>
              <th 
                className={styles.sortableHeader}
                onClick={() => handleSort("price")}
              >
                Price
                {sortBy === "price" && (
                  <span className={styles.sortIndicator}>
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.products.map((product) => (
              <tr key={product.id} className={styles.tableRow}>
                <td>
                  <div className={styles.productImage}>
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.title} />
                    ) : (
                      <div className={styles.imagePlaceholder}>No Image</div>
                    )}
                  </div>
                </td>
                <td>
                  <div className={styles.productInfo}>
                    <span className={styles.productTitle}>{product.title}</span>
                    {product.description && (
                      <span className={styles.productDescription}>
                        {product.description.length > 60 
                          ? `${product.description.substring(0, 60)}...`
                          : product.description
                        }
                      </span>
                    )}
                  </div>
                </td>
                <td>{product.category}</td>
                <td>{product.brand}</td>
                <td>
                  <div className={styles.priceInfo}>
                    <span className={styles.dpPrice}>{formatPrice(product.dpPrice)}</span>
                    <span className={styles.mrpPrice}>{formatPrice(product.mrpPrice)}</span>
                  </div>
                </td>
                <td>
                  <span className={`${styles.stockBadge} ${getStockStatusColor(product.stock)}`}>
                    {product.stock} units
                  </span>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${product.isActive ? styles.active : styles.inactive}`}>
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onEditProduct(product.id)}
                      title="Edit product"
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onDeleteProduct(product.id)}
                      title="Delete product"
                      className={styles.deleteButton}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data?.products.length === 0 && (
          <div className={styles.emptyState}>
            <p>No products found matching your criteria.</p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={!data.pagination.hasPreviousPage}
          >
            <ChevronLeft size={16} />
            Previous
          </Button>
          
          <span className={styles.pageInfo}>
            Page {data.pagination.currentPage} of {data.pagination.totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={!data.pagination.hasNextPage}
          >
            Next
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
};