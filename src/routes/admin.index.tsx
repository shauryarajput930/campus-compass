import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { login } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin login — Campus Compass" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const { setSession } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@psit.ac.in");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null); setLoading(true);
    try {
      const { user, token } = await login(email, password);
      if (user.role !== "admin") { setErr("Not an admin account"); return; }
      setSession(user, token);
      nav({ to: "/admin/dashboard" });
    } catch (e: any) { setErr(e?.message ?? "Login failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="mesh-bg min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
        <div className="w-full rounded-2xl glass-strong p-8 shadow-glow">
          <div className="mb-6 flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "var(--gradient-brand)" }}><ShieldCheck className="h-5 w-5 text-white" /></div>
            <div><div className="font-display text-xl font-bold">Admin Portal</div><div className="text-xs text-muted-foreground">Restricted access</div></div>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" placeholder="admin@psit.ac.in" />
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" placeholder="Password" />
            {err && <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">{err}</div>}
            <button disabled={loading} className="w-full btn-hero btn-hero-hover py-3">{loading ? "Signing in…" : "Sign in as admin"}</button>
          </form>
          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            Not admin? <Link to="/login" className="text-primary hover:underline">User login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
