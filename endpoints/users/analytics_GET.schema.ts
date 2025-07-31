import { z } from "zod";

export const schema = z.object({
  period: z.enum(["7d", "30d", "90d", "1y"]).optional().default("30d")
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  totalOrders: number;
  totalAmountSpent: number;
  ordersInPeriod: number;
  amountInPeriod: number;
  averageOrderValue: number;
  orderStatusBreakdown: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  orderStatusBreakdownPeriod: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  recentActivity: Array<{
    productTitle: string;
    quantity: number;
    totalPrice: number;
    orderDate: string;
    status: string;
  }>;
  favoriteCategories: Array<{
    category: string;
    orderCount: number;
    totalSpent: number;
  }>;
  lastOrderDate: string | null;
  period: string;
};

export const getUsersAnalytics = async (params?: z.infer<typeof schema>, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(params || {});
  const searchParams = new URLSearchParams();
  
  if (validatedInput.period) {
    searchParams.set("period", validatedInput.period);
  }
  
  const queryString = searchParams.toString();
  const url = `/_api/users/analytics${queryString ? `?${queryString}` : ""}`;
  
  const result = await fetch(url, {
    method: "GET",
    ...init,
    headers: {
      ...(init?.headers ?? {}),
    },
  });
  
  if (!result.ok) {
    throw new Error(`HTTP error! status: ${result.status}`);
  }
  
  return result.json();
};