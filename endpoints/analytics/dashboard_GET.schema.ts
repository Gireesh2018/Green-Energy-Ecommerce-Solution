import { z } from "zod";

// No input validation needed for GET request
export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  summary: {
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
  };
  ordersByStatus: Array<{
    status: string;
    count: number;
  }>;
  topSellingProducts: Array<{
    id: number;
    title: string;
    brand: string;
    category: string;
    price: number;
    quantitySold: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: number;
    totalAmount: number;
    status: string;
    paymentStatus: string | null;
    createdAt: string | undefined;
    customerName: string | null;
    customerEmail: string | null;
  }>;
  revenueTrends: Array<{
    date: string;
    revenue: number;
    orderCount: number;
  }>;
};

export const getAnalyticsDashboard = async (init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/analytics/dashboard`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  
  if (!result.ok) {
    throw new Error(`Failed to fetch dashboard analytics: ${result.statusText}`);
  }
  
  return result.json();
};