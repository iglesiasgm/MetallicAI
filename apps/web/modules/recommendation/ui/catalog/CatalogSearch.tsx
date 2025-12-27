"use client";

export default function CatalogSearch({
  value,
  onChange,
  metalFont,
}: {
  value: string;
  onChange: (v: string) => void;
  metalFont: string;
}) {
  return (
    <div className="w-full max-w-xl">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search band name… (local filter)"
        className={[
          "w-full h-[52px] rounded-xl px-5",
          "border border-red-900/60",
          "bg-black/50 backdrop-blur-md",
          "text-gray-200 placeholder:text-gray-500",
          "focus:outline-none focus:ring-2 focus:ring-red-600",
          metalFont,
        ].join(" ")}
      />
    </div>
  );
}
