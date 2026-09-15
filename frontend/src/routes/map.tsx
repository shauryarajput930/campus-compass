import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getBuildings } from "@/lib/api";
import type { Building } from "@/lib/mock-data";
import { CampusMap } from "@/components/campus-map";
import { LocationPinIcon } from "@/components/location-pin-icon";
import { haversineDistance } from "@/lib/osrm-routing";
import { Search, SlidersHorizontal } from "lucide-react";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "PSIT Kanpur Campus Map — Campus Compass" },
      {
        name: "description",
        content: "Interactive Leaflet campus map for PSIT Kanpur with markers, building photos and details.",
      },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const [b, setB] = useState<Building[]>([]);
  const [cat, setCat] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [radius, setRadius] = useState(1000);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    getBuildings().then(setB);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Location is not supported by this browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => setLocationError("Location updates are unavailable. Check browser location permission."),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const filtered = b.filter((location) => {
    const matchesCategory = cat === "all" || location.category === cat;
    const searchText = `${location.name} ${location.code} ${location.department} ${location.category} ${location.facilities.join(" ")}`.toLowerCase();
    const matchesQuery = !query.trim() || searchText.includes(query.toLowerCase().trim());
    const distance = userLocation ? haversineDistance(userLocation, location) : Infinity;
    const matchesRadius = !nearbyOnly || (!!userLocation && distance <= radius);
    return matchesCategory && matchesQuery && matchesRadius;
  });

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Location is not supported by this browser.");
      return;
    }
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setNearbyOnly(true);
      },
      () => setLocationError("Location permission was denied. Choose a category or search instead."),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">PSIT Campus Map</h1>
          <p className="text-muted-foreground">
            Tap any marker to explore building details, photos, and get walking directions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "All" },
            { id: "academic", label: "Academic" },
            { id: "admin", label: "Admin" },
            { id: "hostel", label: "Hostel" },
            { id: "sports", label: "Sports" },
            { id: "food", label: "Food" },
            { id: "medical", label: "Medical" },
            { id: "facility", label: "Facilities" },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={
                "rounded-full border px-3 py-1.5 text-xs transition-colors " +
                (cat === c.id
                  ? "border-primary bg-primary text-primary-foreground font-semibold"
                  : "border-border bg-card text-foreground hover:bg-secondary")
              }
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-5 rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-60 flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find a canteen, ATM, or lab..."
              className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <button
            onClick={requestLocation}
            className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/20"
          >
            <LocationPinIcon className="h-4 w-4" /> Use my location
          </button>
          <button
            onClick={() => setNearbyOnly((value) => !value)}
            className={(nearbyOnly ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background") + " inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold"}
          >
            <SlidersHorizontal className="h-4 w-4" /> Nearby only
          </button>
          <select
            value={radius}
            onChange={(event) => setRadius(Number(event.target.value))}
            disabled={!nearbyOnly}
            className="rounded-xl border border-border bg-background px-3 py-2 text-xs disabled:opacity-50"
          >
            <option value={500}>Within 500 m</option>
            <option value={1000}>Within 1 km</option>
            <option value={2000}>Within 2 km</option>
            <option value={5000}>Within 5 km</option>
          </select>
        </div>
        {locationError && <p className="mt-2 text-xs text-amber-600">{locationError}</p>}
        {nearbyOnly && !userLocation && !locationError && <p className="mt-2 text-xs text-muted-foreground">Use your location to show facilities within the selected radius.</p>}
        <p className="mt-2 text-xs text-muted-foreground">Showing {filtered.length} of {b.length} campus locations.</p>
      </div>
      <CampusMap buildings={filtered} userLocation={userLocation} height="75vh" />
    </div>
  );
}
