"use client";
import { useState } from "react";

interface Props {
  value: string[];
  onChange: (bands: string[]) => void;
}

export function BandTagsInput({ value, onChange }: Props) {
  const [input, setInput] = useState("");

  function addBand() {
    const band = input.trim();
    if (!band || value.includes(band)) return;
    onChange([...value, band]);
    setInput("");
  }

  function removeBand(band: string) {
    onChange(value.filter((b) => b !== band));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((band) => (
          <span
            key={band}
            className="px-3 py-1 bg-red-800 rounded-full flex items-center gap-2 text-white"
          >
            {band}
            <button onClick={() => removeBand(band)}>✕</button>
          </span>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && addBand()}
        placeholder="Agregar banda y presionar Enter"
        className="w-[420px]
          h-[48px]
          rounded-xl
          border border-neutral-600
          bg-black/60
          text-white
          px-4
          placeholder-neutral-400
          focus:outline-none
          focus:ring-2
          focus:ring-red-600"
      />
    </div>
  );
}
