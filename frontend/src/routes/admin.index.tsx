import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SignIn, useClerk, useSignIn, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { checkIsAdmin, useAuth } from "@/lib/auth-context";
import { login } from "@/lib/api";
import { KeyRound, Mail, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin login — Campus Compass" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const { user: authUser, setSession, logout: appLogout } = useAuth();
  const { isLoaded: clerkLoaded, isSignedIn: clerkSignedIn, user: clerkUser } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const { isLoaded: signInLoaded, signIn, setActive } = useSignIn();
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "reset" | "clerk">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const userEmail = authUser?.email || clerkUser?.primaryEmailAddress?.emailAddress || "";
  const isAdmin = authUser?.role === "admin" || checkIsAdmin(clerkUser?.publicMetadata?.role, userEmail);
  const isUserSignedIn = Boolean(authUser || (clerkLoaded && clerkSignedIn));

  const getClerkErrorMessage = (caught: unknown): string => {
    if (typeof caught === "object" && caught !== null && "errors" in caught && Array.isArray((caught as { errors: unknown[] }).errors)) {
      const first = (caught as { errors: Array<{ longMessage?: string; message?: string }> }).errors[0];
      if (first?.longMessage) return first.longMessage;
      if (first?.message) return first.message;
    }
    if (caught instanceof Error) return caught.message;
    return "Could not sign in. Check your email and password.";
  };

  const submitLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      if (signInLoaded && signIn) {
        try {
          const result = await signIn.create({ strategy: "password", identifier: email, password });
          if (result.status === "complete" && result.createdSessionId) {
            await setActive({ session: result.createdSessionId });
            return;
          }
        } catch {
          /* Fall through to backend API login */
        }
      }

      const res = await login(email, password);
      if (res.user.role !== "admin") {
        throw new Error("This account does not have admin privileges.");
      }
      setSession(res.user, res.token);
      nav({ to: "/admin/dashboard", replace: true });
    } catch (caught) {
      const msg = getClerkErrorMessage(caught);
      setError(msg);
      if (msg.toLowerCase().includes("strategy") || msg.toLowerCase().includes("password") || msg.toLowerCase().includes("identifier") || msg.toLowerCase().includes("not found")) {
        setMode("clerk");
      }
    } finally {
      setBusy(false);
    }
  };

  const sendResetCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!signInLoaded) return;
    setBusy(true);
    setError("");
    try {
      await signIn.create({ strategy: "reset_password_email_code", identifier: email });
      setResetSent(true);
    } catch (caught) {
      setError(getClerkErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  const submitReset = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!signInLoaded) return;
    setBusy(true);
    setError("");
    try {
      const result = await signIn.attemptFirstFactor({ strategy: "reset_password_email_code", code });
      if (result.status !== "needs_new_password") throw new Error("That OTP is invalid or expired.");
      await signIn.resetPassword({ password: newPassword });
      setMode("login");
      setResetSent(false);
      setCode("");
      setNewPassword("");
    } catch (caught) {
      setError(getClerkErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isUserSignedIn && isAdmin) {
      nav({ to: "/admin/dashboard", replace: true });
    }
  }, [mounted, isUserSignedIn, isAdmin, nav]);

  const handleSignOut = async () => {
    appLogout();
    try { await clerkSignOut(); } catch {}
    nav({ to: "/admin", replace: true });
  };

  if (!mounted || !clerkLoaded) {
    return (
      <div className="mesh-bg flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-glow sm:p-8">
          <p className="text-center text-sm text-muted-foreground">Loading admin portal...</p>
        </div>
      </div>
    );
  }

  if (isUserSignedIn) {
    if (isAdmin) {
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <p className="text-sm text-muted-foreground">Redirecting to admin dashboard...</p>
        </div>
      );
    }

    return (
      <div className="mesh-bg flex min-h-screen items-center justify-center px-6 text-center">
        <div className="max-w-md rounded-2xl border border-border bg-card p-6 shadow-glow">
          <h2 className="font-display text-xl font-bold text-foreground">Access Restricted</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This account (<strong className="text-foreground">{userEmail || "current user"}</strong>) is not authorized for the admin dashboard.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Sign in with an email starting with <code className="text-primary font-mono">admin</code> (e.g. <code className="text-primary font-mono">admin@gmail.com</code>).
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button onClick={() => nav({ to: "/dashboard", replace: true })} className="btn-hero btn-hero-hover px-4 py-2 text-sm">
              Go to user dashboard
            </button>
            <button
              onClick={handleSignOut}
              className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground transition hover:bg-muted"
            >
              Sign out & switch account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mesh-bg flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-glow sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">Admin portal</h1>
            <p className="text-xs text-muted-foreground">Sign in with an admin email account (e.g. admin@gmail.com).</p>
          </div>
        </div>

        {mode === "clerk" ? (
          <div className="space-y-4">
            <SignIn
              routing="hash"
              fallbackRedirectUrl="/admin/dashboard"
              appearance={{
                elements: {
                  rootBox: "mx-auto w-full",
                  card: "shadow-none border-0 bg-transparent p-0",
                },
              }}
            />
            <button
              type="button"
              onClick={() => setMode("login")}
              className="w-full text-center text-xs text-primary hover:underline"
            >
              Back to direct password login
            </button>
          </div>
        ) : mode === "login" ? (
          <form onSubmit={submitLogin} className="space-y-4">
            <label className="block text-sm">
              <span className="text-xs text-muted-foreground">Admin email</span>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-background px-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full bg-transparent py-2.5 text-sm outline-none"
                  placeholder="admin@gmail.com"
                />
              </div>
            </label>
            <label className="block text-sm">
              <span className="text-xs text-muted-foreground">Password</span>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-background px-3">
                <KeyRound className="h-4 w-4 text-muted-foreground" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full bg-transparent py-2.5 text-sm outline-none"
                  placeholder="Enter password"
                />
              </div>
            </label>
            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive space-y-1">
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => setMode("clerk")}
                  className="font-semibold underline hover:text-foreground"
                >
                  Click here to sign in with Google or Clerk Auth
                </button>
              </div>
            )}
            <button disabled={busy || !signInLoaded} className="btn-hero btn-hero-hover w-full py-3 text-sm">
              {busy ? "Signing in..." : "Sign in to admin portal"}
            </button>
            <div className="flex items-center justify-between text-xs text-primary pt-1">
              <button type="button" onClick={() => setMode("clerk")} className="hover:underline">
                Sign in with Google / Clerk
              </button>
              <button type="button" onClick={() => { setMode("reset"); setError(""); }} className="hover:underline">
                Forgot password?
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={resetSent ? submitReset : sendResetCode} className="space-y-4">
            <div>
              <h2 className="font-display text-lg font-semibold">Reset admin password</h2>
              <p className="mt-1 text-xs text-muted-foreground">We will send a one-time code to your email address.</p>
            </div>
            <label className="block text-sm">
              <span className="text-xs text-muted-foreground">Admin Gmail address</span>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-background px-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input
                  required
                  disabled={resetSent}
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full bg-transparent py-2.5 text-sm outline-none disabled:opacity-60"
                  placeholder="admin@gmail.com"
                />
              </div>
            </label>
            {resetSent && (
              <>
                <label className="block text-sm">
                  <span className="text-xs text-muted-foreground">Email OTP</span>
                  <input
                    required
                    inputMode="numeric"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none"
                    placeholder="Enter the code from Gmail"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-xs text-muted-foreground">New password</span>
                  <input
                    required
                    minLength={8}
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none"
                    placeholder="At least 8 characters"
                  />
                </label>
              </>
            )}
            {error && <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">{error}</p>}
            <button disabled={busy || !signInLoaded} className="btn-hero btn-hero-hover w-full py-3 text-sm">
              {busy ? "Please wait..." : resetSent ? "Set new password" : "Send OTP to Gmail"}
            </button>
            <button type="button" onClick={() => { setMode("login"); setResetSent(false); setError(""); }} className="w-full text-center text-xs text-primary hover:underline">
              Back to admin sign in
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

