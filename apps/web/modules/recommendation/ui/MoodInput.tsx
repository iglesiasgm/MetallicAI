"use client";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  className?: string;
}

export function MoodInput({ value, onChange, placeholder, className }: Props) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={[
        "w-full",
        "bg-black/60",
        "border border-red-900/50",
        "rounded px-4 py-3",
        "text-gray-100 placeholder-gray-500",
        "focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/30",
        "transition-all resize-none",
        className ?? "",
      ].join(" ")}
      rows={4}
    />
  );
}
