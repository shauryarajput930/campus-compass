import { createServerFn } from "@tanstack/react-start";
import { generateText, NoObjectGeneratedError, Output } from "ai";
import { z } from "zod";

const SuggestionSchema = z.object({
  suggestions: z.array(z.string()).max(6),
});

const RecommendationSchema = z.object({
  recommendations: z
    .array(
      z.object({
        id: z.string(),
        reason: z.string(),
      }),
    )
    .max(4),
});

interface BuildingLite {
  id: string;
  name: string;
  code: string;
  department: string;
  category: string;
  facilities: string[];
}

async function makeModel() {
  const key = process.env.AI_API_KEY;
  if (!key) throw new Error("Missing AI_API_KEY");
  const { createAiGateway } = await import("./ai-gateway.server");
  return createAiGateway(key)("google/gemini-2.5-flash");
}

export const getAISuggestions = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        query: z.string().max(200),
        buildings: z
          .array(
            z.object({
              id: z.string(),
              name: z.string(),
              code: z.string(),
              department: z.string(),
              category: z.string(),
              facilities: z.array(z.string()),
            }),
          )
          .max(60),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const model = await makeModel();
    const catalog = data.buildings
      .map((b) => `${b.code} — ${b.name} (${b.department}) [${b.facilities.slice(0, 4).join(", ")}]`)
      .join("\n");
    try {
      const { output } = await generateText({
        model,
        output: Output.object({ schema: SuggestionSchema }),
        prompt: `You help students navigate the PSIT campus. Given a partial search query, suggest up to 6 short, specific search phrases (each ≤ 40 chars) users likely intend. Prefer real buildings, rooms, labs, or facilities from the catalog. No numbering, no explanation.\n\nCatalog:\n${catalog}\n\nPartial query: "${data.query}"`,
      });
      return { suggestions: output.suggestions.slice(0, 6) };
    } catch (e) {
      if (NoObjectGeneratedError.isInstance(e)) return { suggestions: [] };
      throw e;
    }
  });

export const getAIRecommendations = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        recentIds: z.array(z.string()).max(20),
        buildings: z
          .array(
            z.object({
              id: z.string(),
              name: z.string(),
              code: z.string(),
              department: z.string(),
              category: z.string(),
              facilities: z.array(z.string()),
            }),
          )
          .max(60),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const model = await makeModel();
    const catalog = data.buildings
      .map((b) => `- id:${b.id} | ${b.code} ${b.name} (${b.department}, ${b.category})`)
      .join("\n");
    const recent = data.recentIds.join(", ") || "(none)";
    try {
      const { output } = await generateText({
        model,
        output: Output.object({ schema: RecommendationSchema }),
        prompt: `Recommend up to 4 campus destinations for a student based on their recently visited buildings. Only pick IDs from the catalog. Give a short (≤ 60 char) reason per pick. Return only ids that exist. Prefer variety across categories.\n\nCatalog:\n${catalog}\n\nRecently visited ids: ${recent}`,
      });
      const validIds = new Set(data.buildings.map((b) => b.id));
      return {
        recommendations: output.recommendations.filter((r) => validIds.has(r.id)).slice(0, 4),
      };
    } catch (e) {
      if (NoObjectGeneratedError.isInstance(e)) return { recommendations: [] };
      throw e;
    }
  });
