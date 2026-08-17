import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { H as Heart } from "../_libs/lucide-react.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getBuildings } from "./api-upx-0QUe.mjs";
import { r as getFavorites } from "./favorites-D3aR_5-0.mjs";
import { t as BuildingCard } from "./building-card-CLvDw1H-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/favorites-o3Eyqnmt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function FavoritesPage() {
	const [b, setB] = (0, import_react.useState)([]);
	const [ids, setIds] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		getBuildings().then(setB);
		setIds(getFavorites());
	}, []);
	const favs = b.filter((x) => ids.includes(x.id));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-bold md:text-4xl",
				children: "Your favourite places"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground",
				children: "Quick access to the spots you visit most."
			}),
			favs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10 rounded-2xl border border-border bg-card p-10 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "mx-auto h-8 w-8 text-muted-foreground" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-muted-foreground",
						children: "No favourites yet. Tap the heart on any building to save it here."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/map",
						className: "mt-4 inline-block btn-hero btn-hero-hover px-4 py-2 text-sm",
						children: "Open Map"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
				children: favs.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BuildingCard, {
					b: x,
					index: i
				}, x.id))
			})
		]
	});
}
//#endregion
export { FavoritesPage as component };
