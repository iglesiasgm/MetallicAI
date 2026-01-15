export type Role = "ADMIN" | "USER";

export type AuthUser = {
  id?: string;
  username: string;
  role: Role;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};
