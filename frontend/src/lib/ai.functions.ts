export interface BuildingLite {
  id: string;
  name: string;
  code: string;
  department: string;
  category: string;
  facilities: string[];
}

export async function getAISuggestions({
  data,
}: {
  data: { query: string; buildings: BuildingLite[] };
}): Promise<{ suggestions: string[] }> {
  const query = data.query.toLowerCase().trim();
  if (!query) return { suggestions: [] };

  const matches = new Set<string>();

  for (const b of data.buildings) {
    if (b.name.toLowerCase().includes(query)) {
      matches.add(b.name);
    }
    if (b.code.toLowerCase().includes(query)) {
      matches.add(`${b.code} - ${b.name}`);
    }
    if (b.department.toLowerCase().includes(query)) {
      matches.add(`${b.name} (${b.department})`);
    }
    for (const f of b.facilities) {
      if (f.toLowerCase().includes(query)) {
        matches.add(`${f} (${b.name})`);
      }
    }
  }

  // If few matches, add close category/name matches
  if (matches.size < 4) {
    for (const b of data.buildings) {
      if (b.category.toLowerCase().includes(query)) {
        matches.add(`${b.name} - ${b.category}`);
      }
    }
  }

  return { suggestions: Array.from(matches).slice(0, 6) };
}

export async function getAIRecommendations({
  data,
}: {
  data: { recentIds: string[]; buildings: BuildingLite[] };
}): Promise<{ recommendations: { id: string; reason: string }[] }> {
  const recentSet = new Set(data.recentIds);
  const candidates = data.buildings.filter((b) => !recentSet.has(b.id));
  const pool = candidates.length > 0 ? candidates : data.buildings;

  const categoryReasons: Record<string, string> = {
    library: "Central quiet study space & resources",
    canteen: "Food, snacks, and dining area",
    food: "Campus refreshments & cafeteria",
    facility: "Essential campus student services",
    medical: "Health center & first-aid support",
    academic: "Classrooms, faculty cabins & lecture halls",
    lab: "Specialized lab equipment & practice spaces",
    admin: "Administrative queries & official support",
    sports: "Recreation, grounds & sports complex",
  };

  const selected: { id: string; reason: string }[] = [];
  const seenCategories = new Set<string>();

  // Prioritize distinct categories
  for (const b of pool) {
    const cat = b.category.toLowerCase();
    if (!seenCategories.has(cat)) {
      seenCategories.add(cat);
      selected.push({
        id: b.id,
        reason: categoryReasons[cat] || `Explore facilities at ${b.name}`,
      });
      if (selected.length >= 4) break;
    }
  }

  // Fill up if fewer than 4
  if (selected.length < 4) {
    for (const b of pool) {
      if (!selected.some((s) => s.id === b.id)) {
        const cat = b.category.toLowerCase();
        selected.push({
          id: b.id,
          reason: categoryReasons[cat] || `Recommended campus destination: ${b.name}`,
        });
        if (selected.length >= 4) break;
      }
    }
  }

  return { recommendations: selected.slice(0, 4) };
}

export async function getAIRouteSuggestions({
  data,
}: {
  data: {
    startName: string;
    destinationId: string;
    buildings: BuildingLite[];
  };
}): Promise<{ suggestions: { destinationId: string; reason: string }[] }> {
  const available = data.buildings.filter(
    (b) => b.id !== data.destinationId && !b.name.includes(data.startName)
  );

  const priorityCategories = ["food", "canteen", "library", "facility", "medical"];
  const sorted = [...available].sort((a, b) => {
    const aPriority = priorityCategories.indexOf(a.category.toLowerCase());
    const bPriority = priorityCategories.indexOf(b.category.toLowerCase());
    const aScore = aPriority !== -1 ? aPriority : 99;
    const bScore = bPriority !== -1 ? bPriority : 99;
    return aScore - bScore;
  });

  const suggestions = sorted.slice(0, 4).map((b) => {
    let reason = "Useful stop along your campus route";
    const cat = b.category.toLowerCase();
    if (cat === "food" || cat === "canteen") reason = "Grab refreshments or quick meal";
    else if (cat === "library") reason = "Study spot & digital library access";
    else if (cat === "facility") reason = "Campus student amenity & resting area";
    else if (cat === "medical") reason = "Health clinic & first aid center";

    return {
      destinationId: b.id,
      reason,
    };
  });

  return { suggestions };
}
