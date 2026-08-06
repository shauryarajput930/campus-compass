import { useMemo, useState } from "react";
import { BarChart3, Clock, MapPin, Navigation, Route as RouteIcon, Sunrise } from "lucide-react";
import type { RecentRoute } from "@/lib/recent-routes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const BUCKETS = [
  { id: "morning", label: "Morning", range: "5am–11am", test: (h: number) => h >= 5 && h < 11 },
  { id: "midday", label: "Midday", range: "11am–3pm", test: (h: number) => h >= 11 && h < 15 },
  { id: "afternoon", label: "Afternoon", range: "3pm–7pm", test: (h: number) => h >= 15 && h < 19 },
  { id: "evening", label: "Evening", range: "7pm–5am", test: (h: number) => h >= 19 || h < 5 },
] as const;

export interface RouteInsightsProps {
  recents: RecentRoute[];
  /** Called when a top destination is chosen, e.g. to set it as the "To" field. */
  onSelectDestination?: (id: string) => void;
}

export function RouteInsights({ recents, onSelectDestination }: RouteInsightsProps) {
  const { topPlaces, buckets, peak, total } = useMemo(() => {
    const counts = new Map<string, { id: string; name: string; count: number; last: number }>();
    const bucketCounts = BUCKETS.map((bkt) => ({ ...bkt, count: 0 }));

    for (const r of recents) {
      const cur = counts.get(r.toId);
      if (cur) {
        cur.count += 1;
        cur.last = Math.max(cur.last, r.at);
      } else {
        counts.set(r.toId, { id: r.toId, name: r.toName, count: 1, last: r.at });
      }
      const h = new Date(r.at).getHours();
      const bkt = bucketCounts.find((x) => x.test(h));
      if (bkt) bkt.count += 1;
    }

    const topPlaces = [...counts.values()].sort((a, b) => b.count - a.count || b.last - a.last).slice(0, 5);
    const peak = bucketCounts.reduce((a, b) => (b.count > a.count ? b : a), bucketCounts[0]);
    return { topPlaces, buckets: bucketCounts, peak, total: recents.length };
  }, [recents]);

  const [drillId, setDrillId] = useState<string | null>(null);

  const drill = useMemo(() => {
    if (!drillId) return null;
    const visits = recents.filter((r) => r.toId === drillId).sort((a, b) => b.at - a.at);
    if (visits.length === 0) return null;
    const routeMap = new Map<string, { key: string; fromName: string; mode: string; count: number; last: number }>();
    for (const v of visits) {
      const key = `${v.fromId}|${v.mode}`;
      const cur = routeMap.get(key);
      if (cur) {
        cur.count += 1;
        cur.last = Math.max(cur.last, v.at);
      } else {
        routeMap.set(key, { key, fromName: v.fromName, mode: v.mode, count: 1, last: v.at });
      }
    }
    const routes = [...routeMap.values()].sort((a, b) => b.count - a.count || b.last - a.last);
    const durations = visits.map((v) => v.durationSeconds).filter((x): x is number => typeof x === "number");
    const distances = visits.map((v) => v.distanceMeters).filter((x): x is number => typeof x === "number");
    const avg = (xs: number[]) => (xs.length ? xs.reduce((a, c) => a + c, 0) / xs.length : null);
    return {
      name: visits[0].toName,
      visits,
      routes,
      avgMin: avg(durations) != null ? Math.round((avg(durations) as number) / 60) : null,
      avgM: avg(distances) != null ? Math.round(avg(distances) as number) : null,
    };
  }, [drillId, recents]);

  if (total === 0) return null;


  const maxPlace = topPlaces[0]?.count || 1;
  const maxBucket = Math.max(1, ...buckets.map((x) => x.count));

  return (
    <section
      id="route-insights"
      aria-labelledby="route-insights-heading"
      className="rounded-xl border border-border bg-background p-3"
    >
      <h3
        id="route-insights-heading"
        className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
      >
        <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" /> Route insights
      </h3>

      <p className="mb-3 text-[11px] text-muted-foreground">
        Based on your last {total} {total === 1 ? "route" : "routes"}. You travel most often in the{" "}
        <strong className="text-foreground">{peak.label.toLowerCase()}</strong> ({peak.range}).
      </p>

      <h4 className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold">
        <MapPin className="h-3 w-3" aria-hidden="true" /> Most visited buildings
      </h4>
      <ul className="space-y-1.5">
        {topPlaces.map((p) => {
          const pct = Math.round((p.count / maxPlace) * 100);
          const row = (
            <>
              <span className="flex items-center justify-between gap-2 text-xs">
                <span className="min-w-0 truncate">{p.name}</span>
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {p.count} {p.count === 1 ? "trip" : "trips"}
                </span>
              </span>
              <span className="mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-secondary" aria-hidden="true">
                <span className="block h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
              </span>
            </>
          );
          return (
            <li key={p.id} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setDrillId(p.id)}
                aria-label={`View visit history for ${p.name}. ${p.count} recent ${p.count === 1 ? "trip" : "trips"}.`}
                className="block min-w-0 flex-1 rounded-md px-1.5 py-1 text-left hover:bg-secondary"
              >
                {row}
              </button>
              {onSelectDestination ? (
                <button
                  type="button"
                  onClick={() => onSelectDestination(p.id)}
                  aria-label={`Set ${p.name} as destination`}
                  className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              ) : null}
            </li>

          );
        })}
      </ul>

      <h4 className="mb-1.5 mt-3 flex items-center gap-1.5 text-[11px] font-semibold">
        <Clock className="h-3 w-3" aria-hidden="true" /> Time-of-day pattern
      </h4>
      <ul className="space-y-1">
        {buckets.map((bkt) => {
          const pct = Math.round((bkt.count / maxBucket) * 100);
          const isPeak = bkt.id === peak.id && bkt.count > 0;
          return (
            <li key={bkt.id} className="flex items-center gap-2 px-1.5">
              <span className="w-16 shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground">
                {bkt.label}
              </span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
                <span
                  className={"block h-full rounded-full " + (isPeak ? "bg-primary" : "bg-muted-foreground/50")}
                  style={{ width: `${pct}%` }}
                />
              </span>
              <span className="w-14 shrink-0 text-right text-[10px] text-muted-foreground">
                {bkt.count} {bkt.count === 1 ? "trip" : "trips"}
              </span>
              <span className="sr-only">
                {bkt.label}, {bkt.range}: {bkt.count} {bkt.count === 1 ? "trip" : "trips"}
                {isPeak ? ", your busiest time" : ""}.
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
        <Sunrise className="h-3 w-3" aria-hidden="true" /> Times reflect when each route was calculated. Tap a building
        for its full visit history.
      </p>

      <Dialog open={!!drill} onOpenChange={(o) => !o && setDrillId(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          {drill ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4" aria-hidden="true" /> {drill.name}
                </DialogTitle>
                <DialogDescription>
                  {drill.visits.length} {drill.visits.length === 1 ? "visit" : "visits"} in your history
                  {drill.avgMin != null ? ` · avg ${drill.avgMin} min` : ""}
                  {drill.avgM != null ? ` · avg ${drill.avgM} m` : ""}
                </DialogDescription>
              </DialogHeader>

              <h4 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                <RouteIcon className="h-3 w-3" aria-hidden="true" /> Typical routes
              </h4>
              <ul className="space-y-1">
                {drill.routes.map((r) => (
                  <li
                    key={r.key}
                    className="flex items-center justify-between gap-2 rounded-md border border-border px-2 py-1.5 text-xs"
                  >
                    <span className="min-w-0 truncate">
                      From {r.fromName} · {r.mode.toLowerCase()}
                    </span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {r.count}× · {Math.round((r.count / drill.visits.length) * 100)}%
                    </span>
                  </li>
                ))}
              </ul>

              <h4 className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                <Clock className="h-3 w-3" aria-hidden="true" /> Visit history
              </h4>
              <ul className="space-y-1">
                {drill.visits.map((v) => (
                  <li key={`${v.at}-${v.fromId}`} className="rounded-md border border-border px-2 py-1.5 text-xs">
                    <span className="flex items-center justify-between gap-2">
                      <span className="min-w-0 truncate">
                        {new Date(v.at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        ·{" "}
                        {new Date(v.at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                      </span>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {v.durationSeconds != null ? `${Math.max(1, Math.round(v.durationSeconds / 60))} min` : "—"}
                        {v.distanceMeters != null ? ` · ${Math.round(v.distanceMeters)} m` : ""}
                        {v.source ? ` · ${v.source}` : ""}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                      From {v.fromName} · {v.mode.toLowerCase()}
                    </span>
                  </li>
                ))}
              </ul>

              {onSelectDestination ? (
                <button
                  type="button"
                  onClick={() => {
                    onSelectDestination(drill.visits[0].toId);
                    setDrillId(null);
                  }}
                  className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
                >
                  <Navigation className="h-3.5 w-3.5" aria-hidden="true" /> Navigate here
                </button>
              ) : null}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>

  );
}
