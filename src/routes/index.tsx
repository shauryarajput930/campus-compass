import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Search, MapPinned, Route as RouteIcon, Camera, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { getBuildings } from "@/lib/api";
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
  const nav = useNavigate();

  useEffect(() => { getBuildings().then((b) => setFeatured(b.slice(0, 6))); }, []);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="hero-bg absolute inset-0 -z-10 opacity-90" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(600px_circle_at_30%_20%,rgba(255,255,255,0.15),transparent)]" />
        <div className="mx-auto max-w-7xl px-4 py-24 md:py-32 text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Smart navigation for PSIT
            </span>
            <h1 className="mt-5 font-display text-5xl font-black leading-tight md:text-7xl">
              Navigate your campus, <br /> <span className="text-white/90">smarter.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-white/85">
              Find any building, classroom, lab, department or facility on campus in seconds — with real photos, live directions and turn-by-turn guidance.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); nav({ to: "/search", search: { q } }); }}
              className="mt-8 flex max-w-2xl items-center gap-2 rounded-2xl glass-strong p-2 shadow-glow">
              <Search className="ml-2 h-5 w-5 text-white/80" />
              <input value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Search building, classroom, lab, department…"
                className="w-full bg-transparent px-2 py-3 text-white placeholder:text-white/60 focus:outline-none" />
              <button type="submit" className="btn-hero btn-hero-hover inline-flex items-center gap-1 px-5 py-3">
                Explore <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <Link to="/map" className="rounded-lg border border-white/25 bg-white/10 px-4 py-2 backdrop-blur hover:bg-white/20">Open Campus Map</Link>
              <Link to="/navigate" className="rounded-lg border border-white/25 bg-white/10 px-4 py-2 backdrop-blur hover:bg-white/20">Get Directions</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto -mt-12 max-w-7xl px-4">
        <div className="grid grid-cols-2 gap-3 rounded-2xl glass-strong p-4 shadow-soft md:grid-cols-4">
          {[
            { label: "Departments", value: stats.departments },
            { label: "Buildings", value: stats.buildings },
            { label: "Labs", value: stats.labs },
            { label: "Students", value: stats.students },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="rounded-xl bg-card/60 p-4 text-center">
              <div className="font-display text-3xl font-bold gradient-text">{s.value.toLocaleString()}+</div>
              <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Everything you need to find your way</h2>
          <p className="mt-3 text-muted-foreground">From marker-rich maps to smart search — Campus Compass is built for students, faculty and visitors.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: MapPinned, title: "Interactive Map", desc: "Every building marked with photos, departments and facilities." },
            { icon: Search, title: "Smart Search", desc: "Search across buildings, rooms, labs, offices and services." },
            { icon: Camera, title: "Real Photos", desc: "See the actual building before you set out." },
            { icon: RouteIcon, title: "Route Navigation", desc: "Turn-by-turn directions with distance & walking time." },
          ].map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:shadow-glow">
              <div className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: "var(--gradient-brand)" }}>
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURED BUILDINGS */}
      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold">Popular locations</h2>
            <p className="text-muted-foreground">Frequently visited by students today.</p>
          </div>
          <Link to="/map" className="text-sm text-primary hover:underline">See all →</Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((b, i) => <BuildingCard key={b.id} b={b} index={i} />)}
        </div>
      </section>
    </div>
  );
}
