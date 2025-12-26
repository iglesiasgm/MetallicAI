"use client";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}

export function MoodInput({ value, onChange, placeholder }: Props) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="
        w-[420px]
        h-[120px]
        resize-none
        overflow-y-auto
        rounded-xl
        border border-neutral-600
        bg-black/60
        text-white
        p-4
        placeholder-neutral-400
        focus:outline-none
        focus:ring-2
        focus:ring-red-600
      "
      rows={4}
    />
  );
}
