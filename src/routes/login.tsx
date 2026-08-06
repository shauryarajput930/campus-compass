import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { login } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Compass, Mail, Lock } from "lucide-react";
import { GoogleSignInButton, AuthDivider } from "@/components/google-signin";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Campus Compass" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { setSession } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null); setLoading(true);
    try {
      const { user, token } = await login(email, password);
      setSession(user, token);
      nav({ to: user.role === "admin" ? "/admin/dashboard" : "/dashboard" });
    } catch (e: any) { setErr(e?.message ?? "Login failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-16">
      <div className="w-full rounded-2xl glass-strong p-8 shadow-glow">
        <div className="mb-6 flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "var(--gradient-brand)" }}><Compass className="h-5 w-5 text-white" /></div>
          <div><div className="font-display text-xl font-bold">Welcome back</div><div className="text-xs text-muted-foreground">Sign in to Campus Compass</div></div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-xs text-muted-foreground">Email</span>
            <div className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-background px-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent py-2.5 text-sm focus:outline-none" placeholder="you@psit.ac.in" />
            </div>
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">Password</span>
            <div className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-background px-3">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent py-2.5 text-sm focus:outline-none" placeholder="••••••••" />
            </div>
          </label>
          <div className="text-right">
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
          </div>
          {err && <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">{err}</div>}
          <button disabled={loading} className="w-full btn-hero btn-hero-hover py-3">{loading ? "Signing in…" : "Sign in"}</button>
        </form>
        <AuthDivider />
        <GoogleSignInButton onError={setErr} />
        <p className="mt-4 text-center text-xs text-muted-foreground">
          No account? <Link to="/register" className="text-primary hover:underline">Register</Link> · Admin? <Link to="/admin" className="text-primary hover:underline">Admin login</Link>
        </p>
        <p className="mt-3 text-center text-[10px] text-muted-foreground">Demo: any email/password works. Use <b>admin@…</b> to see the admin panel.</p>
      </div>
    </div>
  );
}
