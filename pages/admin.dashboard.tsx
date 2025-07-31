import React from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  Clock,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { AdminLayout } from "../components/AdminLayout";
import { MetricCard } from "../components/MetricCard";
import { DashboardTable, renderOrderStatus, renderPaymentStatus, formatCurrency, formatDate } from "../components/DashboardTable";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "../components/Chart";
import { getAnalyticsDashboard } from "../endpoints/analytics/dashboard_GET.schema";
import styles from "./admin.dashboard.module.css";

export default function AdminDashboard() {
  console.log("AdminDashboard: Rendering admin dashboard page");

  const {
    data: dashboardData,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: () => getAnalyticsDashboard(),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  console.log("AdminDashboard: Dashboard data loading state:", isFetching);
  console.log("AdminDashboard: Dashboard data:", dashboardData);

  if (error) {
    console.error("AdminDashboard: Error loading dashboard data:", error);
    return (
      <AdminLayout>
        <Helmet>
          <title>Dashboard - Green Energy Solutions Admin</title>
          <meta name="description" content="Admin dashboard for Green Energy Solutions" />
        </Helmet>
        <div className={styles.errorContainer}>
          <h1>Error Loading Dashboard</h1>
          <p>Failed to load dashboard data. Please try again later.</p>
        </div>
      </AdminLayout>
    );
  }

  // Prepare chart data
  const orderStatusChartData = dashboardData?.ordersByStatus.map(item => ({
    status: item.status,
    count: item.count,
  })) || [];

  const revenueChartData = dashboardData?.revenueTrends.map(trend => ({
    date: new Date(trend.date).toLocaleDateString("en-IN", { 
      month: "short", 
      day: "numeric" 
    }),
    revenue: trend.revenue,
    orders: trend.orderCount,
  })) || [];

  // Chart configurations
  const orderStatusConfig = {
    count: {
      label: "Orders",
      color: "var(--primary)",
    },
  };

  const revenueConfig = {
    revenue: {
      label: "Revenue (₹)",
      color: "var(--primary)",
    },
    orders: {
      label: "Orders",
      color: "var(--secondary)",
    },
  };

  // Table columns for recent orders
  const recentOrdersColumns = [
    {
      key: "id" as const,
      header: "Order ID",
      render: (value: number) => `#${value}`,
      className: styles.orderIdColumn,
    },
    {
      key: "customerName" as const,
      header: "Customer",
      render: (value: string | null, item: any) => (
        <div className={styles.customerInfo}>
          <div className={styles.customerName}>{value || "Guest"}</div>
          <div className={styles.customerEmail}>{item.customerEmail}</div>
        </div>
      ),
    },
    {
      key: "totalAmount" as const,
      header: "Amount",
      render: (value: number) => formatCurrency(value),
      className: styles.amountColumn,
    },
    {
      key: "status" as const,
      header: "Status",
      render: (value: string) => renderOrderStatus(value),
    },
    {
      key: "paymentStatus" as const,
      header: "Payment",
      render: (value: string | null) => renderPaymentStatus(value),
    },
    {
      key: "createdAt" as const,
      header: "Date",
      render: (value: string) => formatDate(value),
      className: styles.dateColumn,
    },
  ];

  // Table columns for top products
  const topProductsColumns = [
    {
      key: "title" as const,
      header: "Product",
      render: (value: string, item: any) => (
        <div className={styles.productInfo}>
          <div className={styles.productTitle}>{value}</div>
          <div className={styles.productBrand}>{item.brand} • {item.category}</div>
        </div>
      ),
    },
    {
      key: "price" as const,
      header: "Price",
      render: (value: number) => formatCurrency(value),
      className: styles.priceColumn,
    },
    {
      key: "quantitySold" as const,
      header: "Sold",
      render: (value: number) => `${value} units`,
      className: styles.quantityColumn,
    },
    {
      key: "revenue" as const,
      header: "Revenue",
      render: (value: number) => formatCurrency(value),
      className: styles.revenueColumn,
    },
  ];

  return (
    <AdminLayout>
      <Helmet>
        <title>Dashboard - Green Energy Solutions Admin</title>
        <meta name="description" content="Admin dashboard for Green Energy Solutions with sales metrics, order analytics, and business insights" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className={styles.dashboard}>
        <div className={styles.header}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>
            Welcome to your Green Energy Solutions admin dashboard
          </p>
        </div>

        {/* Loading skeleton */}
        {isFetching && !dashboardData && (
          <div className={styles.loadingContainer}>
            <div className={styles.skeletonGrid}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className={styles.skeletonCard} />
              ))}
            </div>
          </div>
        )}

        {/* Dashboard content */}
        {dashboardData && (
          <>
            {/* Metrics Cards */}
            <div className={styles.metricsGrid}>
              <MetricCard
                title="Total Sales"
                value={dashboardData.summary.totalSales}
                icon={<DollarSign />}
              />
              <MetricCard
                title="Total Orders"
                value={dashboardData.summary.totalOrders}
                icon={<ShoppingCart />}
              />
              <MetricCard
                title="Products"
                value={dashboardData.summary.totalProducts}
                icon={<Package />}
              />
              <MetricCard
                title="Customers"
                value={dashboardData.summary.totalCustomers}
                icon={<Users />}
              />
            </div>

            {/* Charts Section */}
            <div className={styles.chartsGrid}>
              {/* Revenue Trends Chart */}
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <h3 className={styles.chartTitle}>Revenue Trends (Last 30 Days)</h3>
                  <TrendingUp className={styles.chartIcon} />
                </div>
                <div className={styles.chartContainer}>
                  <ChartContainer config={revenueConfig}>
                    <LineChart data={revenueChartData}>
                      <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--color-revenue)"
                        strokeWidth={2}
                        dot={{ fill: "var(--color-revenue)" }}
                      />
                    </LineChart>
                  </ChartContainer>
                </div>
              </div>

              {/* Order Status Chart */}
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <h3 className={styles.chartTitle}>Orders by Status</h3>
                  <ShoppingCart className={styles.chartIcon} />
                </div>
                <div className={styles.chartContainer}>
                  <ChartContainer config={orderStatusConfig}>
                    <BarChart data={orderStatusChartData}>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Bar dataKey="count" fill="var(--color-count)" />
                    </BarChart>
                  </ChartContainer>
                </div>
              </div>
            </div>

            {/* Tables Section */}
            <div className={styles.tablesGrid}>
              {/* Recent Orders */}
              <DashboardTable
                title="Recent Orders"
                data={dashboardData.recentOrders}
                columns={recentOrdersColumns}
                emptyMessage="No recent orders found"
                className={styles.tableCard}
              />

              {/* Top Selling Products */}
              <DashboardTable
                title="Top Selling Products"
                data={dashboardData.topSellingProducts}
                columns={topProductsColumns}
                emptyMessage="No sales data available"
                className={styles.tableCard}
              />
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}