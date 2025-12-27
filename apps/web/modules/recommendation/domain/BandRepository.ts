import { Band } from "./Catalog";

export interface BandRepository {
  getBands(input: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<Band[]>;
}
