import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SignUp, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { register } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Compass, User, Mail, Lock, Info, ArrowRight } from "lucide-react";
import { GoogleSignInButton, AuthDivider } from "@/components/google-signin";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — Campus Compass" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { user: authUser, setSession } = useAuth();
  const { isLoaded: clerkLoaded, isSignedIn: clerkSignedIn } = useUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"database" | "clerk">("database");

  useEffect(() => {
    if (authUser || (clerkLoaded && clerkSignedIn)) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [authUser, clerkLoaded, clerkSignedIn, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!name.trim()) return setErr("Name is required");
    if (!email.trim()) return setErr("Email is required");
    if (password.length < 6) return setErr("Password must be at least 6 characters");

    setLoading(true);
    try {
      const res = await register(name.trim(), email.trim(), password);
      setSession(res.user, res.token);
      navigate({ to: "/dashboard", replace: true });
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? e?.message ?? "Registration failed. Please try again.");
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
            <span className="font-semibold text-foreground">Campus Registration:</span> Sign up with your details to create a persistent profile saved directly in our MongoDB database.
          </div>
        </div>
      </div>

      <div className="w-full rounded-2xl glass-strong p-8 shadow-glow">
        <div className="mb-6 flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "var(--gradient-brand)" }}>
            <Compass className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">Create your account</h1>
            <div className="text-xs text-muted-foreground">Join Campus Compass</div>
          </div>
        </div>

        {mode === "clerk" ? (
          <div className="space-y-4">
            <SignUp
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
              Sign up with Campus Compass directly instead
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={submit} className="space-y-4">
              <label className="block">
                <span className="text-xs text-muted-foreground">Full name</span>
                <div className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-background px-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent py-2.5 text-sm outline-none"
                    placeholder="Aditya Kumar"
                    aria-label="Full name"
                  />
                </div>
              </label>

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
                    minLength={6}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent py-2.5 text-sm outline-none"
                    placeholder="At least 6 characters"
                    aria-label="Password"
                  />
                </div>
              </label>

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
                {loading ? "Creating account..." : "Create account"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <AuthDivider />
            <GoogleSignInButton onError={(msg) => setErr(msg)} />

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>

            <div className="mt-4 pt-4 border-t border-border/50 text-center">
              <button
                type="button"
                onClick={() => setMode("clerk")}
                className="text-[11px] text-muted-foreground hover:text-foreground underline"
              >
                Alternative: Sign up with Clerk
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
