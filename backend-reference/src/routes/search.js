import { Router } from "express";
import Building from "../models/Building.js";

const r = Router();

r.get("/", async (req, res) => {
  const q = (req.query.q || "").toString().trim();
  if (!q) return res.json([]);
  const rx = new RegExp(q, "i");
  const results = await Building.find({
    $or: [
      { name: rx }, { code: rx }, { department: rx },
      { description: rx }, { facilities: rx },
      { "rooms.number": rx }, { "rooms.type": rx },
    ],
  }).limit(50);
  res.json(results);
});

export default r;
