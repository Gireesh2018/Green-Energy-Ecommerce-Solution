import { z } from "zod";
import { CategoryType } from "../../helpers/schema";

// Define the category enum based on the database schema
const categorySchema = z.enum([
  "Battery Tray",
  "Four-Wheeler Batteries", 
  "Inverter Trolley",
  "Inverters",
  "Others",
  "Solar PCU",
  "Two-Wheeler Batteries",
  "UPS Battery"
]);

export const schema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().optional(),
  category: categorySchema,
  brand: z.string().min(1, "Brand is required").max(100, "Brand name too long"),
  imageUrl: z.string().url("Invalid image URL").optional(),
  dpPrice: z.number().positive("DP price must be positive"),
  mrpPrice: z.number().positive("MRP price must be positive"),
  stock: z.number().int().min(0, "Stock cannot be negative").default(0),
  specifications: z.record(z.any()).optional(),
  tags: z.array(z.string()).default([]),
}).refine(data => data.dpPrice <= data.mrpPrice, {
  message: "DP price cannot be higher than MRP price",
  path: ["dpPrice"]
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  id: number;
  title: string;
  description: string | null;
  category: CategoryType;
  brand: string;
  imageUrl: string | null;
  dpPrice: number;
  mrpPrice: number;
  stock: number;
  specifications: Record<string, any> | null;
  tags: string[] | null;
  isActive: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export const postProductsCreate = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/products/create`, {
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