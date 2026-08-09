import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as Target, q as Compass, r as Users } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/about-DnMQ9eiB.js
var import_jsx_runtime = require_jsx_runtime();
function About() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl px-4 py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs uppercase tracking-widest text-muted-foreground",
				children: "About"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 font-display text-4xl font-black md:text-5xl",
				children: "We help people find their way around campus."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-2xl text-muted-foreground",
				children: "Campus Compass was built to solve a simple problem: new students, visitors and even faculty often struggle to locate specific classrooms, labs and offices spread across the campus. We built an interactive, photo-rich navigation platform to make finding anything on campus effortless."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-10 grid gap-4 md:grid-cols-3",
				children: [
					{
						icon: Compass,
						title: "Our Mission",
						desc: "Turn campus wayfinding into a delightful, one-tap experience."
					},
					{
						icon: Target,
						title: "Our Vision",
						desc: "Every campus in India navigable from a single, elegant app."
					},
					{
						icon: Users,
						title: "Who It's For",
						desc: "Students, faculty, parents, visitors and event guests."
					}
				].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-card p-5 shadow-soft",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-11 w-11 place-items-center rounded-xl",
							style: { background: "var(--gradient-brand)" },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(c.icon, { className: "h-5 w-5 text-white" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-4 font-display text-lg font-semibold",
							children: c.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: c.desc
						})
					]
				}, c.title))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-14 rounded-3xl glass-strong p-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl font-bold",
					children: "Built with a modern stack"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "React, TanStack Router, Tailwind CSS v4, Framer Motion and Google Maps — served fast at the edge."
				})]
			})
		]
	});
}
//#endregion
export { About as component };
