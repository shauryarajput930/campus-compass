import { St as object, pt as array, wt as string } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { n as createServerFn } from "./server-BFRsKcKu.mjs";
import { t as createServerRpc } from "./createServerRpc-DbuEcjY5.mjs";
import { n as generateText, r as output_exports, t as NoObjectGeneratedError } from "../_libs/ai.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai.functions-BZuBYuMN.js
var SuggestionSchema = object({ suggestions: array(string()).max(6) });
var RecommendationSchema = object({ recommendations: array(object({
	id: string(),
	reason: string()
})).max(4) });
async function makeModel() {
	const key = process.env.AI_API_KEY;
	if (!key) throw new Error("Missing AI_API_KEY");
	const { createAiGateway } = await import("./ai-gateway.server-Dy16k_Fw.mjs");
	return createAiGateway(key)("google/gemini-2.5-flash");
}
var getAISuggestions_createServerFn_handler = createServerRpc({
	id: "0b851254e11eb17acd8365aa10619d33fc2060cab3764176b2062ba7e81c335a",
	name: "getAISuggestions",
	filename: "src/lib/ai.functions.ts"
}, (opts) => getAISuggestions.__executeServer(opts));
var getAISuggestions = createServerFn({ method: "POST" }).inputValidator((input) => object({
	query: string().max(200),
	buildings: array(object({
		id: string(),
		name: string(),
		code: string(),
		department: string(),
		category: string(),
		facilities: array(string())
	})).max(60)
}).parse(input)).handler(getAISuggestions_createServerFn_handler, async ({ data }) => {
	const model = await makeModel();
	const catalog = data.buildings.map((b) => `${b.code} — ${b.name} (${b.department}) [${b.facilities.slice(0, 4).join(", ")}]`).join("\n");
	try {
		const { output } = await generateText({
			model,
			output: output_exports.object({ schema: SuggestionSchema }),
			prompt: `You help students navigate the PSIT campus. Given a partial search query, suggest up to 6 short, specific search phrases (each ≤ 40 chars) users likely intend. Prefer real buildings, rooms, labs, or facilities from the catalog. No numbering, no explanation.\n\nCatalog:\n${catalog}\n\nPartial query: "${data.query}"`
		});
		return { suggestions: output.suggestions.slice(0, 6) };
	} catch (e) {
		if (NoObjectGeneratedError.isInstance(e)) return { suggestions: [] };
		throw e;
	}
});
var getAIRecommendations_createServerFn_handler = createServerRpc({
	id: "3ad2ea78df4e70dbd3084576a044dfe2cf31656dfc100962c9bd826f796fa432",
	name: "getAIRecommendations",
	filename: "src/lib/ai.functions.ts"
}, (opts) => getAIRecommendations.__executeServer(opts));
var getAIRecommendations = createServerFn({ method: "POST" }).inputValidator((input) => object({
	recentIds: array(string()).max(20),
	buildings: array(object({
		id: string(),
		name: string(),
		code: string(),
		department: string(),
		category: string(),
		facilities: array(string())
	})).max(60)
}).parse(input)).handler(getAIRecommendations_createServerFn_handler, async ({ data }) => {
	const model = await makeModel();
	const catalog = data.buildings.map((b) => `- id:${b.id} | ${b.code} ${b.name} (${b.department}, ${b.category})`).join("\n");
	const recent = data.recentIds.join(", ") || "(none)";
	try {
		const { output } = await generateText({
			model,
			output: output_exports.object({ schema: RecommendationSchema }),
			prompt: `Recommend up to 4 campus destinations for a student based on their recently visited buildings. Only pick IDs from the catalog. Give a short (≤ 60 char) reason per pick. Return only ids that exist. Prefer variety across categories.\n\nCatalog:\n${catalog}\n\nRecently visited ids: ${recent}`
		});
		const validIds = new Set(data.buildings.map((b) => b.id));
		return { recommendations: output.recommendations.filter((r) => validIds.has(r.id)).slice(0, 4) };
	} catch (e) {
		if (NoObjectGeneratedError.isInstance(e)) return { recommendations: [] };
		throw e;
	}
});
//#endregion
export { getAIRecommendations_createServerFn_handler, getAISuggestions_createServerFn_handler };
