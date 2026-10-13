import { api } from "./api";

const KEY = "cc_favorites";
const ALIAS_KEY = "cc_favorite_aliases";
export const FAVORITES_CHANGED_EVENT = "cc-favorites-changed";

function hasAuthToken(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem("cc_token"));
}

export function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function saveFavoritesLocally(list: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(FAVORITES_CHANGED_EVENT, { detail: list }));
    window.dispatchEvent(new Event("storage"));
  }
}

/**
 * Fetch authoritative favorites from MongoDB for authenticated user.
 */
export async function fetchFavorites(): Promise<string[]> {
  if (!hasAuthToken()) {
    return getFavorites();
  }
  try {
    const { data } = await api.get<string[]>("/api/favorites");
    if (Array.isArray(data)) {
      saveFavoritesLocally(data);
      return data;
    }
    return getFavorites();
  } catch (err) {
    console.warn("[favorites] Could not fetch from MongoDB, using local cache:", err);
    return getFavorites();
  }
}

/**
 * Toggle favorite in MongoDB (or local cache for guests).
 */
export function toggleFavorite(id: string): string[] {
  const current = getFavorites();
  const willBeFavorited = !current.includes(id);
  const optimistic = willBeFavorited ? [...current, id] : current.filter((x) => x !== id);
  saveFavoritesLocally(optimistic);

  if (hasAuthToken()) {
    api
      .post<{ favorites: string[]; favorited: boolean }>("/api/favorites", { buildingId: id })
      .then((res) => {
        if (res.data?.favorites && Array.isArray(res.data.favorites)) {
          saveFavoritesLocally(res.data.favorites);
        }
      })
      .catch((err) => {
        console.error("[favorites] Failed to persist toggle to MongoDB:", err);
      });
  }

  return optimistic;
}

/**
 * Remove favorite from MongoDB.
 */
export function removeFavorite(id: string): string[] {
  const current = getFavorites();
  const next = current.filter((x) => x !== id);
  saveFavoritesLocally(next);

  const aliases = getFavoriteAliases();
  if (aliases[id]) {
    delete aliases[id];
    saveAliases(aliases);
  }

  if (hasAuthToken()) {
    api
      .delete<{ favorites: string[] }>(`/api/favorites/${encodeURIComponent(id)}`)
      .then((res) => {
        if (res.data?.favorites && Array.isArray(res.data.favorites)) {
          saveFavoritesLocally(res.data.favorites);
        }
      })
      .catch((err) => {
        console.error("[favorites] Failed to persist removal to MongoDB:", err);
      });
  }

  return next;
}

export function isFavorite(id: string): boolean {
  return getFavorites().includes(id);
}

export function clearFavorites(): void {
  saveFavoritesLocally([]);
}

export function getFavoriteAliases(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(ALIAS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveAliases(a: Record<string, string>) {
  try {
    localStorage.setItem(ALIAS_KEY, JSON.stringify(a));
  } catch {
    /* ignore */
  }
}

export function setFavoriteAlias(id: string, alias: string): Record<string, string> {
  const a = getFavoriteAliases();
  const trimmed = alias.trim();
  if (trimmed) a[id] = trimmed;
  else delete a[id];
  saveAliases(a);
  return a;
}

const RECENT = "cc_recent";
export function pushRecent(id: string) {
  if (typeof window === "undefined") return;
  try {
    const list: string[] = JSON.parse(localStorage.getItem(RECENT) || "[]");
    const next = [id, ...list.filter((x) => x !== id)].slice(0, 8);
    localStorage.setItem(RECENT, JSON.stringify(next));
  } catch {}
}

export function getRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT) || "[]");
  } catch {
    return [];
  }
}
