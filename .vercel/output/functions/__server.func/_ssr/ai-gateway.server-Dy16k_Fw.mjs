import { t as createOpenAICompatible } from "../_libs/ai-sdk__openai-compatible.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai-gateway.server-Dy16k_Fw.js
function createAiGateway(apiKey) {
	const key = process.env.AI_API_KEY || apiKey;
	const baseURL = process.env.AI_GATEWAY_URL || "https://api.openai.com/v1";
	return createOpenAICompatible({
		name: "ai-gateway",
		baseURL,
		supportsStructuredOutputs: false,
		headers: { Authorization: `Bearer ${key}` }
	});
}
//#endregion
export { createAiGateway };
