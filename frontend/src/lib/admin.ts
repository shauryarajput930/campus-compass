import { api } from "./api";

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  active: boolean;
  createdAt?: string;
};

export type AdminReport = {
  id: string;
  buildingId: string;
  buildingName?: string;
  userName?: string;
  userEmail?: string;
  category: string;
  message: string;
  status: "pending" | "approved" | "rejected" | "resolved";
  createdAt: string;
};

export type SiteSettings = {
  homeBackground?: string;
  contactEmail: string;
  contactPhone: string;
  instagram: string;
  linkedin: string;
  twitter: string;
};

export type AdminAnalytics = {
  totalUsers: number;
  activeUsers: number;
  reports: number;
  pendingReports?: number;
  resolvedReports?: number;
  buildingsCount?: number;
  favorites: { buildingId: string; count: number }[];
  dailyUsage?: { label: string; value: number }[];
};

const defaultSettings: SiteSettings = {
  homeBackground: "",
  contactEmail: "support@campuscompass.in",
  contactPhone: "+91 1800 123 4567",
  instagram: "https://instagram.com/psitkanpur",
  linkedin: "https://linkedin.com/school/psit-kanpur",
  twitter: "https://x.com/psitkanpur",
};

export async function getAdminUsers(): Promise<ManagedUser[]> {
  const { data } = await api.get<any[]>("/api/admin/users");
  return data.map((u) => ({
    id: u._id || u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    active: u.active ?? true,
    createdAt: u.createdAt,
  }));
}

export async function createAdminUser(input: {
  name: string;
  email: string;
  password: string;
  role: ManagedUser["role"];
}): Promise<ManagedUser> {
  const { data } = await api.post<any>("/api/admin/users", input);
  return {
    id: data._id || data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    active: data.active ?? true,
    createdAt: data.createdAt,
  };
}

export async function updateAdminUser(
  id: string,
  patch: Partial<Pick<ManagedUser, "role" | "active" | "name">>
): Promise<ManagedUser> {
  const { data } = await api.patch<any>(`/api/admin/users/${id}`, patch);
  return {
    id: data._id || data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    active: data.active ?? true,
    createdAt: data.createdAt,
  };
}

export async function deleteAdminUser(id: string): Promise<void> {
  await api.delete(`/api/admin/users/${id}`);
}

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const { data } = await api.get<AdminAnalytics>("/api/admin/analytics");
  return data;
}

export async function resetAdminUserPassword(id: string, password: string): Promise<void> {
  await api.post(`/api/admin/users/${id}/reset-password`, { password });
}

export async function getReports(): Promise<AdminReport[]> {
  const { data } = await api.get<any[]>("/api/reports");
  return data.map((r) => ({
    id: r._id || r.id,
    buildingId: r.buildingId,
    buildingName: r.buildingName,
    userName: r.userName,
    userEmail: r.userEmail,
    category: r.category,
    message: r.message,
    status: r.status,
    createdAt: r.createdAt,
  }));
}

export async function getMyReports(_email?: string): Promise<AdminReport[]> {
  const { data } = await api.get<any[]>("/api/reports/my");
  return data.map((r) => ({
    id: r._id || r.id,
    buildingId: r.buildingId,
    buildingName: r.buildingName,
    userName: r.userName,
    userEmail: r.userEmail,
    category: r.category,
    message: r.message,
    status: r.status,
    createdAt: r.createdAt,
  }));
}

export async function createReport(
  report: Pick<AdminReport, "buildingId" | "buildingName" | "userName" | "userEmail" | "category" | "message">
): Promise<AdminReport> {
  const { data } = await api.post<any>("/api/reports", report);
  return {
    id: data._id || data.id,
    buildingId: data.buildingId,
    buildingName: data.buildingName,
    userName: data.userName,
    userEmail: data.userEmail,
    category: data.category,
    message: data.message,
    status: data.status,
    createdAt: data.createdAt,
  };
}

export async function updateReport(id: string, status: AdminReport["status"]): Promise<AdminReport> {
  const { data } = await api.patch<any>(`/api/reports/${id}`, { status });
  return {
    id: data._id || data.id,
    buildingId: data.buildingId,
    buildingName: data.buildingName,
    userName: data.userName,
    userEmail: data.userEmail,
    category: data.category,
    message: data.message,
    status: data.status,
    createdAt: data.createdAt,
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const { data } = await api.get<SiteSettings>("/api/settings");
    return data || defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export async function updateSiteSettings(settings: SiteSettings): Promise<SiteSettings> {
  const { data } = await api.put<SiteSettings>("/api/settings", settings);
  return data;
}
