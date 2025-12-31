"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import { FaBolt, FaGuitar, FaHeart } from "react-icons/fa";
import { Lang, LanguageDropdown } from "../LanguageDropdown";
import { RecommendationApiRepository } from "../../infraestructure/RecommendationApiRepository";
import { getRecommendations } from "../../application/getRecommendations";
import { BandTagsChips, BandTagsField } from "../BandTagsInput";
import { MoodInput } from "../MoodInput";
import { RecommendationResponse } from "./RecommendationResponse";

// --- Constantes y Helpers ---

const PLACEHOLDERS: Record<Lang, { bands: string; mood: string }> = {
  es: {
    bands: "Agregá bandas como Metallica, Slayer, Iron Maiden…",
    mood: "Busco riffs agresivos, tempo rápido, letras oscuras…",
  },
  en: {
    bands: "Add bands like Metallica, Slayer, Iron Maiden…",
    mood: "I'm looking for aggressive riffs, fast tempo, dark lyrics…",
  },
  de: {
    bands: "Füge Bands hinzu wie Metallica, Slayer, Iron Maiden…",
    mood: "Ich suche aggressive Riffs, schnelles Tempo, dunkle Texte…",
  },
  it: {
    bands: "Aggiungi band come Metallica, Slayer, Iron Maiden…",
    mood: "Cerco riff aggressivi, tempo veloce, testi oscuri…",
  },
  pt: {
    bands: "Adicione bandas como Metallica, Slayer, Iron Maiden…",
    mood: "Procuro riffs agressivos, andamento rápido, letras sombrias…",
  },
};

function uniqMerge(prev: string[], next: string[]) {
  const set = new Set(prev);
  for (const id of next) set.add(id);
  return Array.from(set);
}

// Clase compartida para que todos los selects sean IDÉNTICOS
const selectClasses = `
  w-full bg-black/60
  border border-red-900/50
  rounded px-3 py-2
  text-gray-100 text-sm
  focus:outline-none focus:border-red-600
  disabled:opacity-50 disabled:cursor-not-allowed
`;

// --- Componente Principal ---

