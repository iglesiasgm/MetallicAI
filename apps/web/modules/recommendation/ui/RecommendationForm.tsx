"use client";
import { useState } from "react";
import { BandTagsInput } from "./BandTagsInput";
import { MoodInput } from "./MoodInput";
import { RecommendationResponse } from "./RecommendationResponse";

import { getRecommendations } from "../application/getRecommendations";
import { RecommendationApiRepository } from "../infraestructure/RecommendationApiRepository";

export function RecommendationForm() {
  const [bands, setBands] = useState<string[]>([]);
  const [mood, setMood] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRecommend() {
    setLoading(true);
    setResponse("");

    try {
      const repo = new RecommendationApiRepository();
      const recommendations = await getRecommendations(repo, {
        favoriteBands: bands,
        targetMood: mood,
      });

      const text = recommendations
        .map((r) => `🎸 ${r.band}\n${r.explanation}\n`)
        .join("\n");

      setResponse(text);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <BandTagsInput value={bands} onChange={setBands} />
      <MoodInput value={mood} onChange={setMood} />

      <button
        onClick={handleRecommend}
        disabled={loading}
        className="w-full p-3 rounded-xl bg-black text-white"
      >
        {loading ? "Recomendando..." : "Recomendar"}
      </button>

      <RecommendationResponse text={response} />
    </div>
  );
}
