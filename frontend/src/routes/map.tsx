import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getBuildings } from "@/lib/api";
import type { Building } from "@/lib/mock-data";
import { CampusMap } from "@/components/campus-map";

export const Route = createFileRoute("/map")({
  head: () => ({ meta: [
    { title: "Campus Map — Campus Compass" },
    { name: "description", content: "Interactive campus map with markers, real photos and building details." },
  ] }),
  component: MapPage,
});

function MapPage() {
  const [b, setB] = useState<Building[]>([]);
  const [cat, setCat] = useState<string>("all");
  useEffect(() => { getBuildings().then(setB); }, []);
  const filtered = cat === "all" ? b : b.filter((x) => x.category === cat);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Campus Map</h1>
          <p className="text-muted-foreground">Tap any marker to see details, photos and directions.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "All" },
            { id: "academic", label: "Academic" },
            { id: "hostel", label: "Hostel" },
            { id: "sports", label: "Sports" },
            { id: "food", label: "Food" },
            { id: "facility", label: "Facilities" },
            { id: "admin", label: "Admin" },
          ].map((c) => (
            <button key={c.id} onClick={() => setCat(c.id)}
              className={"rounded-full border px-3 py-1.5 text-xs " + (cat === c.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card")}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <CampusMap buildings={filtered} height="75vh" />
    </div>
  );
}
