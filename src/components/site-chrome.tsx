import { Link, useRouter } from "@tanstack/react-router";
import { Compass, Map, LayoutDashboard, Search, Heart, Info, Mail, LogIn, LogOut, ShieldCheck, Menu, X, QrCode } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
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
    <header className="sticky top-0 z-40 glass-strong">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <div className="overflow-hidden rounded-xl border border-border shadow-glow">
            <img src="/logo.png" alt="Campus Compass logo" className="h-9 w-9 object-cover" />
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
              {user.role === "admin" && (
                <Link to="/admin/dashboard" className="hidden items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs md:inline-flex">
                  <ShieldCheck className="h-4 w-4" /> Admin
                </Link>
              )}
              <button onClick={() => { logout(); router.navigate({ to: "/" }); }} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs hover:bg-secondary">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </>
          ) : (
            <Link to="/login" className="inline-flex items-center gap-1 rounded-lg btn-hero btn-hero-hover px-3 py-2 text-xs">
              <LogIn className="h-4 w-4" /> Sign in
            </Link>
          )}
          <button onClick={() => setOpen((o) => !o)} className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card md:hidden" aria-label="Menu">
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden overflow-hidden border-t border-border">
            <div className="grid gap-1 p-3">
              {nav.map((n) => (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-secondary">
                  <n.icon className="h-4 w-4" /> {n.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: "var(--gradient-brand)" }}>
              <Compass className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-bold">Campus Compass</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Navigate your campus smarter. Interactive maps, live directions, and building info at your fingertips.</p>
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
            <li><Link to="/admin" className="hover:text-foreground">Admin</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Emergency</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Security: +91 98765 43210</li>
            <li>Medical: +91 98765 43211</li>
            <li>Reception: +91 98765 43212</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Campus Compass · Built for PSIT</div>
    </footer>
  );
}
