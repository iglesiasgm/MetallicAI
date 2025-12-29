"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import { FaBolt, FaFire, FaGuitar, FaHeart, FaUsers } from "react-icons/fa";
import { Lang, LanguageDropdown } from "../LanguageDropdown";
import { RecommendationApiRepository } from "../../infraestructure/RecommendationApiRepository";
import { getRecommendations } from "../../application/getRecommendations";
import { BandTagsChips, BandTagsField } from "../BandTagsInput";
import { MoodInput } from "../MoodInput";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { RecommendationResponse } from "./RecommendationResponse";

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

export default function PromptSection({
  horrorFont,
  metalFont,
}: {
  horrorFont: string;
  metalFont: string;
}) {
  const [bands, setBands] = useState<string[]>([]);
  const [mood, setMood] = useState("");
  const [lang, setLang] = useState<Lang>("es");

  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ NUEVO: ids ya mostrados alguna vez (NO repetir nunca)
  const [seenBandIds, setSeenBandIds] = useState<string[]>([]);

  // ✅ NUEVO: para mostrar el botón solo al terminar el typewriter
  const [typingDone, setTypingDone] = useState(false);

  const ph = PLACEHOLDERS[lang];

  async function handleRecommend(opts?: { exclude?: string[] }) {
    setLoading(true);
    setTypingDone(false);
    setResponse("");

    try {
      const repo = new RecommendationApiRepository();

      const recommendations = await getRecommendations(repo, {
        favoriteBands: bands,
        targetMood: mood,
        language: lang,
        excludeBandIds: opts?.exclude,
      });

      // ✅ Guardamos ids de esta tanda para nunca repetir
      const newIds = recommendations
        .map((r: any) => String(r?.band?.id ?? ""))
        .filter(Boolean);

      setSeenBandIds((prev) => uniqMerge(prev, newIds));

      const text = recommendations
        .map((r: any) => {
          const name = typeof r.band === "string" ? r.band : r.band?.name ?? "";
          return `🎸 ${name}\n${r.explanation}\n`;
        })
        .join("\n");

      setResponse(text);
    } finally {
      setLoading(false);
    }
  }

  function handleReroll() {
    // ✅ excluye TODAS las bandas vistas en cualquier momento
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
          {/* stats bar (mock) */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-red-900/30">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <FaFire className="text-red-600" />
                <span className="text-sm text-gray-400">
                  1.2M Recomendaciones
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaUsers className="text-red-600" />
                <span className="text-sm text-gray-400">850K Metaleros</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              <span className="text-sm text-gray-400">IA Online</span>
            </div>
          </div>

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

          {/* advanced filters (MOCK) */}
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "SUBGÉNEROS",
                options: [
                  "Todos los Subgéneros",
                  "Thrash",
                  "Death",
                  "Black",
                  "Power",
                  "Doom",
                  "Progressive",
                ],
              },
              {
                label: "ERA",
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
                label: "INTENSIDAD",
                options: [
                  "Cualquiera",
                  "🔥 Light",
                  "🔥🔥 Medio",
                  "🔥🔥🔥 Heavy",
                  "🔥🔥🔥🔥 Extremo",
                ],
              },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-xs text-gray-400 mb-2">
                  {f.label}
                </label>
                <select
                  className="
                    w-full bg-black/60
                    border border-red-900/50
                    rounded px-3 py-2
                    text-gray-100 text-sm
                    focus:outline-none focus:border-red-600
                  "
                  disabled
                >
                  {f.options.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
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
            <FaWandMagicSparkles />
            {loading ? "DESATANDO..." : "DESATA A LA BESTIA"}
            <FaWandMagicSparkles />
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
            text={response}
            onDone={() => setTypingDone(true)}
          />
        </div>

        {/* ✅ BOTÓN NUEVO: aparece SOLO cuando terminó de tipear */}
        {response && typingDone && (
          <motion.button
            type="button"
            onClick={handleReroll}
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="
              mt-4 w-full
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
            Generar otras bandas
          </motion.button>
        )}

        {/* community stats (MOCK) */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: "1.2M", label: "Recomendaciones" },
            { title: "850K", label: "Usuarios Activos" },
            { title: "4.9/5", label: "Calificación de Usuarios" },
          ].map((c) => (
            <div
              key={c.label}
              className="bg-black/30 border border-red-900/30 rounded-lg p-4 text-center backdrop-blur-sm"
            >
              <div className="text-2xl font-bold text-white">{c.title}</div>
              <div className="text-xs text-gray-400">{c.label}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
