import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { resetPassword } from "@/lib/api";
import { Compass, Lock, ArrowLeft } from "lucide-react";

type Search = { token?: string };

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Set a new password — Campus Compass" },
      { name: "description", content: "Choose a new password for your Campus Compass account and continue navigating the PSIT campus." },
      { property: "og:title", content: "Set a new password — Campus Compass" },
      { property: "og:description", content: "Choose a new password for your Campus Compass account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (password.length < 8) return setErr("Password must be at least 8 characters");
    if (password !== confirm) return setErr("Passwords do not match");
    setLoading(true);
    try {
      await resetPassword(token ?? "", password);
      nav({ to: "/login" });
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? e?.message ?? "Could not reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-16">
      <div className="w-full rounded-2xl glass-strong p-8 shadow-glow">
        <div className="mb-6 flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "var(--gradient-brand)" }}>
            <Compass className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">Set a new password</h1>
            <div className="text-xs text-muted-foreground">Choose something strong and memorable</div>
          </div>
        </div>

        {!token && (
          <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
            This reset link is missing its token. Request a new link from the{" "}
            <Link to="/forgot-password" className="underline">forgot password</Link> page.
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-xs text-muted-foreground">New password</span>
            <div className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-background px-3">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent py-2.5 text-sm focus:outline-none" placeholder="••••••••" aria-label="New password" />
            </div>
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">Confirm password</span>
            <div className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-background px-3">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input required type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full bg-transparent py-2.5 text-sm focus:outline-none" placeholder="••••••••" aria-label="Confirm new password" />
            </div>
          </label>
          {err && <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">{err}</div>}
          <button disabled={loading || !token} className="w-full btn-hero btn-hero-hover py-3">
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link to="/login" className="inline-flex items-center gap-1 text-primary hover:underline">
            <ArrowLeft className="h-3 w-3" /> Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
