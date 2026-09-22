import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";
import { setClerkTokenGetter, type AuthUser } from "./api";

export function checkIsAdmin(roleMeta: unknown, email: string | undefined): boolean {
  if (roleMeta === "admin") return true;
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return (
    normalized.startsWith("admin") ||
    normalized.includes("admin") ||
    normalized.endsWith("@admin.psit.ac.in")
  );
}

interface AuthCtx {
  user: AuthUser | null;
  isLoaded: boolean;
  setSession: (u: AuthUser | null, token: string | null) => void;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { getToken, signOut } = useClerkAuth();
  const { user: clerkUser, isLoaded } = useUser();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setClerkTokenGetter(getToken);
    return () => setClerkTokenGetter(null);
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!clerkUser) {
      setUser(null);
      localStorage.removeItem("cc_user");
      localStorage.removeItem("cc_token");
      return;
    }

    const email = clerkUser.primaryEmailAddress?.emailAddress || "";
    const isAdmin = checkIsAdmin(clerkUser.publicMetadata?.role, email);

    const nextUser: AuthUser = {
      id: clerkUser.id,
      name: clerkUser.fullName || email || "Campus user",
      email,
      role: isAdmin ? "admin" : "user",
    };
    setUser(nextUser);
    localStorage.setItem("cc_user", JSON.stringify(nextUser));
    getToken().then((token) => {
      if (token) localStorage.setItem("cc_token", token);
    });
  }, [clerkUser, getToken, isLoaded]);

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

  const logout = () => {
    setSession(null, null);
    void signOut();
  };

  return <Ctx.Provider value={{ user, isLoaded, setSession, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

