import OpenAI from 'openai';
import { AiProvider } from './base.provider';

export class OpenAIProvider implements AiProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey: apiKey,
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  }

  async generateChatResponse(prompt: string, context: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert Business Intelligence Assistant for AgriQon, an agricultural supply chain platform.
          Use the following context to answer the user's question accurately.
          If the context doesn't contain the answer, say you don't know but offer to help with general business advice.
          
          Context:
          ${context}`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
    });

    return response.choices[0].message.content || 'I could not generate a response.';
  }
}
