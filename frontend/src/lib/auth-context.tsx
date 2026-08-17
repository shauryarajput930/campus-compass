import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthUser } from "./api";

interface AuthCtx {
  user: AuthUser | null;
  setSession: (u: AuthUser | null, token: string | null) => void;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("cc_user");
    if (raw) try { setUser(JSON.parse(raw)); } catch { /* noop */ }
  }, []);

  const setSession = (u: AuthUser | null, token: string | null) => {
    setUser(u);
    if (u && token) {
      localStorage.setItem("cc_user", JSON.stringify(u));
      localStorage.setItem("cc_token", token);
    } else {
      localStorage.removeItem("cc_user");
      localStorage.removeItem("cc_token");
    }
  };

  const logout = () => setSession(null, null);

  return <Ctx.Provider value={{ user, setSession, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
