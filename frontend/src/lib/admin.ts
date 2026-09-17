import { api } from "./api";

export type ManagedUser = { id: string; name: string; email: string; role: "user" | "admin"; active: boolean; createdAt?: string };
export type AdminReport = { id: string; buildingId: string; buildingName?: string; userName?: string; userEmail?: string; category: string; message: string; status: "pending" | "approved" | "rejected" | "resolved"; createdAt: string };
export type SiteSettings = { homeBackground?: string; contactEmail: string; contactPhone: string; instagram: string; linkedin: string; twitter: string };
export type AdminAnalytics = { totalUsers: number; activeUsers: number; reports: number; favorites: { buildingId: string; count: number }[]; topSearches: { label: string; count: number }[]; topRoutes: { label: string; count: number }[]; dailyUsage: { label: string; value: number }[] };

const mockUsers: ManagedUser[] = [
  { id: "u_demo_1", name: "Demo Student", email: "student@psit.ac.in", role: "user", active: true },
  { id: "u_demo_2", name: "Campus Admin", email: "admin@psit.ac.in", role: "admin", active: true },
];
const defaultSettings: SiteSettings = { homeBackground: "", contactEmail: "support@campuscompass.in", contactPhone: "+91 1800 123 4567", instagram: "https://instagram.com/psitkanpur", linkedin: "https://linkedin.com/school/psit-kanpur", twitter: "https://x.com/psitkanpur" };
const mockKey = "cc_admin_";
const adminMemoryCache: Record<string, unknown> = {};

const read = <T,>(key: string, fallback: T): T => {
  if (key in adminMemoryCache) return adminMemoryCache[key] as T;
  try {
    const raw = localStorage.getItem(mockKey + key);
    if (!raw) {
      adminMemoryCache[key] = fallback;
      return fallback;
    }
    const parsed = JSON.parse(raw) as T;
    adminMemoryCache[key] = parsed;
    return parsed;
  } catch {
    adminMemoryCache[key] = fallback;
    return fallback;
  }
};

const write = (key: string, value: unknown) => {
  adminMemoryCache[key] = value;
  try {
    localStorage.setItem(mockKey + key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Unable to write ${key} to LocalStorage:`, err);
  }
};

const isMock = () => !import.meta.env.VITE_API_URL;

export async function getAdminUsers(): Promise<ManagedUser[]> {
  if (isMock()) return read("users", mockUsers);
  const { data } = await api.get<ManagedUser[]>("/api/admin/users"); return data;
}
export async function createAdminUser(input: { name: string; email: string; password: string; role: ManagedUser["role"] }): Promise<ManagedUser> {
  if (isMock()) {
    const users = read("users", mockUsers);
    if (users.some((user) => user.email.toLowerCase() === input.email.toLowerCase())) throw new Error("Email is already in use");
    const created = { id: `u_${Date.now()}`, name: input.name, email: input.email.toLowerCase(), role: input.role, active: true };
    write("users", [created, ...users]);
    return created;
  }
  const { data } = await api.post<ManagedUser>("/api/admin/users", input); return data;
}
export async function updateAdminUser(id: string, patch: Partial<Pick<ManagedUser, "role" | "active">>): Promise<ManagedUser> {
  if (isMock()) { const next = read("users", mockUsers).map((user) => user.id === id ? { ...user, ...patch } : user); write("users", next); return next.find((user) => user.id === id)!; }
  const { data } = await api.patch<ManagedUser>(`/api/admin/users/${id}`, patch); return data;
}
export async function deleteAdminUser(id: string): Promise<void> {
  if (isMock()) { write("users", read<ManagedUser[]>("users", mockUsers).filter((user) => user.id !== id)); return; }
  await api.delete(`/api/admin/users/${id}`);
}
export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  if (isMock()) return { totalUsers: read("users", mockUsers).length, activeUsers: read("users", mockUsers).filter((user) => user.active).length, reports: read<AdminReport[]>("reports", []).length, favorites: [{ buildingId: "admin", count: 18 }, { buildingId: "library", count: 12 }], topSearches: [{ label: "Library", count: 42 }, { label: "CSE Block", count: 31 }], topRoutes: [{ label: "Main Gate → Library", count: 26 }, { label: "Hostel → Food Court", count: 18 }], dailyUsage: [{ label: "Mon", value: 38 }, { label: "Tue", value: 54 }, { label: "Wed", value: 46 }, { label: "Thu", value: 72 }, { label: "Fri", value: 64 }, { label: "Sat", value: 31 }, { label: "Sun", value: 22 }] };
  const { data } = await api.get<AdminAnalytics>("/api/admin/analytics"); return data;
}
export async function resetAdminUserPassword(id: string, password: string): Promise<void> { if (isMock()) return; await api.post(`/api/admin/users/${id}/reset-password`, { password }); }
export async function getReports(): Promise<AdminReport[]> { if (isMock()) return read("reports", []); const { data } = await api.get<AdminReport[]>("/api/reports"); return data; }
export async function getMyReports(email: string): Promise<AdminReport[]> { if (isMock()) return read<AdminReport[]>("reports", []).filter((report) => report.userEmail === email); const { data } = await api.get<AdminReport[]>("/api/reports/my"); return data; }
export async function createReport(report: Pick<AdminReport, "buildingId" | "buildingName" | "userName" | "userEmail" | "category" | "message">): Promise<AdminReport> { if (isMock()) { const next = { ...report, id: `report_${Date.now()}`, status: "pending" as const, createdAt: new Date().toISOString() }; write("reports", [next, ...read<AdminReport[]>("reports", [])]); return next; } const { data } = await api.post<AdminReport>("/api/reports", report); return data; }
export async function updateReport(id: string, status: AdminReport["status"]): Promise<AdminReport> { if (isMock()) { const next = read<AdminReport[]>("reports", []).map((report) => report.id === id ? { ...report, status } : report); write("reports", next); return next.find((report) => report.id === id)!; } const { data } = await api.patch<AdminReport>(`/api/reports/${id}`, { status }); return data; }
export async function getSiteSettings(): Promise<SiteSettings> { if (isMock()) return read("settings", defaultSettings); const { data } = await api.get<SiteSettings>("/api/settings"); return data; }
export async function updateSiteSettings(settings: SiteSettings): Promise<SiteSettings> { if (isMock()) { write("settings", settings); return settings; } const { data } = await api.put<SiteSettings>("/api/settings", settings); return data; }
