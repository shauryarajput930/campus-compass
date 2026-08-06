import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { loginWithGoogle } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

declare global {
  interface Window {
    google?: any;
  }
}

function loadGsi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.accounts?.id) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-gsi]");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Google")));
      return;
    }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.dataset.gsi = "true";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Google"));
    document.head.appendChild(s);
  });
}

export function GoogleSignInButton({ onError }: { onError?: (msg: string) => void }) {
  const { setSession } = useAuth();
  const nav = useNavigate();
  const holder = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  const finish = async (credential: string) => {
    setBusy(true);
    try {
      const { user, token } = await loginWithGoogle(credential);
      setSession(user, token);
      nav({ to: user.role === "admin" ? "/admin/dashboard" : "/dashboard" });
    } catch (e: any) {
      onError?.(e?.response?.data?.error ?? e?.message ?? "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    loadGsi()
      .then(() => {
        if (cancelled || !holder.current || !window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (res: { credential?: string }) => {
            if (res.credential) void finish(res.credential);
          },
        });
        window.google.accounts.id.renderButton(holder.current, {
          theme: "filled_black",
          size: "large",
          shape: "pill",
          text: "continue_with",
          width: 320,
        });
        setReady(true);
      })
      .catch(() => onError?.("Could not load Google sign-in"));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!CLIENT_ID) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void finish("demo")}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card py-2.5 text-sm hover:bg-secondary"
        >
          <GoogleGlyph /> {busy ? "Signing in…" : "Continue with Google"}
        </button>
        <p className="text-center text-[10px] text-muted-foreground">
          Demo mode — set <code>VITE_GOOGLE_CLIENT_ID</code> to enable real Google sign-in.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={holder} aria-label="Continue with Google" />
      {!ready && <div className="text-xs text-muted-foreground">Loading Google…</div>}
      {busy && <div className="text-xs text-muted-foreground" aria-live="polite">Signing in…</div>}
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.1a5.2 5.2 0 0 1-2.3 3.4v2.8h3.6c2.1-2 3.6-4.9 3.6-8.4Z" />
      <path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.4-2.8l-3.6-2.8c-1 .7-2.3 1.1-3.8 1.1a6.7 6.7 0 0 1-6.3-4.6H1.9v2.9A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.7 14.9a7.2 7.2 0 0 1 0-4.6V7.4H1.9a12 12 0 0 0 0 10.8l3.8-3.3Z" />
      <path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.2-3.2A12 12 0 0 0 1.9 7.4l3.8 2.9A6.7 6.7 0 0 1 12 4.8Z" />
    </svg>
  );
}

export function AuthDivider() {
  return (
    <div className="my-5 flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">or</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
