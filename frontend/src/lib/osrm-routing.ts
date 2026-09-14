/**
 * Free OSRM Walking Route Service for PSIT Campus Navigation
 * Uses Open Source Routing Machine (OSRM) foot routing engine.
 * Fallbacks to internal campus path graph when OSRM is unreachable.
 */

import { INTERNAL_CAMPUS_PATH_NODES } from "./psit-campus-config";

export interface LatLngPoint {
  lat: number;
  lng: number;
}

export interface WalkingRouteStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
}

export interface OsrmRouteResult {
  distanceMeters: number;
  durationSeconds: number;
  coordinates: [number, number][]; // [lat, lng] array for Leaflet polyline
  steps: WalkingRouteStep[];
  source: "osrm" | "campus-internal";
  warning?: string;
}

/**
 * Calculate distance between two lat/lng points using Haversine formula (in meters)
 */
export function haversineDistance(a: LatLngPoint, b: LatLngPoint): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Calculate compass direction between two points
 */
function getBearingDirection(a: LatLngPoint, b: LatLngPoint): string {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const y = Math.sin(toRad(b.lng - a.lng)) * Math.cos(toRad(b.lat));
  const x =
    Math.cos(toRad(a.lat)) * Math.sin(toRad(b.lat)) -
    Math.sin(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.cos(toRad(b.lng - a.lng));
  const bearing = (toDeg(Math.atan2(y, x)) + 360) % 360;
  const dirs = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"];
  return dirs[Math.round(bearing / 45) % 8];
}

/**
 * Format meters into human-readable string (e.g. 350 m or 1.2 km)
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Format duration into human-readable string (e.g. 3 mins or 1 hr 10 mins)
 */
export function formatDuration(seconds: number): string {
  const mins = Math.ceil(seconds / 60);
  if (mins < 60) {
    return `${mins} min${mins === 1 ? "" : "s"}`;
  }
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs} hr${hrs === 1 ? "" : "s"}${remMins > 0 ? ` ${remMins} min` : ""}`;
}

/**
 * Build internal campus fallback route connecting through nearest campus path waypoints
 */
function buildCampusFallbackRoute(
  origin: LatLngPoint,
  destination: LatLngPoint,
  warningMessage?: string
): OsrmRouteResult {
  const directMeters = haversineDistance(origin, destination);
  const durationSeconds = Math.max(45, Math.round((directMeters / 1.3) * 60)); // Average walking speed ~1.3 m/s

  // Find nearest campus waypoints if available to create a realistic path
  const path: [number, number][] = [[origin.lat, origin.lng]];

  // Find closest waypoint to origin and destination
  let closestOriginNode = INTERNAL_CAMPUS_PATH_NODES[0];
  let minOriginDist = Infinity;
  let closestDestNode = INTERNAL_CAMPUS_PATH_NODES[0];
  let minDestDist = Infinity;

  for (const node of INTERNAL_CAMPUS_PATH_NODES) {
    const dOrig = haversineDistance(origin, node);
    if (dOrig < minOriginDist) {
      minOriginDist = dOrig;
      closestOriginNode = node;
    }

    const dDest = haversineDistance(destination, node);
    if (dDest < minDestDist) {
      minDestDist = dDest;
      closestDestNode = node;
    }
  }

  // If origin and destination are reasonably connected via waypoints, interpolate path
  if (minOriginDist < 300 && minDestDist < 300 && closestOriginNode.id !== closestDestNode.id) {
    path.push([closestOriginNode.lat, closestOriginNode.lng]);
    // Midpoint node if needed
    const midLat = (closestOriginNode.lat + closestDestNode.lat) / 2;
    const midLng = (closestOriginNode.lng + closestDestNode.lng) / 2;
    path.push([midLat, midLng]);
    path.push([closestDestNode.lat, closestDestNode.lng]);
  }

  path.push([destination.lat, destination.lng]);

  const heading = getBearingDirection(origin, destination);

  const steps: WalkingRouteStep[] = [
    {
      instruction: `Head <b>${heading}</b> on the campus pathway`,
      distanceMeters: Math.round(directMeters * 0.2),
      durationSeconds: Math.round(durationSeconds * 0.2),
    },
    {
      instruction: `Continue straight along the central PSIT walkway`,
      distanceMeters: Math.round(directMeters * 0.6),
      durationSeconds: Math.round(durationSeconds * 0.6),
    },
    {
      instruction: `Arrive at destination`,
      distanceMeters: Math.round(directMeters * 0.2),
      durationSeconds: Math.round(durationSeconds * 0.2),
    },
  ];

  return {
    distanceMeters: Math.round(directMeters),
    durationSeconds,
    coordinates: path,
    steps,
    source: "campus-internal",
    warning: warningMessage,
  };
}

/**
 * Fetch walking route from OSRM public API
 */
export async function getWalkingDirections(
  origin: LatLngPoint,
  destination: LatLngPoint
): Promise<OsrmRouteResult> {
  const osrmUrl = `https://router.project-osrm.org/route/v1/foot/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(osrmUrl, {
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));

    if (!response.ok) {
      return buildCampusFallbackRoute(origin, destination, "OSRM service offline. Displaying campus path.");
    }

    const data = await response.json();
    const route = data.routes?.[0];

    if (!route || !route.geometry?.coordinates) {
      return buildCampusFallbackRoute(origin, destination, "Direct route calculated using campus pathways.");
    }

    // Convert GeoJSON [lng, lat] coordinates to Leaflet [lat, lng]
    const coordinates: [number, number][] = route.geometry.coordinates.map(
      (pt: [number, number]) => [pt[1], pt[0]]
    );

    // Parse turn-by-turn steps from OSRM
    const steps: WalkingRouteStep[] = [];
    const legs = route.legs ?? [];

    for (const leg of legs) {
      for (const step of leg.steps ?? []) {
        const name = step.name ? ` on <b>${step.name}</b>` : "";
        const modifier = step.maneuver?.modifier ? ` ${step.maneuver.modifier}` : "";
        const type = step.maneuver?.type ?? "turn";

        let text = "Continue along campus path";
        if (type === "depart") {
          text = `Depart and head ${modifier || "forward"}${name}`;
        } else if (type === "arrive") {
          text = `Arrive at your campus destination`;
        } else if (type === "turn" || type === "end of road") {
          text = `Turn ${modifier || "slightly"}${name}`;
        } else if (type === "continue") {
          text = `Continue straight${name}`;
        }

        steps.push({
          instruction: text,
          distanceMeters: Math.round(step.distance ?? 0),
          durationSeconds: Math.round(step.duration ?? 0),
        });
      }
    }

    return {
      distanceMeters: Math.round(route.distance),
      durationSeconds: Math.round(route.duration),
      coordinates,
      steps: steps.length > 0 ? steps : buildCampusFallbackRoute(origin, destination).steps,
      source: "osrm",
    };
  } catch {
    return buildCampusFallbackRoute(
      origin,
      destination,
      "Network unreachable. Displaying internal campus walking route."
    );
  }
}
