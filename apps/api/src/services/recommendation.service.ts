import { Band, UserInput, RecommendationResult, LanguageCode } from "../domain/types";
import { GeminiService } from "./gemini.service";
import { jaccardSimilarity } from "../utils/math";
import { QdrantClient } from "@qdrant/js-client-rest";

type ExplanationItem = { id: string; explanation: string };

const OFFLINE_MESSAGES: Record<LanguageCode, string> = {
  es: "Recomendación matemática por coincidencia de estilos (Modo Offline).",
  en: "Mathematical recommendation based on style matching (Offline Mode).",
  it: "Raccomandazione basata sulla corrispondenza di stile (Modalità Offline).",
  de: "Mathematische Empfehlung basierend auf Stilübereinstimmung (Offline-Modus).",
  pt: "Recomendação matemática baseada em correspondência de estilo (Modo Offline)."
};

function stripCodeFences(s: string) {
  return s.replace(/```json/gi, "```").replace(/```/g, "").trim();
}

function extractJsonArray(s: string) {
  const cleaned = stripCodeFences(s);
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return cleaned;
  return cleaned.slice(start, end + 1);
}

function safeParseExplanationArray(raw: string): ExplanationItem[] | null {
  try {
    const jsonText = extractJsonArray(raw);
    const parsed = JSON.parse(jsonText);
    if (!Array.isArray(parsed)) return null;

    const items: ExplanationItem[] = [];
    for (const it of parsed) {
      if (!it) continue;
      const id = String((it as any).id ?? "");
      const explanation = String((it as any).explanation ?? "").trim();
      if (!id || !explanation) continue;
      items.push({ id, explanation });
    }
    return items.length ? items : null;
  } catch {
    return null;
  }
}

function clampText(s: string, maxChars: number) {
  const t = (s ?? "").trim();
  if (t.length <= maxChars) return t;
  return t.slice(0, maxChars - 1).trimEnd() + "…";
}

export class RecommendationService {
  constructor(private aiService: GeminiService, private qdrant: QdrantClient) {}

  async getRecommendations(input: UserInput): Promise<RecommendationResult[]> {
    try {
      console.log("Trying AI-based recommendation strategy");
      return await this.runAiStrategy(input);
    } catch (error) {
      console.error("AI recommendation failed, trying Jaccard fallback strategy", error);
      return this.runJaccardStrategy(input);
    }
  }

  private sortCandidates(candidates: any[], mode: 'popular' | 'underground') {
    return candidates.sort((a, b) => {
      const popA = (a.payload?.popularity ?? a.band?.popularity) || 0;
      const popB = (b.payload?.popularity ?? b.band?.popularity) || 0;

      if (mode === 'underground') {
        return popA - popB;
      }
      return popB - popA;
    });
  }

  private async runAiStrategy(input: UserInput): Promise<RecommendationResult[]> {
    const embeddingText = input.targetMood;
    const userVector = await this.aiService.getEmbedding(embeddingText);
    const mode = input.popularityMode || 'popular';

    const baseMustNot = [{ key: "name", match: { any: input.favoriteBands } }];

    let finalCandidates: any[] = [];

    if (input.subgenrePreferences && input.subgenrePreferences.length > 0) {
        
        const strictFilter = {
            must_not: baseMustNot,
            must: [{ key: "subgenres", match: { any: input.subgenrePreferences } }]
        };

        const strictResult = await this.qdrant.search('bands', {
            vector: userVector,
            limit: 10,
            with_payload: true,
            filter: strictFilter
        });

        const sortedStrict = this.sortCandidates(strictResult, mode);

        if (sortedStrict.length < 3) {
            const broadFilter = { must_not: baseMustNot };
            
            const broadResult = await this.qdrant.search('bands', {
                vector: userVector,
                limit: 10, 
                with_payload: true,
                filter: broadFilter
            });

            const sortedBroad = this.sortCandidates(broadResult, mode);

            finalCandidates = [...sortedStrict];
            const existingNames = new Set(finalCandidates.map(c => c.payload.name));

            for (const cand of sortedBroad) {
                if (finalCandidates.length >= 3) break; // Ya tenemos 3
                if (!existingNames.has(cand.payload.name)) {
                    finalCandidates.push(cand);
                }
            }
        } else {
            finalCandidates = sortedStrict.slice(0, 3);
        }

    } else {
        const result = await this.qdrant.search('bands', {
            vector: userVector,
            limit: 15,
            with_payload: true,
            filter: { must_not: baseMustNot }
        });
        finalCandidates = this.sortCandidates(result, mode).slice(0, 3);
    }
    
    if (finalCandidates.length === 0) return [];

    const topPicks = finalCandidates.map(hit => ({
      band: hit.payload as unknown as Band,
      score: hit.score
    }));

    const bandsForPrompt = topPicks.map(({ band }) => {
      return {
        id: String((band as any).id ?? band.name),
        name: band.name,
        subgenres: (band.subgenres ?? []).slice(0, 4),
        moods: ((band as any).moods ?? []).slice(0, 4),
        description: clampText(band.description ?? "", 180),
        popularityScore: (band as any).popularity || 0,
      };
    });

    const languageInstructionMap: Record<LanguageCode, string> = {
      es: "ESPAÑOL (Latam neutro), usa jerga metalera en español (bardo, riffs).",
      en: "ENGLISH, use metalhead slang (riffs, shredding, brutal).",
      it: "ITALIANO, usa slang metal (pesante, oscuro).",
      de: "DEUTSCH, use metal slang.",
      pt: "PORTUGUÊS, use gírias de metal."
    };

    const langInstruction = languageInstructionMap[input.language];
    const subgenresText = input.subgenrePreferences?.length 
        ? input.subgenrePreferences.join(", ") 
        : "Cualquiera";

    const megaPrompt = `
Eres "EL METALERO TRUE", un veterano dueño de una disquera.
IDIOMA OBLIGATORIO: ${langInstruction}

CONTEXTO DEL USUARIO:

- Mood deseado: ${input.targetMood}
- Preferencia de Escena: ${mode.toUpperCase()} (Quiere bandas ${mode === 'underground' ? 'desconocidas/culto' : 'famosas/clásicos'}).
- Favoritos: ${input.favoriteBands.join(", ")}
- Subgéneros preferidos: ${subgenresText}

TU MISIÓN:
Explicar estas 3 recomendaciones. Debes cruzar la preferencia del usuario con el 'popularityScore' real de la banda.

REGLAS DE JUICIO (Basadas en popularityScore 0-100):
1. SI EL USUARIO PIDIÓ UNDERGROUND y LAS RECOMENDACIONES SON UNDERGROUND, vendelo como una joya oculta, pero si alguna es popular, reconocelo.
2. SI EL USUARIO PIDIÓ POPULAR y LAS RECOMENDACIONES SON POPULARES, enfatizá su legado y hits, si alguna es underground, mencioná que es una sorpresa.
USA TU CRITERIO PARA ADAPTARTE A CADA CASO Y DEFINIR EN BASE A POPULARIDAD Y LEGADO SI UNA BANDA ES MAS O MENOS POPULAR O UNDERGROUND.

MANDAMIENTOS ABSOLUTOS:

1. PRIORIDAD TOTAL AL PEDIDO: Si el usuario pide "voz femenina", "lento", o "black metal", TU EXPLICACIÓN DEBE CONFIRMAR QUE LA BANDA TIENE ESO.
2. CERO CONTRADICCIONES: Prohibido decir "Sé que querías X, pero tomá Y".
3. ESTILO: Usá jerga: riffs, breakdown, blast beats, podrido, satánico, gutural.
4. FORMATO: JSON puro.
5. RESPETO: NO OFENDAS al usuario ni a sus gustos. Si el usuario busca voz femenina, no digas "DEJATE DE JODER". Tene en que el usuario es metalero y busca música, es el usuario del sistema y hay que respetarlo.

RESTRICCIONES:

- Máximo 2 oraciones por banda.
- Máximo 220 caracteres.
- NO repitas el nombre de la banda.

FORMATO DE SALIDA (JSON ARRAY):
[ { "id": "<id>", "explanation": "<texto>" } ]

BANDAS A EXPLICAR:
${JSON.stringify(bandsForPrompt)}
    `.trim();

    const raw = await this.aiService.generateExplanation(megaPrompt);
    const parsed = safeParseExplanationArray(raw);
    const explanationById = new Map<string, string>();
    if (parsed) {
      for (const it of parsed) explanationById.set(it.id, it.explanation);
    }

    return topPicks.map(({ band, score }) => {
      const { embedding, ...bandData } = band as any;
      const id = String((band as any).id ?? band.name);
      
      const fallbackMap: Record<LanguageCode, string> = {
        es: "Riffs brutales para tu mood.",
        en: "Brutal riffs for your mood.",
        it: "Riffs brutali.",
        de: "Brutale Riffs.",
        pt: "Riffs brutais."
      };
      
      const explanation = explanationById.get(id) ?? fallbackMap[input.language] ?? fallbackMap['es'];

      return {
        band: {
            ...bandData,
            imageUrl: bandData.imageUrl || null,
            popularity: bandData.popularity || 0
        },
        score,
        explanation: explanation.trim(),
      };
    });
  }

  private async runJaccardStrategy(input: UserInput): Promise<RecommendationResult[]> {
    const keywords = input.targetMood.split(" ")
      .filter(w => w.length > 3)
      .map(w => w.toLowerCase());

    const shouldConditions = keywords.flatMap(k => [
        { key: "subgenres", match: { text: k } },
        { key: "moods", match: { text: k } }
    ]);

    if (shouldConditions.length === 0) return [];

    const baseMustNot = [{ key: "name", match: { any: input.favoriteBands } }];
    const mode = input.popularityMode || 'popular';
    let finalCandidates: any[] = [];

    const processJaccard = (points: any[]) => {
        return points.map(record => {
            const bandData = record.payload as unknown as Band;
            const bandTags = [...(bandData.subgenres || []), ...(bandData.moods || []), ...(bandData.features || [])];
            return { band: bandData, score: jaccardSimilarity(keywords, bandTags) };
        }).sort((a, b) => b.score - a.score);
    };

    if (input.subgenrePreferences && input.subgenrePreferences.length > 0) {
        const strictFilter = {
            should: shouldConditions,
            must_not: baseMustNot,
            must: [{ key: "subgenres", match: { any: input.subgenrePreferences } }]
        };
        
        const strictResponse = await this.qdrant.scroll('bands', { limit: 50, with_payload: true, filter: strictFilter });
        const strictScored = processJaccard(strictResponse.points);
        const strictSorted = this.sortCandidates(strictScored.slice(0, 15), mode);

        if (strictSorted.length < 3) {
             const broadFilter = {
                should: shouldConditions,
                must_not: baseMustNot
            };
            const broadResponse = await this.qdrant.scroll('bands', { limit: 50, with_payload: true, filter: broadFilter });
            const broadScored = processJaccard(broadResponse.points);
            const broadSorted = this.sortCandidates(broadScored.slice(0, 15), mode);

            finalCandidates = [...strictSorted];
            const existingNames = new Set(finalCandidates.map(c => c.band.name));
            
            for (const item of broadSorted) {
                if (finalCandidates.length >= 3) break;
                if (!existingNames.has(item.band.name)) {
                    finalCandidates.push(item);
                }
            }
        } else {
            finalCandidates = strictSorted.slice(0, 3);
        }
    } else {
        const filter = { should: shouldConditions, must_not: baseMustNot };
        const response = await this.qdrant.scroll('bands', { limit: 50, with_payload: true, filter });
        const scored = processJaccard(response.points);
        finalCandidates = this.sortCandidates(scored.slice(0, 15), mode).slice(0, 3);
    }

    const staticExplanation = OFFLINE_MESSAGES[input.language] ?? OFFLINE_MESSAGES['es'];

    return finalCandidates.map(item => {
      const { embedding, ...bandData } = item.band as any;
      return {
        band: {
            ...bandData,
            imageUrl: bandData.imageUrl || null,
            popularity: bandData.popularity || 0
        },
        score: item.score,
        explanation: `${staticExplanation} (${item.band.subgenres.slice(0, 2).join(", ")}).`,
      };
    });
  }
}