import { createAdminUser, deleteAdminUser, getAdminAnalytics, getAdminUsers, getReports, getSiteSettings, resetAdminUserPassword, updateAdminUser, updateReport, updateSiteSettings, type AdminAnalytics, type AdminReport, type ManagedUser, type SiteSettings } from "@/lib/admin";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  getBuildings,
  createBuilding,
  updateBuilding,
  deleteBuilding,
  getHomeBackground,
  persistHomeBackground,
  DEFAULT_HOME_BACKGROUND,
  compressHomeBackgroundImage,
} from "@/lib/api";
import type { Building } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import { academicPrograms, buildings as defaultBuildings, departments } from "@/lib/mock-data";
import { Building2, Users, Search, Layers, Plus, Trash2, Edit3, X, ShieldCheck, LogOut, Upload, MapPinned, Filter, BarChart3, Flag, Save, UserCheck, LockKeyhole } from "lucide-react";
import { CampusMap } from "@/components/campus-map";

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
  const [homeBackground, setHomeBackground] = useState<string>(getHomeBackground());
  const [coordinateTargetId, setCoordinateTargetId] = useState("");
  const [coordinateSaving, setCoordinateSaving] = useState(false);
  const [buildingQuery, setBuildingQuery] = useState("");
  const [buildingCategory, setBuildingCategory] = useState("all");
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [userQuery, setUserQuery] = useState("");
  const [settings, setSettings] = useState<SiteSettings>({ contactEmail: "", contactPhone: "", instagram: "", linkedin: "", twitter: "" });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [resetUser, setResetUser] = useState<ManagedUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSaving, setResetSaving] = useState(false);
  const [deleteUser, setDeleteUser] = useState<ManagedUser | null>(null);
  const [deleteSaving, setDeleteSaving] = useState(false);
  const [addUserOpen, setAddUserOpen] = useState(false);

  useEffect(() => { if (!user || user.role !== "admin") nav({ to: "/admin" }); }, [user, nav]);
  useEffect(() => {
    getBuildings()
      .then((buildings) => {
        const loadedBuildings = buildings.length ? buildings : defaultBuildings;
        setB(loadedBuildings);
        setCoordinateTargetId(loadedBuildings[0]?.id ?? "");
      })
      .catch(() => {
        setB(defaultBuildings);
        setCoordinateTargetId(defaultBuildings[0]?.id ?? "");
      });
  }, []);
  useEffect(() => {
    Promise.all([getAdminUsers(), getReports(), getAdminAnalytics(), getSiteSettings()]).then(([nextUsers, nextReports, nextAnalytics, nextSettings]) => {
      setUsers(nextUsers); setReports(nextReports); setAnalytics(nextAnalytics); setSettings(nextSettings);
    });
  }, []);

  const refresh = () => getBuildings().then(setB);
  const saveHomeBackground = () => {
    const next = persistHomeBackground(homeBackground);
    setHomeBackground(next);
  };

  const handleHomeBackgroundFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const next = await compressHomeBackgroundImage(String(reader.result ?? DEFAULT_HOME_BACKGROUND));
      setHomeBackground(next);
    };
    reader.readAsDataURL(file);
  };

  const coordinateTarget = b.find((building) => building.id === coordinateTargetId);
  const academicProgramCount = Object.values(academicPrograms).flat().length;
  const filteredBuildings = useMemo(() => {
    const query = buildingQuery.trim().toLowerCase();
    return b.filter((building) => {
      const matchesCategory = buildingCategory === "all" || building.category === buildingCategory;
      const matchesQuery = !query || `${building.name} ${building.code} ${building.department}`.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [b, buildingQuery, buildingCategory]);
  const managedUsers = useMemo(() => {
    const query = userQuery.trim().toLowerCase();
    return users
      .filter((item) => !query || `${item.name} ${item.email}`.toLowerCase().includes(query))
      .sort((first, second) => Number(second.role === "admin") - Number(first.role === "admin"));
  }, [users, userQuery]);
  const handleCoordinateChange = async ({ lat, lng }: { lat: number; lng: number }) => {
    if (!coordinateTarget) return;
    setCoordinateSaving(true);
    try {
      const updated = await updateBuilding(coordinateTarget.id, { lat, lng });
      setB((current) => current.map((building) => building.id === updated.id ? { ...building, lat, lng } : building));
    } finally {
      setCoordinateSaving(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card/80 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-card p-1 shadow-glow"><img src="/logo.png" alt="Campus Compass logo" className="h-full w-full object-contain" /></div>
            <div><div className="font-display font-bold">Campus Compass · Admin</div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">Control panel</div></div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="rounded-lg border border-border px-3 py-2 text-xs">View site</Link>
            <button onClick={() => { logout(); nav({ to: "/admin" }); }} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs"><LogOut className="h-3.5 w-3.5" /> Sign out</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-3xl bg-[linear-gradient(120deg,#172554,#312e81_48%,#0e7490)] p-6 text-white shadow-[0_24px_60px_rgba(30,41,59,0.22)] md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Operations dashboard</div>
              <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">Good to see you, {user?.name || "Admin"}.</h1>
              <p className="mt-2 max-w-xl text-sm text-white/70">Manage campus locations, update coordinates, and keep every student-facing detail accurate.</p>
            </div>
            <button onClick={() => setCreating(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-cyan-50"><Plus className="h-4 w-4" /> Add building</button>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          {[
            { icon: Building2, label: "Buildings", value: b.length },
            { icon: Layers, label: "Academic programs", value: academicProgramCount },
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

        <section className="mt-10 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold">Home page hero image</h2>
              <p className="text-sm text-muted-foreground">Set the background image that appears on the landing page.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setHomeBackground(DEFAULT_HOME_BACKGROUND); persistHomeBackground(DEFAULT_HOME_BACKGROUND); }} className="rounded-lg border border-border px-3 py-2 text-xs">Reset</button>
              <button onClick={saveHomeBackground} className="btn-hero btn-hero-hover px-3 py-2 text-sm">Save</button>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
            <div className="space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">Image URL</span>
                <input
                  value={homeBackground}
                  onChange={(e) => setHomeBackground(e.target.value)}
                  placeholder="https://example.com/campus.jpg"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </label>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs hover:bg-secondary">
                <Upload className="h-4 w-4" /> Upload photo
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleHomeBackgroundFile(e.target.files[0])} />
              </label>
            </div>

            <div className="overflow-hidden rounded-xl border border-border">
              <div
                className="h-40 w-full bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(135deg, rgba(22, 29, 52, 0.62), rgba(59, 130, 246, 0.32)), url("${homeBackground.replace(/"/g, '\\"')}")`,
                }}
              />
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="flex items-center gap-2 font-display text-xl font-semibold"><MapPinned className="h-5 w-5 text-primary" /> Edit location coordinates</h2>
              <p className="text-sm text-muted-foreground">Choose any location, then click its new position directly on the map.</p>
            </div>
            <select
              value={coordinateTargetId}
              onChange={(event) => setCoordinateTargetId(event.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {b.map((building) => <option key={building.id} value={building.id}>{building.name} ({building.code})</option>)}
            </select>
          </div>
          {coordinateTarget && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>Editing: <strong className="text-foreground">{coordinateTarget.name}</strong></span>
              <span>{coordinateSaving ? "Saving coordinates..." : `${coordinateTarget.lat.toFixed(6)}, ${coordinateTarget.lng.toFixed(6)}`}</span>
            </div>
          )}
          <div className="mt-4">
            <CampusMap
              buildings={b}
              centerId={coordinateTargetId}
              height="420px"
              editableCoordinates
              onCoordinateChange={handleCoordinateChange}
            />
          </div>
        </section>

        <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold">Buildings</h2>
            <p className="mt-1 text-sm text-muted-foreground">{filteredBuildings.length} of {b.length} locations shown</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input value={buildingQuery} onChange={(event) => setBuildingQuery(event.target.value)} placeholder="Search buildings..." className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm sm:w-56" />
            </div>
            <label className="relative">
              <Filter className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <select value={buildingCategory} onChange={(event) => setBuildingCategory(event.target.value)} className="w-full appearance-none rounded-lg border border-border bg-background py-2 pl-9 pr-8 text-sm sm:w-40">
                <option value="all">All categories</option>
                {['academic', 'admin', 'hostel', 'sports', 'food', 'medical', 'facility'].map((category) => <option key={category} value={category}>{category[0].toUpperCase() + category.slice(1)}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
          <table className="w-full min-w-190 text-sm">
            <thead className="bg-secondary/50 text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr><th className="px-4 py-3">Image</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Dept</th><th className="px-4 py-3">Rooms</th><th className="px-4 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {filteredBuildings.map((x) => (
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
              {filteredBuildings.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">No buildings match your search.</td></tr>}
            </tbody>
          </table>
        </div>

        <section className="mt-10 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="flex items-center gap-2 font-display text-xl font-semibold"><Users className="h-5 w-5 text-primary" /> User management</h2><p className="text-sm text-muted-foreground">Manage access and account roles.</p></div><div className="flex gap-2"><input value={userQuery} onChange={(event) => setUserQuery(event.target.value)} placeholder="Search users..." className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs sm:w-40 sm:flex-none" /><button type="button" onClick={() => setAddUserOpen(true)} className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"><Plus className="h-3.5 w-3.5" /> Add user</button></div></div>
            <div className="mt-4 space-y-2">{managedUsers.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3 text-sm"><div><div className="font-medium">{item.name}</div><div className="text-xs text-muted-foreground">{item.email}</div></div><div className="flex items-center gap-2"><select value={item.role} onChange={async (event) => { const updated = await updateAdminUser(item.id, { role: event.target.value as ManagedUser["role"] }); setUsers((current) => current.map((user) => user.id === item.id ? updated : user)); }} className="rounded-md border border-border bg-background px-2 py-1 text-xs"><option value="user">User</option><option value="admin">Admin</option></select><button onClick={() => { setResetUser(item); setNewPassword(""); setConfirmPassword(""); setResetError(""); }} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs"><LockKeyhole className="h-3 w-3" /> Reset password</button><button onClick={async () => { const updated = await updateAdminUser(item.id, { active: !item.active }); setUsers((current) => current.map((user) => user.id === item.id ? updated : user)); }} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs"><UserCheck className="h-3 w-3" /> {item.active ? "Active" : "Inactive"}</button><button onClick={() => setDeleteUser(item)} className="inline-flex items-center gap-1 rounded-md border border-destructive/50 bg-destructive/10 px-2 py-1 text-xs text-destructive hover:bg-destructive/20"><Trash2 className="h-3 w-3" /> Delete</button></div></div>)}</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft"><h2 className="flex items-center gap-2 font-display text-xl font-semibold"><BarChart3 className="h-5 w-5 text-primary" /> Analytics</h2><div className="mt-4 grid grid-cols-3 gap-2 text-center">{[["Users", analytics?.totalUsers ?? 0], ["Active", analytics?.activeUsers ?? 0], ["Reports", analytics?.reports ?? reports.length]].map(([label, value]) => <div key={String(label)} className="rounded-xl bg-secondary/60 p-3"><div className="text-2xl font-bold">{value}</div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div></div>)}</div><div className="mt-5 flex h-28 items-end gap-2">{(analytics?.dailyUsage ?? []).map((day) => <div key={day.label} className="flex flex-1 flex-col items-center gap-1"><div className="w-full rounded-t bg-primary" style={{ height: `${Math.max(8, day.value)}%` }} /><span className="text-[10px] text-muted-foreground">{day.label}</span></div>)}</div></div>
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft"><h2 className="flex items-center gap-2 font-display text-xl font-semibold"><Flag className="h-5 w-5 text-primary" /> Feedback & reports</h2><p className="mt-1 text-sm text-muted-foreground">Review incorrect information reported by users.</p><div className="mt-4 space-y-3">{reports.length === 0 && <p className="text-sm text-muted-foreground">No reports yet.</p>}{reports.map((report) => <div key={report.id} className="rounded-xl border border-border p-3"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="text-sm font-semibold">{report.buildingName || report.buildingId}</div><div className="mt-1 text-xs text-muted-foreground">Reported by: {report.userName || "Signed-in user"}{report.userEmail ? ` · ${report.userEmail}` : ""}</div><div className="mt-2 inline-flex rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">Problem: {report.category}</div></div><select aria-label={`State for report about ${report.buildingName || report.buildingId}`} value={report.status} onChange={async (event) => { const updated = await updateReport(report.id, event.target.value as AdminReport["status"]); setReports((current) => current.map((item) => item.id === report.id ? updated : item)); }} className="rounded-md border border-border bg-background px-2 py-1 text-xs"><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="resolved">Resolved</option></select></div><p className="mt-2 text-sm text-foreground">{report.message}</p><p className="mt-2 text-[10px] text-muted-foreground">{new Date(report.createdAt).toLocaleString()}</p></div>)}</div></div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft"><h2 className="flex items-center gap-2 font-display text-xl font-semibold"><Save className="h-5 w-5 text-primary" /> Site settings</h2><p className="text-sm text-muted-foreground">Public contact and social links.</p><div className="mt-4 grid gap-3">{(["contactEmail", "contactPhone", "instagram", "linkedin", "twitter"] as const).map((key) => <input key={key} value={settings[key]} onChange={(event) => setSettings((current) => ({ ...current, [key]: event.target.value }))} placeholder={key} className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />)}<button onClick={async () => { await updateSiteSettings(settings); setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 1800); }} className="btn-hero btn-hero-hover inline-flex items-center justify-center gap-2 px-4 py-2 text-sm"><Save className="h-4 w-4" /> {settingsSaved ? "Saved" : "Save settings"}</button></div></div>
        </section>
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

      {resetUser && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="reset-password-title">
          <form onSubmit={async (event) => { event.preventDefault(); if (newPassword.length < 8) { setResetError("Password must be at least 8 characters."); return; } if (newPassword !== confirmPassword) { setResetError("Passwords do not match."); return; } setResetSaving(true); setResetError(""); try { await resetAdminUserPassword(resetUser.id, newPassword); setResetUser(null); } catch { setResetError("Could not reset password. Please try again."); } finally { setResetSaving(false); } }} className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4"><div><div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><LockKeyhole className="h-5 w-5" /></div><h2 id="reset-password-title" className="mt-4 font-display text-xl font-semibold">Reset password</h2><p className="mt-1 text-sm text-muted-foreground">Set a new password for {resetUser.name}.</p></div><button type="button" onClick={() => setResetUser(null)} aria-label="Close reset password dialog" className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"><X className="h-5 w-5" /></button></div>
            <div className="mt-5 space-y-3"><input autoFocus required minLength={8} type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="New password" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" /><input required minLength={8} type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm new password" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />{resetError && <p className="text-xs text-destructive">{resetError}</p>}</div>
            <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setResetUser(null)} className="rounded-lg border border-border px-4 py-2 text-sm">Cancel</button><button disabled={resetSaving} className="btn-hero btn-hero-hover px-4 py-2 text-sm">{resetSaving ? "Saving..." : "Reset password"}</button></div>
          </form>
        </div>
      )}

      {deleteUser && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="delete-user-title">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-destructive/10 text-destructive"><Trash2 className="h-5 w-5" /></div>
                <h2 id="delete-user-title" className="mt-4 font-display text-xl font-semibold">Delete user account?</h2>
                <p className="mt-2 text-sm text-muted-foreground">This will permanently delete <strong className="text-foreground">{deleteUser.name}</strong> and cannot be undone.</p>
              </div>
              <button type="button" onClick={() => setDeleteUser(null)} aria-label="Close delete user dialog" className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteUser(null)} disabled={deleteSaving} className="rounded-lg border border-border px-4 py-2 text-sm">Cancel</button>
              <button type="button" disabled={deleteSaving} onClick={async () => { if (!deleteUser) return; setDeleteSaving(true); try { await deleteAdminUser(deleteUser.id); setUsers((current) => current.filter((user) => user.id !== deleteUser.id)); setDeleteUser(null); } finally { setDeleteSaving(false); } }} className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 disabled:opacity-60"><Trash2 className="h-4 w-4" /> {deleteSaving ? "Deleting..." : "Delete permanently"}</button>
            </div>
          </div>
        </div>
      )}

      {addUserOpen && (
        <AddUserDialog
          onClose={() => setAddUserOpen(false)}
          onCreated={(created) => { setUsers((current) => [created, ...current]); setAddUserOpen(false); }}
        />
      )}
    </div>
  );
}

function AddUserDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (user: ManagedUser) => void }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" as ManagedUser["role"] });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="add-user-title">
      <form onSubmit={async (event) => { event.preventDefault(); setSaving(true); setError(""); try { onCreated(await createAdminUser(form)); } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not create user."); } finally { setSaving(false); } }} className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4"><div><div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Users className="h-5 w-5" /></div><h2 id="add-user-title" className="mt-4 font-display text-xl font-semibold">Add account</h2><p className="mt-1 text-sm text-muted-foreground">Create a Student or Admin account.</p></div><button type="button" onClick={onClose} aria-label="Close add account dialog" className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"><X className="h-5 w-5" /></button></div>
        <div className="mt-5 space-y-3"><input autoFocus required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Full name" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" /><input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email address" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" /><input required minLength={8} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Temporary password" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" /><label className="block text-sm"><span className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">Account type</span><select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as ManagedUser["role"] })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"><option value="user">User</option><option value="admin">Admin</option></select></label>{error && <p className="text-xs text-destructive">{error}</p>}</div>
        <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm">Cancel</button><button disabled={saving} className="btn-hero btn-hero-hover px-4 py-2 text-sm">{saving ? "Creating..." : "Create account"}</button></div>
      </form>
    </div>
  );
}

function BuildingEditor({ value, onClose, onSave }: { value: Building | null; onClose: () => void; onSave: (b: Building) => void }) {
  const [d, setD] = useState<Building>(value ?? {
  id: "", name: "", code: "", icon: "", department: departments[0], programs: [departments[0]], description: "",
    openingTime: "9:00 AM – 5:00 PM", facilities: [], image: "",
    gallery: [], category: "academic", lat: 26.45016, lng: 80.19200, floors: 1, rooms: [],
  });

  const handleFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const next = await compressHomeBackgroundImage(String(reader.result ?? ""));
      setD((prev) => ({ ...prev, image: next }));
    };
    reader.readAsDataURL(file);
  };

  const handleIconFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const next = await compressHomeBackgroundImage(String(reader.result ?? ""), 256, 256, 0.8);
      setD((prev) => ({ ...prev, icon: next }));
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryFiles = async (files: FileList) => {
    const nextImages = await Promise.all(Array.from(files).map((file) => new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => resolve(await compressHomeBackgroundImage(String(reader.result ?? "")));
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    })));

    setD((prev) => ({ ...prev, gallery: [...prev.gallery, ...nextImages.filter(Boolean)] }));
  };

  const updateRoom = (index: number, field: "number" | "type" | "floor", value: string | number) => {
    setD((prev) => {
      const nextRooms = [...prev.rooms];
      nextRooms[index] = { ...nextRooms[index], [field]: value };
      return { ...prev, rooms: nextRooms };
    });
  };

  const addRoom = () => {
    setD((prev) => ({
      ...prev,
      rooms: [...prev.rooms, { number: `R-${prev.rooms.length + 1}`, type: "Classroom", floor: Math.min(1, prev.floors || 1) }],
    }));
  };

  const removeRoom = (index: number) => {
    setD((prev) => ({ ...prev, rooms: prev.rooms.filter((_, i) => i !== index) }));
  };

  const selectedPrograms = d.programs?.length ? d.programs : [d.department];
  const updatePrograms = (programs: string[]) => {
    setD((prev) => ({ ...prev, programs, department: programs.join(", ") || departments[0] }));
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl glass-strong shadow-glow" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 p-4 backdrop-blur">
          <h3 className="font-display text-lg font-semibold">{value ? "Edit building" : "Add building"}</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg border border-border"><X className="h-4 w-4" /></button>
        </div>
        <div className="building-editor__scroll max-h-[70vh] overflow-y-auto p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block"><span className="text-xs text-muted-foreground">Name</span>
              <input value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></label>
            <label className="block"><span className="text-xs text-muted-foreground">Code</span>
              <input value={d.code} onChange={(e) => setD({ ...d, code: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></label>
            <div className="block">
              <span className="text-xs text-muted-foreground">Code icon</span>
              <div className="mt-1 flex items-center gap-2">
                {d.icon && <img src={d.icon} alt="Code icon preview" className="h-9 w-9 rounded-md border border-border object-cover" />}
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs hover:bg-secondary">
                  <Upload className="h-4 w-4" /> Upload icon
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && void handleIconFile(e.target.files[0])} />
                </label>
                {d.icon && <button type="button" onClick={() => setD((prev) => ({ ...prev, icon: "" }))} className="rounded-lg border border-border px-2 py-2 text-xs text-muted-foreground hover:text-destructive">Remove</button>}
              </div>
            </div>
            <label className="block md:col-span-2"><span className="text-xs text-muted-foreground">Courses / programs</span>
              <select
                multiple
                size={6}
                value={selectedPrograms}
                onChange={(event) => updatePrograms(Array.from(event.target.selectedOptions, (option) => option.value))}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {departments.map((program) => <option key={program} value={program}>{program}</option>)}
              </select>
              <span className="mt-1 block text-[11px] text-muted-foreground">Use Ctrl/Cmd to select multiple courses for one building.</span>
            </label>
            <label className="block md:col-span-2"><span className="text-xs text-muted-foreground">Description</span>
              <textarea value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} rows={3} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></label>
            <label className="block"><span className="text-xs text-muted-foreground">Opening time</span>
              <input value={d.openingTime} onChange={(e) => setD({ ...d, openingTime: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></label>
            <label className="block"><span className="text-xs text-muted-foreground">Category</span>
              <select value={d.category} onChange={(e) => setD({ ...d, category: e.target.value as any })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                {["academic", "hostel", "sports", "food", "facility", "admin"].map((x) => <option key={x}>{x}</option>)}
              </select></label>
            <label className="block"><span className="text-xs text-muted-foreground">Latitude</span>
              <input type="number" step="0.0001" value={d.lat} onChange={(e) => setD({ ...d, lat: parseFloat(e.target.value) })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></label>
            <label className="block"><span className="text-xs text-muted-foreground">Longitude</span>
              <input type="number" step="0.0001" value={d.lng} onChange={(e) => setD({ ...d, lng: parseFloat(e.target.value) })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></label>
            <label className="block"><span className="text-xs text-muted-foreground">Floors</span>
              <input
                type="number"
                min={1}
                value={d.floors}
                onChange={(e) => {
                  const nextFloors = Math.max(1, Number(e.target.value) || 1);
                  setD((prev) => ({
                    ...prev,
                    floors: nextFloors,
                    rooms: prev.rooms.map((room) => ({
                      ...room,
                      floor: Math.min(room.floor, nextFloors),
                    })),
                  }));
                }}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block"><span className="text-xs text-muted-foreground">Total room count</span>
              <input value={d.rooms.length} readOnly className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground" />
            </label>

            <div className="md:col-span-2 rounded-xl border border-border bg-secondary/20 p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">Rooms</span>
                <button type="button" onClick={addRoom} className="rounded-lg border border-border px-2 py-1 text-xs">Add room</button>
              </div>

              <div className="space-y-2">
                {d.rooms.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No rooms added yet.</p>
                ) : (
                  d.rooms.map((room, index) => (
                    <div key={`${room.number}-${index}`} className="grid gap-2 rounded-lg border border-border bg-background p-2 md:grid-cols-[1fr_1.5fr_1fr_auto]">
                      <input
                        value={room.number}
                        onChange={(e) => updateRoom(index, "number", e.target.value)}
                        placeholder="Room no"
                        className="rounded border border-border bg-background px-2 py-1 text-xs"
                      />
                      <input
                        value={room.type}
                        onChange={(e) => updateRoom(index, "type", e.target.value)}
                        placeholder="Room type"
                        className="rounded border border-border bg-background px-2 py-1 text-xs"
                      />
                      <input
                        type="number"
                        min={1}
                        max={d.floors}
                        value={room.floor}
                        onChange={(e) => updateRoom(index, "floor", Math.min(Math.max(1, Number(e.target.value) || 1), d.floors))}
                        className="rounded border border-border bg-background px-2 py-1 text-xs"
                      />
                      <button type="button" onClick={() => removeRoom(index)} className="rounded border border-border px-2 py-1 text-xs text-destructive">Remove</button>
                    </div>
                  ))
                )}
              </div>
            </div>

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

            <div className="md:col-span-2">
              <span className="text-xs text-muted-foreground">Gallery photos</span>
              <div className="mt-1 space-y-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs hover:bg-secondary">
                  <Upload className="h-4 w-4" /> Upload gallery photos
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.length) void handleGalleryFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
                {d.gallery.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {d.gallery.map((photo, index) => (
                      <div key={`${photo.slice(0, 24)}-${index}`} className="relative">
                        <img src={photo} alt={`Gallery ${index + 1}`} className="h-20 w-full rounded-md object-cover" />
                        <button
                          type="button"
                          aria-label={`Remove gallery photo ${index + 1}`}
                          onClick={() => setD((prev) => ({ ...prev, gallery: prev.gallery.filter((_, photoIndex) => photoIndex !== index) }))}
                          className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-white"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 z-10 flex justify-end gap-2 border-t border-border bg-card/95 p-4 backdrop-blur">
          <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm">Cancel</button>
          <button onClick={() => onSave(d)} className="btn-hero btn-hero-hover px-4 py-2 text-sm">Save</button>
        </div>
      </div>
    </div>
  );
}
