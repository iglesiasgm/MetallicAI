"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import ReactCountryFlag from "react-country-flag";

export type Lang = "es" | "en" | "de" | "it" | "pt";

type LangItem = { key: Lang; label: string; countryCode: string };

const LANGS: LangItem[] = [
  { key: "es", label: "Español", countryCode: "ES" },
  { key: "en", label: "English", countryCode: "US" }, // si preferís UK: "GB"
  { key: "de", label: "Deutsch", countryCode: "DE" },
  { key: "it", label: "Italiano", countryCode: "IT" },
  { key: "pt", label: "Português", countryCode: "PT" }, // si preferís Brasil: "BR"
];

export function LanguageDropdown({
  value,
  onChange,
}: {
  value: Lang;
  onChange: (l: Lang) => void;
}) {
  const [open, setOpen] = useState(false);

  const current = useMemo(
    () => LANGS.find((l) => l.key === value) ?? LANGS[0],
    [value]
  );

  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        className="
          h-[49px] w-[49px]
          mt-0.5
          flex items-center justify-center
          rounded-xl
          border border-neutral-600
          bg-black/60
          focus:outline-none
          focus:ring-2
          focus:ring-red-600
        "
        aria-haspopup="menu"
        aria-expanded={open}
        title={current.label}
      >
        <ReactCountryFlag
          countryCode={current.countryCode}
          svg
          style={{
            width: "22px",
            height: "22px",
            borderRadius: "4px",
          }}
          aria-label={current.label}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            {/* overlay invisible para cerrar al click afuera */}
            <button
              type="button"
              aria-label="Cerrar"
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-20 cursor-default"
            />

            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="
                absolute left-0 top-[52px]
                z-30
                w-[190px]
                overflow-hidden
                rounded-xl
                border border-white/10
                bg-neutral-950/80
                backdrop-blur-md
                shadow-2xl
              "
              role="menu"
            >
              {LANGS.map((l) => {
                const active = l.key === value;

                return (
                  <button
                    key={l.key}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onChange(l.key);
                      setOpen(false);
                    }}
                    className={[
                      "w-full flex items-center gap-2 px-3 py-2 text-sm",
                      "transition-colors",
                      active
                        ? "bg-red-700/40 text-white"
                        : "text-white/80 hover:bg-white/10",
                    ].join(" ")}
                  >
                    <ReactCountryFlag
                      countryCode={l.countryCode}
                      svg
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "4px",
                      }}
                      aria-label={l.label}
                    />
                    <span className="truncate">{l.label}</span>
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
