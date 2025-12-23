import { Band, UserInput, RecommendationResult } from '../domain/types';
import { cosineSimilarity } from '../utils/math';
import { GeminiService } from "./gemini.service";

export class RecommendationService {
    constructor(
        private aiService: GeminiService,
        private catalog: Band[],
    ) {}

    async getRecommendations(input: UserInput): Promise<RecommendationResult[]> {
        console.log('Generating embedding for user input');

        const userProfileText = `Favorite Bands: ${input.favoriteBands.join(', ')}. Target Mood: ${input.targetMood}.`;
        const userVector = await this.aiService.getEmbedding(userProfileText);
        const scoredBands = this.catalog.map(band => {
            if (!band.embedding) return {band, score: 0};
            const similarity = cosineSimilarity(userVector, band.embedding);
            return {band, score: similarity};
        });

        const topPicks = scoredBands
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);

            const resultsWithExplanation = await Promise.all(topPicks.map(async pick => {
                const prompt = `Act as a Metal music expert. Explain why the band "${pick.band.name}" is a good recommendation for a user who likes: ${input.favoriteBands.join(', ')} and is looking for a mood described as: "${input.targetMood}". Provide a concise explanation.`;

                const explanation = await this.aiService.generateExplanation(prompt);

                return {
                    band: pick.band,
                    score: pick.score,
                    explanation,
                };
            }) );
        return resultsWithExplanation;
    }   
}