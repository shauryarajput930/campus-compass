import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Target, Users, ArrowRight, MapPinned, Route as RouteIcon, QrCode, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About — Campus Compass" },
    { name: "description", content: "The story behind Campus Compass — smart navigation for PSIT." },
  ] }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">About</span>
      <h1 className="mt-1 max-w-4xl font-display text-4xl font-black md:text-5xl">A clearer way to move through PSIT.</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Campus Compass brings buildings, classrooms, labs, facilities and directions into one practical campus guide. It is designed for the first day on campus, the fastest route between lectures, and every visit after that.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          { icon: Compass, title: "Simple wayfinding", desc: "Find the right building, room or facility without asking around." },
          { icon: Target, title: "Useful directions", desc: "Plan routes with campus-aware map data and clear route insights." },
          { icon: Users, title: "For the whole campus", desc: "Students, faculty, parents, visitors and event guests can all use it." },
        ].map((c) => (
          <div key={c.title} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: "var(--gradient-brand)" }}>
              <c.icon className="h-5 w-5 text-white" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold">{c.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
          </div>
        ))}
      </div>

      <section className="mt-14 rounded-3xl glass-strong p-8">
        <h2 className="font-display text-2xl font-bold">Everything you need before you arrive</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Search campus locations, open building details, save favourites, scan QR codes and get directions from one responsive experience.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: MapPinned, label: "Interactive campus map" },
            { icon: RouteIcon, label: "Route planning" },
            { icon: QrCode, label: "QR building lookup" },
            { icon: ShieldCheck, label: "Verified campus details" },
          ].map((item) => <div key={item.label} className="flex items-center gap-2 rounded-xl border border-border bg-background/60 p-3 text-sm"><item.icon className="h-4 w-4 text-primary" /> {item.label}</div>)}
        </div>
        <Link
          to="/team"
          className="btn-hero btn-hero-hover mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm"
        >
          <Users className="h-4 w-4" />
          Meet the Team
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
