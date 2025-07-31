import { z } from "zod";

export const schema = z.object({
  page: z.string().optional().default("1").transform(val => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1) {
      throw new Error("Page must be a positive integer");
    }
    return num;
  }),
  limit: z.string().optional().default("20").transform(val => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1 || num > 100) {
      throw new Error("Limit must be between 1 and 100");
    }
    return num;
  })
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
    isActive: boolean;
    tags: string[] | null;
    specifications: any;
    addedToWishlistAt: Date | null;
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export const getUsersWishlist = async (queryParams: Record<string, string> = {}, init?: RequestInit): Promise<OutputType> => {
  const searchParams = new URLSearchParams();
  
  // Add query parameters to URL
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value);
    }
  });

  const queryString = searchParams.toString();
  const url = queryString ? `/_api/users/wishlist?${queryString}` : `/_api/users/wishlist`;

  const result = await fetch(url, {
    method: "GET",
    ...init,
    headers: {
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    throw new Error(`Failed to fetch wishlist: ${result.statusText}`);
  }

  return result.json();
};