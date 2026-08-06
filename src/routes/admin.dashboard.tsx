import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getBuildings, createBuilding, updateBuilding, deleteBuilding } from "@/lib/api";
import type { Building } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import { departments } from "@/lib/mock-data";
import { Building2, Users, Search, Layers, Plus, Trash2, Edit3, X, ShieldCheck, LogOut, Upload } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin dashboard — Campus Compass" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [b, setB] = useState<Building[]>([]);
  const [editing, setEditing] = useState<Building | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => { if (!user || user.role !== "admin") nav({ to: "/admin" }); }, [user, nav]);
  useEffect(() => { getBuildings().then(setB); }, []);

  const refresh = () => getBuildings().then(setB);

  return (
    <div className="min-h-screen">
      <header className="border-b border-border glass-strong">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: "var(--gradient-brand)" }}><ShieldCheck className="h-5 w-5 text-white" /></div>
            <div><div className="font-display font-bold">Campus Compass · Admin</div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">Control panel</div></div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="rounded-lg border border-border px-3 py-2 text-xs">View site</Link>
            <button onClick={() => { logout(); nav({ to: "/admin" }); }} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs"><LogOut className="h-3.5 w-3.5" /> Sign out</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="font-display text-2xl font-bold">Overview</h1>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          {[
            { icon: Building2, label: "Buildings", value: b.length },
            { icon: Layers, label: "Departments", value: departments.length },
            { icon: Search, label: "Rooms", value: b.reduce((n, x) => n + x.rooms.length, 0) },
            { icon: Users, label: "Users", value: 1240 },
          ].map((c) => (
            <div key={c.label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
                <span>{c.label}</span><c.icon className="h-4 w-4" />
              </div>
              <div className="mt-2 font-display text-3xl font-bold gradient-text">{c.value.toLocaleString()}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex items-end justify-between">
          <h2 className="font-display text-xl font-semibold">Buildings</h2>
          <button onClick={() => setCreating(true)} className="btn-hero btn-hero-hover inline-flex items-center gap-2 px-3 py-2 text-sm"><Plus className="h-4 w-4" /> Add building</button>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr><th className="px-4 py-3">Image</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Dept</th><th className="px-4 py-3">Rooms</th><th className="px-4 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {b.map((x) => (
                <tr key={x.id} className="border-t border-border">
                  <td className="px-4 py-2"><img src={x.image} alt="" className="h-10 w-16 rounded-md object-cover" /></td>
                  <td className="px-4 py-2 font-medium">{x.name} <span className="text-xs text-muted-foreground">({x.code})</span></td>
                  <td className="px-4 py-2 text-muted-foreground">{x.department}</td>
                  <td className="px-4 py-2">{x.rooms.length}</td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => setEditing(x)} className="mr-2 rounded-md border border-border px-2 py-1 text-xs inline-flex items-center gap-1"><Edit3 className="h-3 w-3" /> Edit</button>
                    <button onClick={async () => { if (confirm("Delete " + x.name + "?")) { await deleteBuilding(x.id); refresh(); } }}
                      className="rounded-md border border-destructive/50 bg-destructive/10 px-2 py-1 text-xs text-destructive inline-flex items-center gap-1"><Trash2 className="h-3 w-3" /> Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {(editing || creating) && (
        <BuildingEditor
          value={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSave={async (data) => {
            if (editing) await updateBuilding(editing.id, data);
            else await createBuilding({ ...data, id: data.id || "b_" + Date.now() });
            setEditing(null); setCreating(false); refresh();
          }}
        />
      )}
    </div>
  );
}

function BuildingEditor({ value, onClose, onSave }: { value: Building | null; onClose: () => void; onSave: (b: Building) => void }) {
  const [d, setD] = useState<Building>(value ?? {
    id: "", name: "", code: "", department: departments[0], description: "",
    openingTime: "9:00 AM – 5:00 PM", facilities: [], image: "",
    gallery: [], category: "academic", lat: 26.5361, lng: 80.2456, floors: 1, rooms: [],
  });

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setD((prev) => ({ ...prev, image: reader.result as string }));
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl glass-strong shadow-glow" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="font-display text-lg font-semibold">{value ? "Edit building" : "Add building"}</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg border border-border"><X className="h-4 w-4" /></button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block"><span className="text-xs text-muted-foreground">Name</span>
              <input value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></label>
            <label className="block"><span className="text-xs text-muted-foreground">Code</span>
              <input value={d.code} onChange={(e) => setD({ ...d, code: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></label>
            <label className="block md:col-span-2"><span className="text-xs text-muted-foreground">Department</span>
              <select value={d.department} onChange={(e) => setD({ ...d, department: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                {departments.map((x) => <option key={x}>{x}</option>)}
              </select></label>
            <label className="block md:col-span-2"><span className="text-xs text-muted-foreground">Description</span>
              <textarea value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} rows={3} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></label>
            <label className="block"><span className="text-xs text-muted-foreground">Opening time</span>
              <input value={d.openingTime} onChange={(e) => setD({ ...d, openingTime: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></label>
            <label className="block"><span className="text-xs text-muted-foreground">Category</span>
              <select value={d.category} onChange={(e) => setD({ ...d, category: e.target.value as any })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                {["academic","hostel","sports","food","facility","admin"].map((x) => <option key={x}>{x}</option>)}
              </select></label>
            <label className="block"><span className="text-xs text-muted-foreground">Latitude</span>
              <input type="number" step="0.0001" value={d.lat} onChange={(e) => setD({ ...d, lat: parseFloat(e.target.value) })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></label>
            <label className="block"><span className="text-xs text-muted-foreground">Longitude</span>
              <input type="number" step="0.0001" value={d.lng} onChange={(e) => setD({ ...d, lng: parseFloat(e.target.value) })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></label>
            <label className="block md:col-span-2"><span className="text-xs text-muted-foreground">Facilities (comma separated)</span>
              <input value={d.facilities.join(", ")} onChange={(e) => setD({ ...d, facilities: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></label>

            <div className="md:col-span-2">
              <span className="text-xs text-muted-foreground">Building image</span>
              <div className="mt-1 flex items-center gap-3">
                {d.image && <img src={d.image} alt="" className="h-16 w-24 rounded-md object-cover" />}
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs hover:bg-secondary">
                  <Upload className="h-4 w-4" /> Upload photo
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
                </label>
                <input value={d.image} onChange={(e) => setD({ ...d, image: e.target.value })} placeholder="or paste URL" className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-4">
          <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm">Cancel</button>
          <button onClick={() => onSave(d)} className="btn-hero btn-hero-hover px-4 py-2 text-sm">Save</button>
        </div>
      </div>
    </div>
  );
}
