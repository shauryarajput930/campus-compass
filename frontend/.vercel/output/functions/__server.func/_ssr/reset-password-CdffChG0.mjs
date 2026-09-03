import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { I as Lock, it as ArrowLeft, q as Compass } from "../_libs/lucide-react.mjs";
import { v as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as Route$6 } from "./router--Sg3DtRc.mjs";
import { u as resetPassword } from "./api-upx-0QUe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reset-password-CdffChG0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ResetPasswordPage() {
	const { token } = Route$6.useSearch();
	const nav = useNavigate();
	const [password, setPassword] = (0, import_react.useState)("");
	const [confirm, setConfirm] = (0, import_react.useState)("");
	const [err, setErr] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const submit = async (e) => {
		e.preventDefault();
		setErr(null);
		if (password.length < 8) return setErr("Password must be at least 8 characters");
		if (password !== confirm) return setErr("Passwords do not match");
		setLoading(true);
		try {
			await resetPassword(token ?? "", password);
			nav({ to: "/login" });
		} catch (e) {
			setErr(e?.response?.data?.error ?? e?.message ?? "Could not reset password");
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
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-xl font-bold",
						children: "Set a new password"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground",
						children: "Choose something strong and memorable"
					})] })]
				}),
				!token && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive",
					children: [
						"This reset link is missing its token. Request a new link from the",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/forgot-password",
							className: "underline",
							children: "forgot password"
						}),
						" page."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: submit,
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: "New password"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 flex items-center gap-2 rounded-lg border border-border bg-background px-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									required: true,
									type: "password",
									value: password,
									onChange: (e) => setPassword(e.target.value),
									className: "w-full bg-transparent py-2.5 text-sm focus:outline-none",
									placeholder: "••••••••",
									"aria-label": "New password"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: "Confirm password"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 flex items-center gap-2 rounded-lg border border-border bg-background px-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									required: true,
									type: "password",
									value: confirm,
									onChange: (e) => setConfirm(e.target.value),
									className: "w-full bg-transparent py-2.5 text-sm focus:outline-none",
									placeholder: "••••••••",
									"aria-label": "Confirm new password"
								})]
							})]
						}),
						err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-lg border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive",
							children: err
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							disabled: loading || !token,
							className: "w-full btn-hero btn-hero-hover py-3",
							children: loading ? "Updating…" : "Update password"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-center text-xs text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/login",
						className: "inline-flex items-center gap-1 text-primary hover:underline",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3 w-3" }), " Back to sign in"]
					})
				})
			]
		})
	});
}
//#endregion
export { ResetPasswordPage as component };
