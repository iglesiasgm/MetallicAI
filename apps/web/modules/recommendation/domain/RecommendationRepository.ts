import { Recommendation } from "./Recommendation";
import { Lang } from "../ui/LanguageDropdown";

export type PopularityMode = "popular" | "underground";

export interface RecommendationRepository {
  getRecommendations(input: {
    favoriteBands: string[];
    targetMood: string;
    language: Lang;
    popularityMode?: PopularityMode;
    excludeBandIds?: string[];
    subgenrePreferences?: string[]; 
  }): Promise<Recommendation[]>;
}