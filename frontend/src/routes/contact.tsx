import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Send, Clock } from "lucide-react";
import { getSiteSettings, type SiteSettings } from "@/lib/admin";
import { FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [
    { title: "Contact — Campus Compass" },
    { name: "description", content: "Get in touch with the Campus Compass team." },
  ] }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  useEffect(() => { getSiteSettings().then(setSettings).catch(() => undefined); }, []);
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 lg:grid-cols-[0.85fr_1.15fr]">
      <div>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Contact</span>
        <h1 className="mt-1 font-display text-4xl font-black md:text-5xl">We are here to help.</h1>
        <p className="mt-3 max-w-md text-muted-foreground">Found an incorrect building detail, need help with directions, or want to suggest an improvement? Send the campus team a note.</p>
        <ul className="mt-8 space-y-3 text-sm">
          <li className="flex items-center gap-3"><Mail className="h-4 w-4" /> {settings?.contactEmail || "hello@campuscompass.app"}</li>
          <li className="flex items-center gap-3"><Phone className="h-4 w-4" /> {settings?.contactPhone || "+91 98765 43210"}</li>
          <li className="flex items-center gap-3"><MapPin className="h-4 w-4" /> PSIT Campus, Kanpur, India</li>
          <li className="flex items-center gap-3"><Clock className="h-4 w-4" /> Usually replies within one working day</li>
        </ul>
        <div className="mt-8 flex items-center gap-3">
          {[
            { href: settings?.instagram, label: "Instagram", icon: FaInstagram },
            { href: settings?.linkedin, label: "LinkedIn", icon: FaLinkedinIn },
            { href: settings?.twitter, label: "X / Twitter", icon: FaXTwitter },
          ].filter((item) => item.href).map((item) => <a key={item.label} href={item.href} target="_blank" rel="noreferrer" aria-label={item.label} className="rounded-lg border border-border p-2.5 text-muted-foreground transition hover:border-primary hover:text-primary"><item.icon className="h-4 w-4" /></a>)}
        </div>
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
            <h3 className="mt-4 font-display text-xl font-semibold">Message received.</h3>
            <p className="text-sm text-muted-foreground">The Campus Compass team will get back to you within one working day.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              <input required placeholder="Full name" className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
              <input required type="email" placeholder="Email" className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
            </div>
            <input required placeholder="Subject" className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
            <textarea required rows={6} placeholder="How can we help?" className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
            <button className="mt-4 w-full btn-hero btn-hero-hover py-3 text-sm inline-flex items-center justify-center gap-2">
              <Send className="h-4 w-4" /> Send message
            </button>
          </>
        )}
      </form>
    </div>
  );
}
