import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { D as Mic, O as MicOff, R as LoaderCircle, f as Sparkles, v as Search, x as QrCode } from "../_libs/lucide-react.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as Route$4 } from "./router--Sg3DtRc.mjs";
import { a as getBuildings } from "./api-upx-0QUe.mjs";
import { n as useServerFn } from "./createSsrRpc-CqEh_Aij.mjs";
import { t as BuildingCard } from "./building-card-CLvDw1H-.mjs";
import { n as getAISuggestions } from "./ai.functions-D82dI9Xv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/search-B66vp3x4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function isVoiceSupported() {
	if (typeof window === "undefined") return false;
	return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}
function startVoiceSession(h) {
	if (!isVoiceSupported()) return null;
	const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
	rec.continuous = false;
	rec.interimResults = true;
	rec.lang = "en-US";
	rec.onresult = (e) => {
		let interim = "";
		let finalText = "";
		for (let i = e.resultIndex; i < e.results.length; i++) {
			const r = e.results[i];
			if (r.isFinal) finalText += r[0].transcript;
			else interim += r[0].transcript;
		}
		if (interim) h.onInterim(interim);
		if (finalText) h.onFinal(finalText.trim());
	};
	rec.onerror = (e) => h.onError?.(e.error || "voice_error");
	rec.onend = () => h.onEnd?.();
	try {
		rec.start();
	} catch (err) {
		h.onError?.(err?.message || "start_failed");
		return null;
	}
	return { stop: () => {
		try {
			rec.stop();
		} catch {}
	} };
}
function SearchPage() {
	const { q: initial } = Route$4.useSearch();
	const [all, setAll] = (0, import_react.useState)([]);
	const [q, setQ] = (0, import_react.useState)(initial ?? "");
	const [interim, setInterim] = (0, import_react.useState)("");
	const [listening, setListening] = (0, import_react.useState)(false);
	const [voiceErr, setVoiceErr] = (0, import_react.useState)(null);
	const [aiSuggestions, setAiSuggestions] = (0, import_react.useState)([]);
	const [aiLoading, setAiLoading] = (0, import_react.useState)(false);
	const voiceRef = (0, import_react.useRef)(null);
	const debounceRef = (0, import_react.useRef)(null);
	const fetchSuggestions = useServerFn(getAISuggestions);
	(0, import_react.useEffect)(() => {
		getBuildings().then(setAll);
	}, []);
	const results = (0, import_react.useMemo)(() => {
		const s = q.toLowerCase().trim();
		if (!s) return [];
		return all.filter((b) => [
			b.name,
			b.code,
			b.department,
			b.description,
			...b.facilities,
			...b.rooms.map((r) => `${r.number} ${r.type}`)
		].join(" ").toLowerCase().includes(s));
	}, [q, all]);
	(0, import_react.useEffect)(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		if (!q || q.trim().length < 2 || all.length === 0) {
			setAiSuggestions([]);
			return;
		}
		debounceRef.current = setTimeout(async () => {
			setAiLoading(true);
			try {
				const r = await fetchSuggestions({ data: {
					query: q.trim(),
					buildings: all.map((b) => ({
						id: b.id,
						name: b.name,
						code: b.code,
						department: b.department,
						category: b.category,
						facilities: b.facilities
					}))
				} });
				setAiSuggestions(r.suggestions);
			} catch {
				setAiSuggestions([]);
			} finally {
				setAiLoading(false);
			}
		}, 350);
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, [
		q,
		all,
		fetchSuggestions
	]);
	const toggleVoice = () => {
		setVoiceErr(null);
		if (listening) {
			voiceRef.current?.stop();
			voiceRef.current = null;
			setListening(false);
			return;
		}
		if (!isVoiceSupported()) {
			setVoiceErr("Voice search isn't supported in this browser. Try Chrome or Safari.");
			return;
		}
		const session = startVoiceSession({
			onInterim: (t) => setInterim(t),
			onFinal: (t) => {
				setQ(t);
				setInterim("");
			},
			onError: (e) => setVoiceErr(e === "not-allowed" ? "Microphone permission denied." : `Voice error: ${e}`),
			onEnd: () => {
				setListening(false);
				setInterim("");
				voiceRef.current = null;
			}
		});
		if (session) {
			voiceRef.current = session;
			setListening(true);
		}
	};
	(0, import_react.useEffect)(() => () => voiceRef.current?.stop(), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-bold md:text-4xl",
					children: "Search the campus"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground",
					children: "Buildings, rooms, labs, faculty offices, facilities."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/scan",
					className: "inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-secondary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrCode, { className: "h-4 w-4" }), " Scan QR"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex items-center gap-2 rounded-2xl glass-strong p-2 shadow-soft",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "ml-2 h-5 w-5 text-muted-foreground" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: listening && interim ? interim : q,
						onChange: (e) => setQ(e.target.value),
						placeholder: listening ? "Listening…" : "e.g. AI Lab, A-201, Canteen, Library…",
						className: "w-full bg-transparent px-2 py-3 focus:outline-none"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: toggleVoice,
						"aria-label": listening ? "Stop voice search" : "Start voice search",
						className: "mr-1 grid h-10 w-10 place-items-center rounded-xl border transition " + (listening ? "border-red-500 bg-red-500/10 text-red-500 animate-pulse" : "border-border bg-card hover:bg-secondary"),
						children: listening ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MicOff, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "h-4 w-4" })
					})
				]
			}),
			voiceErr && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 text-xs text-destructive",
				children: voiceErr
			}),
			q.trim().length >= 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 rounded-xl border border-border bg-card/60 p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-xs text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5 text-primary" }),
						"AI suggestions",
						aiLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3 w-3 animate-spin" })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex flex-wrap gap-2",
					children: [aiSuggestions.length === 0 && !aiLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: "Keep typing for smart suggestions…"
					}), aiSuggestions.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setQ(s),
						className: "rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary hover:bg-primary/20",
						children: s
					}, s))]
				})]
			}),
			!q && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap gap-2 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1 text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3 w-3" }), " Try:"]
				}), [
					"Library",
					"AI Lab",
					"Canteen",
					"Auditorium",
					"Hostel",
					"Sports"
				].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setQ(s),
					className: "rounded-full border border-border bg-card px-3 py-1 text-xs hover:bg-secondary",
					children: s
				}, s))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8",
				children: [
					q && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 text-sm text-muted-foreground",
						children: [
							results.length,
							" result",
							results.length !== 1 ? "s" : "",
							" for “",
							q,
							"”"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
						children: results.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BuildingCard, {
							b,
							index: i
						}, b.id))
					}),
					q && results.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground",
						children: "Nothing matched. Try a different keyword."
					})
				]
			})
		]
	});
}
//#endregion
export { SearchPage as component };
