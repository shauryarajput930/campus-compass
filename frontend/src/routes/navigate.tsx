import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getBuildings } from "@/lib/api";
import { getAIRouteSuggestions } from "@/lib/ai.functions";
import type { Building } from "@/lib/mock-data";
import { CampusMap } from "@/components/campus-map";
import { LocationPinIcon } from "@/components/location-pin-icon";
import {
  getWalkingDirections,
  formatDistance,
  formatDuration,
  type OsrmRouteResult,
} from "@/lib/osrm-routing";
import {
  Navigation,
  MapPin,
  Flag,
  ArrowRightLeft,
  RotateCcw,
  Search,
  Footprints,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Compass,
  Sparkles,
  Loader2,
} from "lucide-react";

const searchSchema = z.object({
  from: z.string().optional().catch(""),
  to: z.string().optional().catch(""),
  fromLat: z.coerce.number().optional().catch(undefined),
  fromLng: z.coerce.number().optional().catch(undefined),
});

export const Route = createFileRoute("/navigate")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "PSIT Campus Walking Directions — Campus Compass" },
      {
        name: "description",
        content:
          "Find turn-by-turn walking routes between any buildings, labs, hostels or facilities on PSIT Kanpur campus.",
      },
    ],
  }),
  component: NavigatePage,
});

const CURRENT_LOCATION_KEY = "__current__";

