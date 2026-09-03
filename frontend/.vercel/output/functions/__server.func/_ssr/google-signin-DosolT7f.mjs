import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as useAuth } from "./router--Sg3DtRc.mjs";
import { s as loginWithGoogle } from "./api-upx-0QUe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/google-signin-DosolT7f.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function GoogleSignInButton({ onError }) {
	const { setSession } = useAuth();
	const nav = useNavigate();
	(0, import_react.useRef)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const finish = async (credential) => {
		setBusy(true);
		try {
			const { user, token } = await loginWithGoogle(credential);
			setSession(user, token);
			nav({ to: user.role === "admin" ? "/admin/dashboard" : "/dashboard" });
		} catch (e) {
			onError?.(e?.response?.data?.error ?? e?.message ?? "Google sign-in failed");
		} finally {
			setBusy(false);
		}
	};
	(0, import_react.useEffect)(() => {}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			disabled: busy,
			onClick: () => void finish("demo"),
			className: "flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card py-2.5 text-sm hover:bg-secondary",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleGlyph, {}),
				" ",
				busy ? "Signing in…" : "Continue with Google"
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-center text-[10px] text-muted-foreground",
			children: [
				"Demo mode — set ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "VITE_GOOGLE_CLIENT_ID" }),
				" to enable real Google sign-in."
			]
		})]
	});
}
function GoogleGlyph() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 24 24",
		className: "h-4 w-4",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#4285F4",
				d: "M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.1a5.2 5.2 0 0 1-2.3 3.4v2.8h3.6c2.1-2 3.6-4.9 3.6-8.4Z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#34A853",
				d: "M12 24c3.1 0 5.7-1 7.4-2.8l-3.6-2.8c-1 .7-2.3 1.1-3.8 1.1a6.7 6.7 0 0 1-6.3-4.6H1.9v2.9A12 12 0 0 0 12 24Z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#FBBC05",
				d: "M5.7 14.9a7.2 7.2 0 0 1 0-4.6V7.4H1.9a12 12 0 0 0 0 10.8l3.8-3.3Z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#EA4335",
				d: "M12 4.8c1.7 0 3.3.6 4.5 1.8l3.2-3.2A12 12 0 0 0 1.9 7.4l3.8 2.9A6.7 6.7 0 0 1 12 4.8Z"
			})
		]
	});
}
function AuthDivider() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "my-5 flex items-center gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px flex-1 bg-border" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[10px] uppercase tracking-widest text-muted-foreground",
				children: "or"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px flex-1 bg-border" })
		]
	});
}
//#endregion
export { GoogleSignInButton as n, AuthDivider as t };
