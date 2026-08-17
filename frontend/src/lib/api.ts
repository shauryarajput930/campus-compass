import axios from "axios";
import { buildings as mockBuildings, type Building } from "./mock-data";

/**
 * Axios API client.
 *
 * Point it at your Express+MongoDB backend by setting VITE_API_URL
 * in .env (e.g. VITE_API_URL=https://campus-compass-api.onrender.com).
 * When VITE_API_URL is unset, the client falls back to local mock data
 * so the frontend runs without a backend.
 */
const BASE_URL = import.meta.env.VITE_API_URL as string | undefined;

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
  return data;
}

export async function getBuilding(id: string): Promise<Building | undefined> {
  if (useMock()) { await delay(); return readBuildings().find((b) => b.id === id); }
  const { data } = await api.get<Building>(`/api/buildings/${id}`);
  return data;
}

export async function createBuilding(b: Building): Promise<Building> {
  if (useMock()) { const list = readBuildings(); list.push(b); writeBuildings(list); return b; }
  const { data } = await api.post<Building>("/api/buildings", b);
  return data;
}

export async function updateBuilding(id: string, patch: Partial<Building>): Promise<Building> {
  if (useMock()) {
    const list = readBuildings();
    const idx = list.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error("Not found");
    list[idx] = { ...list[idx], ...patch };
    writeBuildings(list);
    return list[idx];
  }
  const { data } = await api.put<Building>(`/api/buildings/${id}`, patch);
  return data;
}

export async function deleteBuilding(id: string): Promise<void> {
  if (useMock()) { writeBuildings(readBuildings().filter((b) => b.id !== id)); return; }
  await api.delete(`/api/buildings/${id}`);
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
function readBuildings(): Building[] {
  if (typeof window === "undefined") return [...mockBuildings];
  const raw = localStorage.getItem("cc_buildings");
  if (!raw) { writeBuildings(mockBuildings); return [...mockBuildings]; }
  try { return JSON.parse(raw) as Building[]; } catch { return [...mockBuildings]; }
}
function writeBuildings(list: Building[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("cc_buildings", JSON.stringify(list));
}
