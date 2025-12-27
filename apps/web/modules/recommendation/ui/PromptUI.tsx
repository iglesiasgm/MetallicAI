"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { RecommendationApiRepository } from "../infraestructure/RecommendationApiRepository";
import { getRecommendations } from "../application/getRecommendations";
import { BandTagsChips, BandTagsField } from "./BandTagsInput";
import { MoodInput } from "./MoodInput";
import { RecommendationResponse } from "./RecommendationResponse";
import { env } from "@/shared/config/env";
import { Lang, LanguageDropdown } from "./LanguageDropdown";

const PLACEHOLDERS: Record<Lang, { tags: string; mood: string }> = {
  es: {
    tags: "Agregar banda y presionar Enter",
    mood: "Describe el mood que estás buscando...",
  },
  en: {
    tags: "Add a band and press Enter",
    mood: "Describe the mood you're looking for...",
  },
  de: {
    tags: "Band hinzufügen und Enter drücken",
    mood: "Beschreibe die Stimmung, die du suchst...",
  },
  it: {
    tags: "Aggiungi una band e premi Invio",
    mood: "Descrivi il mood che stai cercando...",
  },
  pt: {
    tags: "Adicionar banda e pressionar Enter",
    mood: "Descreva o mood que você está procurando...",
  },
};

export default function PromptUI() {
  const [bands, setBands] = useState<string[]>([]);
  const [mood, setMood] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<Lang>("es");

  const ph = PLACEHOLDERS[lang];

  async function handleRecommend() {
    setLoading(true);
    setResponse("");

    console.log("API_URL:", (env as any).API_URL);

    try {
      const repo = new RecommendationApiRepository();
      const recommendations = await getRecommendations(repo, {
        favoriteBands: bands,
        targetMood: mood,
        language: lang,
      });

      console.log("recommendations raw:", recommendations);
      console.log("first item:", recommendations?.[0]);
      console.log(
        "typeof band:",
        typeof recommendations?.[0]?.band,
        recommendations?.[0]?.band
      );

      const text = recommendations

        .map(
          (r: any) =>
            `🎸 ${r.band?.name ?? "Banda desconocida"}\n${r.explanation}\n`
        )
        .join("\n");

      setResponse(text);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-4 z-10"
    >
      <div className="w-[420px]">
        <div className="mb-2">
          <BandTagsChips
            value={bands}
            onRemove={(band) => setBands(bands.filter((b) => b !== band))}
          />
        </div>

        <div className="flex items-center gap-[5px]">
          <div className="shrink-0">
            <LanguageDropdown value={lang} onChange={setLang} />
          </div>

          <div className="flex-1">
            <BandTagsField
              value={bands}
              placeholder={ph.tags}
              onAdd={(band) => setBands([...bands, band])}
            />
          </div>
        </div>
      </div>
      <MoodInput value={mood} onChange={setMood} placeholder={ph.mood} />

      {/* Botón */}
      <button
        onClick={handleRecommend}
        disabled={loading}
        className="
          w-[420px]
          py-4
          rounded-xl
          bg-red-800
          hover:bg-red-900
          transition
          text-white
          font-semibold
        "
      >
        {loading ? "Recomendando..." : "Recomendar"}
      </button>

      <RecommendationResponse text={response} />
    </motion.div>
  );
}
