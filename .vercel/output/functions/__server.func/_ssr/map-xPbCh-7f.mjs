import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { a as getBuildings } from "./api-upx-0QUe.mjs";
import { t as CampusMap } from "./campus-map-C37GgseY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/map-xPbCh-7f.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MapPage() {
	const [b, setB] = (0, import_react.useState)([]);
	const [cat, setCat] = (0, import_react.useState)("all");
	(0, import_react.useEffect)(() => {
		getBuildings().then(setB);
	}, []);
	const filtered = cat === "all" ? b : b.filter((x) => x.category === cat);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-4 py-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex flex-wrap items-end justify-between gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-bold md:text-4xl",
				children: "Campus Map"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground",
				children: "Tap any marker to see details, photos and directions."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					{
						id: "all",
						label: "All"
					},
					{
						id: "academic",
						label: "Academic"
					},
					{
						id: "hostel",
						label: "Hostel"
					},
					{
						id: "sports",
						label: "Sports"
					},
					{
						id: "food",
						label: "Food"
					},
					{
						id: "facility",
						label: "Facilities"
					},
					{
						id: "admin",
						label: "Admin"
					}
				].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setCat(c.id),
					className: "rounded-full border px-3 py-1.5 text-xs " + (cat === c.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"),
					children: c.label
				}, c.id))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampusMap, {
			buildings: filtered,
			height: "75vh"
		})]
	});
}
//#endregion
export { MapPage as component };
