import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { B as Layers, P as LogOut, S as Plus, T as PenLine, a as Upload, et as Building2, p as ShieldCheck, r as Users, s as Trash2, t as X, v as Search } from "../_libs/lucide-react.mjs";
import { v as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as useAuth } from "./router--Sg3DtRc.mjs";
import { a as getBuildings, f as updateBuilding, n as deleteBuilding, r as departments, t as createBuilding } from "./api-upx-0QUe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.dashboard-Dh65KO3U.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminDashboard() {
	const { user, logout } = useAuth();
	const nav = useNavigate();
	const [b, setB] = (0, import_react.useState)([]);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [creating, setCreating] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!user || user.role !== "admin") nav({ to: "/admin" });
	}, [user, nav]);
	(0, import_react.useEffect)(() => {
		getBuildings().then(setB);
	}, []);
	const refresh = () => getBuildings().then(setB);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "border-b border-border glass-strong",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-7xl items-center justify-between px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-9 w-9 place-items-center rounded-xl",
							style: { background: "var(--gradient-brand)" },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-5 w-5 text-white" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-display font-bold",
							children: "Campus Compass · Admin"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] uppercase tracking-widest text-muted-foreground",
							children: "Control panel"
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "rounded-lg border border-border px-3 py-2 text-xs",
							children: "View site"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => {
								logout();
								nav({ to: "/admin" });
							},
							className: "inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-3.5 w-3.5" }), " Sign out"]
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-7xl px-4 py-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-2xl font-bold",
						children: "Overview"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid gap-4 md:grid-cols-4",
						children: [
							{
								icon: Building2,
								label: "Buildings",
								value: b.length
							},
							{
								icon: Layers,
								label: "Departments",
								value: departments.length
							},
							{
								icon: Search,
								label: "Rooms",
								value: b.reduce((n, x) => n + x.rooms.length, 0)
							},
							{
								icon: Users,
								label: "Users",
								value: 1240
							}
						].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-border bg-card p-5 shadow-soft",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: c.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(c.icon, { className: "h-4 w-4" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 font-display text-3xl font-bold gradient-text",
								children: c.value.toLocaleString()
							})]
						}, c.label))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-10 flex items-end justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl font-semibold",
							children: "Buildings"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setCreating(true),
							className: "btn-hero btn-hero-hover inline-flex items-center gap-2 px-3 py-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add building"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 overflow-hidden rounded-2xl border border-border",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "bg-secondary/50 text-left text-xs uppercase tracking-widest text-muted-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3",
										children: "Image"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3",
										children: "Name"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3",
										children: "Dept"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3",
										children: "Rooms"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3 text-right",
										children: "Actions"
									})
								] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: b.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: x.image,
											alt: "",
											className: "h-10 w-16 rounded-md object-cover"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "px-4 py-2 font-medium",
										children: [
											x.name,
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-xs text-muted-foreground",
												children: [
													"(",
													x.code,
													")"
												]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2 text-muted-foreground",
										children: x.department
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2",
										children: x.rooms.length
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "px-4 py-2 text-right",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: () => setEditing(x),
											className: "mr-2 rounded-md border border-border px-2 py-1 text-xs inline-flex items-center gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "h-3 w-3" }), " Edit"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: async () => {
												if (confirm("Delete " + x.name + "?")) {
													await deleteBuilding(x.id);
													refresh();
												}
											},
											className: "rounded-md border border-destructive/50 bg-destructive/10 px-2 py-1 text-xs text-destructive inline-flex items-center gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" }), " Delete"]
										})]
									})
								]
							}, x.id)) })]
						})
					})
				]
			}),
			(editing || creating) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BuildingEditor, {
				value: editing,
				onClose: () => {
					setEditing(null);
					setCreating(false);
				},
				onSave: async (data) => {
					if (editing) await updateBuilding(editing.id, data);
					else await createBuilding({
						...data,
						id: data.id || "b_" + Date.now()
					});
					setEditing(null);
					setCreating(false);
					refresh();
				}
			})
		]
	});
}
function BuildingEditor({ value, onClose, onSave }) {
	const [d, setD] = (0, import_react.useState)(value ?? {
		id: "",
		name: "",
		code: "",
		department: departments[0],
		description: "",
		openingTime: "9:00 AM – 5:00 PM",
		facilities: [],
		image: "",
		gallery: [],
		category: "academic",
		lat: 26.5361,
		lng: 80.2456,
		floors: 1,
		rooms: []
	});
	const handleFile = (file) => {
		const reader = new FileReader();
		reader.onload = () => setD((prev) => ({
			...prev,
			image: reader.result
		}));
		reader.readAsDataURL(file);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 grid place-items-center bg-black/60 p-4",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-2xl overflow-hidden rounded-2xl glass-strong shadow-glow",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-b border-border p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-lg font-semibold",
						children: value ? "Edit building" : "Add building"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "grid h-8 w-8 place-items-center rounded-lg border border-border",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "max-h-[70vh] overflow-y-auto p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 md:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "Name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: d.name,
									onChange: (e) => setD({
										...d,
										name: e.target.value
									}),
									className: "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "Code"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: d.code,
									onChange: (e) => setD({
										...d,
										code: e.target.value
									}),
									className: "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block md:col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "Department"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									value: d.department,
									onChange: (e) => setD({
										...d,
										department: e.target.value
									}),
									className: "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm",
									children: departments.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: x }, x))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block md:col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "Description"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									value: d.description,
									onChange: (e) => setD({
										...d,
										description: e.target.value
									}),
									rows: 3,
									className: "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "Opening time"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: d.openingTime,
									onChange: (e) => setD({
										...d,
										openingTime: e.target.value
									}),
									className: "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "Category"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									value: d.category,
									onChange: (e) => setD({
										...d,
										category: e.target.value
									}),
									className: "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm",
									children: [
										"academic",
										"hostel",
										"sports",
										"food",
										"facility",
										"admin"
									].map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: x }, x))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "Latitude"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									step: "0.0001",
									value: d.lat,
									onChange: (e) => setD({
										...d,
										lat: parseFloat(e.target.value)
									}),
									className: "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "Longitude"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									step: "0.0001",
									value: d.lng,
									onChange: (e) => setD({
										...d,
										lng: parseFloat(e.target.value)
									}),
									className: "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block md:col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "Facilities (comma separated)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: d.facilities.join(", "),
									onChange: (e) => setD({
										...d,
										facilities: e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
									}),
									className: "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "md:col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "Building image"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 flex items-center gap-3",
									children: [
										d.image && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: d.image,
											alt: "",
											className: "h-16 w-24 rounded-md object-cover"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs hover:bg-secondary",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-4 w-4" }),
												" Upload photo",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "file",
													accept: "image/*",
													className: "hidden",
													onChange: (e) => e.target.files && handleFile(e.target.files[0])
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: d.image,
											onChange: (e) => setD({
												...d,
												image: e.target.value
											}),
											placeholder: "or paste URL",
											className: "flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs"
										})
									]
								})]
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-end gap-2 border-t border-border p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "rounded-lg border border-border px-4 py-2 text-sm",
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => onSave(d),
						className: "btn-hero btn-hero-hover px-4 py-2 text-sm",
						children: "Save"
					})]
				})
			]
		})
	});
}
//#endregion
export { AdminDashboard as component };
