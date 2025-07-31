import { z } from "zod";

export const schema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  brand: z.string().min(1).max(100).optional(),
  category: z.enum([
    "Two-Wheeler Batteries",
    "Four-Wheeler Batteries", 
    "Inverters",
    "Solar PCU",
    "UPS Battery",
    "Inverter Trolley",
    "Battery Tray",
    "Others"
  ]).optional(),
  dp_price: z.number().positive().optional(),
  mrp_price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
  image_url: z.string().url().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  specifications: z.record(z.any()).optional().nullable()
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  id: number;
  title: string;
  description: string | null;
  brand: string;
  category: string;
  dp_price: number;
  mrp_price: number;
  stock: number | null;
  is_active: boolean | null;
  image_url: string | null;
  tags: string[] | null;
  specifications: Record<string, any> | null;
  created_at: string | null;
  updated_at: string | null;
};

export const postProductsUpdate = async (body: z.infer<typeof schema>, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/products/update`, {
    method: "POST",
    body: JSON.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  
  if (!result.ok) {
    const errorData = await result.json();
    throw new Error(errorData.error || `HTTP ${result.status}`);
  }
  
  return result.json();
};