function NavigatePage() {
  const params = Route.useSearch();
  const [locations, setLocations] = useState<Building[]>([]);

  // Selection states
  const [fromId, setFromId] = useState<string>(
    params.fromLat != null && params.fromLng != null
      ? CURRENT_LOCATION_KEY
      : params.from || "main-gate"
  );
  const [toId, setToId] = useState<string>(params.to || "block-a");

  // Geolocation & User position state
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(
    params.fromLat != null && params.fromLng != null
      ? { lat: params.fromLat, lng: params.fromLng }
      : null
  );
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [liveTracking, setLiveTracking] = useState(false);

  // Search filter query
  const [searchQuery, setSearchQuery] = useState("");

  // Route result & status
  const [routeResult, setRouteResult] = useState<OsrmRouteResult | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeSuggestions, setRouteSuggestions] = useState<{ destinationId: string; reason: string }[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const fetchRouteSuggestions = useServerFn(getAIRouteSuggestions);

  useEffect(() => {
    getBuildings().then((b) => {
      setLocations(b);
      if (!params.from && b[0]) {
        setFromId(b[0].id);
      }
      if (!params.to && b[1]) {
        setToId(b[1].id);
      }
    });
  }, []);

  // Filtered locations based on search
  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return locations;
    const q = searchQuery.toLowerCase().trim();
    return locations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(q) ||
        loc.code.toLowerCase().includes(q) ||
        loc.department.toLowerCase().includes(q) ||
        loc.category.toLowerCase().includes(q)
    );
  }, [locations, searchQuery]);

  // Derive active start & destination objects
  const startLoc = useMemo(() => {
    if (fromId === CURRENT_LOCATION_KEY && userCoords) {
      return { lat: userCoords.lat, lng: userCoords.lng, name: "Your Current Location" };
    }
    const found = locations.find((l) => l.id === fromId);
    return found ? { lat: found.lat, lng: found.lng, name: found.name } : null;
  }, [fromId, userCoords, locations]);

  const destLoc = useMemo(() => {
    const found = locations.find((l) => l.id === toId);
    return found ? { lat: found.lat, lng: found.lng, name: found.name } : null;
  }, [toId, locations]);

  const fallbackRouteSuggestions = useMemo(() => {
    return locations
      .filter((location) => location.id !== fromId && location.id !== toId)
      .sort((a, b) => {
        const aScore = a.category === "facility" || a.category === "food" || a.category === "medical" ? 2 : 0;
        const bScore = b.category === "facility" || b.category === "food" || b.category === "medical" ? 2 : 0;
        return bScore - aScore;
      })
      .slice(0, 3)
      .map((location) => ({
        destinationId: location.id,
        reason: location.category === "food" ? "Useful stop for refreshments" : `Explore ${location.category} nearby`,
      }));
  }, [locations, fromId, toId]);

  useEffect(() => {
    if (!startLoc || locations.length === 0) return;

    let cancelled = false;
    setSuggestionsLoading(true);
    fetchRouteSuggestions({
      data: {
        startName: startLoc.name,
        destinationId: toId,
        buildings: locations.map((location) => ({
          id: location.id,
          name: location.name,
          code: location.code,
          department: location.department,
          category: location.category,
          facilities: location.facilities,
        })),
      },
    })
      .then((result) => {
        if (!cancelled) setRouteSuggestions(result.suggestions.length ? result.suggestions : fallbackRouteSuggestions);
      })
      .catch(() => {
        if (!cancelled) setRouteSuggestions(fallbackRouteSuggestions);
      })
      .finally(() => {
        if (!cancelled) setSuggestionsLoading(false);
      });

    return () => { cancelled = true; };
  }, [startLoc, toId, locations, fetchRouteSuggestions, fallbackRouteSuggestions]);

  // Keep the user's position fresh while the directions screen is open.
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLiveTracking(true);
        setGeoError(null);
      },
      () => setLiveTracking(false),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Request Browser Geolocation
  const handleUseMyLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser. Please select starting point manually.");
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        setFromId(CURRENT_LOCATION_KEY);
        setLiveTracking(true);
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        let msg = "Could not fetch your location.";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "Location permission denied. Please select your starting campus location manually below.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = "Location position unavailable. Please select your starting point manually.";
        } else if (err.code === err.TIMEOUT) {
          msg = "Location request timed out. Please try again or select manually.";
        }
        setGeoError(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Compute Walking Route
  const handleGetDirections = async () => {
    if (!startLoc || !destLoc) return;

    setRouteLoading(true);
    try {
      const res = await getWalkingDirections(startLoc, destLoc);
      setRouteResult(res);
    } catch {
      setGeoError("Failed to calculate route. Please try again.");
    } finally {
      setRouteLoading(false);
    }
  };

  // Auto calculate when params change or when start/dest update
  useEffect(() => {
    if (startLoc && destLoc && (params.from || params.to || userCoords)) {
      handleGetDirections();
    }
  }, [fromId, toId, userCoords]);

  // Swap Start and Destination
  const handleSwap = () => {
    if (fromId === CURRENT_LOCATION_KEY) return;
    const temp = fromId;
    setFromId(toId);
    setToId(temp);
  };

  // Reset Route
  const handleReset = () => {
    setRouteResult(null);
    setSearchQuery("");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header Banner */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Compass className="h-3.5 w-3.5" /> PSIT Kanpur Campus Directions
          </span>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            Campus Navigation
          </h1>
          <p className="text-sm text-muted-foreground">
            Get accurate walking routes and turn-by-turn guidance between PSIT buildings.
          </p>
        </div>

        {/* Quick Action Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleUseMyLocation}
            disabled={geoLoading}
            className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-all inline-flex items-center gap-2 shadow-sm"
          >
            <LocationPinIcon className={"h-4 w-4 " + (geoLoading ? "animate-spin" : "")} />
            {geoLoading ? "Locating..." : "Use My Location"}
          </button>

          {routeResult && (
            <button
              onClick={handleReset}
              className="rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors inline-flex items-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset Route
            </button>
          )}
        </div>
      </div>

      {/* Geolocation Alert / Warning */}
      {geoError && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-600 dark:text-amber-400">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Geolocation Alert</p>
            <p className="mt-0.5 text-xs text-amber-600/90 dark:text-amber-400/90">{geoError}</p>
          </div>
        </div>
      )}

      {/* Main Grid: Control Panel + Leaflet Map */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Search & Route Inputs */}
        <div className="space-y-6 lg:col-span-4">
          {/* Controls Card */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Navigation className="h-4 w-4 text-primary" /> Plan Your Route
            </h2>

            {/* Live Location Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search PSIT campus location..."
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-4 text-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-3 text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Start Location Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                <span>Start Location</span>
                {fromId === CURRENT_LOCATION_KEY && (
                  <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> {liveTracking ? "Live GPS" : "GPS Active"}
                  </span>
                )}
              </label>
              <div className="flex gap-2">
                <div className="relative w-full">
                  {fromId === CURRENT_LOCATION_KEY && (
                    <LocationPinIcon className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2" />
                  )}
                  <select
                    value={fromId}
                    onChange={(e) => setFromId(e.target.value)}
                    className={
                      "w-full rounded-xl border border-border bg-background py-2.5 pr-3 text-xs text-foreground focus:border-primary focus:outline-none " +
                      (fromId === CURRENT_LOCATION_KEY ? "pl-9" : "pl-3")
                    }
                  >
                    {userCoords && (
                      <option value={CURRENT_LOCATION_KEY}>My Current GPS Location</option>
                    )}
                    <optgroup label="PSIT Campus Locations">
                      {filteredLocations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name} ({loc.code})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center -my-1">
              <button
                onClick={handleSwap}
                disabled={fromId === CURRENT_LOCATION_KEY}
                title="Swap Start and Destination"
                className="grid h-8 w-8 place-items-center rounded-full border border-border bg-secondary hover:bg-muted transition-colors disabled:opacity-40"
              >
                <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground rotate-90" />
              </button>
            </div>

            {/* Destination Location Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Destination</label>
              <select
                value={toId}
                onChange={(e) => setToId(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                <optgroup label="PSIT Campus Locations">
                  {filteredLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.code})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-2">
              <button
                onClick={handleGetDirections}
                disabled={routeLoading}
                className="flex-1 btn-hero btn-hero-hover inline-flex items-center justify-center gap-2 py-3 text-xs font-semibold"
              >
                <Navigation className="h-4 w-4" />
                {routeLoading ? "Calculating..." : "Get Directions"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" /> AI route suggestions
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">Useful stops based on your route.</p>
              </div>
              {suggestionsLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
            </div>
            <div className="mt-3 space-y-2">
              {routeSuggestions.map((suggestion) => {
                const location = locations.find((item) => item.id === suggestion.destinationId);
                if (!location) return null;
                return (
                  <button
                    key={suggestion.destinationId}
                    onClick={() => setToId(suggestion.destinationId)}
                    className="w-full rounded-xl border border-border bg-card p-3 text-left transition hover:border-primary/50 hover:shadow-sm"
                  >
                    <div className="text-xs font-semibold text-foreground">{location.name}</div>
                    <div className="mt-1 text-[11px] text-muted-foreground">{suggestion.reason}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Route Stats Summary (If Calculated) */}
          {routeResult && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Walking Route Summary
                </h3>
                <span
                  className={
                    "rounded-full px-2.5 py-0.5 text-[10px] font-semibold " +
                    (routeResult.source === "osrm"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-blue-500/10 text-blue-600 dark:text-blue-400")
                  }
                >
                  {routeResult.source === "osrm" ? "OSRM Walking Route" : "PSIT Campus Pathway"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border/60 bg-secondary/50 p-3 text-center">
                  <Footprints className="mx-auto h-5 w-5 text-primary mb-1" />
                  <span className="text-xs text-muted-foreground">Distance</span>
                  <p className="text-lg font-bold text-foreground">
                    {formatDistance(routeResult.distanceMeters)}
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-secondary/50 p-3 text-center">
                  <Clock className="mx-auto h-5 w-5 text-amber-500 mb-1" />
                  <span className="text-xs text-muted-foreground">Est. Walking Time</span>
                  <p className="text-lg font-bold text-foreground">
                    {formatDuration(routeResult.durationSeconds)}
                  </p>
                </div>
              </div>

              {/* Turn-by-Turn Steps */}
              {routeResult.steps.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-foreground">Turn-by-Turn Directions</h4>
                  <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {routeResult.steps.map((step, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 rounded-xl border border-border/40 bg-background/60 p-2.5 text-xs text-foreground"
                      >
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <p
                            className="leading-snug"
                            dangerouslySetInnerHTML={{ __html: step.instruction }}
                          />
                          <span className="text-[10px] text-muted-foreground">
                            {step.distanceMeters > 0 ? `${step.distanceMeters} m` : ""}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Interactive Leaflet Map Canvas */}
        <div className="lg:col-span-8">
          <CampusMap
            buildings={filteredLocations}
            height="76vh"
            userLocation={userCoords}
            startLocation={startLoc}
            destinationLocation={destLoc}
            routePath={routeResult?.coordinates}
            onSelectStart={(b) => setFromId(b.id)}
            onSelectDestination={(b) => setToId(b.id)}
          />
        </div>
      </div>
    </div>
  );
}
