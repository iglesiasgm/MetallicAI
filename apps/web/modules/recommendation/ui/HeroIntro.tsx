"use client";

import { motion } from "framer-motion";

interface Props {
  onStart: () => void;
}

export default function HeroIntro({ onStart }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="text-center z-10"
    >
      <h1 className="text-6xl md:text-7xl font-bold text-white mb-4">
        MetallicAI
      </h1>

      <p className="text-neutral-300 max-w-xl mx-auto mb-10">
        Un recomendador inteligente de bandas de metal basado en mood,
        influencias y sensaciones.
      </p>

      <button
        onClick={onStart}
        className="
          px-10 py-4
          rounded-full
          bg-red-700
          hover:bg-red-600
          transition
          text-white
          font-semibold
          tracking-wide
        "
      >
        Comenzar
      </button>
    </motion.div>
  );
}
