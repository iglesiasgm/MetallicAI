"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/auth/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const redirect = search.get("redirect") || "/";

  const [username, setUsername] = useState("usuario_test");
  const [password, setPassword] = useState("test123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      router.push(redirect);
    } catch (err: any) {
      setError(err.message || "Login error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl bg-white/5 p-6 border border-white/10"
      >
        <h1 className="text-xl font-semibold mb-4">Login</h1>

        <label className="block text-sm mb-1">Username</label>
        <input
          className="w-full mb-3 rounded-xl bg-black/30 border border-white/10 px-3 py-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label className="block text-sm mb-1">Password</label>
        <input
          type="password"
          className="w-full mb-4 rounded-xl bg-black/30 border border-white/10 px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error ? (
          <div className="text-sm text-red-300 mb-3">{error}</div>
        ) : null}

        <button
          disabled={loading}
          className="w-full rounded-xl px-3 py-2 bg-white/10 hover:bg-white/15 disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p className="text-xs opacity-70 mt-3">
          Admins: “La Bestia Pop” / “WindsOfMayhem”
        </p>
      </form>
    </div>
  );
}
