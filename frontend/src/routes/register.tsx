import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { register } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Compass, User, Mail, Lock } from "lucide-react";
import { GoogleSignInButton, AuthDivider } from "@/components/google-signin";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — Campus Compass" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const { setSession } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null); setLoading(true);
    try {
      const { user, token } = await register(name, email, password);
      setSession(user, token);
      nav({ to: "/dashboard" });
    } catch (e: any) { setErr(e?.message ?? "Registration failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-16">
      <div className="w-full rounded-2xl glass-strong p-8 shadow-glow">
        <div className="mb-6 flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "var(--gradient-brand)" }}><Compass className="h-5 w-5 text-white" /></div>
          <div><div className="font-display text-xl font-bold">Create your account</div><div className="text-xs text-muted-foreground">Join Campus Compass</div></div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-xs text-muted-foreground">Name</span>
            <div className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-background px-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent py-2.5 text-sm focus:outline-none" placeholder="Aditya Kumar" />
            </div>
          </label>
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
          {err && <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">{err}</div>}
          <button disabled={loading} className="w-full btn-hero btn-hero-hover py-3">{loading ? "Creating…" : "Create account"}</button>
        </form>
        <AuthDivider />
        <GoogleSignInButton onError={setErr} />
        <p className="mt-4 text-center text-xs text-muted-foreground">Have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link></p>
      </div>
    </div>
  );
}
