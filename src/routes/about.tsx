import { createFileRoute } from "@tanstack/react-router";
import { Compass, Target, Users } from "lucide-react";

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
      <h1 className="mt-1 font-display text-4xl font-black md:text-5xl">We help people find their way around campus.</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Campus Compass was built to solve a simple problem: new students, visitors and even faculty
        often struggle to locate specific classrooms, labs and offices spread across the campus.
        We built an interactive, photo-rich navigation platform to make finding anything on campus effortless.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          { icon: Compass, title: "Our Mission", desc: "Turn campus wayfinding into a delightful, one-tap experience." },
          { icon: Target, title: "Our Vision", desc: "Every campus in India navigable from a single, elegant app." },
          { icon: Users, title: "Who It's For", desc: "Students, faculty, parents, visitors and event guests." },
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
        <h2 className="font-display text-2xl font-bold">Built with a modern stack</h2>
        <p className="mt-2 text-sm text-muted-foreground">React, TanStack Router, Tailwind CSS v4, Framer Motion and Google Maps — served fast at the edge.</p>
      </section>
    </div>
  );
}
