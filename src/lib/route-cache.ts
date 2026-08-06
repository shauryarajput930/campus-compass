import type { RouteResult } from "./routing.functions";

const DB_NAME = "cc_routes";
const STORE = "routes";
const LS_KEY = "cc_route_cache_v1";
const MAX_ENTRIES = 80;
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days for offline durability

interface Entry {
  key: string;
  at: number;
  result: RouteResult;
}

export function routeKey(fromId: string, toId: string, mode: string) {
  return `${fromId}|${toId}|${mode}`;
}

// ---------- IndexedDB helpers (with graceful fallback) ----------
function openDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof indexedDB === "undefined") return resolve(null);
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: "key" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbGet(key: string): Promise<Entry | null> {
  const db = await openDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve((req.result as Entry) ?? null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbPut(entry: Entry): Promise<void> {
  const db = await openDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      store.put(entry);
      // Prune oldest if we exceed MAX_ENTRIES.
      const countReq = store.count();
      countReq.onsuccess = () => {
        if (countReq.result > MAX_ENTRIES) {
          const cursorReq = store.openCursor();
          const drop: string[] = [];
          const overflow = countReq.result - MAX_ENTRIES;
          cursorReq.onsuccess = () => {
            const c = cursorReq.result;
            if (c && drop.length < overflow) {
              drop.push((c.value as Entry).key);
              c.continue();
            } else {
              drop.forEach((k) => store.delete(k));
            }
          };
        }
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

// ---------- localStorage fallback ----------
function lsRead(): Entry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]") as Entry[];
  } catch {
    return [];
  }
}
function lsWrite(entries: Entry[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)));
  } catch {
    // ignore quota
  }
}

// ---------- Public API (async) ----------
export async function getCachedRoute(key: string): Promise<RouteResult | null> {
  const now = Date.now();
  const hit = (await idbGet(key)) ?? lsRead().find((e) => e.key === key) ?? null;
  if (!hit) return null;
  if (now - hit.at > TTL_MS) return null;
  return hit.result;
}

export async function saveCachedRoute(key: string, result: RouteResult): Promise<void> {
  // Only cache real Google routes; simplified fallbacks are cheap to recompute.
  if (result.source !== "google") return;
  const entry: Entry = { key, at: Date.now(), result };
  await idbPut(entry);
  // Mirror to localStorage so cache survives if IDB is wiped independently.
  const entries = lsRead().filter((e) => e.key !== key);
  entries.push(entry);
  lsWrite(entries);
}
