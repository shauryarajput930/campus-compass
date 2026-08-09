import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { E as Navigation, H as Heart, J as Clock, K as Copy, L as LocateFixed, M as MapPin, R as LoaderCircle, W as Download, X as Check, et as Building2 } from "../_libs/lucide-react.mjs";
import { B as notFound, v as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Route$1 } from "./router-CMaMXinN.mjs";
import { i as getBuilding } from "./api-upx-0QUe.mjs";
import { l as toggleFavorite, o as pushRecent } from "./favorites-D3aR_5-0.mjs";
import { t as CampusMap } from "./campus-map-C37GgseY.mjs";
import { t as QRCodeSVG } from "../_libs/qrcode.react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/buildings._id-BGV82rDJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BuildingQRCode({ id, name }) {
	const url = typeof window !== "undefined" ? `${window.location.origin}/buildings/${id}` : `/buildings/${id}`;
	const [copied, setCopied] = (0, import_react.useState)(false);
	const download = () => {
		const svg = document.getElementById(`qr-${id}`);
		if (!svg) return;
		const xml = new XMLSerializer().serializeToString(svg);
		const blob = new Blob([xml], { type: "image/svg+xml" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = `campus-compass-${id}.svg`;
		link.click();
		URL.revokeObjectURL(link.href);
	};
	const copy = async () => {
		await navigator.clipboard.writeText(url);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground",
				children: "Share via QR"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: [
					"Scan to open ",
					name,
					" on any phone."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid place-items-center rounded-xl bg-white p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QRCodeSVG, {
					id: `qr-${id}`,
					value: url,
					size: 160,
					level: "M",
					includeMargin: false
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: download,
					className: "flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-border px-3 py-2 text-xs hover:bg-secondary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), " Download"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: copy,
					className: "flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-border px-3 py-2 text-xs hover:bg-secondary",
					children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5 text-green-500" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "h-3.5 w-3.5" }), copied ? "Copied" : "Copy link"]
				})]
			})
		]
	});
}
function BuildingDetails() {
	const { id } = Route$1.useParams();
	const navigate = useNavigate();
	const [b, setB] = (0, import_react.useState)(null);
	const [fav, setFav] = (0, import_react.useState)(false);
	const [notFoundFlag, setNF] = (0, import_react.useState)(false);
	const [locating, setLocating] = (0, import_react.useState)(false);
	const [geoErr, setGeoErr] = (0, import_react.useState)(null);
	function navigateFromHere() {
		if (!b) return;
		setGeoErr(null);
		if (typeof navigator === "undefined" || !navigator.geolocation) {
			setGeoErr("Geolocation not supported.");
			return;
		}
		setLocating(true);
		navigator.geolocation.getCurrentPosition((pos) => {
			setLocating(false);
			navigate({
				to: "/navigate",
				search: {
					to: b.id,
					fromLat: pos.coords.latitude,
					fromLng: pos.coords.longitude
				}
			});
		}, (e) => {
			setLocating(false);
			setGeoErr(e.message || "Could not get your location.");
		}, {
			enableHighAccuracy: true,
			timeout: 8e3
		});
	}
	(0, import_react.useEffect)(() => {
		getBuilding(id).then((x) => {
			if (!x) {
				setNF(true);
				return;
			}
			setB(x);
			pushRecent(x.id);
			const list = JSON.parse(localStorage.getItem("cc_favorites") || "[]");
			setFav(list.includes(x.id));
		});
	}, [id]);
	if (notFoundFlag) throw notFound();
	if (!b) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-6xl px-4 py-16 text-muted-foreground",
		children: "Loading…"
	});
	const roomsByFloor = {};
	b.rooms.forEach((r) => {
		(roomsByFloor[r.floor] ??= []).push(r);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "relative h-[42vh] overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: b.image,
				alt: b.name,
				className: "h-full w-full object-cover"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute bottom-6 left-0 right-0 mx-auto max-w-7xl px-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-xs uppercase tracking-widest text-muted-foreground",
					children: [
						b.code,
						" · ",
						b.department
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl font-black md:text-5xl",
					children: b.name
				})]
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_320px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							const n = toggleFavorite(b.id);
							setFav(n.includes(b.id));
						},
						className: "inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "h-4 w-4 " + (fav ? "fill-red-500 text-red-500" : "") }),
							" ",
							fav ? "Saved" : "Save"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/navigate",
						search: { to: b.id },
						className: "btn-hero btn-hero-hover inline-flex items-center gap-2 px-4 py-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, { className: "h-4 w-4" }), " Navigate here"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: navigateFromHere,
						disabled: locating,
						"aria-label": "Navigate from my current location",
						className: "inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-secondary disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
						children: [locating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
							className: "h-4 w-4 animate-spin",
							"aria-hidden": "true"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocateFixed, {
							className: "h-4 w-4",
							"aria-hidden": "true"
						}), locating ? "Locating…" : "From my location"]
					})
				]
			}),
			geoErr && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-2 text-xs text-destructive",
				children: geoErr
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-muted-foreground",
				children: b.description
			}),
			b.gallery.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-semibold",
					children: "Gallery"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 grid grid-cols-2 gap-3 md:grid-cols-3",
					children: [b.image, ...b.gallery].map((g, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: g,
						alt: b.name + " " + i,
						className: "h-40 w-full rounded-xl object-cover"
					}, i))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-semibold",
					children: "Facilities"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: b.facilities.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full border border-border bg-card px-3 py-1 text-xs",
						children: f
					}, f))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-semibold",
					children: "Floors & Rooms"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 grid gap-3",
					children: Object.entries(roomsByFloor).map(([floor, rooms]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-card p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs uppercase tracking-widest text-muted-foreground",
							children: ["Floor ", floor]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 grid gap-2 sm:grid-cols-2 md:grid-cols-3",
							children: rooms.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 rounded-lg bg-background p-2 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-4 w-4 text-muted-foreground" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-xs",
										children: r.number
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-auto text-xs text-muted-foreground",
										children: r.type
									})
								]
							}, r.number))
						})]
					}, floor))
				})]
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-card p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground",
						children: "Info"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-3 space-y-2 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4 text-muted-foreground" }),
									" ",
									b.openingTime
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4 text-muted-foreground" }),
									" ",
									b.lat.toFixed(4),
									", ",
									b.lng.toFixed(4)
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-4 w-4 text-muted-foreground" }),
									" ",
									b.floors,
									" floors"
								]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BuildingQRCode, {
					id: b.id,
					name: b.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampusMap, {
					buildings: [b],
					centerId: b.id,
					height: "260px",
					showPopups: false
				})
			]
		})]
	})] });
}
//#endregion
export { BuildingDetails as component };
