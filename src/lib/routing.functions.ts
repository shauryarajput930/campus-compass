import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const LatLng = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
}

export interface RouteResult {
  distanceMeters: number;
  durationSeconds: number;
  polyline: string;
  steps: RouteStep[];
  source: "google" | "fallback";
  warning?: string;
}

// Encode a simple 2-point path to Google's polyline algorithm so the map
// component (which decodes with google.maps.geometry) can render the fallback
// exactly like a real route.
function encodePolyline(points: { lat: number; lng: number }[]): string {
  let out = "";
  let prevLat = 0;
  let prevLng = 0;
  for (const p of points) {
    const lat = Math.round(p.lat * 1e5);
    const lng = Math.round(p.lng * 1e5);
    out += encodeSigned(lat - prevLat) + encodeSigned(lng - prevLng);
    prevLat = lat;
    prevLng = lng;
  }
  return out;
}
function encodeSigned(v: number): string {
  let value = v < 0 ? ~(v << 1) : v << 1;
  let out = "";
  while (value >= 0x20) {
    out += String.fromCharCode((0x20 | (value & 0x1f)) + 63);
    value >>= 5;
  }
  out += String.fromCharCode(value + 63);
  return out;
}

function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371e3;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function compass(a: { lat: number; lng: number }, b: { lat: number; lng: number }): string {
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

function buildFallback(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  mode: "WALK" | "DRIVE" | "BICYCLE" | "TWO_WHEELER",
  warning?: string,
): RouteResult {
  const meters = haversine(origin, destination);
  // meters/minute pace by mode
  const pace = mode === "WALK" ? 80 : mode === "BICYCLE" ? 250 : 500;
  const durationSeconds = Math.max(60, Math.round((meters / pace) * 60));
  const heading = compass(origin, destination);
  const steps: RouteStep[] = [
    {
      instruction: `Head <b>${heading}</b> from your starting point`,
      distanceMeters: Math.round(meters * 0.15),
      durationSeconds: Math.round(durationSeconds * 0.15),
    },
    {
      instruction: `Continue along the main campus pathway`,
      distanceMeters: Math.round(meters * 0.7),
      durationSeconds: Math.round(durationSeconds * 0.7),
    },
    {
      instruction: `Arrive at your destination`,
      distanceMeters: Math.round(meters * 0.15),
      durationSeconds: Math.round(durationSeconds * 0.15),
    },
  ];
  return {
    distanceMeters: Math.round(meters),
    durationSeconds,
    polyline: encodePolyline([origin, destination]),
    steps,
    source: "fallback",
    warning,
  };
}

export const computeRoute = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        origin: LatLng,
        destination: LatLng,
        mode: z.enum(["WALK", "DRIVE", "BICYCLE", "TWO_WHEELER"]).default("WALK"),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<RouteResult> => {
    const key = process.env.AI_GATEWAY_KEY;
    const gmKey = process.env.GOOGLE_MAPS_API_KEY;
    const directionsUrl = process.env.DIRECTIONS_API_URL || "https://maps.googleapis.com/maps/api/directions/json";

    // Missing credentials — degrade to a simplified route instead of throwing.
    if (!key || !gmKey) {
      return buildFallback(data.origin, data.destination, data.mode, "Directions service unavailable — showing simplified route.");
    }

    const body = {
      origin: { location: { latLng: { latitude: data.origin.lat, longitude: data.origin.lng } } },
      destination: {
        location: { latLng: { latitude: data.destination.lat, longitude: data.destination.lng } },
      },
      travelMode: data.mode,
      polylineQuality: "HIGH_QUALITY",
      computeAlternativeRoutes: false,
      languageCode: "en-US",
      units: "METRIC",
    };

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(directionsUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "X-Connection-Api-Key": gmKey,
          "Content-Type": "application/json",
          "X-Goog-FieldMask":
            "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline,routes.legs.steps.navigationInstruction,routes.legs.steps.distanceMeters,routes.legs.steps.staticDuration",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      }).finally(() => clearTimeout(timer));

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error(`Routes API failed [${res.status}]: ${text.slice(0, 300)}`);
        return buildFallback(
          data.origin,
          data.destination,
          data.mode,
          `Live directions unavailable (HTTP ${res.status}). Showing simplified route.`,
        );
      }

      const json = (await res.json()) as any;
      const route = json.routes?.[0];
      if (!route) {
        return buildFallback(data.origin, data.destination, data.mode, "No route returned by directions service. Showing simplified route.");
      }

      const steps: RouteStep[] = [];
      for (const leg of route.legs ?? []) {
        for (const s of leg.steps ?? []) {
          steps.push({
            instruction: s.navigationInstruction?.instructions ?? "Continue",
            distanceMeters: s.distanceMeters ?? 0,
            durationSeconds: parseInt(String(s.staticDuration ?? "0s").replace("s", ""), 10) || 0,
          });
        }
      }

      return {
        distanceMeters: route.distanceMeters ?? 0,
        durationSeconds: parseInt(String(route.duration ?? "0s").replace("s", ""), 10) || 0,
        polyline: route.polyline?.encodedPolyline ?? encodePolyline([data.origin, data.destination]),
        steps: steps.length > 0 ? steps : buildFallback(data.origin, data.destination, data.mode).steps,
        source: "google",
      };
    } catch (err: any) {
      console.error("Routes API exception:", err?.message || err);
      const reason = err?.name === "AbortError" ? "timed out" : "unreachable";
      return buildFallback(
        data.origin,
        data.destination,
        data.mode,
        `Directions service ${reason}. Showing simplified route.`,
      );
    }
  });
