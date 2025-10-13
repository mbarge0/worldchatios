export interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

export interface AIError {
  error: string;
  code?: string;
  details?: unknown;
}

export type AIModel = 'gpt-4' | 'gpt-3.5-turbo' | 'gpt-4-turbo';
