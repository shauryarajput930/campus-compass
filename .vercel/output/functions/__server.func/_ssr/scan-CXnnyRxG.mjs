import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { $ as Camera, Y as CircleCheck, m as ShieldAlert, t as X, x as QrCode } from "../_libs/lucide-react.mjs";
import { y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getBuildings } from "./api-upx-0QUe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/scan-CXnnyRxG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ID_RE = /^[a-z0-9][a-z0-9-]{1,39}$/;
var MAX_PAYLOAD_LEN = 512;
var MIN_INTERVAL_MS = 1e3;
var WINDOW_MS = 6e4;
var MAX_PER_WINDOW = 20;
function extractBuildingId(payload) {
	if (typeof payload !== "string" || payload.length === 0 || payload.length > MAX_PAYLOAD_LEN) return null;
	const trimmed = payload.trim();
	try {
		const url = new URL(trimmed);
		if (typeof window !== "undefined" && url.origin !== window.location.origin) return null;
		if (url.protocol !== "http:" && url.protocol !== "https:") return null;
		const m = url.pathname.match(/^\/buildings\/([^/?#]+)\/?$/);
		if (!m) return null;
		const id = decodeURIComponent(m[1]).toLowerCase();
		return ID_RE.test(id) ? id : null;
	} catch {}
	const id = trimmed.toLowerCase();
	return ID_RE.test(id) ? id : null;
}
function ScanPage() {
	const navigate = useNavigate();
	const boxRef = (0, import_react.useRef)(null);
	const scannerRef = (0, import_react.useRef)(null);
	const attemptsRef = (0, import_react.useRef)([]);
	const lastAttemptAtRef = (0, import_react.useRef)(0);
	const handledRef = (0, import_react.useRef)(false);
	const [status, setStatus] = (0, import_react.useState)("idle");
	const [error, setError] = (0, import_react.useState)(null);
	const [feedback, setFeedback] = (0, import_react.useState)(null);
	const [buildings, setBuildings] = (0, import_react.useState)([]);
	const validIdsRef = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	(0, import_react.useEffect)(() => {
		getBuildings().then((list) => {
			setBuildings(list);
			validIdsRef.current = new Set(list.map((b) => b.id));
		});
	}, []);
	const start = async () => {
		setError(null);
		setFeedback(null);
		handledRef.current = false;
		setStatus("running");
		try {
			const Html5Qrcode = (await import("../_libs/html5-qrcode.mjs").then((n) => n.t)).Html5Qrcode;
			const el = boxRef.current;
			el.id = el.id || "cc-qr-reader";
			const scanner = new Html5Qrcode(el.id);
			scannerRef.current = scanner;
			await scanner.start({ facingMode: "environment" }, {
				fps: 10,
				qrbox: {
					width: 240,
					height: 240
				}
			}, (decoded) => onDecoded(decoded), () => {});
		} catch (e) {
			setStatus("error");
			setError(e?.message || "Could not open camera. Grant permission and try again.");
		}
	};
	const stop = async () => {
		try {
			await scannerRef.current?.stop();
			await scannerRef.current?.clear();
		} catch {}
		scannerRef.current = null;
		setStatus("idle");
	};
	const throttleAllows = () => {
		const now = Date.now();
		if (now - lastAttemptAtRef.current < MIN_INTERVAL_MS) return false;
		attemptsRef.current = attemptsRef.current.filter((t) => now - t < WINDOW_MS);
		if (attemptsRef.current.length >= MAX_PER_WINDOW) return false;
		attemptsRef.current.push(now);
		lastAttemptAtRef.current = now;
		return true;
	};
	const onDecoded = (text) => {
		if (handledRef.current) return;
		if (!throttleAllows()) {
			setFeedback({
				kind: "warn",
				message: "Slow down — too many scans. Pause a moment before trying again."
			});
			return;
		}
		const id = extractBuildingId(text);
		if (!id) {
			setFeedback({
				kind: "err",
				message: "This QR isn't a Campus Compass building code. Only official campus stickers are supported."
			});
			return;
		}
		if (!validIdsRef.current.has(id)) {
			setFeedback({
				kind: "err",
				message: `Building "${id}" isn't in the campus directory. Ask an admin to add it or scan a different code.`
			});
			return;
		}
		handledRef.current = true;
		setFeedback({
			kind: "ok",
			message: `Opening ${id}…`
		});
		stop().then(() => navigate({
			to: "/buildings/$id",
			params: { id }
		}));
	};
	(0, import_react.useEffect)(() => {
		return () => {
			stop();
		};
	}, []);
	const feedbackClass = feedback?.kind === "ok" ? "border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400" : feedback?.kind === "warn" ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400" : "border-destructive/40 bg-destructive/10 text-destructive";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrCode, { className: "h-7 w-7 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-bold md:text-4xl",
					children: "Scan QR Code"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-muted-foreground",
				children: "Point your camera at a Campus Compass QR sticker on any building to open its details."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-soft",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					ref: boxRef,
					id: "cc-qr-reader",
					className: "min-h-[320px] w-full bg-black"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3 p-4",
					children: [status !== "running" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: start,
						className: "btn-hero btn-hero-hover inline-flex items-center gap-2 px-5 py-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "h-4 w-4" }), " Start camera"]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: stop,
						className: "inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), " Stop"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: buildings.length > 0 ? `${buildings.length} buildings recognised` : "Loading directory…"
					})]
				})]
			}),
			feedback && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `mt-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${feedbackClass}`,
				children: [feedback.kind === "ok" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mt-0.5 h-4 w-4 shrink-0" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "mt-0.5 h-4 w-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: feedback.message })]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground",
				children: "Tip: On each building's details page, tap “Share via QR” to download a print-ready sticker."
			})
		]
	});
}
//#endregion
export { ScanPage as component };
