import { Link, useNavigate } from "@tanstack/react-router";
import type { Building } from "@/lib/mock-data";
import { Heart, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { toggleFavorite } from "@/lib/favorites";
import { motion } from "framer-motion";

export function BuildingCard({ b, index = 0 }: { b: Building; index?: number }) {
  const [fav, setFav] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const list: string[] = JSON.parse(localStorage.getItem("cc_favorites") || "[]");
    setFav(list.includes(b.id));
  }, [b.id]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
      role="link"
      tabIndex={0}
      onClick={() => navigate({ to: "/buildings/$id", params: { id: b.id } })}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate({ to: "/buildings/$id", params: { id: b.id } });
        }
      }}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-glow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
      <Link to="/buildings/$id" params={{ id: b.id }} className="block" onClick={(event) => event.stopPropagation()}>
        <div className="relative h-44 overflow-hidden">
          <img src={b.image} alt={b.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-black/50 px-2 py-0.5 text-[10px] uppercase tracking-widest text-white">
            {b.icon ? <img src={b.icon} alt={`${b.name} code icon`} className="h-5 w-5 rounded object-cover" /> : b.code}
          </span>
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-xs text-muted-foreground">{b.department}</div>
            <h3 className="font-display text-base font-semibold">{b.name}</h3>
          </div>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); const n = toggleFavorite(b.id); setFav(n.includes(b.id)); }}
            className="grid h-8 w-8 place-items-center rounded-lg border border-border" aria-label="Favourite">
            <Heart className={"h-4 w-4 " + (fav ? "fill-red-500 text-red-500" : "")} />
          </button>
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{b.description}</p>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {b.openingTime}</span>
        </div>
      </div>
    </motion.div>
  );
}
