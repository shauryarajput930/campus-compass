import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { getBuildings } from "@/lib/api";
import type { Building } from "@/lib/mock-data";
import { BuildingCard } from "@/components/building-card";
import { getAISuggestions } from "@/lib/ai.functions";
import { isVoiceSupported, startVoiceSession, type VoiceSession } from "@/lib/voice-search";
import { Search, Sparkles, Mic, MicOff, QrCode, Loader2 } from "lucide-react";

const searchSchema = z.object({ q: z.string().optional().catch("") });

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Search — Campus Compass" }] }),
  component: SearchPage,
});

function SearchPage() {
  const { q: initial } = Route.useSearch();
  const [all, setAll] = useState<Building[]>([]);
  const [q, setQ] = useState(initial ?? "");
  const [interim, setInterim] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceErr, setVoiceErr] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const voiceRef = useRef<VoiceSession | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchSuggestions = useServerFn(getAISuggestions);

  useEffect(() => { getBuildings().then(setAll); }, []);

  const results = useMemo(() => {
    const s = q.toLowerCase().trim();
    if (!s) return [];
    return all.filter((b) =>
      [b.name, b.code, b.department, b.description, ...b.facilities, ...b.rooms.map((r) => `${r.number} ${r.type}`)]
        .join(" ")
        .toLowerCase()
        .includes(s),
    );
  }, [q, all]);

  // Debounced AI suggestions
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q || q.trim().length < 2 || all.length === 0) {
      setAiSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setAiLoading(true);
      try {
        const r = await fetchSuggestions({
          data: {
            query: q.trim(),
            buildings: all.map((b) => ({
              id: b.id, name: b.name, code: b.code,
              department: b.department, category: b.category,
              facilities: b.facilities,
            })),
          },
        });
        setAiSuggestions(r.suggestions);
      } catch {
        setAiSuggestions([]);
      } finally {
        setAiLoading(false);
      }
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q, all, fetchSuggestions]);

  const toggleVoice = () => {
    setVoiceErr(null);
    if (listening) {
      voiceRef.current?.stop();
      voiceRef.current = null;
      setListening(false);
      return;
    }
    if (!isVoiceSupported()) {
      setVoiceErr("Voice search isn't supported in this browser. Try Chrome or Safari.");
      return;
    }
    const session = startVoiceSession({
      onInterim: (t) => setInterim(t),
      onFinal: (t) => {
        setQ(t);
        setInterim("");
      },
      onError: (e) => setVoiceErr(e === "not-allowed" ? "Microphone permission denied." : `Voice error: ${e}`),
      onEnd: () => { setListening(false); setInterim(""); voiceRef.current = null; },
    });
    if (session) { voiceRef.current = session; setListening(true); }
  };

  useEffect(() => () => voiceRef.current?.stop(), []);

  const suggestions = ["Library", "AI Lab", "Canteen", "Auditorium", "Hostel", "Sports"];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Search the campus</h1>
          <p className="text-muted-foreground">Buildings, rooms, labs, faculty offices, facilities.</p>
        </div>
        <Link to="/scan" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-secondary">
          <QrCode className="h-4 w-4" /> Scan QR
        </Link>
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-2xl glass-strong p-2 shadow-soft">
        <Search className="ml-2 h-5 w-5 text-muted-foreground" />
        <input
          value={listening && interim ? interim : q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={listening ? "Listening…" : "e.g. AI Lab, A-201, Canteen, Library…"}
          className="w-full bg-transparent px-2 py-3 focus:outline-none"
        />
        <button
          onClick={toggleVoice}
          aria-label={listening ? "Stop voice search" : "Start voice search"}
          className={
            "mr-1 grid h-10 w-10 place-items-center rounded-xl border transition " +
            (listening
              ? "border-red-500 bg-red-500/10 text-red-500 animate-pulse"
              : "border-border bg-card hover:bg-secondary")
          }
        >
          {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>
      </div>

      {voiceErr && (
        <div className="mt-2 text-xs text-destructive">{voiceErr}</div>
      )}

      {q.trim().length >= 2 && (
        <div className="mt-3 rounded-xl border border-border bg-card/60 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI suggestions
            {aiLoading && <Loader2 className="h-3 w-3 animate-spin" />}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {aiSuggestions.length === 0 && !aiLoading && (
              <span className="text-xs text-muted-foreground">Keep typing for smart suggestions…</span>
            )}
            {aiSuggestions.map((s) => (
              <button
                key={s}
                onClick={() => setQ(s)}
                className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary hover:bg-primary/20"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {!q && (
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Sparkles className="h-3 w-3" /> Try:</span>
          {suggestions.map((s) => (
            <button key={s} onClick={() => setQ(s)} className="rounded-full border border-border bg-card px-3 py-1 text-xs hover:bg-secondary">{s}</button>
          ))}
        </div>
      )}

      <div className="mt-8">
        {q && <div className="mb-4 text-sm text-muted-foreground">{results.length} result{results.length !== 1 ? "s" : ""} for “{q}”</div>}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((b, i) => <BuildingCard key={b.id} b={b} index={i} />)}
        </div>
        {q && results.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">Nothing matched. Try a different keyword.</div>
        )}
      </div>
    </div>
  );
}
