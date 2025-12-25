"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { RecommendationApiRepository } from "../infraestructure/RecommendationApiRepository";
import { getRecommendations } from "../application/getRecommendations";
import { BandTagsInput } from "./BandTagsInput";
import { MoodInput } from "./MoodInput";
import { RecommendationResponse } from "./RecommendationResponse";
import { env } from "@/shared/config/env";

export default function PromptUI() {
  const [bands, setBands] = useState<string[]>([]);
  const [mood, setMood] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRecommend() {
    setLoading(true);
    setResponse("");

    console.log("API_URL:", (env as any).API_URL);

    try {
      const repo = new RecommendationApiRepository();
      const recommendations = await getRecommendations(repo, {
        favoriteBands: bands,
        targetMood: mood,
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
      {/* Input bandas */}

      <BandTagsInput value={bands} onChange={setBands} />

      {/* Textarea mood */}

      <MoodInput value={mood} onChange={setMood} />

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
