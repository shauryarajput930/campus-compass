import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Search, MapPinned, Route as RouteIcon, Camera, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { getBuildings, getHomeBackground } from "@/lib/api";
import type { Building } from "@/lib/mock-data";
import { stats } from "@/lib/mock-data";
import { BuildingCard } from "@/components/building-card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Campus Compass — Navigate Your Campus Smarter" },
      { name: "description", content: "Find any classroom, lab or facility on PSIT campus in seconds." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [q, setQ] = useState("");
  const [featured, setFeatured] = useState<Building[]>([]);
  const [campusPulse, setCampusPulse] = useState({
    fastestPath: "4 min",
    nearbyLab: "Academic Block",
    bestRoute: "North Gate",
  });
  const [heroBackground, setHeroBackground] = useState<string>(getHomeBackground());
  const nav = useNavigate();

  useEffect(() => {
    const syncBackground = () => setHeroBackground(getHomeBackground());
    syncBackground();

    const onCustomEvent = () => syncBackground();
    const onStorage = (event: StorageEvent) => {
      if (event.key === "cc_home_background") syncBackground();
    };

    window.addEventListener("cc-home-background-changed", onCustomEvent);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("cc-home-background-changed", onCustomEvent);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    getBuildings().then((b) => {
      const nextFeatured = b.slice(0, 6);
      setFeatured(nextFeatured);

      if (!nextFeatured.length) return;

      const primary = nextFeatured[0];
      const secondary = nextFeatured[1] ?? primary;
      const pulseMinutes = Math.max(3, Math.min(12, 3 + (primary.name.length % 5)));

      setCampusPulse({
        fastestPath: `${pulseMinutes} min`,
        nearbyLab: primary.name,
        bestRoute: secondary.name,
      });
    });
  }, []);

  const highlights = featured.length
    ? featured.slice(0, 3).map((building) => building.name)
    : ["Fast routes", "Smart search", "Live campus info"];

  return (
    <div className="pb-10">
      <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.16),transparent_30%)]">
        <div
          className="absolute inset-0 -z-10 opacity-100"
          style={{
            backgroundImage: `linear-gradient(130deg, rgba(10, 16, 28, 0.82), rgba(30, 64, 175, 0.38), rgba(15, 23, 42, 0.72)), url(${JSON.stringify(heroBackground)})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="absolute left-10 top-16 -z-10 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute bottom-8 right-8 -z-10 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 pb-20 pt-12 md:pb-28 md:pt-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl text-white">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium tracking-[0.18em] text-white/80 uppercase backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" /> Smart navigation for PSIT
              </span>

              <h1 className="mt-6 font-display text-5xl font-black leading-[0.95] tracking-[-0.04em] md:text-6xl xl:text-7xl">
                Find your way around campus <span className="text-cyan-200">without the stress.</span>
              </h1>

              <p className="mt-5 max-w-xl text-base text-white/80 md:text-lg">
                Discover buildings, classrooms, labs and facilities in seconds with a campus map designed for quick decisions and confident movement.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  nav({ to: "/search", search: { q } });
                }}
                className="mt-8 flex max-w-2xl items-center gap-2 rounded-2xl border border-white/20 bg-white/10 p-2 shadow-[0_20px_50px_rgba(15,23,42,0.35)] backdrop-blur-xl"
              >
                <Search className="ml-2 h-5 w-5 text-white/80" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search building, classroom, lab, department…"
                  className="w-full bg-transparent px-2 py-3 text-base text-white placeholder:text-white/60 focus:outline-none"
                />
                <button type="submit" className="btn-hero btn-hero-hover inline-flex items-center gap-2 px-5 py-3 text-sm md:text-base">
                  Explore <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/85">
                <Link to="/map" className="rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm transition hover:bg-white/15">
                  Open Campus Map
                </Link>
                <Link to="/navigate" className="rounded-full border border-white/20 bg-transparent px-4 py-2 transition hover:bg-white/10">
                  Get Directions
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              <div className="rounded-[28px] border border-white/20 bg-slate-950/35 p-4 shadow-[0_40px_80px_rgba(15,23,42,0.45)] backdrop-blur-xl">
                <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Campus pulse</p>
                      <h3 className="mt-2 font-display text-2xl font-bold text-white">Today at a glance</h3>
                    </div>
                    <div className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-200">
                      Live
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                    {[
                      { label: "Fastest path", value: campusPulse.fastestPath },
                      { label: "Nearby lab", value: campusPulse.nearbyLab },
                      { label: "Best route", value: campusPulse.bestRoute },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <div className="text-[11px] uppercase tracking-[0.2em] text-white/55">{item.label}</div>
                        <div className="mt-2 font-display text-xl font-bold text-white">{item.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                    <div className="mb-3 flex items-center justify-between text-sm text-white/70">
                      <span>Popular destinations</span>
                      <span className="text-cyan-200">Updated now</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {highlights.map((item) => (
                        <span key={item} className="rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-100">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-8 max-w-7xl px-4 md:-mt-12">
        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card/80 p-4 shadow-soft backdrop-blur-xl md:grid-cols-4">
          {[
            { label: "Departments", value: stats.departments },
            { label: "Buildings", value: stats.buildings },
            { label: "Labs", value: stats.labs },
            { label: "Students", value: stats.students },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border border-border/80 bg-secondary/50 p-4 text-center"
            >
              <div className="font-display text-3xl font-bold text-primary">{s.value.toLocaleString()}+</div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="mb-10 max-w-2xl">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-primary">
            Why campus compass
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">Everything you need to move with confidence</h2>
          <p className="mt-3 text-muted-foreground">From marker-rich maps to smart search — Campus Compass is built for students, faculty and visitors.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: MapPinned, title: "Interactive Map", desc: "Every building marked with photos, departments and facilities." },
            { icon: Search, title: "Smart Search", desc: "Search across buildings, rooms, labs, offices and services." },
            { icon: Camera, title: "Real Photos", desc: "See the actual building before you set out." },
            { icon: RouteIcon, title: "Route Navigation", desc: "Turn-by-turn directions with distance & walking time." },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-glow"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-500/20">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold">Popular locations</h2>
            <p className="text-muted-foreground">Frequently visited by students today.</p>
          </div>
          <Link
            to="/map"
            aria-label="See all campus locations"
            className="group inline-flex w-fit items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-3.5 py-2 text-sm font-semibold text-primary transition hover:border-primary/50 hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            See all locations
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((b, i) => (
            <BuildingCard key={b.id} b={b} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
