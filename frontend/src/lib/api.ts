import axios from "axios";
import { buildings as mockBuildings, normalizeDepartmentName, type Building } from "./mock-data";

/**
 * Axios API client.
 *
 * Point it at your Express+MongoDB backend by setting VITE_API_URL
 * in .env (e.g. VITE_API_URL=https://campus-compass-api.onrender.com).
 * When VITE_API_URL is unset, the client falls back to local mock data
 * so the frontend runs without a backend.
 */
const BASE_URL = import.meta.env.VITE_API_URL as string | undefined;
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

const DEFAULT_HOME_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" role="img" aria-label="Campus abstract background">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="38%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#0ea5e9"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" x2="1">
      <stop offset="0%" stop-color="#a78bfa"/>
      <stop offset="100%" stop-color="#67e8f9"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#bg)"/>
  <circle cx="250" cy="180" r="220" fill="rgba(255,255,255,0.10)"/>
  <circle cx="1270" cy="120" r="260" fill="rgba(103,232,249,0.12)"/>
  <path d="M0 720C170 620 350 560 540 600C760 648 900 752 1110 720C1290 694 1460 592 1600 560V900H0Z" fill="rgba(15,23,42,0.38)"/>
  <path d="M0 770C150 680 300 640 450 675C680 720 780 815 1040 790C1240 772 1430 672 1600 620V900H0Z" fill="rgba(255,255,255,0.06)"/>
  <g opacity="0.55" stroke="rgba(255,255,255,0.28)" stroke-width="2" fill="none">
    <path d="M180 260 L480 180 L600 320 L290 420 Z"/>
    <path d="M670 190 L1030 140 L1240 330 L840 410 Z"/>
    <path d="M1160 330 L1430 260 L1540 430 L1280 520 Z"/>
    <path d="M340 500 L640 430 L750 580 L450 660 Z"/>
  </g>
  <g opacity="0.72">
    <path d="M102 610H420" stroke="url(#accent)" stroke-width="11" stroke-linecap="round"/>
    <path d="M480 610H800" stroke="url(#accent)" stroke-width="11" stroke-linecap="round"/>
    <path d="M930 610H1220" stroke="url(#accent)" stroke-width="11" stroke-linecap="round"/>
    <path d="M1265 610H1460" stroke="url(#accent)" stroke-width="11" stroke-linecap="round"/>
  </g>
</svg>`;
export const DEFAULT_HOME_SVG_BACKGROUND = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(DEFAULT_HOME_SVG).replace(/%23/g, "#")}`;

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

      // Draw background white for transparent PNGs before converting to JPEG
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Force image/jpeg format to ensure compact size (~100-250KB) that fits LocalStorage quota
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
    console.warn("Unable to persist home background to LocalStorage quota:", error);
    // If quota still exceeded, store in memory/storage fallback if needed
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cc-home-background-changed"));
    window.dispatchEvent(new Event("storage"));
  }
  return next;
}

export const api = axios.create({
  baseURL: BASE_URL || "/mock",
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("cc_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const useMock = () => !BASE_URL;
const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

// ---------- Buildings ----------
export async function getBuildings(): Promise<Building[]> {
  if (useMock()) { await delay(); return readBuildings(); }
  const { data } = await api.get<Building[]>("/api/buildings");
  return data.map((building) => ({
    ...building,
    department: normalizeDepartmentName(building.department),
    programs: building.programs?.length ? building.programs : [normalizeDepartmentName(building.department)],
  }));
}

export async function getBuilding(id: string): Promise<Building | undefined> {
  if (useMock()) { await delay(); return readBuildings().find((b) => b.id === id); }
  const { data } = await api.get<Building>(`/api/buildings/${id}`);
  return data;
}

export async function createBuilding(b: Building): Promise<Building> {
  const buildingWithId: Building = {
    ...b,
    id: b.id && b.id.trim() ? b.id.trim() : "b_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
  };
  if (useMock()) {
    const list = readBuildings();
    list.push(buildingWithId);
    writeBuildings(list);
    notifyBuildingsChanged();
    return buildingWithId;
  }
  const { data } = await api.post<Building>("/api/buildings", buildingWithId);
  notifyBuildingsChanged();
  return data;
}

export async function updateBuilding(id: string, patch: Partial<Building>): Promise<Building> {
  if (useMock()) {
    const list = readBuildings();
    const idx = list.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error("Not found");
    list[idx] = { ...list[idx], ...patch };
    writeBuildings(list);
    notifyBuildingsChanged();
    return list[idx];
  }
  const { data } = await api.put<Building>(`/api/buildings/${id}`, patch);
  notifyBuildingsChanged();
  return data;
}

export async function deleteBuilding(id: string): Promise<void> {
  if (useMock()) {
    const list = readBuildings().filter((b) => b.id !== id);
    writeBuildings(list);
    notifyBuildingsChanged();
    return;
  }
  await api.delete(`/api/buildings/${id}`);
  notifyBuildingsChanged();
}

function notifyBuildingsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(BUILDINGS_CHANGED_EVENT));
  try { localStorage.setItem(BUILDINGS_CHANGED_KEY, String(Date.now())); } catch { /* storage is optional */ }
}

// ---------- Search ----------
export async function searchAll(q: string): Promise<Building[]> {
  const list = await getBuildings();
  const s = q.toLowerCase().trim();
  if (!s) return [];
  return list.filter((b) =>
    [b.name, b.code, b.department, b.description, ...b.facilities, ...b.rooms.map((r) => `${r.number} ${r.type}`)]
      .join(" ")
      .toLowerCase()
      .includes(s),
  );
}

// ---------- Auth (mock) ----------
export interface AuthUser { id: string; name: string; email: string; role: "user" | "admin" }

export async function login(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
  if (useMock()) {
    await delay(300);
    if (!email || !password) throw new Error("Email and password required");
    const isAdmin = email.toLowerCase().startsWith("admin");
    return {
      user: { id: "u_" + email, name: email.split("@")[0], email, role: isAdmin ? "admin" : "user" },
      token: "mock_" + btoa(email),
    };
  }
  const { data } = await api.post("/api/auth/login", { email, password });
  return data;
}

export async function register(name: string, email: string, password: string): Promise<{ user: AuthUser; token: string }> {
  if (useMock()) {
    await delay(300);
    return { user: { id: "u_" + email, name, email, role: "user" }, token: "mock_" + btoa(email) };
  }
  const { data } = await api.post("/api/auth/register", { name, email, password });
  return data;
}

export async function loginWithGoogle(credential: string): Promise<{ user: AuthUser; token: string }> {
  if (useMock()) {
    await delay(300);
    const payload = decodeJwtPayload(credential);
    const email = payload?.email ?? "google.user@psit.ac.in";
    const name = payload?.name ?? email.split("@")[0];
    const isAdmin = email.toLowerCase().startsWith("admin");
    return {
      user: { id: "g_" + email, name, email, role: isAdmin ? "admin" : "user" },
      token: "mock_google_" + btoa(email),
    };
  }
  const { data } = await api.post("/api/auth/google", { credential });
  return data;
}

function decodeJwtPayload(token: string): { email?: string; name?: string } | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    return JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")));
  } catch { return null; }
}

