import { Link, useRouter } from "@tanstack/react-router";
import { Compass, Map, LayoutDashboard, Search, Heart, Info, Mail, LogIn, LogOut, Menu, X, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getSiteSettings, type SiteSettings } from "@/lib/admin";
import { FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";

const nav = [
  { to: "/", label: "Home", icon: Compass },
  { to: "/map", label: "Map", icon: Map },
  { to: "/search", label: "Search", icon: Search },
  { to: "/scan", label: "Scan", icon: QrCode },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/favorites", label: "Favourites", icon: Heart },
  { to: "/about", label: "About", icon: Info },
  { to: "/contact", label: "Contact", icon: Mail },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <header className="relative sticky top-0 z-40 glass-strong">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <div className="overflow-hidden rounded-xl border border-border shadow-glow bg-card p-1 flex items-center justify-center">
            <img src="/logo.png" alt="Campus Compass logo" className="h-9 w-auto max-w-full object-contain" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-bold">Campus Compass</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Navigate smarter</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "rounded-lg px-3 py-2 text-sm text-foreground bg-secondary" }}
              activeOptions={{ exact: n.to === "/" }}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <button onClick={() => { logout(); router.navigate({ to: "/" }); }} className="hidden items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs hover:bg-secondary md:inline-flex">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </>
          ) : (
            <Link to="/login" className="hidden items-center gap-1 rounded-lg btn-hero btn-hero-hover px-3 py-2 text-xs md:inline-flex">
              <LogIn className="h-4 w-4" /> Sign in
            </Link>
          )}
          <motion.button
            onClick={() => setOpen((o) => !o)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card/80 shadow-sm transition hover:border-primary/50 hover:bg-secondary active:scale-95 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={open ? "close" : "menu"}
                initial={{ opacity: 0, rotate: open ? -90 : 90, scale: 0.65 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: open ? 90 : -90, scale: 0.65 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="grid place-items-center"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="absolute left-0 right-0 top-full z-50 overflow-hidden border-t border-border bg-background/95 shadow-xl backdrop-blur md:hidden">
            <div className="grid gap-1 p-3">
              {nav.map((n) => (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-secondary">
                  <n.icon className="h-4 w-4" /> {n.label}
                </Link>
              ))}
              {!user && (
                <Link to="/login" onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-secondary">
                  <LogIn className="h-4 w-4" /> Sign in
                </Link>
              )}
              {user && (
                <button onClick={() => { setOpen(false); logout(); router.navigate({ to: "/" }); }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => { getSiteSettings().then(setSettings).catch(() => undefined); }, []);

  return (
    <footer className="mt-auto border-t border-border bg-background/70">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-5 gap-y-8 px-4 py-8 sm:gap-7 lg:grid-cols-[1.5fr_0.8fr_0.8fr_1fr] lg:gap-10 lg:py-10">
        <div className="col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2">
            <div className="overflow-hidden rounded-lg border border-border bg-card p-1 flex items-center justify-center">
              <img src="/logo.png" alt="Campus Compass logo" className="h-7 w-auto max-w-full object-contain" />
            </div>
            <span className="font-display font-bold">Campus Compass</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">Navigate your campus smarter with live directions, building details and helpful campus locations.</p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Explore</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/map" className="hover:text-foreground">Campus Map</Link></li>
            <li><Link to="/search" className="hover:text-foreground">Search</Link></li>
            <li><Link to="/favorites" className="hover:text-foreground">Favourites</Link></li>
            <li><Link to="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
          </ul>
        </div>
        <div className="col-span-2 sm:col-span-1 lg:col-span-1">
          <h4 className="mb-3 text-sm font-semibold">Emergency</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Security: +91 98765 43210</li>
            <li>Medical: +91 98765 43211</li>
            <li>Reception: +91 98765 43212</li>
          </ul>
          <div className="mt-4 flex items-center gap-2">
            {[
              { href: settings?.instagram, label: "Instagram", icon: FaInstagram },
              { href: settings?.linkedin, label: "LinkedIn", icon: FaLinkedinIn },
              { href: settings?.twitter, label: "X / Twitter", icon: FaXTwitter },
            ].filter((item) => item.href).map((item) => <a key={item.label} href={item.href} target="_blank" rel="noreferrer" aria-label={item.label} className="rounded-lg border border-border p-2 text-muted-foreground transition hover:border-primary hover:text-primary"><item.icon className="h-4 w-4" /></a>)}
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Campus Compass · Built for PSIT</div>
    </footer>
  );
}
