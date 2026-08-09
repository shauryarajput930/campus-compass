import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { p as ShieldCheck } from "../_libs/lucide-react.mjs";
import { v as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as useAuth } from "./router-CMaMXinN.mjs";
import { o as login } from "./api-upx-0QUe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.index-oxU7TQR1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminLogin() {
	const { setSession } = useAuth();
	const nav = useNavigate();
	const [email, setEmail] = (0, import_react.useState)("admin@psit.ac.in");
	const [password, setPassword] = (0, import_react.useState)("");
	const [err, setErr] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const submit = async (e) => {
		e.preventDefault();
		setErr(null);
		setLoading(true);
		try {
			const { user, token } = await login(email, password);
			if (user.role !== "admin") {
				setErr("Not an admin account");
				return;
			}
			setSession(user, token);
			nav({ to: "/admin/dashboard" });
		} catch (e) {
			setErr(e?.message ?? "Login failed");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mesh-bg min-h-screen",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto flex min-h-screen max-w-md items-center px-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full rounded-2xl glass-strong p-8 shadow-glow",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-6 flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-10 w-10 place-items-center rounded-xl",
							style: { background: "var(--gradient-brand)" },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-5 w-5 text-white" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-display text-xl font-bold",
							children: "Admin Portal"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: "Restricted access"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: submit,
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								type: "email",
								value: email,
								onChange: (e) => setEmail(e.target.value),
								className: "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm",
								placeholder: "admin@psit.ac.in"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								type: "password",
								value: password,
								onChange: (e) => setPassword(e.target.value),
								className: "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm",
								placeholder: "Password"
							}),
							err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-lg border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive",
								children: err
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								disabled: loading,
								className: "w-full btn-hero btn-hero-hover py-3",
								children: loading ? "Signing in…" : "Sign in as admin"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 text-center text-[11px] text-muted-foreground",
						children: ["Not admin? ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/login",
							className: "text-primary hover:underline",
							children: "User login"
						})]
					})
				]
			})
		})
	});
}
//#endregion
export { AdminLogin as component };
