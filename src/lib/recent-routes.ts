const KEY = "cc_recent_routes_v1";
const MAX = 10;

export interface RecentRoute {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  mode: "WALK" | "DRIVE" | "BICYCLE";
  fromLat?: number;
  fromLng?: number;
  distanceMeters?: number;
  durationSeconds?: number;
  source?: "google" | "fallback";
  at: number;
}

export function getRecentRoutes(): RecentRoute[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as RecentRoute[];
  } catch {
    return [];
  }
}

export function addRecentRoute(entry: Omit<RecentRoute, "at">): RecentRoute[] {
  if (typeof window === "undefined") return [];
  const now = Date.now();
  const existing = getRecentRoutes().filter(
    (r) => !(r.fromId === entry.fromId && r.toId === entry.toId && r.mode === entry.mode),
  );
  const next = [{ ...entry, at: now }, ...existing].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
  return next;
}

export function clearRecentRoutes() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function routeUid(r: RecentRoute) {
  return `${r.fromId}|${r.toId}|${r.mode}|${r.at}`;
}

export function removeRecentRoutes(uids: string[]): RecentRoute[] {
  const set = new Set(uids);
  const next = getRecentRoutes().filter((r) => !set.has(routeUid(r)));
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}
