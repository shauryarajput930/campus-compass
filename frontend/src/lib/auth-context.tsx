import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, setClerkTokenGetter, type AuthUser } from "./api";
import { fetchFavorites, clearFavorites } from "./favorites";

export function checkIsAdmin(roleMeta: unknown, email: string | undefined): boolean {
  if (roleMeta === "admin") return true;
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  const configuredAdmin = "admin@psit.ac.in";
  return normalized === configuredAdmin;
}

interface AuthCtx {
  user: AuthUser | null;
  isLoaded: boolean;
  setSession: (u: AuthUser | null, token: string | null) => void;
  logout: () => void;
  refreshUser: () => Promise<AuthUser | null>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = localStorage.getItem("cc_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoaded, setIsLoaded] = useState(false);

  const refreshUser = async (): Promise<AuthUser | null> => {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("cc_token");
    if (!token) {
      setUser(null);
      setIsLoaded(true);
      return null;
    }

    try {
      const { data } = await api.get<AuthUser>("/api/auth/me");
      setUser(data);
      localStorage.setItem("cc_user", JSON.stringify(data));
      void fetchFavorites();
      return data;
    } catch (err) {
      console.warn("[auth] /api/auth/me verification failed:", err);
      setUser(null);
      localStorage.removeItem("cc_user");
      localStorage.removeItem("cc_token");
      clearFavorites();
      return null;
    } finally {
      setIsLoaded(true);
    }
  };

  // Verify and hydrate user session against MongoDB on initial mount / refresh
  useEffect(() => {
    refreshUser();
  }, []);

  const setSession = (u: AuthUser | null, token: string | null) => {
    setUser(u);
    if (u && token) {
      localStorage.setItem("cc_user", JSON.stringify(u));
      localStorage.setItem("cc_token", token);
      void fetchFavorites();
    } else {
      localStorage.removeItem("cc_user");
      localStorage.removeItem("cc_token");
      clearFavorites();
    }
  };

  const logout = () => {
    setSession(null, null);
    if (typeof window !== "undefined" && window.Clerk) {
      try {
        void (window.Clerk as any).signOut?.();
      } catch {}
    }
  };

  return (
    <Ctx.Provider value={{ user, isLoaded, setSession, logout, refreshUser }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
