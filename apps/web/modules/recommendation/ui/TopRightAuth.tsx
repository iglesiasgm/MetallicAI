"use client";

import Link from "next/link";
import { useAuth } from "@/auth/AuthContext";

export function TopRightAuth() {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        className="rounded-xl px-3 py-2 text-sm bg-white/10 hover:bg-white/15"
      >
        Login
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm opacity-90">
        Bienvenido, <span className="font-semibold">{user?.username}</span>
        {isAdmin ? (
          <span className="ml-2 text-xs opacity-70">(admin)</span>
        ) : null}
      </div>
      <button
        onClick={logout}
        className="rounded-xl px-3 py-2 text-sm bg-white/10 hover:bg-white/15"
      >
        Logout
      </button>
    </div>
  );
}
