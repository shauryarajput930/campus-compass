import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useBuildings } from "@/hooks/use-buildings";
import { BuildingCard } from "@/components/building-card";
import { Heart } from "lucide-react";
import { fetchFavorites, getFavorites, FAVORITES_CHANGED_EVENT } from "@/lib/favorites";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/favorites")({
  head: () => ({ meta: [{ title: "Favourites — Campus Compass" }] }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { user } = useAuth();
  const b = useBuildings();
  const [ids, setIds] = useState<string[]>(() => getFavorites());

  useEffect(() => {
    let active = true;

    const update = () => {
      if (active) setIds(getFavorites());
    };

    update();
    fetchFavorites().then((fresh) => {
      if (active) setIds(fresh);
    });

    window.addEventListener(FAVORITES_CHANGED_EVENT, update);
    window.addEventListener("storage", update);

    return () => {
      active = false;
      window.removeEventListener(FAVORITES_CHANGED_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, [user]);

  const favs = b.filter((x) => ids.includes(x.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold md:text-4xl">Your favourite places</h1>
      <p className="text-muted-foreground">Quick access to the spots you visit most.</p>

      {favs.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-border bg-card p-10 text-center">
          <Heart className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">No favourites yet. Tap the heart on any building to save it here.</p>
          <Link to="/map" className="mt-4 inline-block btn-hero btn-hero-hover px-4 py-2 text-sm">
            Open Map
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {favs.map((x, i) => (
            <BuildingCard key={x.id} b={x} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
