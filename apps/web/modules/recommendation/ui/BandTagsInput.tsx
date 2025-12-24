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
            className="px-3 py-1 bg-gray-200 rounded-full flex items-center gap-2"
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
        className="w-full p-3 rounded-lg border"
      />
    </div>
  );
}
