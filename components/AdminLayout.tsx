"use client";

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  Leaf,
  User,
} from "lucide-react";
import { Button } from "./Button";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./DropdownMenu";
import { ThemeModeSwitch } from "./ThemeModeSwitch";
import { useAuth } from "../helpers/useAuth";
import { useIsMobile } from "../helpers/useIsMobile";
import styles from "./AdminLayout.module.css";

interface AdminLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const navigationItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  className,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { authState, logout } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  console.log("AdminLayout: Current auth state:", authState.type);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    console.log("AdminLayout: Logging out user");
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("AdminLayout: Logout failed:", error);
    }
  };

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  // Show loading state while checking authentication
  if (authState.type === "loading") {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <Leaf className={styles.loadingIcon} />
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (authState.type === "unauthenticated") {
    console.log("AdminLayout: User not authenticated, redirecting to login");
    navigate("/login");
    return null;
  }

  const user = authState.user;

  return (
    <div className={`${styles.layout} ${className || ""}`}>
      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${
          sidebarOpen ? styles.sidebarOpen : ""
        }`}
      >
        <div className={styles.sidebarHeader}>
          <Link to="/admin" className={styles.logo} onClick={closeSidebar}>
            <Leaf className={styles.logoIcon} />
            <span className={styles.logoText}>Admin Panel</span>
          </Link>
        </div>

        <nav className={styles.navigation}>
          <ul className={styles.navList}>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`${styles.navLink} ${
                      isActive(item.href) ? styles.navLinkActive : ""
                    }`}
                    onClick={closeSidebar}
                  >
                    <Icon className={styles.navIcon} />
                    <span className={styles.navLabel}>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div className={styles.sidebarOverlay} onClick={closeSidebar} />
      )}

      {/* Main content area */}
      <div className={styles.mainContainer}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            {isMobile && (
              <Button
                variant="ghost"
                size="icon-md"
                onClick={toggleSidebar}
                className={styles.menuButton}
              >
                {sidebarOpen ? <X /> : <Menu />}
              </Button>
            )}
            <h1 className={styles.pageTitle}>Green Energy Solutions Admin</h1>
          </div>

          <div className={styles.headerRight}>
            <ThemeModeSwitch />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={styles.userButton}>
                  <Avatar>
                    <AvatarImage src={user.avatarUrl ?? undefined} alt={user.displayName} />
                    <AvatarFallback>
                      {user.displayName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{user.displayName}</span>
                    <span className={styles.userRole}>Administrator</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <User className={styles.menuIcon} />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className={styles.menuIcon} />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className={styles.menuIcon} />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main content */}
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
};