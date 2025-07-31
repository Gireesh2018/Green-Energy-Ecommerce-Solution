"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, Heart, User, Menu, X } from "lucide-react";
import { Button } from "./Button";
import { useIsMobile } from "../helpers/useIsMobile";
import styles from "./DashboardSidebar.module.css";

export interface DashboardSidebarProps {
  /**
   * Optional CSS class to apply to the component
   */
  className?: string;
  /**
   * Whether the sidebar is collapsed (for mobile)
   */
  collapsed?: boolean;
  /**
   * Callback when collapse state should change
   */
  onToggleCollapse?: () => void;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  searchParams?: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: <LayoutDashboard size={20} />,
    path: "/dashboard",
  },
  {
    id: "orders",
    label: "Orders",
    icon: <Package size={20} />,
    path: "/dashboard",
    searchParams: "?tab=orders",
  },
  {
    id: "wishlist",
    label: "Wishlist",
    icon: <Heart size={20} />,
    path: "/dashboard",
    searchParams: "?tab=wishlist",
  },
  {
    id: "profile",
    label: "Profile",
    icon: <User size={20} />,
    path: "/dashboard",
    searchParams: "?tab=profile",
  },
];

export const DashboardSidebar = ({
  className,
  collapsed = false,
  onToggleCollapse,
}: DashboardSidebarProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();

  console.log("DashboardSidebar: Current location:", location.pathname + location.search);

  const isActiveItem = (item: NavigationItem): boolean => {
    const currentPath = location.pathname + location.search;
    const itemPath = item.path + (item.searchParams || "");
    
    // For overview, check if we're on dashboard with no search params
    if (item.id === "overview") {
      return location.pathname === "/dashboard" && !location.search;
    }
    
    // For other items, check if search params match
    if (item.searchParams) {
      return currentPath === itemPath;
    }
    
    return location.pathname === item.path;
  };

  const handleItemClick = () => {
    // Close sidebar on mobile when item is clicked
    if (isMobile && onToggleCollapse && !collapsed) {
      onToggleCollapse();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && !collapsed && (
        <div 
          className={styles.overlay} 
          onClick={onToggleCollapse}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          ${styles.sidebar} 
          ${isMobile ? styles.mobile : styles.desktop}
          ${isMobile && collapsed ? styles.collapsed : ""}
          ${className || ""}
        `}
      >
        {/* Mobile header with close button */}
        {isMobile && (
          <div className={styles.mobileHeader}>
            <h2 className={styles.sidebarTitle}>Dashboard</h2>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleCollapse}
              aria-label="Close sidebar"
              className={styles.closeButton}
            >
              <X size={18} />
            </Button>
          </div>
        )}

        {/* Navigation */}
        <nav className={styles.navigation} role="navigation" aria-label="Dashboard navigation">
          <ul className={styles.navigationList}>
            {navigationItems.map((item) => {
              const isActive = isActiveItem(item);
              const fullPath = item.path + (item.searchParams || "");
              
              return (
                <li key={item.id} className={styles.navigationItem}>
                  <Link
                    to={fullPath}
                    className={`
                      ${styles.navigationLink}
                      ${isActive ? styles.active : ""}
                    `}
                    onClick={handleItemClick}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className={styles.navigationIcon}>
                      {item.icon}
                    </span>
                    <span className={styles.navigationLabel}>
                      {item.label}
                    </span>
                    {isActive && (
                      <span className={styles.activeIndicator} aria-hidden="true" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};