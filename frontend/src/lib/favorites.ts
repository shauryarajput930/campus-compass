const KEY = "cc_favorites";
const ALIAS_KEY = "cc_favorite_aliases";

export function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

function saveFavorites(list: string[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* ignore */ }
}

export function toggleFavorite(id: string) {
  const list = getFavorites();
  const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  saveFavorites(next);
  if (!next.includes(id)) {
    // clean up alias when removed
    const aliases = getFavoriteAliases();
    if (aliases[id]) {
      delete aliases[id];
      saveAliases(aliases);
    }
  }
  return next;
}

export function removeFavorite(id: string) {
  const next = getFavorites().filter((x) => x !== id);
  saveFavorites(next);
  const aliases = getFavoriteAliases();
  if (aliases[id]) { delete aliases[id]; saveAliases(aliases); }
  return next;
}

export function reorderFavorite(id: string, direction: "up" | "down") {
  const list = getFavorites();
  const i = list.indexOf(id);
  if (i < 0) return list;
  const j = direction === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= list.length) return list;
  const next = list.slice();
  [next[i], next[j]] = [next[j], next[i]];
  saveFavorites(next);
  return next;
}

export function isFavorite(id: string) { return getFavorites().includes(id); }

export function getFavoriteAliases(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(ALIAS_KEY) || "{}"); } catch { return {}; }
}
function saveAliases(a: Record<string, string>) {
  try { localStorage.setItem(ALIAS_KEY, JSON.stringify(a)); } catch { /* ignore */ }
}
export function setFavoriteAlias(id: string, alias: string) {
  const a = getFavoriteAliases();
  const trimmed = alias.trim();
  if (trimmed) a[id] = trimmed; else delete a[id];
  saveAliases(a);
  return a;
}

const RECENT = "cc_recent";
export function pushRecent(id: string) {
  if (typeof window === "undefined") return;
  const list: string[] = JSON.parse(localStorage.getItem(RECENT) || "[]");
  const next = [id, ...list.filter((x) => x !== id)].slice(0, 8);
  localStorage.setItem(RECENT, JSON.stringify(next));
}
export function getRecent(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(RECENT) || "[]"); } catch { return []; }
}

export function moveFavoriteTo(id: string, index: number) {
  const list = getFavorites();
  const i = list.indexOf(id);
  if (i < 0) return list;
  const target = Math.max(0, Math.min(list.length - 1, index));
  if (target === i) return list;
  const next = list.slice();
  next.splice(i, 1);
  next.splice(target, 0, id);
  saveFavorites(next);
  return next;
}

export function addFavorites(ids: string[]) {
  const list = getFavorites();
  const next = [...list, ...ids.filter((id) => !list.includes(id))];
  saveFavorites(next);
  return next;
}
