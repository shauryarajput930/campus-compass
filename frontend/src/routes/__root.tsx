import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, useRouter, useRouterState, HeadContent, Scripts } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";

import appCss from "../styles.css?url";
import { ThemeProvider } from "@/lib/theme-context";
import { MotionProvider } from "@/lib/motion-context";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar, Footer } from "@/components/site-chrome";
import { MapPin, Navigation, ShieldCheck } from "lucide-react";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mesh-bg absolute inset-0 -z-10 opacity-40" />
        <h1 className="gradient-text font-display text-8xl font-black">404</h1>
        <h2 className="mt-4 font-display text-2xl font-semibold">You wandered off the map</h2>
        <p className="mt-2 text-sm text-muted-foreground">This location isn't on the campus grid.</p>
        <a href="/" className="mt-6 inline-flex btn-hero btn-hero-hover px-5 py-3">Back to Campus</a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl font-semibold">Something broke on our end</h1>
        <p className="mt-2 text-sm text-muted-foreground">Try again or head home.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="btn-hero btn-hero-hover px-4 py-2">Try again</button>
          <a href="/" className="rounded-lg border border-border px-4 py-2 text-sm">Home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Campus Compass — Navigate Your Campus Smarter" },
      { name: "description", content: "Interactive campus navigation for PSIT. Find buildings, classrooms, labs and facilities with real-time directions." },
      { name: "author", content: "Campus Compass" },
      { property: "og:title", content: "Campus Compass — Navigate Your Campus Smarter" },
      { property: "og:description", content: "Interactive maps, smart search and turn-by-turn campus navigation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" },
      { rel: "icon", href: "/logo.png", type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

const themeInitScript = `(function(){try{var s=localStorage.getItem('cc_theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){document.documentElement.classList.add('dark');}})();`;

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <HeadContent />
      </head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MotionProvider>
          <AuthProvider>
            <ChromeShell />
          </AuthProvider>
        </MotionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function ChromeShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const bare = pathname.startsWith("/admin");
  const [isLoading, setIsLoading] = useState(true);
  const [locationState, setLocationState] = useState<"checking" | "granted" | "blocked">("checking");

  const requestLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationState("blocked");
      return;
    }
    setLocationState("checking");
    navigator.geolocation.getCurrentPosition(
      () => setLocationState("granted"),
      () => setLocationState("blocked"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  };

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => { requestLocation(); }, []);

  if (!bare && locationState !== "granted") {
    return (
      <div className="mesh-bg flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
          <div className="relative overflow-hidden bg-slate-950 px-8 pb-10 pt-9 text-white">
            <div className="absolute -right-12 -top-16 h-44 w-44 rounded-full border border-cyan-300/20" />
            <div className="absolute -bottom-24 left-1/2 h-48 w-48 rounded-full border border-blue-300/10" />
            <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-cyan-400 text-slate-950 shadow-[0_0_34px_rgba(34,211,238,0.35)]">
              <MapPin className="h-8 w-8" />
            </div>
            <div className="relative mt-7 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Campus Compass</div>
            <h1 className="relative mt-2 font-display text-3xl font-bold">Location access required</h1>
            <p className="relative mt-2 max-w-md text-sm leading-6 text-slate-300">Allow your location to unlock accurate campus directions and nearby building navigation.</p>
          </div>
          <div className="p-8">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: Navigation, label: "Live directions" },
                { icon: MapPin, label: "Nearby places" },
                { icon: ShieldCheck, label: "Used securely" },
              ].map((item) => <div key={item.label} className="rounded-xl border border-border bg-background p-3 text-center"><item.icon className="mx-auto h-4 w-4 text-primary" /><div className="mt-2 text-xs text-muted-foreground">{item.label}</div></div>)}
            </div>
          {locationState === "checking" ? (
            <p className="mt-6 text-center text-sm text-muted-foreground">Waiting for your location permission…</p>
          ) : (
            <>
              <p className="mt-6 text-center text-sm text-muted-foreground">Allow location access in your browser, then continue to Campus Compass.</p>
              <p className="mt-3 text-center text-xs text-muted-foreground">Blocked it earlier? Open the lock icon beside the address bar and set Location to Allow.</p>
              <button onClick={requestLocation} className="btn-hero btn-hero-hover mt-6 w-full px-5 py-3 text-sm">Allow location and continue</button>
            </>
          )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mesh-bg flex min-h-screen flex-col">
      {isLoading && !bare && (
        <div className="startup-loader" role="status" aria-label="Loading Campus Compass">
          <div className="startup-loader__mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <p className="startup-loader__label">Campus Compass</p>
          <div className="startup-loader__line" aria-hidden="true"><span /></div>
        </div>
      )}
      {!bare && <Navbar />}
      <main className="flex-1">
        <Outlet />
      </main>
      {!bare && <Footer />}
    </div>
  );
}