export async function requestPasswordReset(email: string): Promise<{ ok: true }> {
  if (useMock()) {
    await delay(400);
    if (!email) throw new Error("Email required");
    return { ok: true };
  }
  await api.post("/api/auth/forgot-password", { email });
  return { ok: true };
}

export async function resetPassword(token: string, password: string): Promise<{ ok: true }> {
  if (useMock()) {
    await delay(400);
    if (!token || !password) throw new Error("Token and password required");
    return { ok: true };
  }
  await api.post("/api/auth/reset-password", { token, password });
  return { ok: true };
}

// ---------- LocalStorage mock persistence ----------
let memoryBuildingsCache: Building[] | null = null;

function readBuildings(): Building[] {
  if (memoryBuildingsCache !== null) {
    return memoryBuildingsCache;
  }
  if (typeof window === "undefined") return [...mockBuildings];
  const storage = getBrowserStorage();
  if (!storage) {
    memoryBuildingsCache = [...mockBuildings];
    return memoryBuildingsCache;
  }
  try {
    const raw = storage.getItem("cc_buildings");
    if (raw === null) {
      writeBuildings(mockBuildings);
      return memoryBuildingsCache || [...mockBuildings];
    }
    const saved = JSON.parse(raw) as Building[];
    const result = saved.map((building) => {
      const department = normalizeDepartmentName(building.department || "");
      return {
        ...building,
        department,
        programs: building.programs?.length ? building.programs : [department || "General"],
      };
    });
    memoryBuildingsCache = result;
    return result;
  } catch {
    memoryBuildingsCache = [...mockBuildings];
    return memoryBuildingsCache;
  }
}

function writeBuildings(list: Building[]) {
  memoryBuildingsCache = [...list];
  const storage = getBrowserStorage();
  if (!storage) return;

  try {
    storage.setItem("cc_buildings", JSON.stringify(list));
  } catch (error) {
    console.warn("Unable to write buildings to LocalStorage quota, trimming images...", error);
    try {
      const trimmed = list.map((b) => ({
        ...b,
        image: b.image.startsWith("data:image/") && b.image.length > 20000 ? "" : b.image,
        icon: b.icon && b.icon.startsWith("data:image/") && b.icon.length > 10000 ? "" : b.icon,
        gallery: (b.gallery || []).map((img) => (img.startsWith("data:image/") && img.length > 20000 ? "" : img)).filter(Boolean),
      }));
      storage.setItem("cc_buildings", JSON.stringify(trimmed));
    } catch (innerError) {
      console.warn("Trimming failed, stripping all base64 data URLs...", innerError);
      try {
        const stripped = list.map((b) => ({
          ...b,
          image: b.image.startsWith("data:image/") ? "" : b.image,
          icon: b.icon && b.icon.startsWith("data:image/") ? "" : b.icon,
          gallery: (b.gallery || []).filter((img) => !img.startsWith("data:image/")),
        }));
        storage.setItem("cc_buildings", JSON.stringify(stripped));
      } catch (finalError) {
        console.error("Unable to persist buildings to LocalStorage:", finalError);
      }
    }
  }
}
