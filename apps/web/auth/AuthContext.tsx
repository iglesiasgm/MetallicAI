"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Role = "ADMIN" | "USER";

export type AuthUser = {
  id: string;
  username: string;
  role: Role;
};

type LoginApiResponse = {
  accessToken: string;
  user: AuthUser;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  authFetch: (path: string, init?: RequestInit) => Promise<Response>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

const LS_TOKEN = "metallicai_token";
const LS_USER = "metallicai_user";

function getApiUrl() {
  const url =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL;
  // Si querés ser estricto, tirá error si no existe. Para MVP, fallback:
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(
    /\/$/,
    ""
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  // Hidratar desde localStorage (solo client)
  useEffect(() => {
    const t = localStorage.getItem(LS_TOKEN);
    const u = localStorage.getItem(LS_USER);

    if (t) setToken(t);
    if (u) {
      try {
        setUser(JSON.parse(u));
      } catch {
        localStorage.removeItem(LS_USER);
      }
    }
  }, []);

  const isAuthenticated = !!token;
  const isAdmin = user?.role === "ADMIN";

  const login = async (username: string, password: string) => {
    const res = await fetch(`${getApiUrl()}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = (await res
      .json()
      .catch(() => ({}))) as Partial<LoginApiResponse> & any;

    if (!res.ok) {
      throw new Error(data?.error || data?.message || "Login failed");
    }

    const accessToken = data.accessToken as string;
    const u = data.user as AuthUser;

    setToken(accessToken);
    setUser(u);

    localStorage.setItem(LS_TOKEN, accessToken);
    localStorage.setItem(LS_USER, JSON.stringify(u));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_USER);
  };

  const authFetch = async (path: string, init: RequestInit = {}) => {
    const headers = new Headers(init.headers || {});

    // No fuerces Content-Type si mandás FormData
    const isFormData =
      typeof FormData !== "undefined" && init.body instanceof FormData;
    if (!isFormData && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (token) headers.set("Authorization", `Bearer ${token}`);

    const url = `${getApiUrl()}${path.startsWith("/") ? path : `/${path}`}`;
    return fetch(url, { ...init, headers });
  };

  const value = useMemo(
    () => ({ token, user, isAuthenticated, isAdmin, login, logout, authFetch }),
    [token, user, isAuthenticated, isAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
