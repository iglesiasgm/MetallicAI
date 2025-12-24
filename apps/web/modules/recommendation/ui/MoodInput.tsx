"use client";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function MoodInput({ value, onChange }: Props) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Describe el mood que estás buscando..."
      className="w-[420px]
          h-[120px]
          resize-none
          overflow-y-auto
          rounded-xl
          border border-neutral-600
          bg-black/40
          text-white
          p-4
          placeholder-neutral-400
          focus:outline-none
          focus:ring-2
          focus:ring-red-600"
      rows={4}
    />
  );
}
