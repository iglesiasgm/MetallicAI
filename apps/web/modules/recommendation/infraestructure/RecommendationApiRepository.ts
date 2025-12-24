import { RecommendationRepository } from "../domain/RecommendationRepository";
import { Recommendation } from "../domain/Recommendation";
import { env } from "@/shared/config/env";

export class RecommendationApiRepository implements RecommendationRepository {
  async getRecommendations(input: {
    favoriteBands: string[];
    targetMood: string;
  }): Promise<Recommendation[]> {
    const response = await fetch(`${env.API_URL}/recommend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error("Error al obtener recomendaciones");
    }

    const data = await response.json();
    return data.recommendations;
  }
}
