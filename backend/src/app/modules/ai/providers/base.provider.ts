export interface AiProvider {
  generateEmbedding(text: string): Promise<number[]>;
  generateChatResponse(prompt: string, context: string): Promise<string>;
}
