export type UserRole = "ADMIN" | "USER";

export type User = {
  id: string;
  username: string;
  role: UserRole;
  passwordHash: string;
};
