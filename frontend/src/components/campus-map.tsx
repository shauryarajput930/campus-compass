import { useEffect, useRef, useState } from "react";
import type { Building } from "@/lib/mock-data";
import { MAP_TILE_CONFIG, PSIT_CAMPUS_CENTER } from "@/lib/psit-campus-config";
import { Link } from "@tanstack/react-router";
import { Heart, Maximize2, Minimize2, Navigation, ZoomIn, ZoomOut, MapPin, Flag } from "lucide-react";
import { toggleFavorite } from "@/lib/favorites";

interface Props {
  buildings: Building[];
  height?: string;
  showPopups?: boolean;
  centerId?: string;
  userLocation?: { lat: number; lng: number } | null;
  startLocation?: { lat: number; lng: number; name?: string } | null;
  destinationLocation?: { lat: number; lng: number; name?: string } | null;
  routePath?: [number, number][] | null;
  onSelectStart?: (building: Building) => void;
  onSelectDestination?: (building: Building) => void;
  editableCoordinates?: boolean;
  onCoordinateChange?: (coordinates: { lat: number; lng: number }) => void;
}

export function CampusMap({
  buildings,
  height = "70vh",
  showPopups = true,
  centerId,
  userLocation,
  startLocation,
  destinationLocation,
  routePath,
  onSelectStart,
  onSelectDestination,
  editableCoordinates = false,
  onCoordinateChange,
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const hasFittedInitialBoundsRef = useRef(false);

  const [selected, setSelected] = useState<Building | null>(null);
  const [ready, setReady] = useState(false);
  const [fav, setFav] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setFav(JSON.parse(localStorage.getItem("cc_favorites") || "[]"));
  }, []);

  useEffect(() => {
    if (!ready || !mapInstanceRef.current || !editableCoordinates || !onCoordinateChange) return;
    const map = mapInstanceRef.current;
    const handleMapClick = (event: any) => {
      onCoordinateChange({ lat: event.latlng.lat, lng: event.latlng.lng });
    };
    map.on("click", handleMapClick);
    return () => map.off("click", handleMapClick);
  }, [ready, editableCoordinates, onCoordinateChange]);

  // Initialize Leaflet Map (SSR safe)
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    async function initLeaflet() {
      const L = await import("leaflet");

      if (!isMounted || !mapContainerRef.current) return;

      // Fix default marker icon asset issue in Leaflet with Vite
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const initialCenter = centerId
        ? buildings.find((b) => b.id === centerId) ?? PSIT_CAMPUS_CENTER
        : PSIT_CAMPUS_CENTER;

      const map = L.map(mapContainerRef.current, {
        center: [initialCenter.lat, initialCenter.lng],
        zoom: PSIT_CAMPUS_CENTER.zoom,
        minZoom: PSIT_CAMPUS_CENTER.minZoom,
        maxZoom: PSIT_CAMPUS_CENTER.maxZoom,
        zoomControl: false,
      });

      // Add OpenStreetMap / MapTiler tile layer
      L.tileLayer(MAP_TILE_CONFIG.url, {
        attribution: MAP_TILE_CONFIG.attribution,
        maxZoom: MAP_TILE_CONFIG.maxZoom,
        ...(MAP_TILE_CONFIG.url.includes("{s}") ? { subdomains: MAP_TILE_CONFIG.subdomains } : {}),
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      setReady(true);
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers and Polyline when inputs change
  useEffect(() => {
    if (!ready || !mapInstanceRef.current || typeof window === "undefined") return;

    async function renderMapLayers() {
      const L = await import("leaflet");
      const map = mapInstanceRef.current;
      const markersGroup = markersLayerRef.current;

      if (!map || !markersGroup) return;

      markersGroup.clearLayers();

      if (polylineRef.current) {
        map.removeLayer(polylineRef.current);
        polylineRef.current = null;
      }

      const bounds = L.latLngBounds([]);

      // 1. Render PSIT Campus Locations
      buildings.forEach((b) => {
        const markerColor = getCategoryColor(b.category);
        const iconHtml = `
          <div style="
            background-color: ${markerColor};
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 11px;
            cursor: pointer;
            transition: transform 0.2s ease;
          " title="${b.name}">
            ${b.icon
              ? `<img src="${b.icon}" alt="" style="width: 22px; height: 22px; border-radius: 5px; object-fit: cover;" />`
              : b.code.slice(0, 3)}
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: "custom-leaflet-marker",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([b.lat, b.lng], { icon: customIcon }).addTo(markersGroup);
        bounds.extend([b.lat, b.lng]);

        if (showPopups) {
          marker.on("click", () => {
            setSelected(b);
          });
        }
      });

      // 2. Render User Location (Blue pulsing dot)
      if (userLocation) {
        const userIcon = L.divIcon({
          html: `<div class="user-location-marker" aria-label="Your live location">
            <span class="user-location-marker__pulse"></span>
            <span class="user-location-marker__avatar" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5.5 20c.7-4 2.8-6 6.5-6s5.8 2 6.5 6" />
              </svg>
            </span>
            <svg class="user-location-marker__arrow" viewBox="0 0 32 32" aria-hidden="true">
              <path d="M16 3 27 27l-11-5-11 5L16 3Z" />
            </svg>
          </div>`,
          className: "custom-leaflet-marker",
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        });
        L.marker([userLocation.lat, userLocation.lng], { icon: userIcon, zIndexOffset: 1000 })
          .addTo(markersGroup)
          .bindPopup("<b>📍 Your Current Location</b>");
        bounds.extend([userLocation.lat, userLocation.lng]);
      }

      // 3. Render Start Location Marker (Green Pin)
      if (startLocation) {
        const startIcon = L.divIcon({
          html: `
            <div style="
              background: #22c55e;
              color: white;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 700;
              box-shadow: 0 4px 12px rgba(34,197,94,0.5);
              border: 2px solid white;
              display: flex;
              align-items: center;
              gap: 4px;
              white-space: nowrap;
            ">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"/></svg>
              Start
            </div>
          `,
          className: "custom-leaflet-marker",
          iconSize: [60, 24],
          iconAnchor: [30, 12],
        });
        L.marker([startLocation.lat, startLocation.lng], { icon: startIcon, zIndexOffset: 900 })
          .addTo(markersGroup)
          .bindPopup(`<b>Start:</b> ${startLocation.name || "Selected Location"}`);
        bounds.extend([startLocation.lat, startLocation.lng]);
      }

      // 4. Render Destination Marker (Red Pin)
      if (destinationLocation) {
        const destIcon = L.divIcon({
          html: `
            <div style="
              background: #ef4444;
              color: white;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 700;
              box-shadow: 0 4px 12px rgba(239,68,68,0.5);
              border: 2px solid white;
              display: flex;
              align-items: center;
              gap: 4px;
              white-space: nowrap;
            ">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 2y20M2 12h20"/></svg>
              Destination
            </div>
          `,
          className: "custom-leaflet-marker",
          iconSize: [85, 24],
          iconAnchor: [42, 12],
        });
        L.marker([destinationLocation.lat, destinationLocation.lng], { icon: destIcon, zIndexOffset: 900 })
          .addTo(markersGroup)
          .bindPopup(`<b>Destination:</b> ${destinationLocation.name || "Selected Destination"}`);
        bounds.extend([destinationLocation.lat, destinationLocation.lng]);
      }

      // 5. Render Route & Fit Map Bounds (Blue line removed per user request)
      if (routePath && routePath.length > 0) {
        const routeBounds = L.latLngBounds(routePath);
        map.fitBounds(routeBounds, { padding: [50, 50] });
      } else if (centerId) {
        const target = buildings.find((b) => b.id === centerId);
        if (target) {
          map.setView([target.lat, target.lng], 18);
        }
      } else if (bounds.isValid() && buildings.length > 1 && !hasFittedInitialBoundsRef.current) {
        map.fitBounds(bounds, { padding: [40, 40] });
        hasFittedInitialBoundsRef.current = true;
      }
    }

    renderMapLayers();
  }, [ready, buildings, centerId, userLocation, startLocation, destinationLocation, routePath, showPopups]);

  // Zoom Controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 200);
  };

  return (
    <div
      className={
        "relative overflow-hidden rounded-2xl border border-border shadow-soft transition-all duration-300 " +
        (isFullscreen ? "fixed inset-0 z-50 rounded-none border-none h-screen w-screen" : "")
      }
      style={{ height: isFullscreen ? "100vh" : height }}
    >
      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="h-full w-full bg-card" />

      {!ready && (
        <div className="absolute inset-0 grid place-items-center bg-card/80 backdrop-blur text-sm text-muted-foreground z-10">
          Loading PSIT Campus Map…
        </div>
      )}

      {editableCoordinates && ready && (
        <div className="absolute bottom-4 left-4 z-20 rounded-xl border border-primary/30 bg-card/90 px-3 py-2 text-xs font-medium text-foreground shadow-md backdrop-blur">
          Click anywhere on the map to update this location
        </div>
      )}

      {/* Floating Zoom & Fullscreen Map Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="grid h-10 w-10 place-items-center rounded-xl glass-strong border border-border/60 shadow-md hover:bg-secondary transition-colors text-foreground"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="grid h-10 w-10 place-items-center rounded-xl glass-strong border border-border/60 shadow-md hover:bg-secondary transition-colors text-foreground"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Map"}
          className="grid h-10 w-10 place-items-center rounded-xl glass-strong border border-border/60 shadow-md hover:bg-secondary transition-colors text-foreground"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Interactive Location Detail Modal Popup */}
      {selected && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-30 overflow-hidden rounded-2xl glass-strong border border-border shadow-glow animate-in fade-in slide-in-from-bottom-4">
          <div className="relative">
            <img src={selected.image} alt={selected.name} className="h-36 w-full object-cover" />
            <button
              onClick={() => setSelected(null)}
              className="absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white hover:bg-black"
            >
              ✕
            </button>
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {selected.code} · {selected.category.toUpperCase()}
                </span>
                <h3 className="mt-1 text-base font-bold text-foreground">{selected.name}</h3>
                <p className="text-xs text-muted-foreground">{selected.department}</p>
              </div>
              <button
                onClick={() => {
                  const n = toggleFavorite(selected.id);
                  setFav(n);
                }}
                className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-secondary"
              >
                <Heart className={"h-4 w-4 " + (fav.includes(selected.id) ? "fill-red-500 text-red-500" : "")} />
              </button>
            </div>

            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{selected.description}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {onSelectStart && (
                <button
                  onClick={() => {
                    onSelectStart(selected);
                    setSelected(null);
                  }}
                  className="flex-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-center text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 inline-flex items-center justify-center gap-1"
                >
                  <MapPin className="h-3.5 w-3.5" /> Start Here
                </button>
              )}

              {onSelectDestination && (
                <button
                  onClick={() => {
                    onSelectDestination(selected);
                    setSelected(null);
                  }}
                  className="flex-1 rounded-xl btn-hero btn-hero-hover px-3 py-2 text-center text-xs inline-flex items-center justify-center gap-1"
                >
                  <Flag className="h-3.5 w-3.5" /> Direct Here
                </button>
              )}

              <Link
                to="/buildings/$id"
                params={{ id: selected.id }}
                className="rounded-xl border border-border px-3 py-2 text-center text-xs font-medium hover:bg-secondary"
              >
                Details
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getCategoryColor(category: string): string {
  switch (category) {
    case "academic":
      return "#6366f1"; // Indigo
    case "admin":
      return "#a855f7"; // Purple
    case "hostel":
      return "#f59e0b"; // Amber
    case "food":
      return "#f97316"; // Orange
    case "sports":
      return "#10b981"; // Emerald
    case "medical":
      return "#ef4444"; // Red
    case "facility":
    default:
      return "#3b82f6"; // Blue
  }
}
