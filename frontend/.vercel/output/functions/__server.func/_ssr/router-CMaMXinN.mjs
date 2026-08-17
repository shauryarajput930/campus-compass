import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { A as Map, F as LogIn, H as Heart, N as Mail, P as LogOut, V as Info, k as Menu, p as ShieldCheck, q as Compass, t as X, v as Search, x as QrCode, z as LayoutDashboard } from "../_libs/lucide-react.mjs";
import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { _ as createRootRouteWithContext, b as useRouter, d as useRouterState, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { St as object, lt as _enum, wt as string } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { t as number } from "../_libs/zod.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { n as MotionConfig, r as AnimatePresence, t as motion } from "../_libs/framer-motion.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-CMaMXinN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-D3lc8e8m.css";
var STORAGE_KEY = "cc_theme";
var Ctx$1 = (0, import_react.createContext)(null);
function systemTheme() {
	if (typeof window === "undefined") return "dark";
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function ThemeProvider({ children }) {
	const [theme, setThemeState] = (0, import_react.useState)("dark");
	(0, import_react.useEffect)(() => {
		let initial = systemTheme();
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored === "light" || stored === "dark") initial = stored;
		} catch {}
		setThemeState(initial);
		const mql = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = (e) => {
			try {
				if (localStorage.getItem(STORAGE_KEY)) return;
			} catch {}
			setThemeState(e.matches ? "dark" : "light");
		};
		mql.addEventListener?.("change", onChange);
		return () => mql.removeEventListener?.("change", onChange);
	}, []);
	(0, import_react.useEffect)(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
	}, [theme]);
	const persist = (t) => {
		setThemeState(t);
		try {
			localStorage.setItem(STORAGE_KEY, t);
		} catch {}
	};
	const toggle = () => persist(theme === "dark" ? "light" : "dark");
	const setTheme = (t) => persist(t);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ctx$1.Provider, {
		value: {
			theme,
			toggle,
			setTheme
		},
		children
	});
}
var MotionCtx = (0, import_react.createContext)(null);
function MotionProvider({ children }) {
	const [userPref, setUserPref] = (0, import_react.useState)("system");
	const [systemReduced, setSystemReduced] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const saved = localStorage.getItem("cc_motion") ?? "system";
		setUserPref(saved);
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		setSystemReduced(mq.matches);
		const listener = (e) => setSystemReduced(e.matches);
		mq.addEventListener("change", listener);
		return () => mq.removeEventListener("change", listener);
	}, []);
	const reduced = userPref === "on" ? true : userPref === "off" ? false : systemReduced;
	(0, import_react.useEffect)(() => {
		document.documentElement.classList.toggle("reduce-motion", reduced);
		localStorage.setItem("cc_motion", userPref);
	}, [reduced, userPref]);
	const toggle = () => setUserPref(reduced ? "off" : "on");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MotionCtx.Provider, {
		value: {
			userPref,
			reduced,
			setPref: setUserPref,
			toggle
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MotionConfig, {
			reducedMotion: reduced ? "always" : "never",
			children
		})
	});
}
var Ctx = (0, import_react.createContext)(null);
function AuthProvider({ children }) {
	const [user, setUser] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const raw = localStorage.getItem("cc_user");
		if (raw) try {
			setUser(JSON.parse(raw));
		} catch {}
	}, []);
	const setSession = (u, token) => {
		setUser(u);
		if (u && token) {
			localStorage.setItem("cc_user", JSON.stringify(u));
			localStorage.setItem("cc_token", token);
		} else {
			localStorage.removeItem("cc_user");
			localStorage.removeItem("cc_token");
		}
	};
	const logout = () => setSession(null, null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ctx.Provider, {
		value: {
			user,
			setSession,
			logout
		},
		children
	});
}
function useAuth() {
	const ctx = (0, import_react.useContext)(Ctx);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
}
var nav = [
	{
		to: "/",
		label: "Home",
		icon: Compass
	},
	{
		to: "/map",
		label: "Map",
		icon: Map
	},
	{
		to: "/search",
		label: "Search",
		icon: Search
	},
	{
		to: "/scan",
		label: "Scan",
		icon: QrCode
	},
	{
		to: "/dashboard",
		label: "Dashboard",
		icon: LayoutDashboard
	},
	{
		to: "/favorites",
		label: "Favourites",
		icon: Heart
	},
	{
		to: "/about",
		label: "About",
		icon: Info
	},
	{
		to: "/contact",
		label: "Contact",
		icon: Mail
	}
];
function Navbar() {
	const { user, logout } = useAuth();
	const router = useRouter();
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-40 glass-strong",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-hidden rounded-xl border border-border shadow-glow",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: "/logo.png",
							alt: "Campus Compass logo",
							className: "h-9 w-9 object-cover"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "leading-tight",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-display text-lg font-bold",
							children: "Campus Compass"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] uppercase tracking-widest text-muted-foreground",
							children: "Navigate smarter"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "hidden items-center gap-1 md:flex",
					children: nav.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: n.to,
						className: "rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground",
						activeProps: { className: "rounded-lg px-3 py-2 text-sm text-foreground bg-secondary" },
						activeOptions: { exact: n.to === "/" },
						children: n.label
					}, n.to))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [user.role === "admin" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/admin/dashboard",
						className: "hidden items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs md:inline-flex",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4" }), " Admin"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							logout();
							router.navigate({ to: "/" });
						},
						className: "inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs hover:bg-secondary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" }), " Sign out"]
					})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/login",
						className: "inline-flex items-center gap-1 rounded-lg btn-hero btn-hero-hover px-3 py-2 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogIn, { className: "h-4 w-4" }), " Sign in"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setOpen((o) => !o),
						className: "grid h-9 w-9 place-items-center rounded-lg border border-border bg-card md:hidden",
						"aria-label": "Menu",
						children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "h-4 w-4" })
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
			initial: {
				height: 0,
				opacity: 0
			},
			animate: {
				height: "auto",
				opacity: 1
			},
			exit: {
				height: 0,
				opacity: 0
			},
			className: "md:hidden overflow-hidden border-t border-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-1 p-3",
				children: nav.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: n.to,
					onClick: () => setOpen(false),
					className: "flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-secondary",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(n.icon, { className: "h-4 w-4" }),
						" ",
						n.label
					]
				}, n.to))
			})
		}) })]
	});
}
function Footer() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "mt-24 border-t border-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid h-8 w-8 place-items-center rounded-lg",
						style: { background: "var(--gradient-brand)" },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, { className: "h-4 w-4 text-white" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display font-bold",
						children: "Campus Compass"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted-foreground",
					children: "Navigate your campus smarter. Interactive maps, live directions, and building info at your fingertips."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
					className: "mb-3 text-sm font-semibold",
					children: "Explore"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "space-y-2 text-sm text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/map",
							className: "hover:text-foreground",
							children: "Campus Map"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/search",
							className: "hover:text-foreground",
							children: "Search"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/favorites",
							className: "hover:text-foreground",
							children: "Favourites"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/dashboard",
							className: "hover:text-foreground",
							children: "Dashboard"
						}) })
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
					className: "mb-3 text-sm font-semibold",
					children: "Company"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "space-y-2 text-sm text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/about",
							className: "hover:text-foreground",
							children: "About"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/contact",
							className: "hover:text-foreground",
							children: "Contact"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/admin",
							className: "hover:text-foreground",
							children: "Admin"
						}) })
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
					className: "mb-3 text-sm font-semibold",
					children: "Emergency"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "space-y-2 text-sm text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Security: +91 98765 43210" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Medical: +91 98765 43211" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Reception: +91 98765 43212" })
					]
				})] })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-t border-border py-4 text-center text-xs text-muted-foreground",
			children: [
				"© ",
				(/* @__PURE__ */ new Date()).getFullYear(),
				" Campus Compass · Built for PSIT"
			]
		})]
	});
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mesh-bg absolute inset-0 -z-10 opacity-40" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "gradient-text font-display text-8xl font-black",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 font-display text-2xl font-semibold",
					children: "You wandered off the map"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "This location isn't on the campus grid."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "/",
					className: "mt-6 inline-flex btn-hero btn-hero-hover px-5 py-3",
					children: "Back to Campus"
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	const router = useRouter();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-semibold",
					children: "Something broke on our end"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Try again or head home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "btn-hero btn-hero-hover px-4 py-2",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "rounded-lg border border-border px-4 py-2 text-sm",
						children: "Home"
					})]
				})
			]
		})
	});
}
var Route$17 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Campus Compass — Navigate Your Campus Smarter" },
			{
				name: "description",
				content: "Interactive campus navigation for PSIT. Find buildings, classrooms, labs and facilities with real-time directions."
			},
			{
				name: "author",
				content: "Campus Compass"
			},
			{
				property: "og:title",
				content: "Campus Compass — Navigate Your Campus Smarter"
			},
			{
				property: "og:description",
				content: "Interactive maps, smart search and turn-by-turn campus navigation."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				href: "/logo.png",
				type: "image/png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700;800&display=swap"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
var themeInitScript = `(function(){try{var s=localStorage.getItem('cc_theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){document.documentElement.classList.add('dark');}})();`;
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "dark",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("head", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", { dangerouslySetInnerHTML: { __html: themeInitScript } }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$17.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MotionProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChromeShell, {}) }) }) })
	});
}
function ChromeShell() {
	const bare = useRouterState({ select: (s) => s.location.pathname }).startsWith("/admin");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mesh-bg min-h-screen",
		children: [
			!bare && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navbar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }),
			!bare && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
		]
	});
}
var $$splitComponentImporter$15 = () => import("./routes-BYKlm75G.mjs");
var Route$16 = createFileRoute("/")({
	head: () => ({ meta: [{ title: "Campus Compass — Navigate Your Campus Smarter" }, {
		name: "description",
		content: "Find any classroom, lab or facility on PSIT campus in seconds."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("./about-DnMQ9eiB.mjs");
var Route$15 = createFileRoute("/about")({
	head: () => ({ meta: [{ title: "About — Campus Compass" }, {
		name: "description",
		content: "The story behind Campus Compass — smart navigation for PSIT."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./contact-db35pP2L.mjs");
var Route$14 = createFileRoute("/contact")({
	head: () => ({ meta: [{ title: "Contact — Campus Compass" }, {
		name: "description",
		content: "Get in touch with the Campus Compass team."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./dashboard-gEzOjiaB.mjs");
var Route$13 = createFileRoute("/dashboard")({
	head: () => ({ meta: [{ title: "Dashboard — Campus Compass" }] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./favorites-o3Eyqnmt.mjs");
var Route$12 = createFileRoute("/favorites")({
	head: () => ({ meta: [{ title: "Favourites — Campus Compass" }] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./forgot-password-DICgTaUh.mjs");
var Route$11 = createFileRoute("/forgot-password")({
	head: () => ({ meta: [
		{ title: "Reset your password — Campus Compass" },
		{
			name: "description",
			content: "Forgot your Campus Compass password? Request a secure reset link and get back to navigating the PSIT campus."
		},
		{
			property: "og:title",
			content: "Reset your password — Campus Compass"
		},
		{
			property: "og:description",
			content: "Request a secure password reset link for your Campus Compass account."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./login-olQRXRRE.mjs");
var Route$10 = createFileRoute("/login")({
	head: () => ({ meta: [{ title: "Sign in — Campus Compass" }] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./map-xPbCh-7f.mjs");
var Route$9 = createFileRoute("/map")({
	head: () => ({ meta: [{ title: "Campus Map — Campus Compass" }, {
		name: "description",
		content: "Interactive campus map with markers, real photos and building details."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./navigate-DiTv4-Ij.mjs");
var search = object({
	from: string().optional().catch(""),
	to: string().optional().catch(""),
	mode: _enum([
		"WALK",
		"DRIVE",
		"BICYCLE"
	]).optional().catch(void 0),
	fromLat: number().optional().catch(void 0),
	fromLng: number().optional().catch(void 0)
});
var Route$8 = createFileRoute("/navigate")({
	validateSearch: search,
	head: () => ({ meta: [{ title: "Get directions — Campus Compass" }] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./register-OASuc5vu.mjs");
var Route$7 = createFileRoute("/register")({
	head: () => ({ meta: [{ title: "Create account — Campus Compass" }] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./reset-password-SC6xP-rc.mjs");
var Route$6 = createFileRoute("/reset-password")({
	validateSearch: (search) => ({ token: typeof search.token === "string" ? search.token : void 0 }),
	head: () => ({ meta: [
		{ title: "Set a new password — Campus Compass" },
		{
			name: "description",
			content: "Choose a new password for your Campus Compass account and continue navigating the PSIT campus."
		},
		{
			property: "og:title",
			content: "Set a new password — Campus Compass"
		},
		{
			property: "og:description",
			content: "Choose a new password for your Campus Compass account."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./scan-CXnnyRxG.mjs");
var Route$5 = createFileRoute("/scan")({
	head: () => ({ meta: [{ title: "Scan QR — Campus Compass" }, {
		name: "description",
		content: "Scan a Campus Compass building QR code to open its details instantly."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./search-ClKL5XxV.mjs");
var searchSchema = object({ q: string().optional().catch("") });
var Route$4 = createFileRoute("/search")({
	validateSearch: searchSchema,
	head: () => ({ meta: [{ title: "Search — Campus Compass" }] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./admin.index-oxU7TQR1.mjs");
var Route$3 = createFileRoute("/admin/")({
	head: () => ({ meta: [{ title: "Admin login — Campus Compass" }] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./admin.dashboard-Dwxy8Nvy.mjs");
var Route$2 = createFileRoute("/admin/dashboard")({
	head: () => ({ meta: [{ title: "Admin dashboard — Campus Compass" }] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitNotFoundComponentImporter = () => import("./buildings._id-BcUebcsK.mjs");
var $$splitComponentImporter = () => import("./buildings._id-BGV82rDJ.mjs");
var Route$1 = createFileRoute("/buildings/$id")({
	head: () => ({ meta: [{ title: "Building details — Campus Compass" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
var IndexRoute = Route$16.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$17
});
var AboutRoute = Route$15.update({
	id: "/about",
	path: "/about",
	getParentRoute: () => Route$17
});
var ContactRoute = Route$14.update({
	id: "/contact",
	path: "/contact",
	getParentRoute: () => Route$17
});
var DashboardRoute = Route$13.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => Route$17
});
var FavoritesRoute = Route$12.update({
	id: "/favorites",
	path: "/favorites",
	getParentRoute: () => Route$17
});
var ForgotPasswordRoute = Route$11.update({
	id: "/forgot-password",
	path: "/forgot-password",
	getParentRoute: () => Route$17
});
var LoginRoute = Route$10.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$17
});
var MapRoute = Route$9.update({
	id: "/map",
	path: "/map",
	getParentRoute: () => Route$17
});
var NavigateRoute = Route$8.update({
	id: "/navigate",
	path: "/navigate",
	getParentRoute: () => Route$17
});
var RegisterRoute = Route$7.update({
	id: "/register",
	path: "/register",
	getParentRoute: () => Route$17
});
var ResetPasswordRoute = Route$6.update({
	id: "/reset-password",
	path: "/reset-password",
	getParentRoute: () => Route$17
});
var ScanRoute = Route$5.update({
	id: "/scan",
	path: "/scan",
	getParentRoute: () => Route$17
});
var SearchRoute = Route$4.update({
	id: "/search",
	path: "/search",
	getParentRoute: () => Route$17
});
var AdminIndexRoute = Route$3.update({
	id: "/admin/",
	path: "/admin/",
	getParentRoute: () => Route$17
});
var rootRouteChildren = {
	IndexRoute,
	AboutRoute,
	ContactRoute,
	DashboardRoute,
	FavoritesRoute,
	ForgotPasswordRoute,
	LoginRoute,
	MapRoute,
	NavigateRoute,
	RegisterRoute,
	ResetPasswordRoute,
	ScanRoute,
	SearchRoute,
	AdminDashboardRoute: Route$2.update({
		id: "/admin/dashboard",
		path: "/admin/dashboard",
		getParentRoute: () => Route$17
	}),
	BuildingsIdRoute: Route$1.update({
		id: "/buildings/$id",
		path: "/buildings/$id",
		getParentRoute: () => Route$17
	}),
	AdminIndexRoute
};
var routeTree = Route$17._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { Route$8 as a, Route$6 as i, Route$1 as n, useAuth as o, Route$4 as r, router_exports as t };
