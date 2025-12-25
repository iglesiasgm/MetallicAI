import { Band, UserInput, RecommendationResult } from '../domain/types';
import { GeminiService } from './gemini.service';
import { cosineSimilarity } from '../utils/math';

export class RecommendationService {
  
  constructor(
    private aiService: GeminiService,
    private catalog: Band[] 
  ) {}

  async getRecommendations(input: UserInput): Promise<RecommendationResult[]> {

    const userProfileText = `
      Current mood/request: ${input.targetMood}.
      Context: Heavy Metal music recommendation.
    `;
    
    const userVector = await this.aiService.getEmbedding(userProfileText);
    
    const normalizedFavorites = input.favoriteBands.map(b => b.toLowerCase().trim());

    const scoredBands = this.catalog.map(band => {
      if (!band.embedding) return { band, score: 0 };
      const similarity = cosineSimilarity(userVector, band.embedding);
      return { band, score: similarity };
    });

    const filteredBands = scoredBands.filter(item => {
      const bandName = item.band.name.toLowerCase().trim();
      const isFavorite = normalizedFavorites.includes(bandName);
      return !isFavorite; 
    });

    const topPicks = filteredBands
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    if (topPicks.length === 0) {
      return [];
    }

    const resultsWithExplanation = await Promise.all(topPicks.map(async (item) => {
      
      const prompt = `
        Eres un experto en música Metal que habla ESPAÑOL.
        Tu misión es convencer al usuario de escuchar la banda: "${item.band.name}".
        
        Datos del usuario:
        - Busca: "${input.targetMood}"
        - Le gustan: "${input.favoriteBands.join(', ')}"
        
        Datos de la banda recomendada:
        - Géneros: ${item.band.subgenres.join(', ')}
        - Descripción: "${item.band.description}"
        
        INSTRUCCIONES DE RESPUESTA:
        1. Responde ÚNICAMENTE en ESPAÑOL.
        2. Sé directo, usa un tono metalero y casual ("tutear").
        3. NO menciones el nombre de la banda en la explicación (ya aparece en el título).
        4. LONGITUD MÁXIMA: 15 palabras. (Sé extremadamente conciso).
      `;

      const explanation = await this.aiService.generateExplanation(prompt);

      const { embedding, ...bandData } = item.band;

      return {
        band: bandData,
        score: item.score,
        explanation: explanation.trim()
      };
    }));

    return resultsWithExplanation;
  }
}