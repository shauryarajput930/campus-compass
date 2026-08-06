import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getBuildings } from "@/lib/api";
import type { Building } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import { BuildingCard } from "@/components/building-card";
import { getFavorites, getRecent } from "@/lib/favorites";
import { getAIRecommendations } from "@/lib/ai.functions";
import { Map, Heart, Clock, Search, Sparkles, Loader2 } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Campus Compass" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const [all, setAll] = useState<Building[]>([]);
  const [favIds, setFavIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [recs, setRecs] = useState<{ id: string; reason: string }[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const fetchRecs = useServerFn(getAIRecommendations);

  useEffect(() => {
    getBuildings().then(setAll);
    setFavIds(getFavorites());
    setRecentIds(getRecent());
  }, []);

  useEffect(() => {
    if (all.length === 0) return;
    setRecsLoading(true);
    fetchRecs({
      data: {
        recentIds: [...recentIds, ...favIds].slice(0, 12),
        buildings: all.map((b) => ({
          id: b.id, name: b.name, code: b.code,
          department: b.department, category: b.category,
          facilities: b.facilities,
        })),
      },
    })
      .then((r) => setRecs(r.recommendations))
      .catch(() => setRecs([]))
      .finally(() => setRecsLoading(false));
  }, [all, recentIds, favIds, fetchRecs]);

  const favorites = all.filter((b) => favIds.includes(b.id));
  const recent = recentIds.map((id) => all.find((b) => b.id === id)).filter(Boolean) as Building[];
  const recBuildings = recs
    .map((r) => ({ b: all.find((x) => x.id === r.id), reason: r.reason }))
    .filter((x) => x.b) as { b: Building; reason: string }[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Dashboard</div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Welcome{user ? `, ${user.name}` : ""} 👋</h1>
          <p className="mt-1 text-muted-foreground">Your personalized campus navigation hub.</p>
        </div>
        <Link to="/search" className="btn-hero btn-hero-hover inline-flex items-center gap-2 px-4 py-2 text-sm"><Search className="h-4 w-4" /> Quick Search</Link>
      </div>

      <div className="mb-10 grid gap-4 md:grid-cols-3">
        {[
          { icon: Heart, label: "Favourites", value: favorites.length, to: "/favorites" },
          { icon: Clock, label: "Recently Viewed", value: recent.length, to: "/dashboard" },
          { icon: Map, label: "Locations on Map", value: all.length, to: "/map" },
        ].map((c) => (
          <Link key={c.label} to={c.to} className="rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:shadow-glow">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</div>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 font-display text-4xl font-bold gradient-text">{c.value}</div>
          </Link>
        ))}
      </div>

      <section className="mb-10 rounded-2xl border border-primary/30 bg-primary/5 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-semibold">Recommended for you</h2>
          {recsLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        {recBuildings.length === 0 && !recsLoading && (
          <p className="text-sm text-muted-foreground">Visit a few buildings and AI will tailor picks to your activity.</p>
        )}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {recBuildings.map(({ b, reason }) => (
            <Link key={b.id} to="/buildings/$id" params={{ id: b.id }}
              className="group overflow-hidden rounded-xl border border-border bg-card transition hover:shadow-glow">
              <img src={b.image} alt={b.name} className="h-24 w-full object-cover transition group-hover:scale-105" />
              <div className="p-3">
                <div className="text-xs text-muted-foreground">{b.code}</div>
                <div className="text-sm font-semibold">{b.name}</div>
                <div className="mt-1 line-clamp-2 text-xs text-primary/80">{reason}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {recent.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 font-display text-2xl font-semibold">Recently viewed</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((b, i) => <BuildingCard key={b.id} b={b} index={i} />)}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 font-display text-2xl font-semibold">Explore all locations</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {all.map((b, i) => <BuildingCard key={b.id} b={b} index={i} />)}
        </div>
      </section>
    </div>
  );
}
