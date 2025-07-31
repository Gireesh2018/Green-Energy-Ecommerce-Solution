import { z } from "zod";

export const schema = z.object({
  page: z.string().optional().default("1").transform(val => parseInt(val, 10)).refine(val => val > 0, "Page must be greater than 0"),
  limit: z.string().optional().default("10").transform(val => parseInt(val, 10)).refine(val => val > 0 && val <= 100, "Limit must be between 1 and 100"),
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).optional()
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  orders: Array<{
    id: number;
    status: string;
    totalAmount: number;
    paymentMethod: string | null;
    paymentStatus: string | null;
    shippingAddress: any;
    billingAddress: any;
    notes: string | null;
    createdAt: string | undefined;
    updatedAt: string | undefined;
    items: Array<{
      id: number;
      productId: number | null;
      productTitle: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      imageUrl: string | null;
      brand: string | null;
      category: string | null;
    }>;
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export const getUsersOrders = async (queryParams: Record<string, string> = {}, init?: RequestInit): Promise<OutputType> => {
  const searchParams = new URLSearchParams(queryParams);
  const result = await fetch(`/_api/users/orders?${searchParams.toString()}`, {
    method: "GET",
    ...init,
    headers: {
      ...(init?.headers ?? {}),
    },
  });
  return result.json();
};