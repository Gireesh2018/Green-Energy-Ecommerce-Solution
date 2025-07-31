import { z } from "zod";

export const schema = z.object({
  // Filtering
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  tags: z.array(z.string()).or(z.string().transform(s => s.split(',').map(t => t.trim()))).optional(),
  search: z.string().optional(),
  
  // Sorting
  sortBy: z.enum(["price", "name", "created_at"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  
  // Pagination
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional()
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  products: Array<{
    id: number;
    title: string;
    description: string | null;
    brand: string;
    category: string;
    dpPrice: number;
    mrpPrice: number;
    imageUrl: string | null;
    stock: number;
    stockStatus: "in_stock" | "out_of_stock";
    isActive: boolean;
    tags: string[];
    specifications: any;
    createdAt: string | undefined;
    updatedAt: string | undefined;
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

export const getProductsList = async (params?: z.infer<typeof schema>, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(params || {});
  
  // Build query string from validated input
  const searchParams = new URLSearchParams();
  
  if (validatedInput.category) searchParams.set("category", validatedInput.category);
  if (validatedInput.brand) searchParams.set("brand", validatedInput.brand);
  if (validatedInput.minPrice !== undefined) searchParams.set("minPrice", validatedInput.minPrice.toString());
  if (validatedInput.maxPrice !== undefined) searchParams.set("maxPrice", validatedInput.maxPrice.toString());
  if (validatedInput.tags) {
    if (Array.isArray(validatedInput.tags)) {
      validatedInput.tags.forEach(tag => searchParams.append("tags", tag));
    }
  }
  if (validatedInput.search) searchParams.set("search", validatedInput.search);
  if (validatedInput.sortBy) searchParams.set("sortBy", validatedInput.sortBy);
  if (validatedInput.sortOrder) searchParams.set("sortOrder", validatedInput.sortOrder);
  if (validatedInput.page) searchParams.set("page", validatedInput.page.toString());
  if (validatedInput.limit) searchParams.set("limit", validatedInput.limit.toString());
  
  const queryString = searchParams.toString();
  const url = `/_api/products/list${queryString ? `?${queryString}` : ""}`;
  
  const result = await fetch(url, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  
  return result.json();
};