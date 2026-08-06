// Browser Web Speech API wrapper for realtime transcription.
// Works in Chrome/Edge/Safari. Falls back to `supported = false` otherwise.

export interface VoiceSession {
  stop: () => void;
}

type Handlers = {
  onInterim: (text: string) => void;
  onFinal: (text: string) => void;
  onError?: (err: string) => void;
  onEnd?: () => void;
};

export function isVoiceSupported() {
  if (typeof window === "undefined") return false;
  return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

export function startVoiceSession(h: Handlers): VoiceSession | null {
  if (!isVoiceSupported()) return null;
  const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const rec = new SR();
  rec.continuous = false;
  rec.interimResults = true;
  rec.lang = "en-US";

  rec.onresult = (e: any) => {
    let interim = "";
    let finalText = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) finalText += r[0].transcript;
      else interim += r[0].transcript;
    }
    if (interim) h.onInterim(interim);
    if (finalText) h.onFinal(finalText.trim());
  };
  rec.onerror = (e: any) => h.onError?.(e.error || "voice_error");
  rec.onend = () => h.onEnd?.();
  try {
    rec.start();
  } catch (err: any) {
    h.onError?.(err?.message || "start_failed");
    return null;
  }
  return { stop: () => { try { rec.stop(); } catch {} } };
}
