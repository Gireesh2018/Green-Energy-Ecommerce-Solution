"use client";

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X, ChevronDown, Leaf, User, LogOut, LayoutDashboard } from "lucide-react";
import { useShoppingCart } from "../helpers/useShoppingCart";
import { useIsMobile } from "../helpers/useIsMobile";
import { useAuth } from "../helpers/useAuth";
import { Button } from "./Button";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "./DropdownMenu";
import styles from "./AppLayout.module.css";

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, className }) => {
  const { cart } = useShoppingCart();
  const isMobile = useIsMobile();
  const { authState, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isAdmin = authState.type === "authenticated" && authState.user.role === "admin";

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const renderUserSection = () => {
    if (authState.type === "loading") {
      return <div className={styles.userSection}>Loading...</div>;
    }

    if (authState.type === "unauthenticated") {
      return (
        <Link to="/login" className={styles.loginButton}>
          <Button variant="outline" size="sm">Login</Button>
        </Link>
      );
    }

    if (authState.type === "authenticated") {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger className={styles.userTrigger}>
            <div className={styles.userInfo}>
              <User size={20} />
              <span className={styles.userName}>{authState.user.displayName || authState.user.email}</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <span className={styles.userRole}>Role: {authState.user.role}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/dashboard">
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return null;
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link to="/" className={styles.logo} onClick={closeMobileMenu}>
            <Leaf className={styles.logoIcon} />
            <span className={styles.logoText}>Green Energy Solutions</span>
          </Link>

          {isMobile ? (
            <div className={styles.mobileControls}>
              <Link to="/cart" className={styles.cartIcon}>
                <ShoppingCart />
                {cart.totalItems > 0 && (
                  <span className={styles.cartBadge}>{cart.totalItems}</span>
                )}
              </Link>
              <button className={styles.menuToggle} onClick={toggleMobileMenu}>
                {mobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          ) : (
            <nav className={styles.desktopNav}>
              <ul className={styles.navList}>
                <li>
                  <Link 
                    to="/" 
                    className={`${styles.navLink} ${isActive("/") ? styles.active : ""}`}
                  >
                    Home
                  </Link>
                </li>
                <li className={styles.dropdown}>
                  <button className={styles.dropdownTrigger}>
                    Products <ChevronDown size={16} />
                  </button>
                  <div className={styles.dropdownContent}>
                    <Link to="/products?category=Two-Wheeler+Batteries">Two-Wheeler Batteries</Link>
                    <Link to="/products?category=Four-Wheeler+Batteries">Four-Wheeler Batteries</Link>
                    <Link to="/products?category=Inverters">Inverters</Link>
                    <Link to="/products?category=Solar+PCU">Solar PCU</Link>
                    <Link to="/products">All Products</Link>
                  </div>
                </li>
                <li>
                  <Link 
                    to="/about" 
                    className={`${styles.navLink} ${isActive("/about") ? styles.active : ""}`}
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/contact" 
                    className={`${styles.navLink} ${isActive("/contact") ? styles.active : ""}`}
                  >
                    Contact
                  </Link>
                </li>
                {isAdmin && (
                  <li>
                    <Link 
                      to="/admin/dashboard" 
                      className={`${styles.navLink} ${isActive("/admin/dashboard") ? styles.active : ""}`}
                    >
                      Admin
                    </Link>
                  </li>
                )}
              </ul>
              <div className={styles.desktopActions}>
                <Link to="/cart" className={styles.cartButton}>
                  <ShoppingCart />
                  <span>Cart</span>
                  {cart.totalItems > 0 && (
                    <span className={styles.cartBadge}>{cart.totalItems}</span>
                  )}
                </Link>
                {renderUserSection()}
              </div>
            </nav>
          )}
        </div>
      </header>

      {isMobile && mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <nav>
            <ul className={styles.mobileNavList}>
              <li>
                <Link 
                  to="/" 
                  className={isActive("/") ? styles.active : ""}
                  onClick={closeMobileMenu}
                >
                  Home
                </Link>
              </li>
              <li className={styles.mobileCategory}>
                <span>Products</span>
                <ul className={styles.subMenu}>
                  <li>
                    <Link 
                      to="/products?category=Two-Wheeler+Batteries" 
                      onClick={closeMobileMenu}
                    >
                      Two-Wheeler Batteries
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/products?category=Four-Wheeler+Batteries" 
                      onClick={closeMobileMenu}
                    >
                      Four-Wheeler Batteries
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/products?category=Inverters" 
                      onClick={closeMobileMenu}
                    >
                      Inverters
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/products?category=Solar+PCU" 
                      onClick={closeMobileMenu}
                    >
                      Solar PCU
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/products" 
                      onClick={closeMobileMenu}
                    >
                      All Products
                    </Link>
                  </li>
                </ul>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className={isActive("/about") ? styles.active : ""}
                  onClick={closeMobileMenu}
                >
                  About
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className={isActive("/contact") ? styles.active : ""}
                  onClick={closeMobileMenu}
                >
                  Contact
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link 
                    to="/admin/dashboard" 
                    className={isActive("/admin/dashboard") ? styles.active : ""}
                    onClick={closeMobileMenu}
                  >
                    Admin
                  </Link>
                </li>
              )}
              <li className={styles.mobileUserSection}>
                {authState.type === "loading" && (
                  <span>Loading...</span>
                )}
                {authState.type === "unauthenticated" && (
                  <Link 
                    to="/login" 
                    onClick={closeMobileMenu}
                    className={styles.mobileLoginButton}
                  >
                    Login
                  </Link>
                )}
                {authState.type === "authenticated" && (
                  <div className={styles.mobileUserInfo}>
                    <div className={styles.mobileUserDetails}>
                      <User size={16} />
                      <span>{authState.user.displayName || authState.user.email}</span>
                      <span className={styles.mobileUserRole}>({authState.user.role})</span>
                    </div>
                    <Link 
                      to="/dashboard" 
                      onClick={closeMobileMenu}
                      className={styles.mobileDashboardButton}
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>
                    <button 
                      onClick={() => {
                        handleLogout();
                        closeMobileMenu();
                      }}
                      className={styles.mobileLogoutButton}
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </li>
            </ul>
          </nav>
        </div>
      )}

      <main className={`${styles.main} ${className || ""}`}>
        {children}
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3>Green Energy Solutions</h3>
            <p>Powering a sustainable future with reliable energy solutions.</p>
          </div>
          
          <div className={styles.footerSection}>
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          
          <div className={styles.footerSection}>
            <h4>Contact Us</h4>
            <address>
              123 Green Street<br />
              Eco City, EC 12345<br />
              Phone: (123) 456-7890<br />
              Email: info@greenenergysolutions.com
            </address>
          </div>
        </div>
        
        <div className={styles.copyright}>
          <p>&copy; {new Date().getFullYear()} Green Energy Solutions. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};