import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import styles from "./MetricCard.module.css";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  trend,
  className,
}) => {
  console.log("MetricCard: Rendering metric card for", title);

  const formatValue = (val: string | number) => {
    if (typeof val === "number") {
      if (title.toLowerCase().includes("sales") || title.toLowerCase().includes("revenue")) {
        return `₹${val.toLocaleString()}`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value === 0) return <Minus className={styles.trendIcon} />;
    return trend.isPositive ? (
      <TrendingUp className={styles.trendIcon} />
    ) : (
      <TrendingDown className={styles.trendIcon} />
    );
  };

  const getTrendClass = () => {
    if (!trend) return "";
    if (trend.value === 0) return styles.trendNeutral;
    return trend.isPositive ? styles.trendPositive : styles.trendNegative;
  };

  return (
    <div className={`${styles.card} ${className || ""}`}>
      <div className={styles.header}>
        <div className={styles.iconContainer}>{icon}</div>
        <h3 className={styles.title}>{title}</h3>
      </div>
      
      <div className={styles.content}>
        <div className={styles.value}>{formatValue(value)}</div>
        {trend && (
          <div className={`${styles.trend} ${getTrendClass()}`}>
            {getTrendIcon()}
            <span className={styles.trendValue}>
              {Math.abs(trend.value)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};