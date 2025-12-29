"use client";

import BackgroundVideo from "../BackgroundVideo";
import PromptSection from "./PromptSection";
import RecommendFooter from "./RecommendFooter";
import RecommendHeader from "./RecommendHeader";

export default function RecommendOrchestrator({
  horrorFont,
  metalFont,
}: {
  horrorFont: string;
  metalFont: string;
}) {
  return (
    <main className="relative min-h-screen bg-black text-gray-100 overflow-x-hidden">
      <BackgroundVideo />

      {/* overlay global similar al HTML */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/45 via-[#0f0f0f]/50 to-black/45" />

      <div className="relative z-10">
        <RecommendHeader />
        <PromptSection horrorFont={horrorFont} metalFont={metalFont} />
        <RecommendFooter />
      </div>
    </main>
  );
}
