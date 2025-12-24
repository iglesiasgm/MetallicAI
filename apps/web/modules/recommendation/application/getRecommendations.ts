import { RecommendationRepository } from "../domain/RecommendationRepository";

export async function getRecommendations(
  repository: RecommendationRepository,
  input: {
    favoriteBands: string[];
    targetMood: string;
  }
) {
  if (input.favoriteBands.length === 0) {
    throw new Error("Debe ingresar al menos una banda");
  }

  if (!input.targetMood.trim()) {
    throw new Error("Debe ingresar un mood");
  }

  return repository.getRecommendations(input);
}
