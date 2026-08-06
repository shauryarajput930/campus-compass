import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getBuilding } from "@/lib/api";
import type { Building } from "@/lib/mock-data";
import { CampusMap } from "@/components/campus-map";
import { BuildingQRCode } from "@/components/qr-code";
import { pushRecent, toggleFavorite } from "@/lib/favorites";
import { Heart, MapPin, Clock, Navigation, Building2, LocateFixed, Loader2 } from "lucide-react";

export const Route = createFileRoute("/buildings/$id")({
  head: () => ({ meta: [{ title: "Building details — Campus Compass" }] }),
  component: BuildingDetails,
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Building not found</h1>
      <Link to="/map" className="mt-4 inline-block text-primary hover:underline">Back to map</Link>
    </div>
  ),
});

function BuildingDetails() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [b, setB] = useState<Building | null>(null);
  const [fav, setFav] = useState(false);
  const [notFoundFlag, setNF] = useState(false);
  const [locating, setLocating] = useState(false);
  const [geoErr, setGeoErr] = useState<string | null>(null);

  function navigateFromHere() {
    if (!b) return;
    setGeoErr(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoErr("Geolocation not supported.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        navigate({
          to: "/navigate",
          search: { to: b.id, fromLat: pos.coords.latitude, fromLng: pos.coords.longitude },
        });
      },
      (e) => { setLocating(false); setGeoErr(e.message || "Could not get your location."); },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  useEffect(() => {
    getBuilding(id).then((x) => {
      if (!x) { setNF(true); return; }
      setB(x);
      pushRecent(x.id);
      const list: string[] = JSON.parse(localStorage.getItem("cc_favorites") || "[]");
      setFav(list.includes(x.id));
    });
  }, [id]);

  if (notFoundFlag) throw notFound();
  if (!b) return <div className="mx-auto max-w-6xl px-4 py-16 text-muted-foreground">Loading…</div>;

  const roomsByFloor: Record<number, typeof b.rooms> = {};
  b.rooms.forEach((r) => { (roomsByFloor[r.floor] ??= []).push(r); });

  return (
    <div>
      <section className="relative h-[42vh] overflow-hidden">
        <img src={b.image} alt={b.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0 mx-auto max-w-7xl px-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">{b.code} · {b.department}</div>
          <h1 className="font-display text-4xl font-black md:text-5xl">{b.name}</h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { const n = toggleFavorite(b.id); setFav(n.includes(b.id)); }}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
              <Heart className={"h-4 w-4 " + (fav ? "fill-red-500 text-red-500" : "")} /> {fav ? "Saved" : "Save"}
            </button>
            <Link to="/navigate" search={{ to: b.id }} className="btn-hero btn-hero-hover inline-flex items-center gap-2 px-4 py-2 text-sm">
              <Navigation className="h-4 w-4" /> Navigate here
            </Link>
            <button
              onClick={navigateFromHere}
              disabled={locating}
              aria-label="Navigate from my current location"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-secondary disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {locating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LocateFixed className="h-4 w-4" aria-hidden="true" />}
              {locating ? "Locating…" : "From my location"}
            </button>
          </div>
          {geoErr && <p role="alert" className="mt-2 text-xs text-destructive">{geoErr}</p>}

          <p className="mt-6 text-muted-foreground">{b.description}</p>

          {b.gallery.length > 0 && (
            <section className="mt-8">
              <h2 className="font-display text-xl font-semibold">Gallery</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                {[b.image, ...b.gallery].map((g, i) => (
                  <img key={i} src={g} alt={b.name + " " + i} className="h-40 w-full rounded-xl object-cover" />
                ))}
              </div>
            </section>
          )}

          <section className="mt-8">
            <h2 className="font-display text-xl font-semibold">Facilities</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {b.facilities.map((f) => <span key={f} className="rounded-full border border-border bg-card px-3 py-1 text-xs">{f}</span>)}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="font-display text-xl font-semibold">Floors & Rooms</h2>
            <div className="mt-3 grid gap-3">
              {Object.entries(roomsByFloor).map(([floor, rooms]) => (
                <div key={floor} className="rounded-2xl border border-border bg-card p-4">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Floor {floor}</div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                    {rooms.map((r) => (
                      <div key={r.number} className="flex items-center gap-2 rounded-lg bg-background p-2 text-sm">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-xs">{r.number}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{r.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">Info</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /> {b.openingTime}</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {b.lat.toFixed(4)}, {b.lng.toFixed(4)}</li>
              <li className="flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" /> {b.floors} floors</li>
            </ul>
          </div>
          <BuildingQRCode id={b.id} name={b.name} />
          <CampusMap buildings={[b]} centerId={b.id} height="260px" showPopups={false} />
        </aside>
      </section>
    </div>
  );
}
