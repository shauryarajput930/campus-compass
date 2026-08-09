import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { A as Map, H as Heart, J as Clock, R as LoaderCircle, f as Sparkles, v as Search } from "../_libs/lucide-react.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as useAuth } from "./router-CMaMXinN.mjs";
import { a as getBuildings } from "./api-upx-0QUe.mjs";
import { i as getRecent, r as getFavorites } from "./favorites-D3aR_5-0.mjs";
import { n as useServerFn } from "./createSsrRpc-BDcSRTph.mjs";
import { t as BuildingCard } from "./building-card-CLvDw1H-.mjs";
import { t as getAIRecommendations } from "./ai.functions-Cn0JQV0r.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-gEzOjiaB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Dashboard() {
	const { user } = useAuth();
	const [all, setAll] = (0, import_react.useState)([]);
	const [favIds, setFavIds] = (0, import_react.useState)([]);
	const [recentIds, setRecentIds] = (0, import_react.useState)([]);
	const [recs, setRecs] = (0, import_react.useState)([]);
	const [recsLoading, setRecsLoading] = (0, import_react.useState)(false);
	const fetchRecs = useServerFn(getAIRecommendations);
	(0, import_react.useEffect)(() => {
		getBuildings().then(setAll);
		setFavIds(getFavorites());
		setRecentIds(getRecent());
	}, []);
	(0, import_react.useEffect)(() => {
		if (all.length === 0) return;
		setRecsLoading(true);
		fetchRecs({ data: {
			recentIds: [...recentIds, ...favIds].slice(0, 12),
			buildings: all.map((b) => ({
				id: b.id,
				name: b.name,
				code: b.code,
				department: b.department,
				category: b.category,
				facilities: b.facilities
			}))
		} }).then((r) => setRecs(r.recommendations)).catch(() => setRecs([])).finally(() => setRecsLoading(false));
	}, [
		all,
		recentIds,
		favIds,
		fetchRecs
	]);
	const favorites = all.filter((b) => favIds.includes(b.id));
	const recent = recentIds.map((id) => all.find((b) => b.id === id)).filter(Boolean);
	const recBuildings = recs.map((r) => ({
		b: all.find((x) => x.id === r.id),
		reason: r.reason
	})).filter((x) => x.b);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-8 flex flex-wrap items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs uppercase tracking-widest text-muted-foreground",
						children: "Dashboard"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "font-display text-3xl font-bold md:text-4xl",
						children: [
							"Welcome",
							user ? `, ${user.name}` : "",
							" 👋"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-muted-foreground",
						children: "Your personalized campus navigation hub."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/search",
					className: "btn-hero btn-hero-hover inline-flex items-center gap-2 px-4 py-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4" }), " Quick Search"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-10 grid gap-4 md:grid-cols-3",
				children: [
					{
						icon: Heart,
						label: "Favourites",
						value: favorites.length,
						to: "/favorites"
					},
					{
						icon: Clock,
						label: "Recently Viewed",
						value: recent.length,
						to: "/dashboard"
					},
					{
						icon: Map,
						label: "Locations on Map",
						value: all.length,
						to: "/map"
					}
				].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: c.to,
					className: "rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:shadow-glow",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs uppercase tracking-widest text-muted-foreground",
							children: c.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(c.icon, { className: "h-4 w-4 text-muted-foreground" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 font-display text-4xl font-bold gradient-text",
						children: c.value
					})]
				}, c.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mb-10 rounded-2xl border border-primary/30 bg-primary/5 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-5 w-5 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-xl font-semibold",
								children: "Recommended for you"
							}),
							recsLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin text-muted-foreground" })
						]
					}),
					recBuildings.length === 0 && !recsLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Visit a few buildings and AI will tailor picks to your activity."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
						children: recBuildings.map(({ b, reason }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/buildings/$id",
							params: { id: b.id },
							className: "group overflow-hidden rounded-xl border border-border bg-card transition hover:shadow-glow",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: b.image,
								alt: b.name,
								className: "h-24 w-full object-cover transition group-hover:scale-105"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs text-muted-foreground",
										children: b.code
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-sm font-semibold",
										children: b.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-1 line-clamp-2 text-xs text-primary/80",
										children: reason
									})
								]
							})]
						}, b.id))
					})
				]
			}),
			recent.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mb-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-4 font-display text-2xl font-semibold",
					children: "Recently viewed"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
					children: recent.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BuildingCard, {
						b,
						index: i
					}, b.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-4 font-display text-2xl font-semibold",
				children: "Explore all locations"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
				children: all.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BuildingCard, {
					b,
					index: i
				}, b.id))
			})] })
		]
	});
}
//#endregion
export { Dashboard as component };
