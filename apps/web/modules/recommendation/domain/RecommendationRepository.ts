import { Lang } from "../ui/LanguageDropdown";
import { Recommendation } from "./Recommendation";

export interface RecommendationRepository {
  getRecommendations(input: {
    favoriteBands: string[];
    targetMood: string;
    language: "es" | "en" | "de" | "it" | "pt";
  }): Promise<Recommendation[]>;
}
