import { GoogleGenerativeAI } from '@google/generative-ai';
import { AiProvider } from './base.provider';

export class GeminiProvider implements AiProvider {
  private client: GoogleGenerativeAI;
  private model: any;
  private embedModel: any;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash for speed and cost-efficiency in RAG
    this.model = this.client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    this.embedModel = this.client.getGenerativeModel({ model: 'text-embedding-004' });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const result = await this.embedModel.embedContent(text);
    return result.embedding.values;
  }

  async generateChatResponse(prompt: string, context: string): Promise<string> {
    const systemInstruction = `You are an expert Business Intelligence Assistant for AgriQon, an agricultural supply chain platform.
    Use the following context to answer the user's question accurately.
    If the context doesn't contain the answer, say you don't know but offer to help with general business advice.
    
    Context:
    ${context}`;

    const result = await this.model.generateContent([
      { text: systemInstruction },
      { text: prompt }
    ]);
    return result.response.text();
  }
}
