import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { $ as Camera, f as Sparkles, j as MapPinned, rt as ArrowRight, v as Search, y as Route } from "../_libs/lucide-react.mjs";
import { v as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as motion } from "../_libs/framer-motion.mjs";
import { a as getBuildings, d as stats } from "./api-upx-0QUe.mjs";
import { t as BuildingCard } from "./building-card-CLvDw1H-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BYKlm75G.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Landing() {
	const [q, setQ] = (0, import_react.useState)("");
	const [featured, setFeatured] = (0, import_react.useState)([]);
	const nav = useNavigate();
	(0, import_react.useEffect)(() => {
		getBuildings().then((b) => setFeatured(b.slice(0, 6)));
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "relative overflow-hidden",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "hero-bg absolute inset-0 -z-10 opacity-90" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 -z-10 bg-[radial-gradient(600px_circle_at_30%_20%,rgba(255,255,255,0.15),transparent)]" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto max-w-7xl px-4 py-24 md:py-32 text-white",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							y: 20
						},
						animate: {
							opacity: 1,
							y: 0
						},
						className: "max-w-3xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs backdrop-blur",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5" }), " Smart navigation for PSIT"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "mt-5 font-display text-5xl font-black leading-tight md:text-7xl",
								children: [
									"Navigate your campus, ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-white/90",
										children: "smarter."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-5 max-w-2xl text-lg text-white/85",
								children: "Find any building, classroom, lab, department or facility on campus in seconds — with real photos, live directions and turn-by-turn guidance."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								onSubmit: (e) => {
									e.preventDefault();
									nav({
										to: "/search",
										search: { q }
									});
								},
								className: "mt-8 flex max-w-2xl items-center gap-2 rounded-2xl glass-strong p-2 shadow-glow",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "ml-2 h-5 w-5 text-white/80" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: q,
										onChange: (e) => setQ(e.target.value),
										placeholder: "Search building, classroom, lab, department…",
										className: "w-full bg-transparent px-2 py-3 text-white placeholder:text-white/60 focus:outline-none"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "submit",
										className: "btn-hero btn-hero-hover inline-flex items-center gap-1 px-5 py-3",
										children: ["Explore ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6 flex flex-wrap gap-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/map",
									className: "rounded-lg border border-white/25 bg-white/10 px-4 py-2 backdrop-blur hover:bg-white/20",
									children: "Open Campus Map"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/navigate",
									className: "rounded-lg border border-white/25 bg-white/10 px-4 py-2 backdrop-blur hover:bg-white/20",
									children: "Get Directions"
								})]
							})
						]
					})
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "mx-auto -mt-12 max-w-7xl px-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-3 rounded-2xl glass-strong p-4 shadow-soft md:grid-cols-4",
				children: [
					{
						label: "Departments",
						value: stats.departments
					},
					{
						label: "Buildings",
						value: stats.buildings
					},
					{
						label: "Labs",
						value: stats.labs
					},
					{
						label: "Students",
						value: stats.students
					}
				].map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					initial: {
						opacity: 0,
						y: 10
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: { delay: i * .08 },
					className: "rounded-xl bg-card/60 p-4 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "font-display text-3xl font-bold gradient-text",
						children: [s.value.toLocaleString(), "+"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1 text-xs uppercase tracking-widest text-muted-foreground",
						children: s.label
					})]
				}, s.label))
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto max-w-7xl px-4 py-20",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-10 max-w-2xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-3xl font-bold md:text-4xl",
					children: "Everything you need to find your way"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-muted-foreground",
					children: "From marker-rich maps to smart search — Campus Compass is built for students, faculty and visitors."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4",
				children: [
					{
						icon: MapPinned,
						title: "Interactive Map",
						desc: "Every building marked with photos, departments and facilities."
					},
					{
						icon: Search,
						title: "Smart Search",
						desc: "Search across buildings, rooms, labs, offices and services."
					},
					{
						icon: Camera,
						title: "Real Photos",
						desc: "See the actual building before you set out."
					},
					{
						icon: Route,
						title: "Route Navigation",
						desc: "Turn-by-turn directions with distance & walking time."
					}
				].map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					initial: {
						opacity: 0,
						y: 20
					},
					whileInView: {
						opacity: 1,
						y: 0
					},
					viewport: { once: true },
					transition: { delay: i * .05 },
					className: "rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:shadow-glow",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-11 w-11 place-items-center rounded-xl",
							style: { background: "var(--gradient-brand)" },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(f.icon, { className: "h-5 w-5 text-white" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-4 font-display text-lg font-semibold",
							children: f.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: f.desc
						})
					]
				}, f.title))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto max-w-7xl px-4 pb-24",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex items-end justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-3xl font-bold",
					children: "Popular locations"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground",
					children: "Frequently visited by students today."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/map",
					className: "text-sm text-primary hover:underline",
					children: "See all →"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
				children: featured.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BuildingCard, {
					b,
					index: i
				}, b.id))
			})]
		})
	] });
}
//#endregion
export { Landing as component };