export default function PromptSection({
  horrorFont,
  metalFont,
}: {
  horrorFont: string;
  metalFont: string;
}) {
  // Estados principales
  const [bands, setBands] = useState<string[]>([]);
  const [mood, setMood] = useState("");
  const [lang, setLang] = useState<Lang>("es");
  
  // Estados de filtros
  const [popularityMode, setPopularityMode] = useState<"popular" | "underground">("underground");
  const [subgenre, setSubgenre] = useState("Todos los Subgéneros"); // ✅ Estado para el subgénero

  // Estados de UI/Respuesta
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [seenBandIds, setSeenBandIds] = useState<string[]>([]);
  const [typingDone, setTypingDone] = useState(false);
  const [recs, setRecs] = useState<any[]>([]);

  const ph = PLACEHOLDERS[lang];

  // Lógica de recomendación
  async function handleRecommend(opts?: { exclude?: string[] }) {
    setLoading(true);
    setTypingDone(false);
    setResponse("");
    setRecs([]);

    try {
      const repo = new RecommendationApiRepository();

      // ✅ Lógica: Si es "Todos...", enviamos array vacío. Si no, enviamos el seleccionado.
      const subgenresToSend = subgenre === "Todos los Subgéneros" ? [] : [subgenre];

      const recommendations = await getRecommendations(repo, {
        favoriteBands: bands,
        targetMood: mood,
        language: lang,
        popularityMode,
        excludeBandIds: opts?.exclude,
        subgenrePreferences: subgenresToSend, // ✅ Se envía al backend
      });

      const newIds = recommendations
        .map((r: any) => String(r?.band?.id ?? ""))
        .filter(Boolean);

      setSeenBandIds((prev) => uniqMerge(prev, newIds));

      // Generamos texto plano por si se usa, aunque el componente usa 'recs'
      const text = recommendations
        .map((r: any) => {
          const name = typeof r.band === "string" ? r.band : r.band?.name ?? "";
          return `🎸 ${name}\n${r.explanation}\n`;
        })
        .join("\n");

      setRecs(recommendations);
      setResponse(text);
    } finally {
      setLoading(false);
    }
  }

  function handleReroll() {
    return handleRecommend({ exclude: seenBandIds });
  }

  const quickMoods = useMemo(
    () => ["Aggressive", "Melodic", "Dark & Heavy", "Epic", "Technical"],
    []
  );

  return (
    <main className="min-h-[calc(100vh-140px)] flex items-center justify-center px-6 py-20">
      <div className="max-w-5xl w-full">
        {/* title section */}
        <div className="text-center mb-12">
          <h2
            className={`
              ${horrorFont}
              text-7xl sm:text-8xl
              text-red-600 mb-4
              font-bold tracking-wider
              drop-shadow-[0_0_20px_rgba(220,38,38,0.8)]
            `}
          >
            METALLICAI
          </h2>

          <p
            className={`${metalFont} text-xl text-gray-300 font-light tracking-wide`}
          >
            Descubrí tu próxima obsesión
          </p>

          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-red-600 to-transparent" />
            <FaGuitar className="text-red-600 text-2xl" />
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-red-600 to-transparent" />
          </div>
        </div>

        {/* prompt container */}
        <div
          className="
            rounded-lg p-8
            border border-red-900/50
            bg-gradient-to-br from-[#1a1a1a]/70 to-black/70
            backdrop-blur-md
            shadow-[0_0_15px_rgba(220,38,38,0.5),inset_0_0_15px_rgba(0,0,0,0.5)]
          "
        >
          {/* favorite bands */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-red-600 mb-3 flex items-center gap-2">
              <FaHeart />
              TUS BANDAS FAVORITAS
            </label>

            <div className="flex items-center gap-[5px]">
              <div className="flex-1">
                <BandTagsField
                  value={bands}
                  placeholder={ph.bands}
                  onAdd={(band) => setBands((prev) => [...prev, band])}
                />
              </div>

              <div className="mt-[2px] shrink-0">
                <LanguageDropdown value={lang} onChange={setLang} />
              </div>
            </div>

            <div className="mt-3 min-h-[40px]">
              <BandTagsChips
                value={bands}
                onRemove={(band) =>
                  setBands((prev) => prev.filter((b) => b !== band))
                }
              />
            </div>
          </div>

          {/* mood */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-red-600 mb-3 flex items-center gap-2">
              <FaBolt />
              DESCRIBE TU MOOD
            </label>

            <MoodInput value={mood} onChange={setMood} placeholder={ph.mood} />
          </div>

          {/* advanced filters */}
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "SUBGÉNEROS",
                kind: "subgenre",
                options: [
                  "Todos los Subgéneros",
                  "Thrash",
                  "Death",
                  "Black",
                  "Power",
                  "Doom",
                  "Progressive",
                  "Nu",
                  "Heavy",
                  "Groove",
                  "Sludge",
                  "Grindcore",
                  "Metalcore"
                ],
              },
              {
                label: "ERA",
                kind: "era",
                options: [
                  "Cualquier Era",
                  "70s",
                  "80s",
                  "90s",
                  "2000s",
                  "2010s+",
                ],
              },
              {
                label: "POPULARIDAD",
                kind: "popularity",
                options: [
                  { label: "UNDERGROUND", value: "underground" },
                  { label: "POPULAR", value: "popular" },
                ],
              },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-xs text-gray-400 mb-2">
                  {f.label}
                </label>

                {/* Renderizado Condicional del Select */}
                {f.kind === "popularity" ? (
                  <select
                    className={selectClasses}
                    value={popularityMode}
                    onChange={(e) => setPopularityMode(e.target.value as any)}
                  >
                    {f.options.map((opt: any) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : f.kind === "subgenre" ? (
                  <select
                    className={selectClasses}
                    value={subgenre}
                    onChange={(e) => setSubgenre(e.target.value)}
                  >
                    {f.options.map((opt: any) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  // Select Deshabilitado (ERA)
                  <select className={selectClasses} disabled>
                    {f.options.map((opt: any) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <motion.button
            type="button"
            onClick={() => handleRecommend()}
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="
              w-full
              bg-gradient-to-r from-red-600 to-red-800
              hover:from-red-700 hover:to-red-900
              text-white font-bold
              py-4 rounded
              transition-all
              shadow-[0_0_30px_rgba(220,38,38,0.8),0_0_60px_rgba(220,38,38,0.4)]
              flex items-center justify-center gap-3 text-lg
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            {loading ? "RECOMENDANDO..." : "RECOMENDAR"}
          </motion.button>

          {/* quick moods */}
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-500">Moods rápidos:</span>
            {quickMoods.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() =>
                  setMood((prev) =>
                    prev
                      ? prev
                      : `I'm looking for ${m.toLowerCase()} metal bands with powerful sound`
                  )
                }
                className="
                  text-xs
                  bg-gray-800 hover:bg-red-900/30
                  border border-gray-700 hover:border-red-600
                  px-3 py-1 rounded-full
                  transition-all
                "
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* RESPONSE */}
        <div className="mt-8 w-full">
          <RecommendationResponse
            recommendations={recs}
            onDone={() => setTypingDone(true)}
            isTypingFinished={typingDone} // ✅ Pasamos el estado de escritura
            onRetry={handleReroll}
          />
        </div>

        
      </div>
    </main>
  );
}