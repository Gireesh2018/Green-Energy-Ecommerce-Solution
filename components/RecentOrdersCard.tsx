import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { Skeleton } from "./Skeleton";
import { getUsersOrders } from "../endpoints/users/orders_GET.schema";
import { formatCurrency } from "../helpers/formatCurrency";
import { formatDate } from "../helpers/formatDate";
import styles from "./RecentOrdersCard.module.css";

interface RecentOrdersCardProps {
  className?: string;
}

export const RecentOrdersCard: React.FC<RecentOrdersCardProps> = ({ className }) => {
  console.log("RecentOrdersCard: Rendering recent orders");

  const { data, isLoading, error } = useQuery({
    queryKey: ["users", "orders", "recent"],
    queryFn: () => getUsersOrders({ page: "1", limit: "5" }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle size={16} className={styles.statusIconSuccess} />;
      case "cancelled":
        return <XCircle size={16} className={styles.statusIconError} />;
      case "processing":
      case "shipped":
        return <Clock size={16} className={styles.statusIconWarning} />;
      default:
        return <Package size={16} className={styles.statusIconDefault} />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "delivered":
        return "default" as const;
      case "cancelled":
        return "destructive" as const;
      case "processing":
      case "shipped":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  if (error) {
    console.error("RecentOrdersCard: Error loading orders", error);
    return (
      <div className={`${styles.card} ${className || ""}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>Recent Orders</h2>
        </div>
        <div className={styles.error}>
          <p>Failed to load recent orders</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${className || ""}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>Recent Orders</h2>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/orders">View All</Link>
        </Button>
      </div>

      <div className={styles.content}>
        {isLoading ? (
          <div className={styles.loadingState}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className={styles.orderItemSkeleton}>
                <Skeleton style={{ width: "100%", height: "1rem" }} />
                <Skeleton style={{ width: "60%", height: "0.875rem" }} />
                <Skeleton style={{ width: "40%", height: "0.875rem" }} />
              </div>
            ))}
          </div>
        ) : data?.orders.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={48} className={styles.emptyIcon} />
            <p>No orders yet</p>
            <Button size="sm" asChild>
              <Link to="/products">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className={styles.ordersList}>
            {data?.orders.map((order) => (
              <div key={order.id} className={styles.orderItem}>
                <div className={styles.orderHeader}>
                  <div className={styles.orderInfo}>
                    <span className={styles.orderId}>Order #{order.id}</span>
                    <span className={styles.orderDate}>
                      {order.createdAt ? formatDate(order.createdAt) : ""}
                    </span>
                  </div>
                  <div className={styles.orderStatus}>
                    {getStatusIcon(order.status)}
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                
                <div className={styles.orderDetails}>
                  <div className={styles.orderItems}>
                    {order.items.slice(0, 2).map((item, index) => (
                      <span key={item.id} className={styles.itemName}>
                        {item.productTitle}
                        {index < Math.min(order.items.length, 2) - 1 && ", "}
                      </span>
                    ))}
                    {order.items.length > 2 && (
                      <span className={styles.moreItems}>
                        +{order.items.length - 2} more
                      </span>
                    )}
                  </div>
                  <div className={styles.orderAmount}>
                    {formatCurrency(order.totalAmount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};