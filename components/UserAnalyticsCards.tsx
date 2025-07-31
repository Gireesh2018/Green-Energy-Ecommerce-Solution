import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Package, DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { Skeleton } from "./Skeleton";
import { getUsersAnalytics } from "../endpoints/users/analytics_GET.schema";
import styles from "./UserAnalyticsCards.module.css";

interface UserAnalyticsCardsProps {
  period?: "7d" | "30d" | "90d" | "1y";
  className?: string;
}

export const UserAnalyticsCards: React.FC<UserAnalyticsCardsProps> = ({ 
  period = "30d", 
  className 
}) => {
  console.log("UserAnalyticsCards: Rendering analytics cards for period", period);

  const { data, isLoading, error } = useQuery({
    queryKey: ["users", "analytics", period],
    queryFn: () => getUsersAnalytics({ period }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (error) {
    console.error("UserAnalyticsCards: Error loading analytics", error);
    return (
      <div className={`${styles.container} ${className || ""}`}>
        <div className={styles.error}>
          <p>Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`${styles.container} ${className || ""}`}>
        <div className={styles.grid}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <Skeleton style={{ width: "100%", height: "120px" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Calculate trends (simplified - comparing period vs total)
  const ordersTrend = data.totalOrders > 0 
    ? ((data.ordersInPeriod / data.totalOrders) * 100) - 50 
    : 0;
  
  const spendingTrend = data.totalAmountSpent > 0 
    ? ((data.amountInPeriod / data.totalAmountSpent) * 100) - 50 
    : 0;

  return (
    <div className={`${styles.container} ${className || ""}`}>
      <div className={styles.grid}>
        <MetricCard
          title="Total Orders"
          value={data.totalOrders}
          icon={<Package size={24} />}
          trend={{
            value: Math.abs(ordersTrend),
            isPositive: ordersTrend >= 0
          }}
        />
        
        <MetricCard
          title="Total Spent"
          value={`₹${data.totalAmountSpent.toLocaleString()}`}
          icon={<DollarSign size={24} />}
          trend={{
            value: Math.abs(spendingTrend),
            isPositive: spendingTrend >= 0
          }}
        />
        
        <MetricCard
          title={`Orders (${period})`}
          value={data.ordersInPeriod}
          icon={<ShoppingBag size={24} />}
        />
        
        <MetricCard
          title="Average Order"
          value={`₹${Math.round(data.averageOrderValue).toLocaleString()}`}
          icon={<TrendingUp size={24} />}
        />
      </div>
    </div>
  );
};