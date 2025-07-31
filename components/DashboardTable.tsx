import React from "react";
import { Badge } from "./Badge";
import styles from "./DashboardTable.module.css";

interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, item: T) => React.ReactNode;
  className?: string;
}

interface DashboardTableProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
  className?: string;
  emptyMessage?: string;
}

export function DashboardTable<T extends Record<string, any>>({
  title,
  data,
  columns,
  className,
  emptyMessage = "No data available",
}: DashboardTableProps<T>) {
  console.log("DashboardTable: Rendering table for", title, "with", data.length, "items");

  return (
    <div className={`${styles.container} ${className || ""}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <span className={styles.count}>{data.length} items</span>
      </div>

      {data.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>{emptyMessage}</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={`${styles.th} ${column.className || ""}`}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {data.map((item, index) => (
                <tr key={index} className={styles.tr}>
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={`${styles.td} ${column.className || ""}`}
                    >
                      {column.render
                        ? column.render(item[column.key], item)
                        : item[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Helper function to render order status badges
export const renderOrderStatus = (status: string) => {
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "default";
      case "shipped":
        return "secondary";
      case "processing":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
};

// Helper function to render payment status
export const renderPaymentStatus = (status: string | null) => {
  if (!status) return <span className={styles.noData}>-</span>;
  
  const getPaymentVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "default";
      case "pending":
        return "outline";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  return <Badge variant={getPaymentVariant(status)}>{status}</Badge>;
};

// Helper function to format currency
export const formatCurrency = (amount: number) => {
  return `₹${amount.toLocaleString()}`;
};

// Helper function to format date
export const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};