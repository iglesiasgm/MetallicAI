"use client";

import { useEffect, useMemo, useState } from "react";
import { BandApiRepository } from "../../infraestructure/BandApiRepository";
import { Band } from "../../domain/Catalog";
import { getBands } from "../../application/getBands";
import BackgroundVideo from "../BackgroundVideo";
import CatalogHeader from "./CatalogHeader";
import CatalogSearch from "./CatalogSearch";
import BandsGrid from "./BandsGrid";
import LoadMoreButton from "./LoadMoreButton";
import CatalogFooter from "./CatalogFooter";
import BackHomeButton from "../BackHomeButton";

export default function CatalogOrchestrator({
  horrorFont,
  metalFont,
}: {
  horrorFont: string;
  metalFont: string;
}) {
  const repo = useMemo(() => new BandApiRepository(), []);
  const [bands, setBands] = useState<Band[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const limit = 24;

  async function loadPage(nextPage: number) {
    setLoading(true);
    try {
      const data = await getBands(repo, { page: nextPage, limit });
      setBands((prev) => {
        const map = new Map(prev.map((b) => [String(b.id), b]));
        for (const item of data) map.set(String(item.id), item);
        return Array.from(map.values());
      });
      setPage(nextPage);
      return data.length;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bands;
    return bands.filter((b) => b.name.toLowerCase().includes(q));
  }, [bands, query]);

  return (
    <main className="relative min-h-screen bg-black">
      <BackgroundVideo />

      {/* overlay tipo “flame-bg” pero sobre el video */}
      <section
        className="
          relative z-10
          py-20 px-6
        "
      >
        <div
          className="
            absolute inset-0
            bg-gradient-to-br
            from-black/70 via-[#1a0a0a]/55 to-black/70
          "
        />
        <BackHomeButton />
        <div className="relative max-w-7xl mx-auto">
          <CatalogHeader horrorFont={horrorFont} metalFont={metalFont} />

          <div className="mt-10 flex justify-center">
            <CatalogSearch
              value={query}
              onChange={setQuery}
              metalFont={metalFont}
            />
          </div>

          <div className="mt-10">
            <BandsGrid bands={filtered} metalFont={metalFont} />
          </div>

          <div className="mt-10 flex justify-center">
            <LoadMoreButton
              loading={loading}
              onClick={() => loadPage(page + 1)}
            />
          </div>

          <CatalogFooter metalFont={metalFont} />
        </div>
      </section>
    </main>
  );
}
