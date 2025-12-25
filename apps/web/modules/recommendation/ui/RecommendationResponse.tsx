"use client";
import { useEffect, useState } from "react";

interface Props {
  text: string;
}

export function RecommendationResponse({ text }: Props) {
  const [visible, setVisible] = useState("");

  useEffect(() => {
    if (!text) return;

    setVisible("");
    let i = 0;

    const interval = setInterval(() => {
      const ch = text[i];
      if (ch == null) {
        clearInterval(interval);
        return;
      }

      setVisible((prev) => prev + ch);
      i++;

      if (i >= text.length) clearInterval(interval);
    }, 15);

    return () => clearInterval(interval);
  }, [text]);

  if (!text) return null;

  return (
    <section
      className="
        mt-6
        w-full max-w-[700px]
        rounded-2xl
        border border-white/10
        bg-neutral-950/60
        backdrop-blur-md
        shadow-2xl
        overflow-hidden
      "
    >
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <p className="text-sm font-semibold text-white/90">Respuesta</p>
      </div>

      <div
        className="
          px-4 py-4
          max-h-[45vh]
          overflow-y-auto
          whitespace-pre-wrap
          text-sm leading-6
          text-white/80
        "
      >
        {visible}
      </div>
    </section>
  );
}
