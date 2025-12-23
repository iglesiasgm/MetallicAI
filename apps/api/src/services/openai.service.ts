/*
import OpenAI from "openai";
import { envs } from "../config/envs";

export class OpenAIService {
  private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: envs.openAiApiKey,
        });
    }

    async getEmbedding(text: string): Promise<number[]> {

        if(!text) return [];

    try {
        const response = await this.openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text,
            encoding_format: "float",
        });

        return response.data[0].embedding;
    } catch (error) {
        console.error("Error getting embedding from OpenAI:", error);
        throw error;
    }
}
} */