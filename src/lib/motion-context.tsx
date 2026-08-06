import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";

type Mode = "system" | "on" | "off";
type Ctx = { userPref: Mode; reduced: boolean; setPref: (m: Mode) => void; toggle: () => void };
const MotionCtx = createContext<Ctx | null>(null);

export function MotionProvider({ children }: { children: ReactNode }) {
  const [userPref, setUserPref] = useState<Mode>("system");
  const [systemReduced, setSystemReduced] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem("cc_motion") as Mode | null) ?? "system";
    setUserPref(saved);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setSystemReduced(mq.matches);
    const listener = (e: MediaQueryListEvent) => setSystemReduced(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  const reduced = userPref === "on" ? true : userPref === "off" ? false : systemReduced;

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reduced);
    localStorage.setItem("cc_motion", userPref);
  }, [reduced, userPref]);

  const toggle = () => setUserPref(reduced ? "off" : "on");
  return (
    <MotionCtx.Provider value={{ userPref, reduced, setPref: setUserPref, toggle }}>
      <MotionConfig reducedMotion={reduced ? "always" : "never"}>{children}</MotionConfig>
    </MotionCtx.Provider>
  );
}

export function useReducedMotion() {
  const c = useContext(MotionCtx);
  if (!c) throw new Error("useReducedMotion within MotionProvider");
  return c;
}
