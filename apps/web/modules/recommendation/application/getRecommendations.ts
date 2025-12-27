import { RecommendationRepository } from "../domain/RecommendationRepository";
import { Lang } from "../ui/LanguageDropdown";

export async function getRecommendations(
  repository: RecommendationRepository,
  input: {
    favoriteBands: string[];
    targetMood: string;
    language: Lang;
  }
) {
  if (input.favoriteBands.length === 0) {
    throw new Error("Debe ingresar al menos una banda");
  }

  return repository.getRecommendations(input);
}
