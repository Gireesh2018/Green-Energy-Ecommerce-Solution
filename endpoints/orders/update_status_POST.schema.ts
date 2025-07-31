import { z } from "zod";

export const schema = z.object({
  orderId: z.number().int().positive("Order ID must be a positive integer"),
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"], {
    errorMap: () => ({ message: "Status must be one of: pending, processing, shipped, delivered, cancelled" })
  })
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  success: true;
  order: {
    id: number;
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    totalAmount: string;
    createdAt: Date | null;
    updatedAt: Date | null;
    userId: number | null;
    paymentStatus: string | null;
    paymentMethod: string | null;
    shippingAddress: any;
    billingAddress: any;
    notes: string | null;
  };
} | {
  error: string;
  details?: string;
};

export const postUpdateStatus = async (body: z.infer<typeof schema>, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/orders/update_status`, {
    method: "POST",
    body: JSON.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  return result.json();
};