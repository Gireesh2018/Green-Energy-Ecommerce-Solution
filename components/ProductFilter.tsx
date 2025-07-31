"use client";

import React, { useState } from "react";
import { X, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { Slider } from "./Slider";
import { Separator } from "./Separator";
import { useIsMobile } from "../helpers/useIsMobile";
import styles from "./ProductFilter.module.css";

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface PriceRange {
  min: number;
  max: number;
}

interface ProductFilterProps {
  categories: FilterOption[];
  brands: FilterOption[];
  tags?: FilterOption[];
  priceRange: PriceRange;
  selectedCategories: string[];
  selectedBrands: string[];
  selectedTags: string[];
  selectedPriceRange: [number, number];
  onCategoryChange: (categories: string[]) => void;
  onBrandChange: (brands: string[]) => void;
  onTagChange: (tags: string[]) => void;
  onPriceRangeChange: (range: [number, number]) => void;
  onClearFilters: () => void;
  className?: string;
}

export const ProductFilter: React.FC<ProductFilterProps> = ({
  categories,
  brands,
  tags = [],
  priceRange,
  selectedCategories,
  selectedBrands,
  selectedTags,
  selectedPriceRange,
  onCategoryChange,
  onBrandChange,
  onTagChange,
  onPriceRangeChange,
  onClearFilters,
  className,
}) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    brands: true,
    price: true,
    tags: true,
  });

  const toggleFilter = () => {
    setIsOpen(!isOpen);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCategoryChange = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    
    onCategoryChange(newCategories);
  };

  const handleBrandChange = (brandId: string) => {
    const newBrands = selectedBrands.includes(brandId)
      ? selectedBrands.filter(id => id !== brandId)
      : [...selectedBrands, brandId];
    
    onBrandChange(newBrands);
  };

  const handleTagChange = (tagId: string) => {
    const newTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId];
    
    onTagChange(newTags);
  };

  const handlePriceChange = (values: number[]) => {
    onPriceRangeChange([values[0], values[1]]);
  };

  const filterContent = (
    <div className={styles.filterContent}>
      <div className={styles.filterHeader}>
        <h3>Filters</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearFilters}
          className={styles.clearButton}
        >
          Clear All
        </Button>
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon-sm" 
            onClick={toggleFilter}
            className={styles.closeButton}
          >
            <X size={18} />
          </Button>
        )}
      </div>

      <div className={styles.filterSection}>
        <button 
          className={styles.sectionHeader}
          onClick={() => toggleSection('categories')}
        >
          <h4>Categories</h4>
          {expandedSections.categories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {expandedSections.categories && (
          <div className={styles.optionsList}>
            {categories.map(category => (
              <label key={category.id} className={styles.filterOption}>
                <Checkbox 
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => handleCategoryChange(category.id)}
                />
                <span>{category.label}</span>
                {category.count !== undefined && (
                  <span className={styles.count}>({category.count})</span>
                )}
              </label>
            ))}
          </div>
        )}
      </div>

      <Separator />

      <div className={styles.filterSection}>
        <button 
          className={styles.sectionHeader}
          onClick={() => toggleSection('brands')}
        >
          <h4>Brands</h4>
          {expandedSections.brands ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {expandedSections.brands && (
          <div className={styles.optionsList}>
            {brands.map(brand => (
              <label key={brand.id} className={styles.filterOption}>
                <Checkbox 
                  checked={selectedBrands.includes(brand.id)}
                  onChange={() => handleBrandChange(brand.id)}
                />
                <span>{brand.label}</span>
                {brand.count !== undefined && (
                  <span className={styles.count}>({brand.count})</span>
                )}
              </label>
            ))}
          </div>
        )}
      </div>

      <Separator />

      <div className={styles.filterSection}>
        <button 
          className={styles.sectionHeader}
          onClick={() => toggleSection('price')}
        >
          <h4>Price Range</h4>
          {expandedSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {expandedSections.price && (
          <div className={styles.priceRangeContainer}>
            <Slider 
              min={priceRange.min}
              max={priceRange.max}
              step={100}
              value={[selectedPriceRange[0], selectedPriceRange[1]]}
              onValueChange={handlePriceChange}
            />
            <div className={styles.priceInputs}>
              <div className={styles.priceDisplay}>
                <span>₹{selectedPriceRange[0].toLocaleString()}</span>
                <span>₹{selectedPriceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {tags.length > 0 && (
        <>
          <Separator />
          
          <div className={styles.filterSection}>
            <button 
              className={styles.sectionHeader}
              onClick={() => toggleSection('tags')}
            >
              <h4>Tags</h4>
              {expandedSections.tags ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {expandedSections.tags && (
              <div className={styles.tagsList}>
                {tags.map(tag => (
                  <label key={tag.id} className={styles.filterOption}>
                    <Checkbox 
                      checked={selectedTags.includes(tag.id)}
                      onChange={() => handleTagChange(tag.id)}
                    />
                    <span>{tag.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  // Mobile filter button
  if (isMobile && !isOpen) {
    return (
      <div className={`${styles.mobileFilterButton} ${className || ""}`}>
        <Button onClick={toggleFilter} variant="outline" className={styles.filterButton}>
          <Filter size={16} />
          Filters
          {(selectedCategories.length > 0 || selectedBrands.length > 0 || selectedTags.length > 0) && (
            <span className={styles.activeFiltersBadge}>
              {selectedCategories.length + selectedBrands.length + selectedTags.length}
            </span>
          )}
        </Button>
      </div>
    );
  }

  // Mobile filter panel
  if (isMobile && isOpen) {
    return (
      <div className={`${styles.mobileFilterPanel} ${className || ""}`}>
        {filterContent}
        <div className={styles.mobileFilterActions}>
          <Button variant="outline" onClick={toggleFilter}>
            Cancel
          </Button>
          <Button onClick={toggleFilter}>
            Apply Filters
          </Button>
        </div>
      </div>
    );
  }

  // Desktop sidebar
  return (
    <aside className={`${styles.filterSidebar} ${className || ""}`}>
      {filterContent}
    </aside>
  );
};