import { Band, UserInput, RecommendationResult, LanguageCode } from "../domain/types";
import { GeminiService } from "./gemini.service";
import { cosineSimilarity, jaccardSimilarity } from "../utils/math";
import { QdrantClient } from "@qdrant/js-client-rest";

type ExplanationItem = { id: string; explanation: string };

const CONTROVERSIAL_POSER_BANDS = new Set(
  [
    "sleep token",
    "babymetal",
    "deftones",
    "slipknot",
    "limp bizkit",
    "mayhem",
    "burzum",
  ].map((s) => s.toLowerCase())
);

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

private async runAiStrategy(input: UserInput): Promise<RecommendationResult[]> {
const userProfileText = `Metal recs. Mood: ${
  input.targetMood
}. Favorites: ${input.favoriteBands.join(", ")}.`;

const userVector = await this.aiService.getEmbedding(userProfileText);

    const searchResult = await this.qdrant.search('bands', {
      vector: userVector,
      limit: 6, 
      filter: {
        must_not: [
          { key: "name", match: { any: input.favoriteBands } }
        ]
      }
    });

    if (searchResult.length === 0) return [];

    const topPicksRaw = searchResult.slice(0, 3);

    const topPicks = topPicksRaw.map(hit => ({
      band: hit.payload as unknown as Band,
      score: hit.score
    }));

    const bandsForPrompt = topPicks.map(({ band }) => {
      const nameLower = band.name.toLowerCase().trim();
      const poserRisk =
        CONTROVERSIAL_POSER_BANDS.has(nameLower) ||
        (Array.isArray((band as any).features) &&
          (band as any).features.some((f: string) =>
            String(f).toLowerCase().includes("tiktok")
          ));

      return {
        id: String((band as any).id ?? band.name),
        name: band.name,
        subgenres: (band.subgenres ?? []).slice(0, 4),
        moods: ((band as any).moods ?? []).slice(0, 4),
        features: ((band as any).features ?? []).slice(0, 6),
        description: clampText(band.description ?? "", 180),
        poserRisk,
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

    const megaPrompt = `
Eres "EL METALERO TRUE", un veterano dueño de una disquera under que huele a humedad y cebolla. Llevas chaleco de parches y odias lo moderno.

IDIOMA OBLIGATORIO: ${langInstruction}

TU MISIÓN:
Generar una mini-explicación para una lista de bandas recomendadas basándote en el mood y favoritos del usuario.

MANDAMIENTOS ABSOLUTOS:
1. PRIORIDAD TOTAL AL PEDIDO: Si el usuario pide "voz femenina", "lento", o "black metal", TU EXPLICACIÓN DEBE CONFIRMAR QUE LA BANDA TIENE ESO.
2. CERO CONTRADICCIONES: Prohibido decir "Sé que querías X, pero tomá Y".
3. ANTI-POSER: Si detectas vibra TikTok/viral, meté "poser" con sarcasmo.
4. ESTILO: Usá jerga: riffs, breakdown, blast beats, podrido, satánico, gutural.
5. FORMATO: JSON puro.
6. RESPETO: NO OFENDAS al usuario ni a sus gustos. Si el usuario busca voz femenina, no digas "DEJATE DE JODER". Tene en que el usuario es metalero y busca música, es el usuario del sistema y hay que respetarlo.

RESTRICCIONES:
- Máximo 2 oraciones por banda.
- Máximo 220 caracteres.
- NO repitas el nombre de la banda.

FORMATO DE SALIDA (JSON ARRAY):
[ { "id": "<id>", "explanation": "<texto>" } ]

DATOS DEL USUARIO:
- Mood Actual (LO MÁS IMPORTANTE): ${input.targetMood}
- Favoritos (Solo para contexto/comparación): ${input.favoriteBands.join(", ")}

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
        es: "Riffs brutales para tu mood. Dale play.",
        en: "Brutal riffs for your mood. Just play it.",
        it: "Riffs brutali per il tuo umore. Ascolta.",
        de: "Brutale Riffs für deine Stimmung.",
        pt: "Riffs brutais para o seu humor."
      };
      
      const explanation = explanationById.get(id) ?? fallbackMap[input.language] ?? fallbackMap['es'];

      return {
        band: bandData,
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

    const response = await this.qdrant.scroll('bands', {
      limit: 50, 
      with_vector: false,
      with_payload: true,
      filter: {
        should: shouldConditions,
        must_not: [
          { key: "name", match: { any: input.favoriteBands } } 
        ]
      }
    });

    const scoredCandidates = response.points.map(record => {
      const bandData = record.payload as unknown as Band;
      
      const bandTags = [
        ...(bandData.subgenres || []), 
        ...(bandData.moods || []),
        ...(bandData.features || [])
      ];

      const score = jaccardSimilarity(keywords, bandTags);

      return {
        band: bandData,
        score: score
      };
    });

    const topPicks = scoredCandidates
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const staticExplanation = OFFLINE_MESSAGES[input.language] ?? OFFLINE_MESSAGES['es'];

    return topPicks.map(item => {
      const { embedding, ...bandData } = item.band as any;
      return {
        band: bandData,
        score: item.score,
        explanation: `${staticExplanation} (${item.band.subgenres.slice(0, 2).join(", ")}).`,
      };
    });
  }
}