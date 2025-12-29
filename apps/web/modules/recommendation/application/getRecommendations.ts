import { RecommendationRepository } from "../domain/RecommendationRepository";
import { Lang } from "../ui/LanguageDropdown";

export async function getRecommendations(
  repository: RecommendationRepository,
  input: {
    favoriteBands: string[];
    targetMood: string;
    language: Lang;
    excludeBandIds?: string[]; // ✅ NUEVO
  }
) {
  return repository.getRecommendations(input);
}
