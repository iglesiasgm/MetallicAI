import { Recommendation } from "./Recommendation";
import { Lang } from "../ui/LanguageDropdown";

export interface RecommendationRepository {
  getRecommendations(input: {
    favoriteBands: string[];
    targetMood: string;
    language: Lang;
    excludeBandIds?: string[]; // ✅ NUEVO
  }): Promise<Recommendation[]>;
}
