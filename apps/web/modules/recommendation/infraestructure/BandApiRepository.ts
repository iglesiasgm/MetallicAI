import { env } from "@/shared/config/env";
import { BandRepository } from "../domain/BandRepository";
import { Band } from "../domain/Catalog";

export class BandApiRepository implements BandRepository {
  async getBands(input: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<Band[]> {
    const params = new URLSearchParams();
    params.set("page", String(input.page ?? 1));
    params.set("limit", String(input.limit ?? 20));
    if (input.search) params.set("search", input.search);

    const res = await fetch(`${env.API_URL}/bands?${params.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`Error GET /bands (${res.status})`);

    // tu backend devuelve array directo
    return (await res.json()) as Band[];
  }
}
