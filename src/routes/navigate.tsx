import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { getBuildings } from "@/lib/api";
import type { Building } from "@/lib/mock-data";
import { CampusMap } from "@/components/campus-map";
import { RouteInsights } from "@/components/route-insights";

import { computeRoute, type RouteResult } from "@/lib/routing.functions";
import { getCachedRoute, routeKey, saveCachedRoute } from "@/lib/route-cache";
import { addRecentRoute, getRecentRoutes, clearRecentRoutes, removeRecentRoutes, routeUid, type RecentRoute } from "@/lib/recent-routes";
import { getFavorites, toggleFavorite, removeFavorite, moveFavoriteTo, addFavorites, getFavoriteAliases, setFavoriteAlias } from "@/lib/favorites";
import {
  Navigation,
  Route as RouteIcon,
  Clock,
  ArrowRight,
  Loader2,
  Footprints,
  Car,
  Bike,
  AlertTriangle,
  Database,
  WifiOff,
  LocateFixed,
  Share2,
  Check,
  History,
  Trash2,
  Star,
  StarOff,
  Search,
  X,
  Pencil,
  ArrowUp,
  ArrowDown,
  Settings2,
} from "lucide-react";

const search = z.object({
  from: z.string().optional().catch(""),
  to: z.string().optional().catch(""),
  mode: z.enum(["WALK", "DRIVE", "BICYCLE"]).optional().catch(undefined),
  fromLat: z.coerce.number().optional().catch(undefined),
  fromLng: z.coerce.number().optional().catch(undefined),
});

export const Route = createFileRoute("/navigate")({
  validateSearch: search,
  head: () => ({ meta: [{ title: "Get directions — Campus Compass" }] }),
  component: NavigatePage,
});

type Mode = "WALK" | "DRIVE" | "BICYCLE";
const CURRENT = "__current__";

