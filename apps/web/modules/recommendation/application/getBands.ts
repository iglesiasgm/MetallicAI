import { BandRepository } from "../domain/BandRepository";

export async function getBands(
  repo: BandRepository,
  input: { page?: number; limit?: number; search?: string }
) {
  return repo.getBands(input);
}
