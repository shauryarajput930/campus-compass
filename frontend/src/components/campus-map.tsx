import { useEffect, useRef, useState } from "react";
import type { Building } from "@/lib/mock-data";
import { Link } from "@tanstack/react-router";
import { Heart, Navigation } from "lucide-react";
import { isFavorite, toggleFavorite } from "@/lib/favorites";

declare global {
  interface Window { google?: any; __ccMapsLoading?: Promise<void> }
}

const BROWSER_KEY = import.meta.env.VITE_GOOGLE_MAPS_BROWSER_KEY as string | undefined;
const TRACKING_ID = import.meta.env.VITE_GOOGLE_MAPS_TRACKING_ID as string | undefined;

function loadMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps) return Promise.resolve();
  if (window.__ccMapsLoading) return window.__ccMapsLoading;
  window.__ccMapsLoading = new Promise<void>((resolve, reject) => {
    if (!BROWSER_KEY) { reject(new Error("Google Maps browser key missing")); return; }
    (window as any).__ccInitMap = () => resolve();
    const s = document.createElement("script");
    const params = new URLSearchParams({ key: BROWSER_KEY, loading: "async", callback: "__ccInitMap", libraries: "geometry" });
    if (TRACKING_ID) params.set("channel", TRACKING_ID);
    s.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    s.async = true; s.defer = true;
    s.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(s);
  });
  return window.__ccMapsLoading;
}

interface Props {
  buildings: Building[];
  height?: string;
  showPopups?: boolean;
  centerId?: string;
  route?: { from: Building; to: Building; polyline?: string };
}

export function CampusMap({ buildings, height = "70vh", showPopups = true, centerId, route }: Props) {
  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const [selected, setSelected] = useState<Building | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [fav, setFav] = useState<string[]>([]);

  useEffect(() => { setFav(JSON.parse(localStorage.getItem("cc_favorites") || "[]")); }, []);

  useEffect(() => {
    let cancelled = false;
    loadMaps()
      .then(() => { if (!cancelled) setReady(true); })
      .catch((e) => setError(e.message));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!ready || !mapEl.current || buildings.length === 0) return;
    const google = window.google;
    const center = centerId
      ? buildings.find((b) => b.id === centerId) ?? buildings[0]
      : buildings[0];
    const map = new google.maps.Map(mapEl.current, {
      center: { lat: center.lat, lng: center.lng },
      zoom: 17,
      disableDefaultUI: false,
      streetViewControl: false,
      mapTypeControl: false,
      styles: document.documentElement.classList.contains("dark") ? darkMapStyle : [],
    });
    mapRef.current = map;

    const bounds = new google.maps.LatLngBounds();
    buildings.forEach((b) => {
      const marker = new google.maps.Marker({
        position: { lat: b.lat, lng: b.lng },
        map,
        title: b.name,
        animation: google.maps.Animation.DROP,
      });
      bounds.extend(marker.getPosition()!);
      if (showPopups) marker.addListener("click", () => setSelected(b));
    });
    if (buildings.length > 1 && !centerId) map.fitBounds(bounds, 60);

    if (route) {
      const path =
        route.polyline && google.maps.geometry?.encoding
          ? google.maps.geometry.encoding.decodePath(route.polyline)
          : [
              { lat: route.from.lat, lng: route.from.lng },
              { lat: route.to.lat, lng: route.to.lng },
            ];
      const line = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: "#7c3aed",
        strokeOpacity: 0.9,
        strokeWeight: 5,
      });
      line.setMap(map);
      const rb = new google.maps.LatLngBounds();
      rb.extend({ lat: route.from.lat, lng: route.from.lng });
      rb.extend({ lat: route.to.lat, lng: route.to.lng });
      map.fitBounds(rb, 80);
    }
  }, [ready, buildings, centerId, route, showPopups]);

  if (error) {
    return (
      <div className="grid place-items-center rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground" style={{ height }}>
        Map unavailable: {error}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border shadow-soft" style={{ height }}>
      <div ref={mapEl} className="h-full w-full" />
      {!ready && (
        <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">Loading map…</div>
      )}
      {selected && (
        <div className="absolute bottom-4 left-4 right-4 mx-auto max-w-md overflow-hidden rounded-2xl glass-strong shadow-glow">
          <img src={selected.image} alt={selected.name} className="h-40 w-full object-cover" />
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs text-muted-foreground">{selected.code} · {selected.department}</div>
                <h3 className="text-lg font-semibold">{selected.name}</h3>
              </div>
              <button onClick={() => { const n = toggleFavorite(selected.id); setFav(n); }}
                className="grid h-9 w-9 place-items-center rounded-lg border border-border">
                <Heart className={"h-4 w-4 " + (fav.includes(selected.id) ? "fill-red-500 text-red-500" : "")} />
              </button>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{selected.description}</p>
            <div className="mt-3 flex gap-2">
              <Link to="/buildings/$id" params={{ id: selected.id }} className="flex-1 rounded-lg border border-border px-3 py-2 text-center text-sm hover:bg-secondary">Details</Link>
              <Link to="/navigate" search={{ to: selected.id }} className="flex-1 rounded-lg btn-hero btn-hero-hover px-3 py-2 text-center text-sm inline-flex items-center justify-center gap-1">
                <Navigation className="h-4 w-4" /> Navigate
              </Link>
            </div>
            <button className="mt-2 w-full text-xs text-muted-foreground hover:text-foreground" onClick={() => setSelected(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

const darkMapStyle: any[] = [
  { elementType: "geometry", stylers: [{ color: "#1f2937" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#111827" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#9ca3af" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#374151" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
];
