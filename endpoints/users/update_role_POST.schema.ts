import { z } from "zod";

export const schema = z.object({
  userId: z.number().int().positive(),
  newRole: z.enum(["admin", "user"])
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  success: true;
  user: {
    id: number;
    email: string;
    displayName: string;
    role: "admin" | "user";
    updatedAt: Date | null;
  };
  message: string;
} | {
  error: string;
  details?: string;
};

export const postUsersUpdateRole = async (body: z.infer<typeof schema>, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/users/update_role`, {
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