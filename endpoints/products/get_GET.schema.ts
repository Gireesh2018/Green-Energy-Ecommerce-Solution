import { z } from "zod";
import { CategoryType } from "../../helpers/schema";

export const schema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().positive())
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  id: number;
  title: string;
  description: string | null;
  brand: string;
  category: CategoryType;
  dpPrice: number;
  mrpPrice: number;
  imageUrl: string | null;
  specifications: any;
  stock: number;
  tags: string[];
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export const getProducts = async (params: { id: string }, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(params);
  const searchParams = new URLSearchParams({ id: validatedInput.id.toString() });
  
  const result = await fetch(`/_api/products/get?${searchParams}`, {
    method: "GET",
    ...init,
    headers: {
      ...(init?.headers ?? {}),
    },
  });
  
  if (!result.ok) {
    throw new Error(`Failed to fetch product: ${result.statusText}`);
  }
  
  return result.json();
};