import { z } from "zod";

export const schema = z.object({
  displayName: z.string().min(1, "Display name cannot be empty").max(100, "Display name too long").optional(),
  email: z.string().email("Invalid email format").optional(),
  avatarUrl: z.string().url("Invalid avatar URL").nullable().optional(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  user: {
    id: number;
    email: string;
    displayName: string;
    avatarUrl: string | null;
    role: "admin" | "user";
  };
};

export const postUsersProfileUpdate = async (body: z.infer<typeof schema>, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/users/profile/update`, {
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