function NavigatePage() {
  const params = Route.useSearch();
  const [b, setB] = useState<Building[]>([]);
  const hasCurrentInit = params.fromLat != null && params.fromLng != null;
  const [from, setFrom] = useState<string>(hasCurrentInit ? CURRENT : params.from ?? "");
  const [to, setTo] = useState<string>(params.to ?? "");
  const [mode, setMode] = useState<Mode>(params.mode ?? "WALK");
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    hasCurrentInit ? { lat: params.fromLat!, lng: params.fromLng! } : null,
  );
  const [geoErr, setGeoErr] = useState<string | null>(null);
  const [online, setOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [focusedStep, setFocusedStep] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");
  const [recents, setRecents] = useState<RecentRoute[]>([]);
  const [favIds, setFavIds] = useState<string[]>([]);
  const [favAliases, setFavAliases] = useState<Record<string, string>>({});
  const [recentQuery, setRecentQuery] = useState("");
  const [manageFavs, setManageFavs] = useState(false);
  const [editingFav, setEditingFav] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [selectedRecents, setSelectedRecents] = useState<string[]>([]);
  const [favMsg, setFavMsg] = useState("");
  const favItemRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const stepRefs = useRef<Array<HTMLLIElement | null>>([]);
  const compute = useServerFn(computeRoute);

  useEffect(() => { setRecents(getRecentRoutes()); setFavIds(getFavorites()); setFavAliases(getFavoriteAliases()); }, []);

  useEffect(() => { getBuildings().then(setB); }, []);
  useEffect(() => { if (!from && b[0]) setFrom(b[0].id); }, [b, from]);

  useEffect(() => {
    const on = () => { setOnline(true); setAnnouncement("Back online. Fetching live directions."); };
    const off = () => { setOnline(false); setAnnouncement("You are offline. Showing cached or simplified directions."); };
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const useCurrent = from === CURRENT;
  const fromB = useCurrent ? null : b.find((x) => x.id === from);
  const toB = b.find((x) => x.id === to);

  const originCoords = useCurrent ? coords : fromB ? { lat: fromB.lat, lng: fromB.lng } : null;
  const originId = useCurrent ? "current" : fromB?.id ?? "";
  const originName = useCurrent ? "Your location" : fromB?.name ?? "";

  function favLabel(id: string) {
    return favAliases[id] || b.find((x) => x.id === id)?.name || id;
  }

  function moveFav(id: string, target: number) {
    const next = moveFavoriteTo(id, target);
    setFavIds(next);
    const pos = next.indexOf(id);
    setFavMsg(`${favLabel(id)} moved to position ${pos + 1} of ${next.length}.`);
    requestAnimationFrame(() => favItemRefs.current[id]?.focus());
  }

  function onFavKeyDown(e: React.KeyboardEvent<HTMLLIElement>, id: string, idx: number) {
    const total = favIds.length;
    if ((e.altKey || e.ctrlKey || e.metaKey) && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      e.preventDefault();
      moveFav(id, e.key === "ArrowUp" ? idx - 1 : idx + 1);
      return;
    }
    if (e.key === "Home" && (e.altKey || e.ctrlKey || e.metaKey)) { e.preventDefault(); moveFav(id, 0); return; }
    if (e.key === "End" && (e.altKey || e.ctrlKey || e.metaKey)) { e.preventDefault(); moveFav(id, total - 1); return; }
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextId = favIds[e.key === "ArrowUp" ? Math.max(0, idx - 1) : Math.min(total - 1, idx + 1)];
      favItemRefs.current[nextId]?.focus();
    }
  }


  function requestLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoErr("Geolocation not supported in this browser.");
      return;
    }
    setGeoErr(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setFrom(CURRENT);
      },
      (e) => setGeoErr(e.message || "Could not get your location."),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  useEffect(() => {
    if (!originCoords || !toB) { setRoute(null); return; }
    let cancelled = false;
    setErr(null);

    const key = routeKey(originId, toB.id, mode);

    (async () => {
      const cached = await getCachedRoute(key);
      if (cancelled) return;
      if (cached) {
        setRoute({ ...cached, source: "google", warning: "Showing cached route (offline-friendly)." });
      }
      setLoading(true);
      setAnnouncement(cached ? "Recalculating route." : "Calculating route.");
      try {
        const r = await compute({
          data: {
            origin: originCoords,
            destination: { lat: toB.lat, lng: toB.lng },
            mode,
          },
        });
        if (cancelled) return;
        setRoute(r);
        saveCachedRoute(key, r);
        setRecents(
          addRecentRoute({
            fromId: originId,
            fromName: originName,
            toId: toB.id,
            toName: toB.name,
            mode,
            fromLat: useCurrent && coords ? coords.lat : undefined,
            fromLng: useCurrent && coords ? coords.lng : undefined,
            distanceMeters: r.distanceMeters,
            durationSeconds: r.durationSeconds,
            source: r.source,
          }),
        );
        const mins = Math.max(1, Math.round(r.durationSeconds / 60));
        setAnnouncement(
          `${r.source === "fallback" ? "Simplified route ready. " : "Route ready. "}${r.steps.length} steps, about ${mins} minute${mins === 1 ? "" : "s"}.`,
        );
      } catch (e: any) {
        if (cancelled) return;
        if (!cached) {
          setErr(e?.message || "Could not compute route");
          setAnnouncement("Could not compute route.");
        } else {
          setAnnouncement("Live route unavailable. Using cached route.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [originCoords?.lat, originCoords?.lng, originId, toB, mode, compute]);

  useEffect(() => { setFocusedStep(0); }, [route?.polyline]);

  const distance = route?.distanceMeters ?? 0;
  const minutes = route ? Math.max(1, Math.round(route.durationSeconds / 60)) : 0;

  const modes: { id: Mode; label: string; Icon: typeof Footprints }[] = useMemo(
    () => [
      { id: "WALK", label: "Walk", Icon: Footprints },
      { id: "BICYCLE", label: "Bike", Icon: Bike },
      { id: "DRIVE", label: "Drive", Icon: Car },
    ],
    [],
  );

  useEffect(() => {
    if (!route || !route.steps[focusedStep]) return;
    const s = route.steps[focusedStep];
    const text = s.instruction.replace(/<[^>]+>/g, "");
    setAnnouncement(`Step ${focusedStep + 1} of ${route.steps.length}: ${text}, ${Math.round(s.distanceMeters)} meters.`);
  }, [focusedStep, route]);

  function onStepsKeyDown(e: React.KeyboardEvent<HTMLOListElement>) {
    if (!route) return;
    const max = route.steps.length - 1;
    let next = focusedStep;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = Math.min(max, focusedStep + 1);
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = Math.max(0, focusedStep - 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = max;
    else return;
    e.preventDefault();
    setFocusedStep(next);
    stepRefs.current[next]?.focus();
  }

  async function shareRoute() {
    if (!toB) return;
    const params = new URLSearchParams();
    if (useCurrent && coords) {
      params.set("fromLat", String(coords.lat));
      params.set("fromLng", String(coords.lng));
    } else if (fromB) {
      params.set("from", fromB.id);
    }
    params.set("to", toB.id);
    params.set("mode", mode);
    const url = `${window.location.origin}/navigate?${params.toString()}`;
    const shareData = { title: `Directions to ${toB.name}`, text: `Navigate to ${toB.name} on Campus Compass`, url };
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData);
        setAnnouncement("Route shared.");
        return;
      }
    } catch { /* fall through to copy */ }
    try {
      await navigator.clipboard.writeText(url);
      setShareState("copied");
      setAnnouncement("Route link copied to clipboard.");
      setTimeout(() => setShareState("idle"), 2000);
    } catch {
      setAnnouncement("Could not copy link.");
    }
  }


  const routeForMap =
    originCoords && toB
      ? {
          from: (fromB ?? { id: "current", name: "Your location", lat: originCoords.lat, lng: originCoords.lng }) as Building,
          to: toB,
          polyline: route?.polyline,
        }
      : undefined;

  const mapBuildings: Building[] = originCoords && toB
    ? [
        (fromB ?? { id: "current", name: "Your location", lat: originCoords.lat, lng: originCoords.lng }) as Building,
        toB,
      ]
    : b;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Skip links — first focusable elements on the page */}
      <nav aria-label="Skip links">
        <a href="#nav-controls" className="skip-link">Skip to route controls</a>
        <a href="#nav-favorites" className="skip-link">Skip to favorites</a>
        <a href="#route-insights" className="skip-link">Skip to route insights</a>
        <a href="#nav-recents" className="skip-link">Skip to recent routes</a>
        <a href="#nav-map" className="skip-link">Skip to map</a>
      </nav>

      {/* Screen-reader-only live region for step + status updates */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">{announcement}</div>

      <h1 className="font-display text-3xl font-bold md:text-4xl">Get directions</h1>
      <p className="text-muted-foreground">Real turn-by-turn navigation powered by Google Routes.</p>


      {!online && (
        <div
          role="status"
          aria-live="polite"
          className="mt-4 flex items-center gap-2 rounded-xl border-2 border-amber-600 bg-amber-100 px-4 py-3 text-sm font-medium text-amber-900 dark:border-amber-400 dark:bg-amber-950 dark:text-amber-100"
        >
          <WifiOff className="h-4 w-4" aria-hidden="true" />
          You're offline. Showing cached routes when available; live directions will resume when you reconnect.
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
        <div id="nav-controls" tabIndex={-1} className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-soft">

          <div>
            <label htmlFor="nav-from" className="text-xs uppercase tracking-widest text-muted-foreground">From</label>
            <select
              id="nav-from"
              aria-label="Starting point"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {coords && <option value={CURRENT}>📍 Your location</option>}
              {b.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
            <button
              type="button"
              onClick={requestLocation}
              aria-label="Use my current location as starting point"
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <LocateFixed className="h-3.5 w-3.5" aria-hidden="true" /> Use my location
            </button>
            {geoErr && <p role="alert" className="mt-1 text-xs text-destructive">{geoErr}</p>}
          </div>
          <div>
            <label htmlFor="nav-to" className="text-xs uppercase tracking-widest text-muted-foreground">To</label>
            <select
              id="nav-to"
              aria-label="Destination"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">Choose destination…</option>
              {b.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
          </div>

          <div role="radiogroup" aria-label="Travel mode" className="flex gap-2">
            {modes.map(({ id, label, Icon }) => {
              const active = mode === id;
              return (
                <button
                  key={id}
                  role="radio"
                  aria-checked={active}
                  aria-label={`${label} directions`}
                  onClick={() => setMode(id)}
                  className={
                    "flex-1 inline-flex items-center justify-center gap-1 rounded-lg border px-3 py-2 text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary " +
                    (active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:bg-secondary")
                  }
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={shareRoute}
            disabled={!toB}
            aria-label="Share this route as a link"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {shareState === "copied" ? (
              <><Check className="h-3.5 w-3.5" aria-hidden="true" /> Link copied</>
            ) : (
              <><Share2 className="h-3.5 w-3.5" aria-hidden="true" /> Share this route</>
            )}
          </button>

          <div id="nav-favorites" tabIndex={-1} className="rounded-xl border border-border bg-background p-3">

            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <Star className="h-3.5 w-3.5" aria-hidden="true" /> Favorites
              </h3>
              {favIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setManageFavs((m) => !m); setEditingFav(null); }}
                  aria-pressed={manageFavs}
                  aria-label={manageFavs ? "Done managing favorites" : "Manage favorites"}
                  className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <Settings2 className="h-3 w-3" aria-hidden="true" /> {manageFavs ? "Done" : "Manage"}
                </button>
              )}
            </div>
            {favIds.length === 0 ? (
              <p className="text-[11px] text-muted-foreground">
                Pin your frequently visited buildings for one-tap navigation. Use the star to add favorites.
              </p>
            ) : manageFavs ? (
              <>
              <p id="fav-reorder-help" className="mb-1.5 text-[10px] text-muted-foreground">
                Use Up and Down arrows to move between pinned buildings, and Alt + Up / Alt + Down to reorder them.
              </p>
              <ul className="space-y-1" role="listbox" aria-label="Pinned buildings, reorderable" aria-describedby="fav-reorder-help">
                {favIds.map((id, idx) => {
                  const bld = b.find((x) => x.id === id);
                  if (!bld) return null;
                  const display = favAliases[id] || bld.name;
                  const isEditing = editingFav === id;
                  return (
                    <li
                      key={id}
                      ref={(el) => { favItemRefs.current[id] = el; }}
                      role="option"
                      aria-selected={false}
                      aria-label={`${display}, position ${idx + 1} of ${favIds.length}`}
                      tabIndex={isEditing ? -1 : 0}
                      onKeyDown={isEditing ? undefined : (e) => onFavKeyDown(e, id, idx)}
                      className="flex items-center gap-1 rounded-md border border-border bg-card p-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      <span className="w-4 shrink-0 text-center text-[10px] font-semibold text-muted-foreground" aria-hidden="true">{idx + 1}</span>
                      <div className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => moveFav(id, idx - 1)}
                          disabled={idx === 0}
                          aria-label={`Move ${display} up to position ${idx}`}
                          className="rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30"
                        >
                          <ArrowUp className="h-3 w-3" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveFav(id, idx + 1)}
                          disabled={idx === favIds.length - 1}
                          aria-label={`Move ${display} down to position ${idx + 2}`}
                          className="rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30"
                        >
                          <ArrowDown className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </div>

                      {isEditing ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            setFavAliases(setFavoriteAlias(id, editingValue));
                            setEditingFav(null);
                          }}
                          className="flex flex-1 items-center gap-1"
                        >
                          <input
                            autoFocus
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            placeholder={bld.name}
                            aria-label={`Rename ${bld.name}`}
                            className="min-w-0 flex-1 rounded border border-border bg-background px-2 py-1 text-xs"
                          />
                          <button type="submit" className="rounded bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground">Save</button>
                          <button type="button" onClick={() => setEditingFav(null)} aria-label="Cancel rename" className="rounded border border-border px-1 py-1 text-muted-foreground hover:bg-secondary">
                            <X className="h-3 w-3" aria-hidden="true" />
                          </button>
                        </form>
                      ) : (
                        <>
                          <span className="min-w-0 flex-1 truncate text-xs">
                            {display}
                            {favAliases[id] && <span className="ml-1 text-[10px] text-muted-foreground">({bld.name})</span>}
                          </span>
                          <button
                            type="button"
                            onClick={() => { setEditingFav(id); setEditingValue(favAliases[id] || ""); }}
                            aria-label={`Rename ${display}`}
                            className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                          >
                            <Pencil className="h-3 w-3" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => { setFavIds(removeFavorite(id)); setFavAliases(getFavoriteAliases()); }}
                            aria-label={`Remove ${display} from favorites`}
                            className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" aria-hidden="true" />
                          </button>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
              <p aria-live="polite" className="sr-only">{favMsg}</p>
              </>

            ) : (
              <ul className="space-y-1.5">
                {favIds.map((id) => {
                  const bld = b.find((x) => x.id === id);
                  if (!bld) return null;
                  const display = favAliases[id] || bld.name;
                  const active = to === id;
                  const lastTrip = recents.find((r) => r.toId === id);
                  return (
                    <li key={id}>
                      <div className="flex items-stretch overflow-hidden rounded-lg border border-border bg-background text-xs">
                        <button
                          type="button"
                          onClick={() => setTo(id)}
                          aria-label={`Navigate to ${display}`}
                          className={
                            "flex min-w-0 flex-1 flex-col items-start gap-0.5 px-2.5 py-1.5 text-left hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary " +
                            (active ? "bg-primary/10" : "")
                          }
                        >
                          <span className="flex items-center gap-1 truncate font-medium">
                            <Navigation className="h-3 w-3 shrink-0" aria-hidden="true" />
                            <span className="truncate">{display}</span>
                          </span>
                          {lastTrip ? (
                            <span className="flex flex-wrap items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                              {lastTrip.distanceMeters != null && <span>{Math.round(lastTrip.distanceMeters)} m</span>}
                              {lastTrip.durationSeconds != null && (
                                <span>· {Math.max(1, Math.round(lastTrip.durationSeconds / 60))} min</span>
                              )}
                              {lastTrip.source && (
                                <span
                                  className={
                                    "rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wide " +
                                    (lastTrip.source === "google"
                                      ? "bg-sky-500/15 text-sky-700 dark:text-sky-300"
                                      : "bg-amber-500/15 text-amber-700 dark:text-amber-300")
                                  }
                                >
                                  {lastTrip.source === "google" ? "Google" : "Fallback"}
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">No trip yet</span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setFavIds(toggleFavorite(id))}
                          aria-label={`Remove ${display} from favorites`}
                          className="border-l border-border px-2 text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                          <StarOff className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {toB && !favIds.includes(toB.id) && (
              <button
                type="button"
                onClick={() => setFavIds(toggleFavorite(toB.id))}
                className="mt-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <Star className="h-3 w-3" aria-hidden="true" /> Pin “{toB.name}”
              </button>
            )}
          </div>

          <RouteInsights recents={recents} onSelectDestination={(id) => setTo(id)} />

          {recents.length > 0 && (
            <div id="nav-recents" tabIndex={-1} className="rounded-xl border border-border bg-background p-3">

              <div className="mb-2 flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  <History className="h-3.5 w-3.5" aria-hidden="true" /> Recent routes
                </h3>
                <button
                  type="button"
                  onClick={() => { clearRecentRoutes(); setRecents([]); setRecentQuery(""); setSelectedRecents([]); }}
                  aria-label="Clear all recent routes"
                  className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" aria-hidden="true" /> Clear all
                </button>
              </div>
              <div className="relative mb-2">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input
                  type="search"
                  value={recentQuery}
                  onChange={(e) => setRecentQuery(e.target.value)}
                  placeholder="Search recent routes…"
                  aria-label="Search recent routes"
                  className="w-full rounded-md border border-border bg-background py-1 pl-6 pr-6 text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                />
                {recentQuery && (
                  <button
                    type="button"
                    onClick={() => setRecentQuery("")}
                    aria-label="Clear search"
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                )}
              </div>
              {(() => {
                const q = recentQuery.trim().toLowerCase();
                const filtered = q
                  ? recents.filter(
                      (r) =>
                        r.fromName.toLowerCase().includes(q) ||
                        r.toName.toLowerCase().includes(q) ||
                        r.mode.toLowerCase().includes(q),
                    )
                  : recents;
                if (filtered.length === 0) {
                  return <p className="px-1 py-2 text-[11px] text-muted-foreground">No matches for “{recentQuery}”.</p>;
                }
                const visibleIds = filtered.map(routeUid);
                const allSelected = visibleIds.every((u) => selectedRecents.includes(u));
                return (
                  <>
                    <div className="mb-1.5 flex flex-wrap items-center gap-2 border-b border-border pb-1.5">
                      <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <input
                          type="checkbox"
                          className="h-3.5 w-3.5 accent-[hsl(var(--primary))]"
                          checked={allSelected}
                          onChange={(e) => setSelectedRecents(e.target.checked ? visibleIds : [])}
                        />
                        Select all
                      </label>
                      <span className="text-[11px] text-muted-foreground" aria-live="polite">
                        {selectedRecents.length > 0 ? `${selectedRecents.length} selected` : ""}
                      </span>
                      {selectedRecents.length > 0 && (
                        <span className="ml-auto flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              const ids = Array.from(
                                new Set(recents.filter((r) => selectedRecents.includes(routeUid(r))).map((r) => r.toId)),
                              );
                              setFavIds(addFavorites(ids));
                              setSelectedRecents([]);
                            }}
                            className="inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[10px] hover:bg-secondary"
                          >
                            <Star className="h-3 w-3" aria-hidden="true" /> Pin destinations
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRecents(removeRecentRoutes(selectedRecents));
                              setSelectedRecents([]);
                            }}
                            className="inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[10px] text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3 w-3" aria-hidden="true" /> Delete selected
                          </button>
                        </span>
                      )}
                    </div>
                    <ul className="space-y-1">
                      {filtered.map((r) => {
                        const isCurrent = r.fromId === "current";
                        const uid = routeUid(r);
                        const checked = selectedRecents.includes(uid);
                        return (
                          <li key={uid} className="flex items-start gap-1.5">
                            <input
                              type="checkbox"
                              className="mt-2 h-3.5 w-3.5 shrink-0 accent-[hsl(var(--primary))]"
                              checked={checked}
                              onChange={(e) =>
                                setSelectedRecents((s) => (e.target.checked ? [...s, uid] : s.filter((x) => x !== uid)))
                              }
                              aria-label={`Select route ${r.fromName} to ${r.toName}`}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (isCurrent && r.fromLat != null && r.fromLng != null) {
                                  setCoords({ lat: r.fromLat, lng: r.fromLng });
                                  setFrom(CURRENT);
                                } else {
                                  setFrom(r.fromId);
                                }
                                setTo(r.toId);
                                setMode(r.mode);
                              }}
                              className="min-w-0 flex-1 rounded-md px-2 py-1.5 text-left text-xs hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                            >
                              <div className="flex items-center gap-1 truncate">
                                <span className="truncate">{r.fromName}</span>
                                <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden="true" />
                                <span className="truncate font-medium">{r.toName}</span>
                              </div>
                              <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                                <span>{r.mode === "WALK" ? "Walk" : r.mode === "BICYCLE" ? "Bike" : "Drive"}</span>
                                {r.distanceMeters != null && (
                                  <span aria-label={`${Math.round(r.distanceMeters)} meters`}>· {Math.round(r.distanceMeters)} m</span>
                                )}
                                {r.durationSeconds != null && (
                                  <span aria-label={`about ${Math.max(1, Math.round(r.durationSeconds / 60))} minutes`}>
                                    · {Math.max(1, Math.round(r.durationSeconds / 60))} min
                                  </span>
                                )}
                                {r.source && (
                                  <span
                                    className={
                                      "ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wide " +
                                      (r.source === "google"
                                        ? "bg-sky-500/15 text-sky-700 dark:text-sky-300"
                                        : "bg-amber-500/15 text-amber-700 dark:text-amber-300")
                                    }
                                  >
                                    {r.source === "google" ? "Google" : "Fallback"}
                                  </span>
                                )}
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                );
              })()}

            </div>
          )}




          {originCoords && toB && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-background p-3">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Distance</div>
                  <div className="mt-1 font-display text-xl font-bold" aria-live="polite">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" aria-label="Loading" /> : `${Math.round(distance)} m`}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-background p-3">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {mode === "WALK" ? "Walking" : mode === "BICYCLE" ? "Cycling" : "Driving"}
                  </div>
                  <div className="mt-1 flex items-center gap-1 font-display text-xl font-bold" aria-live="polite">
                    <Clock className="h-4 w-4" aria-hidden="true" /> {loading ? "…" : `${minutes} min`}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <RouteIcon className="h-4 w-4" aria-hidden="true" /> Turn-by-turn
                  </h3>
                  {route?.source === "fallback" && (
                    <span
                      role="status"
                      className="inline-flex items-center gap-1 rounded-full border-2 border-amber-700 bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900 dark:border-amber-300 dark:bg-amber-950 dark:text-amber-100"
                    >
                      <AlertTriangle className="h-3 w-3" aria-hidden="true" /> Simplified
                    </span>
                  )}
                  {route?.source === "google" && route?.warning && (
                    <span
                      role="status"
                      className="inline-flex items-center gap-1 rounded-full border-2 border-sky-700 bg-sky-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-900 dark:border-sky-300 dark:bg-sky-950 dark:text-sky-100"
                    >
                      <Database className="h-3 w-3" aria-hidden="true" /> Cached
                    </span>
                  )}
                </div>
                {route?.warning && (
                  <div role="status" className="mb-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2 text-[11px] text-amber-700 dark:text-amber-300">
                    {route.warning}
                  </div>
                )}
                {err && <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">{err}</div>}
                {loading && !route && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> Computing route…</div>
                )}
                {route && (
                  <ol
                    className="space-y-2 text-sm outline-none"
                    aria-label="Turn-by-turn directions. Use arrow keys to move between steps."
                    tabIndex={0}
                    onKeyDown={onStepsKeyDown}
                  >
                    <li className="flex gap-2">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground" aria-hidden="true">S</span>
                      <span>Start at <strong>{originName}</strong>.</span>
                    </li>
                    {route.steps.map((s, i) => (
                      <li
                        key={i}
                        ref={(el) => { stepRefs.current[i] = el; }}
                        tabIndex={focusedStep === i ? 0 : -1}
                        aria-posinset={i + 1}
                        aria-setsize={route.steps.length}
                        aria-label={`Step ${i + 1} of ${route.steps.length}: ${s.instruction.replace(/<[^>]+>/g, "")}, ${Math.round(s.distanceMeters)} meters`}
                        className={
                          "flex gap-2 rounded-md p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary " +
                          (focusedStep === i ? "bg-secondary" : "")
                        }
                      >
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground" aria-hidden="true">{i + 1}</span>
                        <span>
                          <span dangerouslySetInnerHTML={{ __html: s.instruction }} />
                          <span className="ml-1 text-xs text-muted-foreground">· {Math.round(s.distanceMeters)} m</span>
                        </span>
                      </li>
                    ))}
                    <li className="flex gap-2">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-green-600 text-[10px] font-bold text-white" aria-hidden="true">✓</span>
                      <span>Arrive at <strong>{toB.name}</strong> — {toB.openingTime}.</span>
                    </li>
                  </ol>
                )}
              </div>
            </>
          )}

          {!toB && (
            <div className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              <Navigation className="mx-auto mb-2 h-6 w-6" aria-hidden="true" />
              Pick a destination to see the route <ArrowRight className="inline h-3 w-3" aria-hidden="true" />
            </div>
          )}
        </div>

        <div id="nav-map" tabIndex={-1} aria-label="Campus map">

          {originCoords && toB ? (
            <CampusMap
              buildings={mapBuildings}
              height="70vh"
              route={routeForMap}
            />
          ) : (
            <CampusMap buildings={b} height="70vh" />
          )}
        </div>
      </div>
    </div>
  );
}
