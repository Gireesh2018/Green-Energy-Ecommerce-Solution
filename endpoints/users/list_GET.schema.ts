import { z } from "zod";

export const schema = z.object({
  page: z.string().transform((val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1) return 1;
    return num;
  }),
  limit: z.string().transform((val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1) return 20;
    if (num > 100) return 100; // Max limit to prevent abuse
    return num;
  }),
  search: z.string().default(""),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  users: Array<{
    id: number;
    email: string;
    displayName: string;
    role: "admin" | "user";
    registrationDate: string | null;
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export const getUsersList = async (
  params: { page?: string; limit?: string; search?: string } = {},
  init?: RequestInit
): Promise<OutputType> => {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.set("page", params.page);
  if (params.limit) searchParams.set("limit", params.limit);
  if (params.search) searchParams.set("search", params.search);

  const queryString = searchParams.toString();
  const url = `/_api/users/list${queryString ? `?${queryString}` : ""}`;

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