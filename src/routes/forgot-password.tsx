import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { requestPasswordReset } from "@/lib/api";
import { Compass, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — Campus Compass" },
      { name: "description", content: "Forgot your Campus Compass password? Request a secure reset link and get back to navigating the PSIT campus." },
      { property: "og:title", content: "Reset your password — Campus Compass" },
      { property: "og:description", content: "Request a secure password reset link for your Campus Compass account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? e?.message ?? "Could not send reset link");
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
            <h1 className="font-display text-xl font-bold">Forgot password?</h1>
            <div className="text-xs text-muted-foreground">We'll email you a reset link</div>
          </div>
        </div>

        {sent ? (
          <div className="space-y-4" aria-live="polite">
            <div className="flex items-start gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
              <p>
                If an account exists for <b>{email}</b>, a password reset link is on its way. Check your inbox and spam folder.
              </p>
            </div>
            <button onClick={() => setSent(false)} className="w-full rounded-lg border border-border py-2.5 text-sm hover:bg-secondary">
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="text-xs text-muted-foreground">Email</span>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-background px-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent py-2.5 text-sm focus:outline-none"
                  placeholder="you@psit.ac.in"
                  aria-label="Email address"
                />
              </div>
            </label>
            {err && <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">{err}</div>}
            <button disabled={loading} className="w-full btn-hero btn-hero-hover py-3">
              {loading ? "Sending link…" : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link to="/login" className="inline-flex items-center gap-1 text-primary hover:underline">
            <ArrowLeft className="h-3 w-3" /> Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
