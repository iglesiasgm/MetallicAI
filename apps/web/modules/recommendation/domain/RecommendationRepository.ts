import { Recommendation } from "./Recommendation";

export interface RecommendationRepository {
  getRecommendations(input: {
    favoriteBands: string[];
    targetMood: string;
  }): Promise<Recommendation[]>;
}
