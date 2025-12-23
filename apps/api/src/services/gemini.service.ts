import { GoogleGenerativeAI } from "@google/generative-ai";
import { envs } from "../config/envs";
import { env } from "process";

export class GeminiService {
    private genAI: GoogleGenerativeAI;
    private embeddingModel: any;
    private chatModel: any;

    constructor() {
        this.genAI = new GoogleGenerativeAI(envs.geminiApiKey);
        this.embeddingModel = this.genAI.getGenerativeModel({ model: "text-embedding-004" });
        this.chatModel = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    }

    async getEmbedding(text: string): Promise<number[]> {

        if (!text) return [];
        
        try {
            const result = await this.embeddingModel.embedContent(text);
            const embedding = result.embedding;
            return embedding.values;
        } catch (error) {
            console.error("Error generating embedding:", error);
            throw error;
        }
    }

    async generateExplanation(prompt: string): Promise<string> {
        try {
            const result = await this.chatModel.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("Error generating explanation:", error);
            throw error;
        }
}
}