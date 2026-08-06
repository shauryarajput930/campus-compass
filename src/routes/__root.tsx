import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, useRouter, useRouterState, HeadContent, Scripts } from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";
import { ThemeProvider } from "@/lib/theme-context";
import { MotionProvider } from "@/lib/motion-context";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar, Footer } from "@/components/site-chrome";

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
  return (
    <div className="mesh-bg min-h-screen">
      {!bare && <Navbar />}
      <main>
        <Outlet />
      </main>
      {!bare && <Footer />}
    </div>
  );
}
