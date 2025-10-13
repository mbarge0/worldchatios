import { env } from "./env";

export const aiConfig = {
  openai: {
    apiKey: env.OPENAI_API_KEY,
    model: "gpt-4" as const,
    maxTokens: 4096,
    temperature: 0.7,
  },
  fallback: {
    enabled: true,
    model: "gpt-3.5-turbo" as const,
  },
} as const;
