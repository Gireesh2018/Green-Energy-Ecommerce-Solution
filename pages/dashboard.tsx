import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useLocation, useSearchParams } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "../components/Button";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { UserProfileCard } from "../components/UserProfileCard";
import { UserAnalyticsCards } from "../components/UserAnalyticsCards";
import { RecentOrdersCard } from "../components/RecentOrdersCard";
import { WishlistCard } from "../components/WishlistCard";
import { useAuth } from "../helpers/useAuth";
import { useIsMobile } from "../helpers/useIsMobile";
import { AuthLoadingState } from "../components/AuthLoadingState";
import styles from "./dashboard.module.css";

export default function Dashboard() {
  const { authState } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<"7d" | "30d" | "90d" | "1y">("30d");

  console.log("Dashboard: Rendering user dashboard with sidebar layout");

  if (authState.type === "loading") {
    return <AuthLoadingState title="Loading Dashboard" />;
  }

  if (authState.type === "unauthenticated") {
    return null; // ProtectedRoute will handle redirect
  }

  const { user } = authState;

  // Determine current section based on search params
  const currentTab = searchParams.get("tab") || "overview";

  const getPageTitle = () => {
    switch (currentTab) {
      case "orders":
        return "Orders - Dashboard - Green Energy Solutions";
      case "wishlist":
        return "Wishlist - Dashboard - Green Energy Solutions";
      case "profile":
        return "Profile - Dashboard - Green Energy Solutions";
      default:
        return "Dashboard - Green Energy Solutions";
    }
  };

  const getPageDescription = () => {
    switch (currentTab) {
      case "orders":
        return "View and manage your orders at Green Energy Solutions.";
      case "wishlist":
        return "View and manage your wishlist at Green Energy Solutions.";
      case "profile":
        return "Manage your account settings and profile information at Green Energy Solutions.";
      default:
        return "Your personal dashboard for managing orders, wishlist, and account settings at Green Energy Solutions.";
    }
  };

  const renderContent = () => {
    switch (currentTab) {
      case "orders":
        return (
          <div className={styles.contentSection}>
            <div className={styles.contentHeader}>
              <h1 className={styles.contentTitle}>Orders</h1>
              <p className={styles.contentDescription}>
                View and track all your orders
              </p>
            </div>
            <RecentOrdersCard />
          </div>
        );

      case "wishlist":
        return (
          <div className={styles.contentSection}>
            <div className={styles.contentHeader}>
              <h1 className={styles.contentTitle}>Wishlist</h1>
              <p className={styles.contentDescription}>
                Your saved products and favorites
              </p>
            </div>
            <WishlistCard />
          </div>
        );

      case "profile":
        return (
          <div className={styles.contentSection}>
            <div className={styles.contentHeader}>
              <h1 className={styles.contentTitle}>Profile</h1>
              <p className={styles.contentDescription}>
                Manage your account settings and information
              </p>
            </div>
            <div className={styles.profileSection}>
              <UserProfileCard />
            </div>
          </div>
        );

      default:
        return (
          <div className={styles.contentSection}>
            <div className={styles.contentHeader}>
              <h1 className={styles.contentTitle}>
                Welcome back, {user.displayName || user.email}!
              </h1>
              <p className={styles.contentDescription}>
                Here's an overview of your account activity
              </p>
            </div>

            <div className={styles.overviewContent}>
              {/* Analytics Period Selector */}
              <div className={styles.periodSelector}>
                <label className={styles.periodLabel}>Analytics Period:</label>
                <select 
                  value={analyticsPeriod} 
                  onChange={(e) => setAnalyticsPeriod(e.target.value as any)}
                  className={styles.periodSelect}
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
              </div>

              {/* Analytics Cards */}
              <div className={styles.analyticsSection}>
                <UserAnalyticsCards period={analyticsPeriod} />
              </div>

              {/* Recent Orders and Wishlist */}
              <div className={styles.cardsGrid}>
                <RecentOrdersCard className={styles.recentOrdersCard} />
                <WishlistCard className={styles.wishlistCard} />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <Helmet>
        <title>{getPageTitle()}</title>
        <meta name="description" content={getPageDescription()} />
      </Helmet>

      <div className={styles.dashboardLayout}>
        {/* Mobile Header */}
        {isMobile && (
          <div className={styles.mobileHeader}>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={styles.menuButton}
            >
              <Menu size={20} />
            </Button>
            <h1 className={styles.mobileTitle}>Dashboard</h1>
          </div>
        )}

        {/* Sidebar */}
        <DashboardSidebar
          collapsed={isMobile ? sidebarCollapsed : false}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={styles.sidebar}
        />

        {/* Main Content */}
        <main className={styles.mainContent}>
          {renderContent()}
        </main>
      </div>
    </>
  );
}