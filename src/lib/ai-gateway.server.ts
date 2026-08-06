import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createAiGateway(apiKey: string) {
  const key = process.env.AI_API_KEY || apiKey;
  const baseURL = process.env.AI_GATEWAY_URL || "https://api.openai.com/v1";

  return createOpenAICompatible({
    name: "ai-gateway",
    baseURL,
    supportsStructuredOutputs: false,
    headers: {
      Authorization: `Bearer ${key}`,
    },
  });
}
