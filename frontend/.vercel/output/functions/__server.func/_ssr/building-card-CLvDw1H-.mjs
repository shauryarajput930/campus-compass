import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { H as Heart, M as MapPin } from "../_libs/lucide-react.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as motion } from "../_libs/framer-motion.mjs";
import { l as toggleFavorite } from "./favorites-D3aR_5-0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/building-card-CLvDw1H-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BuildingCard({ b, index = 0 }) {
	const [fav, setFav] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const list = JSON.parse(localStorage.getItem("cc_favorites") || "[]");
		setFav(list.includes(b.id));
	}, [b.id]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		initial: {
			opacity: 0,
			y: 12
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: { delay: index * .04 },
		className: "group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-glow",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/buildings/$id",
			params: { id: b.id },
			className: "block",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative h-44 overflow-hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: b.image,
						alt: b.name,
						className: "h-full w-full object-cover transition duration-500 group-hover:scale-105"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute left-3 top-3 rounded-full bg-black/50 px-2 py-0.5 text-[10px] uppercase tracking-widest text-white",
						children: b.code
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground",
						children: b.department
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-base font-semibold",
						children: b.name
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: (e) => {
							e.preventDefault();
							const n = toggleFavorite(b.id);
							setFav(n.includes(b.id));
						},
						className: "grid h-8 w-8 place-items-center rounded-lg border border-border",
						"aria-label": "Favourite",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "h-4 w-4 " + (fav ? "fill-red-500 text-red-500" : "") })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 line-clamp-2 text-sm text-muted-foreground",
					children: b.description
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex items-center gap-3 text-xs text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3 w-3" }),
							" ",
							b.openingTime
						]
					})
				})
			]
		})]
	});
}
//#endregion
export { BuildingCard as t };
