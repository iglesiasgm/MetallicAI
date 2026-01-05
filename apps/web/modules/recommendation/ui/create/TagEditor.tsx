"use client";

import { useMemo, useState } from "react";
import { FaTimes } from "react-icons/fa";

type Props = {
  label: string;
  icon?: React.ReactNode;
  placeholder: string;
  values: string[];
  onChange: (next: string[]) => void;
};

function normalizeTag(s: string) {
  return s.trim().replace(/\s+/g, " ");
}

export default function TagEditor({
  label,
  icon,
  placeholder,
  values,
  onChange,
}: Props) {
  const [input, setInput] = useState("");

  const canAdd = useMemo(() => {
    const v = normalizeTag(input);
    if (!v) return false;
    return !values.some((x) => x.toLowerCase() === v.toLowerCase());
  }, [input, values]);

  function addTag() {
    const v = normalizeTag(input);
    if (!v) return;
    if (values.some((x) => x.toLowerCase() === v.toLowerCase())) return;
    onChange([...values, v]);
    setInput("");
  }

  function removeTag(tag: string) {
    onChange(values.filter((x) => x !== tag));
  }

  return (
    <div className="space-y-2">
      <label className="block text-red-400 font-bold text-sm uppercase tracking-wider">
        <span className="inline-flex items-center gap-2">
          {icon}
          {label}
        </span>
      </label>

      <div className="flex flex-wrap gap-2">
        {values.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold
                       bg-gradient-to-br from-red-600 to-red-800 border border-red-600"
          >
            {t}
            <button
              type="button"
              onClick={() => removeTag(t)}
              className="text-red-200 hover:text-white transition-colors"
              aria-label={`Remove ${t}`}
              title="Remove"
            >
              <FaTimes className="text-xs" />
            </button>
          </span>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (canAdd) addTag();
          }
        }}
        className="w-full rounded px-4 py-2 text-white placeholder-gray-500
                   bg-[#1f1f1f] border border-[#555]
                   focus:outline-none focus:border-red-500"
        placeholder={placeholder}
      />
    </div>
  );
}
