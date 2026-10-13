import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SignIn, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { checkIsAdmin, useAuth } from "@/lib/auth-context";
import { login } from "@/lib/api";
import { Compass, Mail, Lock, Info, ArrowRight } from "lucide-react";
import { GoogleSignInButton, AuthDivider } from "@/components/google-signin";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Campus Compass" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user: authUser, setSession } = useAuth();
  const { isLoaded: clerkLoaded, isSignedIn: clerkSignedIn, user: clerkUser } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"database" | "clerk">("database");

  useEffect(() => {
    if (authUser) {
      const searchParams = new URLSearchParams(window.location.search);
      const redirectParam = searchParams.get("redirect") || "";
      const isReqAdmin = redirectParam.startsWith("/admin");
      const nextPath = authUser.role === "admin"
        ? (isReqAdmin ? redirectParam : "/admin/dashboard")
        : (isReqAdmin ? "/dashboard" : redirectParam || "/dashboard");
      navigate({ to: nextPath, replace: true });
      return;
    }

    if (clerkLoaded && clerkSignedIn && clerkUser) {
      const email = clerkUser.primaryEmailAddress?.emailAddress || "";
      const isAdmin = checkIsAdmin(clerkUser.publicMetadata?.role, email);
      const searchParams = new URLSearchParams(window.location.search);
      const redirectParam = searchParams.get("redirect") || "";
      const isReqAdmin = redirectParam.startsWith("/admin");
      const nextPath = isAdmin
        ? (isReqAdmin ? redirectParam : "/admin/dashboard")
        : (isReqAdmin ? "/dashboard" : redirectParam || "/dashboard");
      navigate({ to: nextPath, replace: true });
    }
  }, [authUser, clerkLoaded, clerkSignedIn, clerkUser, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await login(email, password);
      setSession(res.user, res.token);
      navigate({ to: res.user.role === "admin" ? "/admin/dashboard" : "/dashboard", replace: true });
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? e?.message ?? "Login failed. Check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  if (authUser || (clerkLoaded && clerkSignedIn)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-4 py-12">
      <div className="mb-6 w-full rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs leading-relaxed text-muted-foreground shadow-soft">
        <div className="flex items-start gap-2.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <span className="font-semibold text-foreground">Campus Sign In:</span> Authenticate with your{" "}
            <strong className="text-foreground">registered email & password</strong> to access your database-backed profile.
          </div>
        </div>
      </div>

      <div className="w-full rounded-2xl glass-strong p-8 shadow-glow">
        <div className="mb-6 flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "var(--gradient-brand)" }}>
            <Compass className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">Welcome back</h1>
            <div className="text-xs text-muted-foreground">Sign in to Campus Compass</div>
          </div>
        </div>

        {mode === "clerk" ? (
          <div className="space-y-4">
            <SignIn
              routing="hash"
              fallbackRedirectUrl="/dashboard"
              appearance={{
                elements: {
                  rootBox: "mx-auto w-full",
                  card: "shadow-none border-0 bg-transparent p-0",
                },
              }}
            />
            <button
              type="button"
              onClick={() => setMode("database")}
              className="w-full text-center text-xs text-primary hover:underline"
            >
              Sign in with Campus Compass account instead
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={submit} className="space-y-4">
              <label className="block">
                <span className="text-xs text-muted-foreground">Email address</span>
                <div className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-background px-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent py-2.5 text-sm outline-none"
                    placeholder="you@psit.ac.in"
                    aria-label="Email address"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-xs text-muted-foreground">Password</span>
                <div className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-background px-3">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent py-2.5 text-sm outline-none"
                    placeholder="••••••••"
                    aria-label="Password"
                  />
                </div>
              </label>

              <div className="text-right">
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              {err && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive">
                  {err}
                </div>
              )}

              <button
                disabled={loading}
                type="submit"
                className="btn-hero btn-hero-hover w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <AuthDivider />
            <GoogleSignInButton onError={(msg) => setErr(msg)} />

            <div className="mt-6 flex flex-col gap-2 text-center text-xs text-muted-foreground">
              <div>
                Don't have an account?{" "}
                <Link to="/register" className="font-semibold text-primary hover:underline">
                  Register here
                </Link>
              </div>
              <div>
                Admin portal?{" "}
                <Link to="/admin" className="font-semibold text-primary hover:underline">
                  Admin login
                </Link>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/50 text-center">
              <button
                type="button"
                onClick={() => setMode("clerk")}
                className="text-[11px] text-muted-foreground hover:text-foreground underline"
              >
                Alternative: Sign in with Clerk
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
