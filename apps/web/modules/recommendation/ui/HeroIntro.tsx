"use client";

import { motion } from "framer-motion";
import Link from "next/link";

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
      <div>
        <div>
          <img src="/icon.png" alt="Logo" className="mx-auto mb-8 w-70 h-80" />
        </div>
        <div className="mt-8">
          <p
            style={{ fontFamily: "HeroDesc" }}
            className="text-neutral-300 max-w-2xl mx-auto mb-10 text-6xl"
          >
            No sabes que banda escuchar hoy?
          </p>
          <div className="gap-5">
            <button
              onClick={onStart}
              className="
          px-10 py-4
          border border-red-900 border-4
          rounded-md
          bg-black
          hover:bg-red-950
          transition
          text-white
          font-semibold
          tracking-wide
          mr-5
        "
            >
              Comenzar
            </button>
            <Link
              href={"/catalog"}
              className="
          px-10 py-5
          border border-red-900 border-4
          rounded-md
          bg-black
          hover:bg-red-950
          transition
          text-white
          font-semibold
          tracking-wide
        "
            >
              La Kripta
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
