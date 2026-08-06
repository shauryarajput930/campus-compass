import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [
    { title: "Contact — Campus Compass" },
    { name: "description", content: "Get in touch with the Campus Compass team." },
  ] }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 lg:grid-cols-2">
      <div>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Contact</span>
        <h1 className="mt-1 font-display text-4xl font-black md:text-5xl">Let's talk.</h1>
        <p className="mt-3 text-muted-foreground">Questions, feedback or a partnership idea — drop us a line.</p>
        <ul className="mt-8 space-y-3 text-sm">
          <li className="flex items-center gap-3"><Mail className="h-4 w-4" /> hello@campuscompass.app</li>
          <li className="flex items-center gap-3"><Phone className="h-4 w-4" /> +91 98765 43210</li>
          <li className="flex items-center gap-3"><MapPin className="h-4 w-4" /> PSIT Campus, Kanpur, India</li>
        </ul>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); setSent(true); }}
        className="rounded-2xl glass-strong p-6 shadow-soft"
      >
        {sent ? (
          <div className="grid place-items-center py-10 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full" style={{ background: "var(--gradient-brand)" }}>
              <Send className="h-6 w-6 text-white" />
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold">Message sent!</h3>
            <p className="text-sm text-muted-foreground">We'll get back to you within 24 hours.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              <input required placeholder="Full name" className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
              <input required type="email" placeholder="Email" className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
            </div>
            <input required placeholder="Subject" className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
            <textarea required rows={5} placeholder="Message" className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
            <button className="mt-4 w-full btn-hero btn-hero-hover py-3 text-sm inline-flex items-center justify-center gap-2">
              <Send className="h-4 w-4" /> Send message
            </button>
          </>
        )}
      </form>
    </div>
  );
}
