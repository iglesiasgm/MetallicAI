"use client";
import { useState } from "react";

export function BandTagsChips({
  value,
  onRemove,
}: {
  value: string[];
  onRemove: (band: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {value.map((band) => (
        <span
          key={band}
          className="px-3 py-1 bg-red-800 rounded-full flex items-center gap-2 text-white"
        >
          {band}
          <button type="button" onClick={() => onRemove(band)}>
            ✕
          </button>
        </span>
      ))}
    </div>
  );
}

export function BandTagsField({
  value,
  onAdd,
  placeholder,
}: {
  value: string[];
  onAdd: (band: string) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  return (
    <input
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const band = input.trim();
          if (!band || value.includes(band)) return;
          onAdd(band);
          setInput("");
        }
      }}
      placeholder={placeholder}
      className="
        w-full
        h-[48px]
        rounded-xl
        border border-neutral-600
        bg-black/60
        text-white
        px-4
        placeholder-neutral-400
        focus:outline-none
        focus:ring-2
        focus:ring-red-600
      "
    />
  );
}
