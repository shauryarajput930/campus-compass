import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { QrCode, X, Camera, ShieldAlert, CheckCircle2 } from "lucide-react";
import { getBuildings } from "@/lib/api";
import type { Building } from "@/lib/mock-data";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Scan QR — Campus Compass" },
      { name: "description", content: "Scan a Campus Compass building QR code to open its details instantly." },
    ],
  }),
  component: ScanPage,
});

// Building ids are lowercase kebab-case, 2-40 chars. Anything else is rejected.
const ID_RE = /^[a-z0-9][a-z0-9-]{1,39}$/;
const MAX_PAYLOAD_LEN = 512;
// Client-side throttle: at most one decoded attempt per second, and at most
// 20 decode attempts per rolling minute. Prevents flooding the router with
// bogus scans from a malicious QR that decodes to a rapidly-changing value.
const MIN_INTERVAL_MS = 1000;
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;

interface ScanFeedback {
  kind: "ok" | "warn" | "err";
  message: string;
}

function extractBuildingId(payload: string): string | null {
  if (typeof payload !== "string" || payload.length === 0 || payload.length > MAX_PAYLOAD_LEN) {
    return null;
  }
  const trimmed = payload.trim();

  // 1. Same-origin absolute URL to /buildings/<id>
  try {
    const url = new URL(trimmed);
    if (typeof window !== "undefined" && url.origin !== window.location.origin) {
      return null; // cross-origin QR is rejected outright
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    const m = url.pathname.match(/^\/buildings\/([^/?#]+)\/?$/);
    if (!m) return null;
    const id = decodeURIComponent(m[1]).toLowerCase();
    return ID_RE.test(id) ? id : null;
  } catch {
    // Not a URL — fall through to bare-id check.
  }

  // 2. Bare building id (only accepted for backwards compat with printed stickers)
  const id = trimmed.toLowerCase();
  return ID_RE.test(id) ? id : null;
}

function ScanPage() {
  const navigate = useNavigate();
  const boxRef = useRef<HTMLDivElement | null>(null);
  const scannerRef = useRef<any>(null);
  const attemptsRef = useRef<number[]>([]);
  const lastAttemptAtRef = useRef(0);
  const handledRef = useRef(false);
  const [status, setStatus] = useState<"idle" | "running" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<ScanFeedback | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const validIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    getBuildings().then((list) => {
      setBuildings(list);
      validIdsRef.current = new Set(list.map((b) => b.id));
    });
  }, []);

  const start = async () => {
    setError(null);
    setFeedback(null);
    handledRef.current = false;
    setStatus("running");
    try {
      const mod = await import("html5-qrcode");
      const Html5Qrcode = mod.Html5Qrcode;
      const el = boxRef.current!;
      el.id = el.id || "cc-qr-reader";
      const scanner = new Html5Qrcode(el.id);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded: string) => onDecoded(decoded),
        () => {},
      );
    } catch (e: any) {
      setStatus("error");
      setError(e?.message || "Could not open camera. Grant permission and try again.");
    }
  };

  const stop = async () => {
    try {
      await scannerRef.current?.stop();
      await scannerRef.current?.clear();
    } catch {
      /* ignore stop errors */
    }
    scannerRef.current = null;
    setStatus("idle");
  };

  const throttleAllows = () => {
    const now = Date.now();
    if (now - lastAttemptAtRef.current < MIN_INTERVAL_MS) return false;
    attemptsRef.current = attemptsRef.current.filter((t) => now - t < WINDOW_MS);
    if (attemptsRef.current.length >= MAX_PER_WINDOW) return false;
    attemptsRef.current.push(now);
    lastAttemptAtRef.current = now;
    return true;
  };

  const onDecoded = (text: string) => {
    if (handledRef.current) return;
    if (!throttleAllows()) {
      setFeedback({ kind: "warn", message: "Slow down — too many scans. Pause a moment before trying again." });
      return;
    }

    const id = extractBuildingId(text);
    if (!id) {
      setFeedback({
        kind: "err",
        message: "This QR isn't a Campus Compass building code. Only official campus stickers are supported.",
      });
      return;
    }

    if (!validIdsRef.current.has(id)) {
      setFeedback({
        kind: "err",
        message: `Building "${id}" isn't in the campus directory. Ask an admin to add it or scan a different code.`,
      });
      return;
    }

    handledRef.current = true;
    setFeedback({ kind: "ok", message: `Opening ${id}…` });
    void stop().then(() => navigate({ to: "/buildings/$id", params: { id } }));
  };

  useEffect(() => {
    return () => { void stop(); };
  }, []);

  const feedbackClass =
    feedback?.kind === "ok"
      ? "border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400"
      : feedback?.kind === "warn"
      ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
      : "border-destructive/40 bg-destructive/10 text-destructive";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center gap-3">
        <QrCode className="h-7 w-7 text-primary" />
        <h1 className="font-display text-3xl font-bold md:text-4xl">Scan QR Code</h1>
      </div>
      <p className="mt-1 text-muted-foreground">
        Point your camera at a Campus Compass QR sticker on any building to open its details.
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div ref={boxRef} id="cc-qr-reader" className="min-h-[320px] w-full bg-black" />
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          {status !== "running" ? (
            <button onClick={start} className="btn-hero btn-hero-hover inline-flex items-center gap-2 px-5 py-2.5">
              <Camera className="h-4 w-4" /> Start camera
            </button>
          ) : (
            <button onClick={stop} className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary">
              <X className="h-4 w-4" /> Stop
            </button>
          )}
          <span className="text-xs text-muted-foreground">
            {buildings.length > 0 ? `${buildings.length} buildings recognised` : "Loading directory…"}
          </span>
        </div>
      </div>

      {feedback && (
        <div className={`mt-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${feedbackClass}`}>
          {feedback.kind === "ok" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
        Tip: On each building's details page, tap “Share via QR” to download a print-ready sticker.
      </div>
    </div>
  );
}
