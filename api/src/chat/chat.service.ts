import { Injectable, Logger } from '@nestjs/common';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  message: string;
  model: string;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  async chat(messages: ChatMessage[]): Promise<ChatResponse> {
    const baseUrl = process.env.OPENAI_BASE_URL;
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL ?? 'gpt-4o';

    if (!baseUrl || !apiKey) {
      this.logger.warn('OPENAI_BASE_URL or OPENAI_API_KEY not configured');
      return {
        message: 'Chat service not configured. Set OPENAI_BASE_URL and OPENAI_API_KEY.',
        model: 'none',
      };
    }

    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages }),
    });

    if (!res.ok) {
      throw new Error(`LLM API error: ${res.status} ${res.statusText}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (await res.json()) as any;
    return {
      message: data.choices?.[0]?.message?.content ?? '',
      model,
    };
  }
}
