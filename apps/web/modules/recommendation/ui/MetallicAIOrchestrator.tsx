"use client";

import BackgroundVideo from "./BackgroundVideo";
import HeroIntro from "./HeroIntro";

export default function MetallicAIOrchestrator() {
  return (
    <main className="relative min-h-screen flex items-center justify-center">
      <BackgroundVideo />
      <HeroIntro />
    </main>
  );
}
