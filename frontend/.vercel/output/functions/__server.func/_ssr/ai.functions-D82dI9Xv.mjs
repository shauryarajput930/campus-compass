import { St as object, pt as array, wt as string } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { n as createServerFn } from "./server-DtYuMhH8.mjs";
import { t as createSsrRpc } from "./createSsrRpc-CqEh_Aij.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai.functions-D82dI9Xv.js
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
}).parse(input)).handler(createSsrRpc("0b851254e11eb17acd8365aa10619d33fc2060cab3764176b2062ba7e81c335a"));
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
}).parse(input)).handler(createSsrRpc("3ad2ea78df4e70dbd3084576a044dfe2cf31656dfc100962c9bd826f796fa432"));
//#endregion
export { getAISuggestions as n, getAIRecommendations as t };
