import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { E as Navigation, G as Database, J as Clock, L as LocateFixed, M as MapPin, Q as Car, R as LoaderCircle, U as Footprints, X as Check, Z as ChartColumn, at as ArrowDown, b as RotateCcwClock, d as StarOff, g as Settings2, h as Share2, l as Sunrise, n as WifiOff, nt as ArrowUp, o as TriangleAlert, rt as ArrowRight, s as Trash2, t as X, tt as Bike, u as Star, v as Search, w as Pencil, y as Route } from "../_libs/lucide-react.mjs";
import { a as DialogOverlay$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { St as object, lt as _enum, xt as number } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { a as Route$8 } from "./router--Sg3DtRc.mjs";
import { a as getBuildings } from "./api-upx-0QUe.mjs";
import { n as createServerFn } from "./server-DtYuMhH8.mjs";
import { a as moveFavoriteTo, c as setFavoriteAlias, l as toggleFavorite, n as getFavoriteAliases, r as getFavorites, s as removeFavorite, t as addFavorites } from "./favorites-D3aR_5-0.mjs";
import { t as CampusMap } from "./campus-map-C37GgseY.mjs";
import { n as useServerFn, t as createSsrRpc } from "./createSsrRpc-CqEh_Aij.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/navigate-DwZtHife.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
var DialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className),
	...props
});
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
DialogFooter.displayName = "DialogFooter";
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("text-lg font-semibold leading-none tracking-tight", className),
	...props
}));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DialogDescription.displayName = DialogDescription$1.displayName;
var BUCKETS = [
	{
		id: "morning",
		label: "Morning",
		range: "5am–11am",
		test: (h) => h >= 5 && h < 11
	},
	{
		id: "midday",
		label: "Midday",
		range: "11am–3pm",
		test: (h) => h >= 11 && h < 15
	},
	{
		id: "afternoon",
		label: "Afternoon",
		range: "3pm–7pm",
		test: (h) => h >= 15 && h < 19
	},
	{
		id: "evening",
		label: "Evening",
		range: "7pm–5am",
		test: (h) => h >= 19 || h < 5
	}
];
function RouteInsights({ recents, onSelectDestination }) {
	const { topPlaces, buckets, peak, total } = (0, import_react.useMemo)(() => {
		const counts = /* @__PURE__ */ new Map();
		const bucketCounts = BUCKETS.map((bkt) => ({
			...bkt,
			count: 0
		}));
		for (const r of recents) {
			const cur = counts.get(r.toId);
			if (cur) {
				cur.count += 1;
				cur.last = Math.max(cur.last, r.at);
			} else counts.set(r.toId, {
				id: r.toId,
				name: r.toName,
				count: 1,
				last: r.at
			});
			const h = new Date(r.at).getHours();
			const bkt = bucketCounts.find((x) => x.test(h));
			if (bkt) bkt.count += 1;
		}
		return {
			topPlaces: [...counts.values()].sort((a, b) => b.count - a.count || b.last - a.last).slice(0, 5),
			buckets: bucketCounts,
			peak: bucketCounts.reduce((a, b) => b.count > a.count ? b : a, bucketCounts[0]),
			total: recents.length
		};
	}, [recents]);
	const [drillId, setDrillId] = (0, import_react.useState)(null);
	const drill = (0, import_react.useMemo)(() => {
		if (!drillId) return null;
		const visits = recents.filter((r) => r.toId === drillId).sort((a, b) => b.at - a.at);
		if (visits.length === 0) return null;
		const routeMap = /* @__PURE__ */ new Map();
		for (const v of visits) {
			const key = `${v.fromId}|${v.mode}`;
			const cur = routeMap.get(key);
			if (cur) {
				cur.count += 1;
				cur.last = Math.max(cur.last, v.at);
			} else routeMap.set(key, {
				key,
				fromName: v.fromName,
				mode: v.mode,
				count: 1,
				last: v.at
			});
		}
		const routes = [...routeMap.values()].sort((a, b) => b.count - a.count || b.last - a.last);
		const durations = visits.map((v) => v.durationSeconds).filter((x) => typeof x === "number");
		const distances = visits.map((v) => v.distanceMeters).filter((x) => typeof x === "number");
		const avg = (xs) => xs.length ? xs.reduce((a, c) => a + c, 0) / xs.length : null;
		return {
			name: visits[0].toName,
			visits,
			routes,
			avgMin: avg(durations) != null ? Math.round(avg(durations) / 60) : null,
			avgM: avg(distances) != null ? Math.round(avg(distances)) : null
		};
	}, [drillId, recents]);
	if (total === 0) return null;
	const maxPlace = topPlaces[0]?.count || 1;
	const maxBucket = Math.max(1, ...buckets.map((x) => x.count));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "route-insights",
		"aria-labelledby": "route-insights-heading",
		className: "rounded-xl border border-border bg-background p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
				id: "route-insights-heading",
				className: "mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, {
					className: "h-3.5 w-3.5",
					"aria-hidden": "true"
				}), " Route insights"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mb-3 text-[11px] text-muted-foreground",
				children: [
					"Based on your last ",
					total,
					" ",
					total === 1 ? "route" : "routes",
					". You travel most often in the",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
						className: "text-foreground",
						children: peak.label.toLowerCase()
					}),
					" (",
					peak.range,
					")."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
				className: "mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
					className: "h-3 w-3",
					"aria-hidden": "true"
				}), " Most visited buildings"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-1.5",
				children: topPlaces.map((p) => {
					const pct = Math.round(p.count / maxPlace * 100);
					const row = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center justify-between gap-2 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 truncate",
							children: p.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "shrink-0 text-[10px] text-muted-foreground",
							children: [
								p.count,
								" ",
								p.count === 1 ? "trip" : "trips"
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-secondary",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block h-full rounded-full bg-primary",
							style: { width: `${pct}%` }
						})
					})] });
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setDrillId(p.id),
							"aria-label": `View visit history for ${p.name}. ${p.count} recent ${p.count === 1 ? "trip" : "trips"}.`,
							className: "block min-w-0 flex-1 rounded-md px-1.5 py-1 text-left hover:bg-secondary",
							children: row
						}), onSelectDestination ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => onSelectDestination(p.id),
							"aria-label": `Set ${p.name} as destination`,
							className: "shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, {
								className: "h-3.5 w-3.5",
								"aria-hidden": "true"
							})
						}) : null]
					}, p.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
				className: "mb-1.5 mt-3 flex items-center gap-1.5 text-[11px] font-semibold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
					className: "h-3 w-3",
					"aria-hidden": "true"
				}), " Time-of-day pattern"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-1",
				children: buckets.map((bkt) => {
					const pct = Math.round(bkt.count / maxBucket * 100);
					const isPeak = bkt.id === peak.id && bkt.count > 0;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-2 px-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-16 shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground",
								children: bkt.label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "h-1.5 flex-1 overflow-hidden rounded-full bg-secondary",
								"aria-hidden": "true",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block h-full rounded-full " + (isPeak ? "bg-primary" : "bg-muted-foreground/50"),
									style: { width: `${pct}%` }
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "w-14 shrink-0 text-right text-[10px] text-muted-foreground",
								children: [
									bkt.count,
									" ",
									bkt.count === 1 ? "trip" : "trips"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "sr-only",
								children: [
									bkt.label,
									", ",
									bkt.range,
									": ",
									bkt.count,
									" ",
									bkt.count === 1 ? "trip" : "trips",
									isPeak ? ", your busiest time" : "",
									"."
								]
							})
						]
					}, bkt.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 flex items-center gap-1 text-[10px] text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sunrise, {
					className: "h-3 w-3",
					"aria-hidden": "true"
				}), " Times reflect when each route was calculated. Tap a building for its full visit history."]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!drill,
				onOpenChange: (o) => !o && setDrillId(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
					className: "max-h-[85vh] overflow-y-auto sm:max-w-md",
					children: drill ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-2 text-base",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
									className: "h-4 w-4",
									"aria-hidden": "true"
								}),
								" ",
								drill.name
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
							drill.visits.length,
							" ",
							drill.visits.length === 1 ? "visit" : "visits",
							" in your history",
							drill.avgMin != null ? ` · avg ${drill.avgMin} min` : "",
							drill.avgM != null ? ` · avg ${drill.avgM} m` : ""
						] })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
							className: "flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
								className: "h-3 w-3",
								"aria-hidden": "true"
							}), " Typical routes"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-1",
							children: drill.routes.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center justify-between gap-2 rounded-md border border-border px-2 py-1.5 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0 truncate",
									children: [
										"From ",
										r.fromName,
										" · ",
										r.mode.toLowerCase()
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "shrink-0 text-[10px] text-muted-foreground",
									children: [
										r.count,
										"× · ",
										Math.round(r.count / drill.visits.length * 100),
										"%"
									]
								})]
							}, r.key))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
							className: "mt-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
								className: "h-3 w-3",
								"aria-hidden": "true"
							}), " Visit history"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-1",
							children: drill.visits.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-md border border-border px-2 py-1.5 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0 truncate",
										children: [
											new Date(v.at).toLocaleDateString(void 0, {
												month: "short",
												day: "numeric",
												year: "numeric"
											}),
											" ",
											"·",
											" ",
											new Date(v.at).toLocaleTimeString(void 0, {
												hour: "numeric",
												minute: "2-digit"
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "shrink-0 text-[10px] text-muted-foreground",
										children: [
											v.durationSeconds != null ? `${Math.max(1, Math.round(v.durationSeconds / 60))} min` : "—",
											v.distanceMeters != null ? ` · ${Math.round(v.distanceMeters)} m` : "",
											v.source ? ` · ${v.source}` : ""
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "mt-0.5 block truncate text-[10px] text-muted-foreground",
									children: [
										"From ",
										v.fromName,
										" · ",
										v.mode.toLowerCase()
									]
								})]
							}, `${v.at}-${v.fromId}`))
						}),
						onSelectDestination ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								onSelectDestination(drill.visits[0].toId);
								setDrillId(null);
							},
							className: "mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, {
								className: "h-3.5 w-3.5",
								"aria-hidden": "true"
							}), " Navigate here"]
						}) : null
					] }) : null
				})
			})
		]
	});
}
var LatLng = object({
	lat: number().min(-90).max(90),
	lng: number().min(-180).max(180)
});
var computeRoute = createServerFn({ method: "POST" }).inputValidator((input) => object({
	origin: LatLng,
	destination: LatLng,
	mode: _enum([
		"WALK",
		"DRIVE",
		"BICYCLE",
		"TWO_WHEELER"
	]).default("WALK")
}).parse(input)).handler(createSsrRpc("98f4c1ec5adcb96ffa660ce6f8dbfe568b087c78707c43f7c8bb57f3e1fa1ae3"));
var DB_NAME = "cc_routes";
var STORE = "routes";
var LS_KEY = "cc_route_cache_v1";
var MAX_ENTRIES = 80;
var TTL_MS = 6048e5;
function routeKey(fromId, toId, mode) {
	return `${fromId}|${toId}|${mode}`;
}
function openDB() {
	return new Promise((resolve) => {
		if (typeof indexedDB === "undefined") return resolve(null);
		try {
			const req = indexedDB.open(DB_NAME, 1);
			req.onupgradeneeded = () => {
				const db = req.result;
				if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "key" });
			};
			req.onsuccess = () => resolve(req.result);
			req.onerror = () => resolve(null);
		} catch {
			resolve(null);
		}
	});
}
async function idbGet(key) {
	const db = await openDB();
	if (!db) return null;
	return new Promise((resolve) => {
		try {
			const req = db.transaction(STORE, "readonly").objectStore(STORE).get(key);
			req.onsuccess = () => resolve(req.result ?? null);
			req.onerror = () => resolve(null);
		} catch {
			resolve(null);
		}
	});
}
async function idbPut(entry) {
	const db = await openDB();
	if (!db) return;
	return new Promise((resolve) => {
		try {
			const tx = db.transaction(STORE, "readwrite");
			const store = tx.objectStore(STORE);
			store.put(entry);
			const countReq = store.count();
			countReq.onsuccess = () => {
				if (countReq.result > MAX_ENTRIES) {
					const cursorReq = store.openCursor();
					const drop = [];
					const overflow = countReq.result - MAX_ENTRIES;
					cursorReq.onsuccess = () => {
						const c = cursorReq.result;
						if (c && drop.length < overflow) {
							drop.push(c.value.key);
							c.continue();
						} else drop.forEach((k) => store.delete(k));
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
function lsRead() {
	if (typeof window === "undefined") return [];
	try {
		return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
	} catch {
		return [];
	}
}
function lsWrite(entries) {
	try {
		localStorage.setItem(LS_KEY, JSON.stringify(entries.slice(-80)));
	} catch {}
}
async function getCachedRoute(key) {
	const now = Date.now();
	const hit = await idbGet(key) ?? lsRead().find((e) => e.key === key) ?? null;
	if (!hit) return null;
	if (now - hit.at > TTL_MS) return null;
	return hit.result;
}
async function saveCachedRoute(key, result) {
	if (result.source !== "google") return;
	const entry = {
		key,
		at: Date.now(),
		result
	};
	await idbPut(entry);
	const entries = lsRead().filter((e) => e.key !== key);
	entries.push(entry);
	lsWrite(entries);
}
var KEY = "cc_recent_routes_v1";
var MAX = 10;
function getRecentRoutes() {
	if (typeof window === "undefined") return [];
	try {
		return JSON.parse(localStorage.getItem(KEY) || "[]");
	} catch {
		return [];
	}
}
function addRecentRoute(entry) {
	if (typeof window === "undefined") return [];
	const now = Date.now();
	const existing = getRecentRoutes().filter((r) => !(r.fromId === entry.fromId && r.toId === entry.toId && r.mode === entry.mode));
	const next = [{
		...entry,
		at: now
	}, ...existing].slice(0, MAX);
	try {
		localStorage.setItem(KEY, JSON.stringify(next));
	} catch {}
	return next;
}
function clearRecentRoutes() {
	try {
		localStorage.removeItem(KEY);
	} catch {}
}
function routeUid(r) {
	return `${r.fromId}|${r.toId}|${r.mode}|${r.at}`;
}
function removeRecentRoutes(uids) {
	const set = new Set(uids);
	const next = getRecentRoutes().filter((r) => !set.has(routeUid(r)));
	try {
		localStorage.setItem(KEY, JSON.stringify(next));
	} catch {}
	return next;
}
var CURRENT = "__current__";
function NavigatePage() {
	const params = Route$8.useSearch();
	const [b, setB] = (0, import_react.useState)([]);
	const hasCurrentInit = params.fromLat != null && params.fromLng != null;
	const [from, setFrom] = (0, import_react.useState)(hasCurrentInit ? CURRENT : params.from ?? "");
	const [to, setTo] = (0, import_react.useState)(params.to ?? "");
	const [mode, setMode] = (0, import_react.useState)(params.mode ?? "WALK");
	const [route, setRoute] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [err, setErr] = (0, import_react.useState)(null);
	const [coords, setCoords] = (0, import_react.useState)(hasCurrentInit ? {
		lat: params.fromLat,
		lng: params.fromLng
	} : null);
	const [geoErr, setGeoErr] = (0, import_react.useState)(null);
	const [online, setOnline] = (0, import_react.useState)(typeof navigator !== "undefined" ? navigator.onLine : true);
	const [focusedStep, setFocusedStep] = (0, import_react.useState)(0);
	const [announcement, setAnnouncement] = (0, import_react.useState)("");
	const [shareState, setShareState] = (0, import_react.useState)("idle");
	const [recents, setRecents] = (0, import_react.useState)([]);
	const [favIds, setFavIds] = (0, import_react.useState)([]);
	const [favAliases, setFavAliases] = (0, import_react.useState)({});
	const [recentQuery, setRecentQuery] = (0, import_react.useState)("");
	const [manageFavs, setManageFavs] = (0, import_react.useState)(false);
	const [editingFav, setEditingFav] = (0, import_react.useState)(null);
	const [editingValue, setEditingValue] = (0, import_react.useState)("");
	const [selectedRecents, setSelectedRecents] = (0, import_react.useState)([]);
	const [favMsg, setFavMsg] = (0, import_react.useState)("");
	const favItemRefs = (0, import_react.useRef)({});
	const stepRefs = (0, import_react.useRef)([]);
	const compute = useServerFn(computeRoute);
	(0, import_react.useEffect)(() => {
		setRecents(getRecentRoutes());
		setFavIds(getFavorites());
		setFavAliases(getFavoriteAliases());
	}, []);
	(0, import_react.useEffect)(() => {
		getBuildings().then(setB);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!from && b[0]) setFrom(b[0].id);
	}, [b, from]);
	(0, import_react.useEffect)(() => {
		const on = () => {
			setOnline(true);
			setAnnouncement("Back online. Fetching live directions.");
		};
		const off = () => {
			setOnline(false);
			setAnnouncement("You are offline. Showing cached or simplified directions.");
		};
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
	const originCoords = useCurrent ? coords : fromB ? {
		lat: fromB.lat,
		lng: fromB.lng
	} : null;
	const originId = useCurrent ? "current" : fromB?.id ?? "";
	const originName = useCurrent ? "Your location" : fromB?.name ?? "";
	function favLabel(id) {
		return favAliases[id] || b.find((x) => x.id === id)?.name || id;
	}
	function moveFav(id, target) {
		const next = moveFavoriteTo(id, target);
		setFavIds(next);
		const pos = next.indexOf(id);
		setFavMsg(`${favLabel(id)} moved to position ${pos + 1} of ${next.length}.`);
		requestAnimationFrame(() => favItemRefs.current[id]?.focus());
	}
	function onFavKeyDown(e, id, idx) {
		const total = favIds.length;
		if ((e.altKey || e.ctrlKey || e.metaKey) && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
			e.preventDefault();
			moveFav(id, e.key === "ArrowUp" ? idx - 1 : idx + 1);
			return;
		}
		if (e.key === "Home" && (e.altKey || e.ctrlKey || e.metaKey)) {
			e.preventDefault();
			moveFav(id, 0);
			return;
		}
		if (e.key === "End" && (e.altKey || e.ctrlKey || e.metaKey)) {
			e.preventDefault();
			moveFav(id, total - 1);
			return;
		}
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
		navigator.geolocation.getCurrentPosition((pos) => {
			setCoords({
				lat: pos.coords.latitude,
				lng: pos.coords.longitude
			});
			setFrom(CURRENT);
		}, (e) => setGeoErr(e.message || "Could not get your location."), {
			enableHighAccuracy: true,
			timeout: 8e3
		});
	}
	(0, import_react.useEffect)(() => {
		if (!originCoords || !toB) {
			setRoute(null);
			return;
		}
		let cancelled = false;
		setErr(null);
		const key = routeKey(originId, toB.id, mode);
		(async () => {
			const cached = await getCachedRoute(key);
			if (cancelled) return;
			if (cached) setRoute({
				...cached,
				source: "google",
				warning: "Showing cached route (offline-friendly)."
			});
			setLoading(true);
			setAnnouncement(cached ? "Recalculating route." : "Calculating route.");
			try {
				const r = await compute({ data: {
					origin: originCoords,
					destination: {
						lat: toB.lat,
						lng: toB.lng
					},
					mode
				} });
				if (cancelled) return;
				setRoute(r);
				saveCachedRoute(key, r);
				setRecents(addRecentRoute({
					fromId: originId,
					fromName: originName,
					toId: toB.id,
					toName: toB.name,
					mode,
					fromLat: useCurrent && coords ? coords.lat : void 0,
					fromLng: useCurrent && coords ? coords.lng : void 0,
					distanceMeters: r.distanceMeters,
					durationSeconds: r.durationSeconds,
					source: r.source
				}));
				const mins = Math.max(1, Math.round(r.durationSeconds / 60));
				setAnnouncement(`${r.source === "fallback" ? "Simplified route ready. " : "Route ready. "}${r.steps.length} steps, about ${mins} minute${mins === 1 ? "" : "s"}.`);
			} catch (e) {
				if (cancelled) return;
				if (!cached) {
					setErr(e?.message || "Could not compute route");
					setAnnouncement("Could not compute route.");
				} else setAnnouncement("Live route unavailable. Using cached route.");
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [
		originCoords?.lat,
		originCoords?.lng,
		originId,
		toB,
		mode,
		compute
	]);
	(0, import_react.useEffect)(() => {
		setFocusedStep(0);
	}, [route?.polyline]);
	const distance = route?.distanceMeters ?? 0;
	const minutes = route ? Math.max(1, Math.round(route.durationSeconds / 60)) : 0;
	const modes = (0, import_react.useMemo)(() => [
		{
			id: "WALK",
			label: "Walk",
			Icon: Footprints
		},
		{
			id: "BICYCLE",
			label: "Bike",
			Icon: Bike
		},
		{
			id: "DRIVE",
			label: "Drive",
			Icon: Car
		}
	], []);
	(0, import_react.useEffect)(() => {
		if (!route || !route.steps[focusedStep]) return;
		const s = route.steps[focusedStep];
		const text = s.instruction.replace(/<[^>]+>/g, "");
		setAnnouncement(`Step ${focusedStep + 1} of ${route.steps.length}: ${text}, ${Math.round(s.distanceMeters)} meters.`);
	}, [focusedStep, route]);
	function onStepsKeyDown(e) {
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
		} else if (fromB) params.set("from", fromB.id);
		params.set("to", toB.id);
		params.set("mode", mode);
		const url = `${window.location.origin}/navigate?${params.toString()}`;
		const shareData = {
			title: `Directions to ${toB.name}`,
			text: `Navigate to ${toB.name} on Campus Compass`,
			url
		};
		try {
			if (typeof navigator !== "undefined" && navigator.share) {
				await navigator.share(shareData);
				setAnnouncement("Route shared.");
				return;
			}
		} catch {}
		try {
			await navigator.clipboard.writeText(url);
			setShareState("copied");
			setAnnouncement("Route link copied to clipboard.");
			setTimeout(() => setShareState("idle"), 2e3);
		} catch {
			setAnnouncement("Could not copy link.");
		}
	}
	const routeForMap = originCoords && toB ? {
		from: fromB ?? {
			id: "current",
			name: "Your location",
			lat: originCoords.lat,
			lng: originCoords.lng
		},
		to: toB,
		polyline: route?.polyline
	} : void 0;
	const mapBuildings = originCoords && toB ? [fromB ?? {
		id: "current",
		name: "Your location",
		lat: originCoords.lat,
		lng: originCoords.lng
	}, toB] : b;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				"aria-label": "Skip links",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "#nav-controls",
						className: "skip-link",
						children: "Skip to route controls"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "#nav-favorites",
						className: "skip-link",
						children: "Skip to favorites"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "#route-insights",
						className: "skip-link",
						children: "Skip to route insights"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "#nav-recents",
						className: "skip-link",
						children: "Skip to recent routes"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "#nav-map",
						className: "skip-link",
						children: "Skip to map"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "status",
				"aria-live": "polite",
				"aria-atomic": "true",
				className: "sr-only",
				children: announcement
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-bold md:text-4xl",
				children: "Get directions"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground",
				children: "Real turn-by-turn navigation powered by Google Routes."
			}),
			!online && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "status",
				"aria-live": "polite",
				className: "mt-4 flex items-center gap-2 rounded-xl border-2 border-amber-600 bg-amber-100 px-4 py-3 text-sm font-medium text-amber-900 dark:border-amber-400 dark:bg-amber-950 dark:text-amber-100",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, {
					className: "h-4 w-4",
					"aria-hidden": "true"
				}), "You're offline. Showing cached routes when available; live directions will resume when you reconnect."]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-6 lg:grid-cols-[380px_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					id: "nav-controls",
					tabIndex: -1,
					className: "space-y-4 rounded-2xl border border-border bg-card p-5 shadow-soft",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "nav-from",
								className: "text-xs uppercase tracking-widest text-muted-foreground",
								children: "From"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								id: "nav-from",
								"aria-label": "Starting point",
								value: from,
								onChange: (e) => setFrom(e.target.value),
								className: "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm",
								children: [coords && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: CURRENT,
									children: "📍 Your location"
								}), b.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: x.id,
									children: x.name
								}, x.id))]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: requestLocation,
								"aria-label": "Use my current location as starting point",
								className: "mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocateFixed, {
									className: "h-3.5 w-3.5",
									"aria-hidden": "true"
								}), " Use my location"]
							}),
							geoErr && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								role: "alert",
								className: "mt-1 text-xs text-destructive",
								children: geoErr
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "nav-to",
							className: "text-xs uppercase tracking-widest text-muted-foreground",
							children: "To"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							id: "nav-to",
							"aria-label": "Destination",
							value: to,
							onChange: (e) => setTo(e.target.value),
							className: "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Choose destination…"
							}), b.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: x.id,
								children: x.name
							}, x.id))]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							role: "radiogroup",
							"aria-label": "Travel mode",
							className: "flex gap-2",
							children: modes.map(({ id, label, Icon }) => {
								const active = mode === id;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									role: "radio",
									"aria-checked": active,
									"aria-label": `${label} directions`,
									onClick: () => setMode(id),
									className: "flex-1 inline-flex items-center justify-center gap-1 rounded-lg border px-3 py-2 text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary " + (active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-secondary"),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
											className: "h-3.5 w-3.5",
											"aria-hidden": "true"
										}),
										" ",
										label
									]
								}, id);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: shareRoute,
							disabled: !toB,
							"aria-label": "Share this route as a link",
							className: "inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
							children: shareState === "copied" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
								className: "h-3.5 w-3.5",
								"aria-hidden": "true"
							}), " Link copied"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, {
								className: "h-3.5 w-3.5",
								"aria-hidden": "true"
							}), " Share this route"] })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							id: "nav-favorites",
							tabIndex: -1,
							className: "rounded-xl border border-border bg-background p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-2 flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
										className: "flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
											className: "h-3.5 w-3.5",
											"aria-hidden": "true"
										}), " Favorites"]
									}), favIds.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => {
											setManageFavs((m) => !m);
											setEditingFav(null);
										},
										"aria-pressed": manageFavs,
										"aria-label": manageFavs ? "Done managing favorites" : "Manage favorites",
										className: "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-secondary hover:text-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, {
												className: "h-3 w-3",
												"aria-hidden": "true"
											}),
											" ",
											manageFavs ? "Done" : "Manage"
										]
									})]
								}),
								favIds.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-muted-foreground",
									children: "Pin your frequently visited buildings for one-tap navigation. Use the star to add favorites."
								}) : manageFavs ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										id: "fav-reorder-help",
										className: "mb-1.5 text-[10px] text-muted-foreground",
										children: "Use Up and Down arrows to move between pinned buildings, and Alt + Up / Alt + Down to reorder them."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "space-y-1",
										role: "listbox",
										"aria-label": "Pinned buildings, reorderable",
										"aria-describedby": "fav-reorder-help",
										children: favIds.map((id, idx) => {
											const bld = b.find((x) => x.id === id);
											if (!bld) return null;
											const display = favAliases[id] || bld.name;
											const isEditing = editingFav === id;
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
												ref: (el) => {
													favItemRefs.current[id] = el;
												},
												role: "option",
												"aria-selected": false,
												"aria-label": `${display}, position ${idx + 1} of ${favIds.length}`,
												tabIndex: isEditing ? -1 : 0,
												onKeyDown: isEditing ? void 0 : (e) => onFavKeyDown(e, id, idx),
												className: "flex items-center gap-1 rounded-md border border-border bg-card p-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "w-4 shrink-0 text-center text-[10px] font-semibold text-muted-foreground",
														"aria-hidden": "true",
														children: idx + 1
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex flex-col",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															type: "button",
															onClick: () => moveFav(id, idx - 1),
															disabled: idx === 0,
															"aria-label": `Move ${display} up to position ${idx}`,
															className: "rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, {
																className: "h-3 w-3",
																"aria-hidden": "true"
															})
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															type: "button",
															onClick: () => moveFav(id, idx + 1),
															disabled: idx === favIds.length - 1,
															"aria-label": `Move ${display} down to position ${idx + 2}`,
															className: "rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, {
																className: "h-3 w-3",
																"aria-hidden": "true"
															})
														})]
													}),
													isEditing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
														onSubmit: (e) => {
															e.preventDefault();
															setFavAliases(setFavoriteAlias(id, editingValue));
															setEditingFav(null);
														},
														className: "flex flex-1 items-center gap-1",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
																autoFocus: true,
																value: editingValue,
																onChange: (e) => setEditingValue(e.target.value),
																placeholder: bld.name,
																"aria-label": `Rename ${bld.name}`,
																className: "min-w-0 flex-1 rounded border border-border bg-background px-2 py-1 text-xs"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																type: "submit",
																className: "rounded bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground",
																children: "Save"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																type: "button",
																onClick: () => setEditingFav(null),
																"aria-label": "Cancel rename",
																className: "rounded border border-border px-1 py-1 text-muted-foreground hover:bg-secondary",
																children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
																	className: "h-3 w-3",
																	"aria-hidden": "true"
																})
															})
														]
													}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "min-w-0 flex-1 truncate text-xs",
															children: [display, favAliases[id] && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "ml-1 text-[10px] text-muted-foreground",
																children: [
																	"(",
																	bld.name,
																	")"
																]
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															type: "button",
															onClick: () => {
																setEditingFav(id);
																setEditingValue(favAliases[id] || "");
															},
															"aria-label": `Rename ${display}`,
															className: "rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, {
																className: "h-3 w-3",
																"aria-hidden": "true"
															})
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															type: "button",
															onClick: () => {
																setFavIds(removeFavorite(id));
																setFavAliases(getFavoriteAliases());
															},
															"aria-label": `Remove ${display} from favorites`,
															className: "rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
																className: "h-3 w-3",
																"aria-hidden": "true"
															})
														})
													] })
												]
											}, id);
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"aria-live": "polite",
										className: "sr-only",
										children: favMsg
									})
								] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "space-y-1.5",
									children: favIds.map((id) => {
										const bld = b.find((x) => x.id === id);
										if (!bld) return null;
										const display = favAliases[id] || bld.name;
										const active = to === id;
										const lastTrip = recents.find((r) => r.toId === id);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-stretch overflow-hidden rounded-lg border border-border bg-background text-xs",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: () => setTo(id),
												"aria-label": `Navigate to ${display}`,
												className: "flex min-w-0 flex-1 flex-col items-start gap-0.5 px-2.5 py-1.5 text-left hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary " + (active ? "bg-primary/10" : ""),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "flex items-center gap-1 truncate font-medium",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, {
														className: "h-3 w-3 shrink-0",
														"aria-hidden": "true"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "truncate",
														children: display
													})]
												}), lastTrip ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "flex flex-wrap items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground",
													children: [
														lastTrip.distanceMeters != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [Math.round(lastTrip.distanceMeters), " m"] }),
														lastTrip.durationSeconds != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
															"· ",
															Math.max(1, Math.round(lastTrip.durationSeconds / 60)),
															" min"
														] }),
														lastTrip.source && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wide " + (lastTrip.source === "google" ? "bg-sky-500/15 text-sky-700 dark:text-sky-300" : "bg-amber-500/15 text-amber-700 dark:text-amber-300"),
															children: lastTrip.source === "google" ? "Google" : "Fallback"
														})
													]
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[10px] text-muted-foreground",
													children: "No trip yet"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => setFavIds(toggleFavorite(id)),
												"aria-label": `Remove ${display} from favorites`,
												className: "border-l border-border px-2 text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StarOff, {
													className: "h-3 w-3",
													"aria-hidden": "true"
												})
											})]
										}) }, id);
									})
								}),
								toB && !favIds.includes(toB.id) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setFavIds(toggleFavorite(toB.id)),
									className: "mt-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground hover:bg-secondary hover:text-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
											className: "h-3 w-3",
											"aria-hidden": "true"
										}),
										" Pin “",
										toB.name,
										"”"
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RouteInsights, {
							recents,
							onSelectDestination: (id) => setTo(id)
						}),
						recents.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							id: "nav-recents",
							tabIndex: -1,
							className: "rounded-xl border border-border bg-background p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-2 flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
										className: "flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcwClock, {
											className: "h-3.5 w-3.5",
											"aria-hidden": "true"
										}), " Recent routes"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => {
											clearRecentRoutes();
											setRecents([]);
											setRecentQuery("");
											setSelectedRecents([]);
										},
										"aria-label": "Clear all recent routes",
										className: "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
											className: "h-3 w-3",
											"aria-hidden": "true"
										}), " Clear all"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative mb-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
											className: "pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground",
											"aria-hidden": "true"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "search",
											value: recentQuery,
											onChange: (e) => setRecentQuery(e.target.value),
											placeholder: "Search recent routes…",
											"aria-label": "Search recent routes",
											className: "w-full rounded-md border border-border bg-background py-1 pl-6 pr-6 text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
										}),
										recentQuery && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setRecentQuery(""),
											"aria-label": "Clear search",
											className: "absolute right-1 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
												className: "h-3 w-3",
												"aria-hidden": "true"
											})
										})
									]
								}),
								(() => {
									const q = recentQuery.trim().toLowerCase();
									const filtered = q ? recents.filter((r) => r.fromName.toLowerCase().includes(q) || r.toName.toLowerCase().includes(q) || r.mode.toLowerCase().includes(q)) : recents;
									if (filtered.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "px-1 py-2 text-[11px] text-muted-foreground",
										children: [
											"No matches for “",
											recentQuery,
											"”."
										]
									});
									const visibleIds = filtered.map(routeUid);
									const allSelected = visibleIds.every((u) => selectedRecents.includes(u));
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mb-1.5 flex flex-wrap items-center gap-2 border-b border-border pb-1.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "flex items-center gap-1.5 text-[11px] text-muted-foreground",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "checkbox",
													className: "h-3.5 w-3.5 accent-[hsl(var(--primary))]",
													checked: allSelected,
													onChange: (e) => setSelectedRecents(e.target.checked ? visibleIds : [])
												}), "Select all"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[11px] text-muted-foreground",
												"aria-live": "polite",
												children: selectedRecents.length > 0 ? `${selectedRecents.length} selected` : ""
											}),
											selectedRecents.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "ml-auto flex items-center gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													onClick: () => {
														const ids = Array.from(new Set(recents.filter((r) => selectedRecents.includes(routeUid(r))).map((r) => r.toId)));
														setFavIds(addFavorites(ids));
														setSelectedRecents([]);
													},
													className: "inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[10px] hover:bg-secondary",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
														className: "h-3 w-3",
														"aria-hidden": "true"
													}), " Pin destinations"]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													onClick: () => {
														setRecents(removeRecentRoutes(selectedRecents));
														setSelectedRecents([]);
													},
													className: "inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[10px] text-destructive hover:bg-destructive/10",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
														className: "h-3 w-3",
														"aria-hidden": "true"
													}), " Delete selected"]
												})]
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "space-y-1",
										children: filtered.map((r) => {
											const isCurrent = r.fromId === "current";
											const uid = routeUid(r);
											const checked = selectedRecents.includes(uid);
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
												className: "flex items-start gap-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "checkbox",
													className: "mt-2 h-3.5 w-3.5 shrink-0 accent-[hsl(var(--primary))]",
													checked,
													onChange: (e) => setSelectedRecents((s) => e.target.checked ? [...s, uid] : s.filter((x) => x !== uid)),
													"aria-label": `Select route ${r.fromName} to ${r.toName}`
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													onClick: () => {
														if (isCurrent && r.fromLat != null && r.fromLng != null) {
															setCoords({
																lat: r.fromLat,
																lng: r.fromLng
															});
															setFrom(CURRENT);
														} else setFrom(r.fromId);
														setTo(r.toId);
														setMode(r.mode);
													},
													className: "min-w-0 flex-1 rounded-md px-2 py-1.5 text-left text-xs hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-1 truncate",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "truncate",
																children: r.fromName
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
																className: "h-3 w-3 shrink-0 text-muted-foreground",
																"aria-hidden": "true"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "truncate font-medium",
																children: r.toName
															})
														]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: r.mode === "WALK" ? "Walk" : r.mode === "BICYCLE" ? "Bike" : "Drive" }),
															r.distanceMeters != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																"aria-label": `${Math.round(r.distanceMeters)} meters`,
																children: [
																	"· ",
																	Math.round(r.distanceMeters),
																	" m"
																]
															}),
															r.durationSeconds != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																"aria-label": `about ${Math.max(1, Math.round(r.durationSeconds / 60))} minutes`,
																children: [
																	"· ",
																	Math.max(1, Math.round(r.durationSeconds / 60)),
																	" min"
																]
															}),
															r.source && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wide " + (r.source === "google" ? "bg-sky-500/15 text-sky-700 dark:text-sky-300" : "bg-amber-500/15 text-amber-700 dark:text-amber-300"),
																children: r.source === "google" ? "Google" : "Fallback"
															})
														]
													})]
												})]
											}, uid);
										})
									})] });
								})()
							]
						}),
						originCoords && toB && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl border border-border bg-background p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10px] uppercase tracking-widest text-muted-foreground",
									children: "Distance"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 font-display text-xl font-bold",
									"aria-live": "polite",
									children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
										className: "h-5 w-5 animate-spin",
										"aria-label": "Loading"
									}) : `${Math.round(distance)} m`
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl border border-border bg-background p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10px] uppercase tracking-widest text-muted-foreground",
									children: mode === "WALK" ? "Walking" : mode === "BICYCLE" ? "Cycling" : "Driving"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 flex items-center gap-1 font-display text-xl font-bold",
									"aria-live": "polite",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
											className: "h-4 w-4",
											"aria-hidden": "true"
										}),
										" ",
										loading ? "…" : `${minutes} min`
									]
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-2 flex items-center justify-between gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
										className: "flex items-center gap-2 text-sm font-semibold",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
											className: "h-4 w-4",
											"aria-hidden": "true"
										}), " Turn-by-turn"]
									}),
									route?.source === "fallback" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										role: "status",
										className: "inline-flex items-center gap-1 rounded-full border-2 border-amber-700 bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900 dark:border-amber-300 dark:bg-amber-950 dark:text-amber-100",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
											className: "h-3 w-3",
											"aria-hidden": "true"
										}), " Simplified"]
									}),
									route?.source === "google" && route?.warning && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										role: "status",
										className: "inline-flex items-center gap-1 rounded-full border-2 border-sky-700 bg-sky-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-900 dark:border-sky-300 dark:bg-sky-950 dark:text-sky-100",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Database, {
											className: "h-3 w-3",
											"aria-hidden": "true"
										}), " Cached"]
									})
								]
							}),
							route?.warning && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								role: "status",
								className: "mb-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2 text-[11px] text-amber-700 dark:text-amber-300",
								children: route.warning
							}),
							err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								role: "alert",
								className: "rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive",
								children: err
							}),
							loading && !route && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
									className: "h-3 w-3 animate-spin",
									"aria-hidden": "true"
								}), " Computing route…"]
							}),
							route && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
								className: "space-y-2 text-sm outline-none",
								"aria-label": "Turn-by-turn directions. Use arrow keys to move between steps.",
								tabIndex: 0,
								onKeyDown: onStepsKeyDown,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground",
											"aria-hidden": "true",
											children: "S"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											"Start at ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: originName }),
											"."
										] })]
									}),
									route.steps.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										ref: (el) => {
											stepRefs.current[i] = el;
										},
										tabIndex: focusedStep === i ? 0 : -1,
										"aria-posinset": i + 1,
										"aria-setsize": route.steps.length,
										"aria-label": `Step ${i + 1} of ${route.steps.length}: ${s.instruction.replace(/<[^>]+>/g, "")}, ${Math.round(s.distanceMeters)} meters`,
										className: "flex gap-2 rounded-md p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary " + (focusedStep === i ? "bg-secondary" : ""),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground",
											"aria-hidden": "true",
											children: i + 1
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { dangerouslySetInnerHTML: { __html: s.instruction } }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "ml-1 text-xs text-muted-foreground",
											children: [
												"· ",
												Math.round(s.distanceMeters),
												" m"
											]
										})] })]
									}, i)),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "grid h-5 w-5 shrink-0 place-items-center rounded-full bg-green-600 text-[10px] font-bold text-white",
											"aria-hidden": "true",
											children: "✓"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											"Arrive at ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: toB.name }),
											" — ",
											toB.openingTime,
											"."
										] })]
									})
								]
							})
						] })] }),
						!toB && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, {
									className: "mx-auto mb-2 h-6 w-6",
									"aria-hidden": "true"
								}),
								"Pick a destination to see the route ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
									className: "inline h-3 w-3",
									"aria-hidden": "true"
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					id: "nav-map",
					tabIndex: -1,
					"aria-label": "Campus map",
					children: originCoords && toB ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampusMap, {
						buildings: mapBuildings,
						height: "70vh",
						route: routeForMap
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampusMap, {
						buildings: b,
						height: "70vh"
					})
				})]
			})
		]
	});
}
//#endregion
export { NavigatePage as component };
