import { Recommendation } from "./Recommendation";
import { Lang } from "../ui/LanguageDropdown";

//(Quiere bandas ${mode === 'underground' ? 'desconocidas/culto' : 'famosas/clásicos'}).

export type PopularityMode = "popular" | "underground";

export interface RecommendationRepository {
  getRecommendations(input: {
    favoriteBands: string[];
    targetMood: string;
    language: Lang;
    popularityMode?: PopularityMode; // ✅ NUEVO
    excludeBandIds?: string[]; // ✅ NUEVO
  }): Promise<Recommendation[]>;
}
