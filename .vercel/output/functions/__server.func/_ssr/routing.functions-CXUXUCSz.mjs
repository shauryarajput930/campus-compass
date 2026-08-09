import { St as object, lt as _enum, xt as number } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { n as createServerFn } from "./server-BFRsKcKu.mjs";
import { t as createServerRpc } from "./createServerRpc-DbuEcjY5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routing.functions-CXUXUCSz.js
var LatLng = object({
	lat: number().min(-90).max(90),
	lng: number().min(-180).max(180)
});
function encodePolyline(points) {
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
function encodeSigned(v) {
	let value = v < 0 ? ~(v << 1) : v << 1;
	let out = "";
	while (value >= 32) {
		out += String.fromCharCode((32 | value & 31) + 63);
		value >>= 5;
	}
	out += String.fromCharCode(value + 63);
	return out;
}
function haversine(a, b) {
	const R = 6371e3;
	const toRad = (d) => d * Math.PI / 180;
	const dLat = toRad(b.lat - a.lat);
	const dLng = toRad(b.lng - a.lng);
	const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
	return 2 * R * Math.asin(Math.sqrt(h));
}
function compass(a, b) {
	const toRad = (d) => d * Math.PI / 180;
	const toDeg = (r) => r * 180 / Math.PI;
	const y = Math.sin(toRad(b.lng - a.lng)) * Math.cos(toRad(b.lat));
	const x = Math.cos(toRad(a.lat)) * Math.sin(toRad(b.lat)) - Math.sin(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.cos(toRad(b.lng - a.lng));
	const bearing = (toDeg(Math.atan2(y, x)) + 360) % 360;
	return [
		"north",
		"north-east",
		"east",
		"south-east",
		"south",
		"south-west",
		"west",
		"north-west"
	][Math.round(bearing / 45) % 8];
}
function buildFallback(origin, destination, mode, warning) {
	const meters = haversine(origin, destination);
	const durationSeconds = Math.max(60, Math.round(meters / (mode === "WALK" ? 80 : mode === "BICYCLE" ? 250 : 500) * 60));
	const steps = [
		{
			instruction: `Head <b>${compass(origin, destination)}</b> from your starting point`,
			distanceMeters: Math.round(meters * .15),
			durationSeconds: Math.round(durationSeconds * .15)
		},
		{
			instruction: `Continue along the main campus pathway`,
			distanceMeters: Math.round(meters * .7),
			durationSeconds: Math.round(durationSeconds * .7)
		},
		{
			instruction: `Arrive at your destination`,
			distanceMeters: Math.round(meters * .15),
			durationSeconds: Math.round(durationSeconds * .15)
		}
	];
	return {
		distanceMeters: Math.round(meters),
		durationSeconds,
		polyline: encodePolyline([origin, destination]),
		steps,
		source: "fallback",
		warning
	};
}
var computeRoute_createServerFn_handler = createServerRpc({
	id: "98f4c1ec5adcb96ffa660ce6f8dbfe568b087c78707c43f7c8bb57f3e1fa1ae3",
	name: "computeRoute",
	filename: "src/lib/routing.functions.ts"
}, (opts) => computeRoute.__executeServer(opts));
var computeRoute = createServerFn({ method: "POST" }).inputValidator((input) => object({
	origin: LatLng,
	destination: LatLng,
	mode: _enum([
		"WALK",
		"DRIVE",
		"BICYCLE",
		"TWO_WHEELER"
	]).default("WALK")
}).parse(input)).handler(computeRoute_createServerFn_handler, async ({ data }) => {
	const key = process.env.AI_GATEWAY_KEY;
	const gmKey = process.env.GOOGLE_MAPS_API_KEY;
	const directionsUrl = process.env.DIRECTIONS_API_URL || "https://maps.googleapis.com/maps/api/directions/json";
	if (!key || !gmKey) return buildFallback(data.origin, data.destination, data.mode, "Directions service unavailable — showing simplified route.");
	const body = {
		origin: { location: { latLng: {
			latitude: data.origin.lat,
			longitude: data.origin.lng
		} } },
		destination: { location: { latLng: {
			latitude: data.destination.lat,
			longitude: data.destination.lng
		} } },
		travelMode: data.mode,
		polylineQuality: "HIGH_QUALITY",
		computeAlternativeRoutes: false,
		languageCode: "en-US",
		units: "METRIC"
	};
	try {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), 8e3);
		const res = await fetch(directionsUrl, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${key}`,
				"X-Connection-Api-Key": gmKey,
				"Content-Type": "application/json",
				"X-Goog-FieldMask": "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline,routes.legs.steps.navigationInstruction,routes.legs.steps.distanceMeters,routes.legs.steps.staticDuration"
			},
			body: JSON.stringify(body),
			signal: controller.signal
		}).finally(() => clearTimeout(timer));
		if (!res.ok) {
			const text = await res.text().catch(() => "");
			console.error(`Routes API failed [${res.status}]: ${text.slice(0, 300)}`);
			return buildFallback(data.origin, data.destination, data.mode, `Live directions unavailable (HTTP ${res.status}). Showing simplified route.`);
		}
		const route = (await res.json()).routes?.[0];
		if (!route) return buildFallback(data.origin, data.destination, data.mode, "No route returned by directions service. Showing simplified route.");
		const steps = [];
		for (const leg of route.legs ?? []) for (const s of leg.steps ?? []) steps.push({
			instruction: s.navigationInstruction?.instructions ?? "Continue",
			distanceMeters: s.distanceMeters ?? 0,
			durationSeconds: parseInt(String(s.staticDuration ?? "0s").replace("s", ""), 10) || 0
		});
		return {
			distanceMeters: route.distanceMeters ?? 0,
			durationSeconds: parseInt(String(route.duration ?? "0s").replace("s", ""), 10) || 0,
			polyline: route.polyline?.encodedPolyline ?? encodePolyline([data.origin, data.destination]),
			steps: steps.length > 0 ? steps : buildFallback(data.origin, data.destination, data.mode).steps,
			source: "google"
		};
	} catch (err) {
		console.error("Routes API exception:", err?.message || err);
		const reason = err?.name === "AbortError" ? "timed out" : "unreachable";
		return buildFallback(data.origin, data.destination, data.mode, `Directions service ${reason}. Showing simplified route.`);
	}
});
//#endregion
export { computeRoute_createServerFn_handler };
