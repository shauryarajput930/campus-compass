import { useEffect, useState } from "react";
import { BUILDINGS_CHANGED_EVENT, getBuildings } from "@/lib/api";
import type { Building } from "@/lib/mock-data";

export function useBuildings(): Building[] {
  const [buildings, setBuildings] = useState<Building[]>([]);

  useEffect(() => {
    let active = true;
    const load = () => {
      getBuildings().then((next) => {
        if (active) setBuildings(next);
      }).catch(() => {
        if (active) setBuildings([]);
      });
    };

    const onChanged = () => load();
    const onFocus = () => load();

    load();
    window.addEventListener(BUILDINGS_CHANGED_EVENT, onChanged);
    window.addEventListener("storage", onChanged);
    window.addEventListener("focus", onFocus);
    const interval = window.setInterval(load, 10000);

    return () => {
      active = false;
      window.removeEventListener(BUILDINGS_CHANGED_EVENT, onChanged);
      window.removeEventListener("storage", onChanged);
      window.removeEventListener("focus", onFocus);
      window.clearInterval(interval);
    };
  }, []);

  return buildings;
}
