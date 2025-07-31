import { z } from "zod";
import { OrderStatus } from "../../helpers/schema";

export const schema = z.object({
  // Pagination
  page: z.string().optional().default("1").transform(val => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1) {
      throw new Error("Invalid page number");
    }
    return num;
  }),
  limit: z.string().optional().default("20").transform(val => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1 || num > 100) {
      throw new Error("Invalid limit. Must be between 1 and 100");
    }
    return num;
  }),
  
  // Filters
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).optional(),
  user_id: z.string().optional().transform(val => {
    if (!val) return undefined;
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1) {
      throw new Error("Invalid user_id");
    }
    return num;
  }),
  start_date: z.string().optional().refine(val => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, "Invalid start_date format"),
  end_date: z.string().optional().refine(val => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, "Invalid end_date format")
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  orders: Array<{
    id: number;
    status: OrderStatus | null;
    total_amount: number;
    payment_status: string | null;
    payment_method: string | null;
    created_at: string | null;
    updated_at: string | null;
    shipping_address: any;
    billing_address: any;
    notes: string | null;
    customer: {
      id: number;
      email: string;
      display_name: string;
    } | null;
    items: Array<{
      id: number;
      product_id: number | null;
      product_title: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      product_brand: string | null;
      product_category: string | null;
      product_image_url: string | null;
    }>;
  }>;
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    limit: number;
    has_next: boolean;
    has_previous: boolean;
  };
};

export const getOrdersList = async (params?: Partial<z.input<typeof schema>>, init?: RequestInit): Promise<OutputType> => {
  const searchParams = new URLSearchParams();
  
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.status) searchParams.set("status", params.status);
  if (params?.user_id) searchParams.set("user_id", params.user_id.toString());
  if (params?.start_date) searchParams.set("start_date", params.start_date);
  if (params?.end_date) searchParams.set("end_date", params.end_date);
  
  const queryString = searchParams.toString();
  const url = `/_api/orders/list${queryString ? `?${queryString}` : ""}`;
  
  const result = await fetch(url, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  
  if (!result.ok) {
    throw new Error(`HTTP error! status: ${result.status}`);
  }
  
  return result.json();
};