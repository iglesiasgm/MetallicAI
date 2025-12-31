"use client";
import { useEffect, useState, useRef } from "react";
import { FaSpotify, FaSyncAlt } from "react-icons/fa";

type BandLinks = { spotify?: string };
type Band = { id: string; name: string; links?: BandLinks };
type Recommendation = { band: Band; explanation?: string };

interface Props {
  recommendations: Recommendation[];
  onDone?: () => void;
  onRetry?: () => void;
  isTypingFinished?: boolean;
}

export function RecommendationResponse({ 
  recommendations, 
  onDone, 
  onRetry, 
  isTypingFinished = false 
}: Props) {
  const [visible, setVisible] = useState<string[]>([]);
  
  // ✅ TRUCO DE EXPERTO:
  // Guardamos onDone en una referencia para poder llamarlo
  // sin que obligue al useEffect a reiniciarse cuando el padre se actualiza.
  const onDoneRef = useRef(onDone);

  // Mantenemos la referencia actualizada siempre
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (!recommendations?.length) return;

    // Preparamos los textos finales
    const texts = recommendations.map((r) => (r.explanation ?? "").trim());
    
    // Inicializamos vacíos
    setVisible(texts.map(() => ""));

    let bandIdx = 0;
    let charIdx = 0;

    const interval = setInterval(() => {
      const full = texts[bandIdx] ?? "";
      const ch = full[charIdx];

      // Terminó este item (banda actual)
      if (ch == null) {
        bandIdx++;
        charIdx = 0;

        // Terminaron TODAS las bandas
        if (bandIdx >= texts.length) {
          clearInterval(interval);
          // ✅ Llamamos a la referencia, NO a la prop directa
          onDoneRef.current?.();
        }
        return;
      }

      // Agregamos un caracter
      setVisible((prev) => {
        const next = [...prev];
        // Protección extra por si el array cambia muy rápido
        if (!next[bandIdx] && charIdx === 0) next[bandIdx] = "";
        next[bandIdx] = (next[bandIdx] ?? "") + ch;
        return next;
      });

      charIdx++;
    }, 12); // Velocidad de escritura

    return () => clearInterval(interval);
    
    // ✅ CLAVE: Quitamos 'onDone' de las dependencias.
    // Solo se reinicia si CAMBIAN las recomendaciones.
  }, [recommendations]); 

  if (!recommendations?.length) return null;

  return (
    <section
      className="
        mt-6 w-full
        rounded-2xl
        border border-white/10
        bg-neutral-950/60
        backdrop-blur-md
        shadow-2xl
        overflow-hidden
      "
    >
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <p className="text-sm font-semibold text-white/90">Respuesta</p>

        {/* Botón de Reroll (Refresh) */}
        <button
          onClick={onRetry}
          disabled={!isTypingFinished}
          title="Generar otras bandas similares"
          className={`
            p-2 rounded-full 
            border border-white/10
            bg-white/5 
            transition-all duration-300
            flex items-center justify-center
            group
            ${!isTypingFinished 
              ? "opacity-30 cursor-not-allowed" 
              : "opacity-100 hover:bg-red-600 hover:border-red-500 cursor-pointer shadow-[0_0_10px_rgba(220,38,38,0.4)]"
            }
          `}
        >
          <FaSyncAlt 
            className={`
              text-xs text-white 
              transition-transform duration-500
              ${isTypingFinished ? "group-hover:rotate-180" : ""}
            `} 
          />
        </button>
      </div>

      <div className="px-4 py-4 max-h-[55vh] overflow-y-auto custom-scrollbar">
        <div className="space-y-5">
          {recommendations.map((r, idx) => (
            <div
              key={r.band.id ?? r.band.name ?? idx}
              className="rounded-xl border border-white/10 bg-black/30 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold text-white/90">
                  🎸 {r.band.name}
                </p>

                {r.band.links?.spotify && (
                  <a
                    href={r.band.links.spotify}
                    target="_blank"
                    rel="noreferrer"
                    className="
                      inline-flex items-center gap-2
                      text-xs font-semibold
                      text-green-400 hover:text-green-300
                      transition
                    "
                    title="Abrir en Spotify"
                  >
                    <FaSpotify className="text-base" />
                    Spotify
                  </a>
                )}
              </div>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/80">
                {/* Mostramos lo que se ha escrito hasta ahora */}
                {visible[idx] ?? ""}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}