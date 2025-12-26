"use client";

import { motion } from "framer-motion";

export type Lang = "es" | "en" | "de" | "it" | "pt";

const LANGS: { key: Lang; label: string }[] = [
  { key: "es", label: "ES" },
  { key: "en", label: "EN" },
  { key: "de", label: "DE" },
  { key: "it", label: "IT" },
  { key: "pt", label: "PT" },
];

export function LanguageTabs({
  value,
  onChange,
  className = "",
}: {
  value: Lang;
  onChange: (l: Lang) => void;
  className?: string;
}) {
  const activeIndex = LANGS.findIndex((l) => l.key === value);

  return (
    <div className={["w-full", className].join(" ")}>
      <div
        className="
          relative
          mx-auto
          w-fit
          flex items-center gap-1
          rounded-xl
          border border-white/10
          bg-black/55
          backdrop-blur
          px-1 py-1
          shadow-xl
        "
      >
        <motion.div
          layout
          layoutId="lang-pill-global"
          className="absolute top-1 bottom-1 rounded-lg bg-red-700/75"
          style={{
            width: 44,
            left: 4 + activeIndex * (44 + 4),
          }}
          transition={{ type: "spring", stiffness: 520, damping: 36 }}
        />

        {LANGS.map((l) => (
          <motion.button
            key={l.key}
            type="button"
            onClick={() => onChange(l.key)}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.97 }}
            className={[
              "relative z-10",
              "w-11 h-9",
              "rounded-lg",
              "text-xs font-semibold tracking-wide",
              "transition-colors",
              value === l.key
                ? "text-white"
                : "text-white/55 hover:text-white/85",
            ].join(" ")}
            aria-pressed={value === l.key}
          >
            {l.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
