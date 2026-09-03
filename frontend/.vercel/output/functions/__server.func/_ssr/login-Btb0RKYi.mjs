import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { I as Lock, N as Mail, q as Compass } from "../_libs/lucide-react.mjs";
import { v as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as useAuth } from "./router--Sg3DtRc.mjs";
import { o as login } from "./api-upx-0QUe.mjs";
import { n as GoogleSignInButton, t as AuthDivider } from "./google-signin-DosolT7f.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-Btb0RKYi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LoginPage() {
	const { setSession } = useAuth();
	const nav = useNavigate();
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [err, setErr] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const submit = async (e) => {
		e.preventDefault();
		setErr(null);
		setLoading(true);
		try {
			const { user, token } = await login(email, password);
			setSession(user, token);
			nav({ to: user.role === "admin" ? "/admin/dashboard" : "/dashboard" });
		} catch (e) {
			setErr(e?.message ?? "Login failed");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full rounded-2xl glass-strong p-8 shadow-glow",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-6 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid h-10 w-10 place-items-center rounded-xl",
						style: { background: "var(--gradient-brand)" },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, { className: "h-5 w-5 text-white" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-display text-xl font-bold",
						children: "Welcome back"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground",
						children: "Sign in to Campus Compass"
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: submit,
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: "Email"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 flex items-center gap-2 rounded-lg border border-border bg-background px-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									required: true,
									type: "email",
									value: email,
									onChange: (e) => setEmail(e.target.value),
									className: "w-full bg-transparent py-2.5 text-sm focus:outline-none",
									placeholder: "you@psit.ac.in"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: "Password"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 flex items-center gap-2 rounded-lg border border-border bg-background px-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									required: true,
									type: "password",
									value: password,
									onChange: (e) => setPassword(e.target.value),
									className: "w-full bg-transparent py-2.5 text-sm focus:outline-none",
									placeholder: "••••••••"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/forgot-password",
								className: "text-xs text-primary hover:underline",
								children: "Forgot password?"
							})
						}),
						err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-lg border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive",
							children: err
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							disabled: loading,
							className: "w-full btn-hero btn-hero-hover py-3",
							children: loading ? "Signing in…" : "Sign in"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthDivider, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleSignInButton, { onError: setErr }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-4 text-center text-xs text-muted-foreground",
					children: [
						"No account? ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/register",
							className: "text-primary hover:underline",
							children: "Register"
						}),
						" · Admin? ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/admin",
							className: "text-primary hover:underline",
							children: "Admin login"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-center text-[10px] text-muted-foreground",
					children: [
						"Demo: any email/password works. Use ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "admin@…" }),
						" to see the admin panel."
					]
				})
			]
		})
	});
}
//#endregion
export { LoginPage as component };
