export interface User {
  id: number;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  // adjust this as necessary
  role: "admin" | "user";
}
