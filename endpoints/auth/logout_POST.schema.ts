import { z } from "zod";

// No input required for logout
export const schema = z.object({});

/**
 * Represents the successful response structure for the logout operation.
 */
export interface LogoutSuccessResponse {
  success: true;
  message: string;
}

/**
 * Represents the error response structure for the logout operation.
 */
export interface LogoutErrorResponse {
  success: false; // Explicitly indicate failure
  error: string;
  message?: string;
}

/**
 * Defines the possible output types for the logout API endpoint.
 * It can either be a successful logout response or an error response.
 */
export type OutputType = LogoutSuccessResponse | LogoutErrorResponse;

export const postLogout = async (
  body: z.infer<typeof schema> = {},
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/auth/logout`, {
    method: "POST",
    body: JSON.stringify(body),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  return result.json();
};
