import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { N as Mail, Y as CircleCheck, it as ArrowLeft, q as Compass } from "../_libs/lucide-react.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as requestPasswordReset } from "./api-upx-0QUe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/forgot-password-DICgTaUh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ForgotPasswordPage() {
	const [email, setEmail] = (0, import_react.useState)("");
	const [err, setErr] = (0, import_react.useState)(null);
	const [sent, setSent] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const submit = async (e) => {
		e.preventDefault();
		setErr(null);
		setLoading(true);
		try {
			await requestPasswordReset(email);
			setSent(true);
		} catch (e) {
			setErr(e?.response?.data?.error ?? e?.message ?? "Could not send reset link");
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
						children: "Forgot password?"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground",
						children: "We'll email you a reset link"
					})] })]
				}),
				sent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					"aria-live": "polite",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mt-0.5 h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"If an account exists for ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: email }),
							", a password reset link is on its way. Check your inbox and spam folder."
						] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setSent(false),
						className: "w-full rounded-lg border border-border py-2.5 text-sm hover:bg-secondary",
						children: "Use a different email"
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
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
									placeholder: "you@psit.ac.in",
									"aria-label": "Email address"
								})]
							})]
						}),
						err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-lg border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive",
							children: err
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							disabled: loading,
							className: "w-full btn-hero btn-hero-hover py-3",
							children: loading ? "Sending link…" : "Send reset link"
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
export { ForgotPasswordPage as component };
