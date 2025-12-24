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
      className="w-full p-4 rounded-2xl border resize-none"
      rows={4}
    />
  );
}
