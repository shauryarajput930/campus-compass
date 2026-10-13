import axios from "axios";
import { normalizeDepartmentName, type Building } from "./mock-data";

/**
 * Axios API client for Campus Compass.
 *
 * Configured via VITE_API_URL in .env (e.g. http://localhost:5000).
 * All data is fetched directly from the MongoDB backend. Mock data is disabled.
 */
const rawBaseUrl = import.meta.env.VITE_API_URL as string | undefined;
export const explicitMock = false;

export const BASE_URL: string = rawBaseUrl
  ? rawBaseUrl.trim().replace(/\/+$/, "")
  : (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ? "http://localhost:5000"
      : "");

export function isMockMode(): boolean {
  return false;
}

export const HOME_BACKGROUND_KEY = "cc_home_background";
export const BUILDINGS_CHANGED_EVENT = "cc-buildings-changed";
const BUILDINGS_CHANGED_KEY = "cc_buildings_changed";

export const DEFAULT_HOME_BACKGROUND = "https://psitche.ac.in/assets/slider/building.jpg";

function getBrowserStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function normalizeHomeBackground(value: string): string {
  const cleaned = value.trim().replace(/^['"]|['"]$/g, "").trim();
  if (!cleaned) return DEFAULT_HOME_BACKGROUND;

  try {
    if (cleaned.startsWith("data:image/")) return cleaned;
    if (cleaned.startsWith("/")) {
      if (typeof window !== "undefined") {
        new URL(cleaned, window.location.origin);
        return cleaned;
      }
      return DEFAULT_HOME_BACKGROUND;
    }
    new URL(cleaned);
    return cleaned;
  } catch {
    return DEFAULT_HOME_BACKGROUND;
  }
}

export function getHomeBackground(): string {
  const storage = getBrowserStorage();
  if (!storage) return DEFAULT_HOME_BACKGROUND;

  try {
    const saved = storage.getItem(HOME_BACKGROUND_KEY)?.trim();
    return normalizeHomeBackground(saved ?? "");
  } catch {
    return DEFAULT_HOME_BACKGROUND;
  }
}

export async function compressHomeBackgroundImage(
  value: string,
  maxWidth = 1280,
  maxHeight = 720,
  quality = 0.68
): Promise<string> {
  const cleaned = normalizeHomeBackground(value);
  if (!cleaned.startsWith("data:image/")) return cleaned;
  if (typeof window === "undefined") return cleaned;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width, maxHeight / img.height);
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(cleaned);
        return;
      }

      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const output = canvas.toDataURL("image/jpeg", quality);
      resolve(output);
    };

    img.onerror = () => resolve(cleaned);
    img.src = cleaned;
  });
}

export function persistHomeBackground(url: string): string {
  const next = normalizeHomeBackground(url);
  const storage = getBrowserStorage();
  if (!storage) return next;

  try {
    if (next === DEFAULT_HOME_BACKGROUND) {
      storage.removeItem(HOME_BACKGROUND_KEY);
    } else {
      storage.setItem(HOME_BACKGROUND_KEY, next);
    }
  } catch (error) {
    console.warn("Unable to persist home background to storage:", error);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cc-home-background-changed"));
    window.dispatchEvent(new Event("storage"));
  }
  return next;
}

declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: (options?: { skipCache?: boolean }) => Promise<string | null>;
      };
    };
  }
}

type TokenGetter = (options?: { skipCache?: boolean }) => Promise<string | null>;
let clerkTokenGetter: TokenGetter | null = null;

export function setClerkTokenGetter(fn: TokenGetter | null) {
  clerkTokenGetter = fn;
}

