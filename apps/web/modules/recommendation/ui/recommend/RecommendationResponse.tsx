"use client";
import { useEffect, useState } from "react";
import { FaSpotify } from "react-icons/fa";

type BandLinks = { spotify?: string };
type Band = { id: string; name: string; links?: BandLinks };
type Recommendation = { band: Band; explanation?: string };

interface Props {
  recommendations: Recommendation[];
  onDone?: () => void;
}

export function RecommendationResponse({ recommendations, onDone }: Props) {
  const [visible, setVisible] = useState<string[]>([]);

  useEffect(() => {
    if (!recommendations?.length) return;

    const texts = recommendations.map((r) => (r.explanation ?? "").trim());
    setVisible(texts.map(() => ""));

    let bandIdx = 0;
    let charIdx = 0;

    const interval = setInterval(() => {
      const full = texts[bandIdx] ?? "";
      const ch = full[charIdx];

      // terminó este item
      if (ch == null) {
        bandIdx++;
        charIdx = 0;

        // terminó todo
        if (bandIdx >= texts.length) {
          clearInterval(interval);
          onDone?.();
        }
        return;
      }

      setVisible((prev) => {
        const next = [...prev];
        next[bandIdx] = (next[bandIdx] ?? "") + ch;
        return next;
      });

      charIdx++;
    }, 12);

    return () => clearInterval(interval);
  }, [recommendations, onDone]);

  if (!recommendations?.length) return null;

  return (
    <section
      className="
        mt-6 w-full
        rounded-2xl
        border border-white/10
        bg-neutral-950/60
        backdrop-blur-md
        shadow-2xl
        overflow-hidden
      "
    >
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <p className="text-sm font-semibold text-white/90">Respuesta</p>
      </div>

      <div className="px-4 py-4 max-h-[55vh] overflow-y-auto">
        <div className="space-y-5">
          {recommendations.map((r, idx) => (
            <div
              key={r.band.id ?? r.band.name ?? idx}
              className="rounded-xl border border-white/10 bg-black/30 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold text-white/90">
                  🎸 {r.band.name}
                </p>

                {r.band.links?.spotify && (
                  <a
                    href={r.band.links.spotify}
                    target="_blank"
                    rel="noreferrer"
                    className="
                      inline-flex items-center gap-2
                      text-xs font-semibold
                      text-green-400 hover:text-green-300
                      transition
                    "
                    title="Abrir en Spotify"
                  >
                    <FaSpotify className="text-base" />
                    Spotify
                  </a>
                )}
              </div>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/80">
                {visible[idx] ?? ""}
              </p>

              {/* Link debajo de la explicación (por si querés que sea “debajo” sí o sí) */}
              {r.band.links?.spotify && (
                <a
                  href={r.band.links.spotify}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-2 text-xs text-green-400 hover:text-green-300"
                >
                  <FaSpotify />
                  Escuchar en Spotify
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
