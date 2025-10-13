import OpenAI from 'openai';
import { aiConfig } from '../../config/ai';
import type { AIResponse, AIError } from '../../types/ai';

const openai = new OpenAI({
  apiKey: aiConfig.openai.apiKey,
});

export async function generateAIResponse(
  prompt: string,
  options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }
): Promise<AIResponse | AIError> {
  try {
    const response = await openai.chat.completions.create({
      model: options?.model || aiConfig.openai.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: options?.maxTokens || aiConfig.openai.maxTokens,
      temperature: options?.temperature || aiConfig.openai.temperature,
    });

    const choice = response.choices[0];
    if (!choice?.message?.content) {
      return { error: 'No response generated' };
    }

    return {
      content: choice.message.content,
      usage: response.usage,
      model: response.model,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error,
    };
  }
}