export const api = axios.create({
  baseURL: BASE_URL || (explicitMock ? "/mock" : ""),
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  if (!explicitMock && !BASE_URL) {
    throw new Error("API base URL is not configured. Please define VITE_API_URL in your environment.");
  }

  let token: string | null = null;

  if (typeof window !== "undefined") {
    // 1. Primary: Use active Clerk token if configured
    if (clerkTokenGetter) {
      try {
        token = await clerkTokenGetter();
      } catch (err) {
        console.warn("[api] clerkTokenGetter error:", err);
      }
    }

    // 2. Secondary: Fallback to window.Clerk
    if (!token && window.Clerk?.session) {
      try {
        token = await window.Clerk.session.getToken();
      } catch (err) {
        console.warn("[api] window.Clerk getToken error:", err);
      }
    }

    // 3. Native JWT auth token from localStorage
    if (!token) {
      token = localStorage.getItem("cc_token");
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

// ---------- Buildings ----------
export async function getBuildings(): Promise<Building[]> {
  const { data } = await api.get<Building[]>("/api/buildings");
  return data.map((building) => ({
    ...building,
    department: normalizeDepartmentName(building.department),
    programs: building.programs?.length ? building.programs : [normalizeDepartmentName(building.department)],
  }));
}

export async function getBuilding(id: string): Promise<Building | undefined> {
  const { data } = await api.get<Building>(`/api/buildings/${encodeURIComponent(id)}`);
  return data;
}

export async function createBuilding(b: Building): Promise<Building> {
  const buildingWithId: Building = {
    ...b,
    id: b.id && b.id.trim() ? b.id.trim() : "b_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
  };
  const { data } = await api.post<Building>("/api/buildings", buildingWithId);
  notifyBuildingsChanged();
  return data;
}

export async function updateBuilding(id: string, patch: Partial<Building>): Promise<Building> {
  const { data } = await api.put<Building>(`/api/buildings/${encodeURIComponent(id)}`, patch);
  notifyBuildingsChanged();
  return data;
}

export async function deleteBuilding(id: string): Promise<void> {
  await api.delete(`/api/buildings/${encodeURIComponent(id)}`);
  notifyBuildingsChanged();
}

function notifyBuildingsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(BUILDINGS_CHANGED_EVENT));
  try {
    localStorage.setItem(BUILDINGS_CHANGED_KEY, String(Date.now()));
  } catch {
    /* storage is optional */
  }
}

// ---------- Search ----------
export async function searchAll(q: string): Promise<Building[]> {
  const s = q.toLowerCase().trim();
  if (!s) return [];

  try {
    const { data } = await api.get<Building[]>(`/api/search?q=${encodeURIComponent(s)}`);
    return data.map((building) => ({
      ...building,
      department: normalizeDepartmentName(building.department),
      programs: building.programs?.length ? building.programs : [normalizeDepartmentName(building.department)],
    }));
  } catch {
    const list = await getBuildings();
    return list.filter((b) =>
      [b.name, b.code, b.department, b.description, ...b.facilities, ...b.rooms.map((r) => `${r.number} ${r.type}`)]
        .join(" ")
        .toLowerCase()
        .includes(s)
    );
  }
}

// ---------- Auth ----------
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  active?: boolean;
}

export async function login(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
  const { data } = await api.post<{ user: AuthUser; token: string }>("/api/auth/login", { email, password });
  return data;
}

export async function register(name: string, email: string, password: string): Promise<{ user: AuthUser; token: string }> {
  const { data } = await api.post<{ user: AuthUser; token: string }>("/api/auth/register", { name, email, password });
  return data;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>("/api/auth/me");
  return data;
}

export async function loginWithGoogle(credential: string): Promise<{ user: AuthUser; token: string }> {
  const { data } = await api.post<{ user: AuthUser; token: string }>("/api/auth/google", { credential });
  return data;
}

export async function requestPasswordReset(email: string): Promise<{ ok: true }> {
  await api.post("/api/auth/forgot-password", { email });
  return { ok: true };
}

export async function resetPassword(token: string, password: string): Promise<{ ok: true }> {
  await api.post("/api/auth/reset-password", { token, password });
  return { ok: true };
}

