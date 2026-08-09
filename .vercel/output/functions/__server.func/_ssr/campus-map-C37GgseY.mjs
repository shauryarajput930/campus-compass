import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { E as Navigation, H as Heart } from "../_libs/lucide-react.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as toggleFavorite } from "./favorites-D3aR_5-0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/campus-map-C37GgseY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var BROWSER_KEY = "AIzaSyBmvJph4LmrbtW7skeczzpBIyb9WWzFKo4";
var TRACKING_ID = "49d24fc4e7b4df9c150c16525c824a2b";
function loadMaps() {
	if (typeof window === "undefined") return Promise.resolve();
	if (window.google?.maps) return Promise.resolve();
	if (window.__ccMapsLoading) return window.__ccMapsLoading;
	window.__ccMapsLoading = new Promise((resolve, reject) => {
		window.__ccInitMap = () => resolve();
		const s = document.createElement("script");
		const params = new URLSearchParams({
			key: BROWSER_KEY,
			loading: "async",
			callback: "__ccInitMap",
			libraries: "geometry"
		});
		params.set("channel", TRACKING_ID);
		s.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
		s.async = true;
		s.defer = true;
		s.onerror = () => reject(/* @__PURE__ */ new Error("Failed to load Google Maps"));
		document.head.appendChild(s);
	});
	return window.__ccMapsLoading;
}
function CampusMap({ buildings, height = "70vh", showPopups = true, centerId, route }) {
	const mapEl = (0, import_react.useRef)(null);
	const mapRef = (0, import_react.useRef)(null);
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [fav, setFav] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		setFav(JSON.parse(localStorage.getItem("cc_favorites") || "[]"));
	}, []);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		loadMaps().then(() => {
			if (!cancelled) setReady(true);
		}).catch((e) => setError(e.message));
		return () => {
			cancelled = true;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!ready || !mapEl.current || buildings.length === 0) return;
		const google = window.google;
		const center = centerId ? buildings.find((b) => b.id === centerId) ?? buildings[0] : buildings[0];
		const map = new google.maps.Map(mapEl.current, {
			center: {
				lat: center.lat,
				lng: center.lng
			},
			zoom: 17,
			disableDefaultUI: false,
			streetViewControl: false,
			mapTypeControl: false,
			styles: document.documentElement.classList.contains("dark") ? darkMapStyle : []
		});
		mapRef.current = map;
		const bounds = new google.maps.LatLngBounds();
		buildings.forEach((b) => {
			const marker = new google.maps.Marker({
				position: {
					lat: b.lat,
					lng: b.lng
				},
				map,
				title: b.name,
				animation: google.maps.Animation.DROP
			});
			bounds.extend(marker.getPosition());
			if (showPopups) marker.addListener("click", () => setSelected(b));
		});
		if (buildings.length > 1 && !centerId) map.fitBounds(bounds, 60);
		if (route) {
			const path = route.polyline && google.maps.geometry?.encoding ? google.maps.geometry.encoding.decodePath(route.polyline) : [{
				lat: route.from.lat,
				lng: route.from.lng
			}, {
				lat: route.to.lat,
				lng: route.to.lng
			}];
			new google.maps.Polyline({
				path,
				geodesic: true,
				strokeColor: "#7c3aed",
				strokeOpacity: .9,
				strokeWeight: 5
			}).setMap(map);
			const rb = new google.maps.LatLngBounds();
			rb.extend({
				lat: route.from.lat,
				lng: route.from.lng
			});
			rb.extend({
				lat: route.to.lat,
				lng: route.to.lng
			});
			map.fitBounds(rb, 80);
		}
	}, [
		ready,
		buildings,
		centerId,
		route,
		showPopups
	]);
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid place-items-center rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground",
		style: { height },
		children: ["Map unavailable: ", error]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative overflow-hidden rounded-2xl border border-border shadow-soft",
		style: { height },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: mapEl,
				className: "h-full w-full"
			}),
			!ready && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 grid place-items-center text-sm text-muted-foreground",
				children: "Loading map…"
			}),
			selected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute bottom-4 left-4 right-4 mx-auto max-w-md overflow-hidden rounded-2xl glass-strong shadow-glow",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: selected.image,
					alt: selected.name,
					className: "h-40 w-full object-cover"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs text-muted-foreground",
								children: [
									selected.code,
									" · ",
									selected.department
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-lg font-semibold",
								children: selected.name
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => {
									const n = toggleFavorite(selected.id);
									setFav(n);
								},
								className: "grid h-9 w-9 place-items-center rounded-lg border border-border",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "h-4 w-4 " + (fav.includes(selected.id) ? "fill-red-500 text-red-500" : "") })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 line-clamp-2 text-sm text-muted-foreground",
							children: selected.description
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/buildings/$id",
								params: { id: selected.id },
								className: "flex-1 rounded-lg border border-border px-3 py-2 text-center text-sm hover:bg-secondary",
								children: "Details"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/navigate",
								search: { to: selected.id },
								className: "flex-1 rounded-lg btn-hero btn-hero-hover px-3 py-2 text-center text-sm inline-flex items-center justify-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, { className: "h-4 w-4" }), " Navigate"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "mt-2 w-full text-xs text-muted-foreground hover:text-foreground",
							onClick: () => setSelected(null),
							children: "Close"
						})
					]
				})]
			})
		]
	});
}
var darkMapStyle = [
	{
		elementType: "geometry",
		stylers: [{ color: "#1f2937" }]
	},
	{
		elementType: "labels.text.stroke",
		stylers: [{ color: "#111827" }]
	},
	{
		elementType: "labels.text.fill",
		stylers: [{ color: "#9ca3af" }]
	},
	{
		featureType: "road",
		elementType: "geometry",
		stylers: [{ color: "#374151" }]
	},
	{
		featureType: "water",
		elementType: "geometry",
		stylers: [{ color: "#0f172a" }]
	},
	{
		featureType: "poi",
		elementType: "labels",
		stylers: [{ visibility: "off" }]
	}
];
//#endregion
export { CampusMap as t };
