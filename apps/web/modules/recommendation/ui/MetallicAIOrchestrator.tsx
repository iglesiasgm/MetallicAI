"use client";

import { useState } from "react";
import BackgroundVideo from "./BackgroundVideo";
import HeroIntro from "./HeroIntro";
import PromptUI from "./PromptUI";

export default function MetallicAIOrchestrator() {
  const [started, setStarted] = useState(false);

  return (
    <main className="relative min-h-screen flex items-center justify-center">
      <BackgroundVideo />

      {!started ? <HeroIntro onStart={() => setStarted(true)} /> : <PromptUI />}
    </main>
  );
}
