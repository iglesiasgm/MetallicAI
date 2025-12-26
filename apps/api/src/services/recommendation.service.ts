import { Band, UserInput, RecommendationResult } from "../domain/types";
import { GeminiService } from "./gemini.service";
import { cosineSimilarity, jaccardSimilarity } from "../utils/math";

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
  constructor(private aiService: GeminiService, private catalog: Band[]) {}

  async getRecommendations(input: UserInput): Promise<RecommendationResult[]> {
    try {
      console.log("Trying AI-based recommendation strategy");
      return await this.runAiStrategy(input);
    } catch (error) {
      console.error("AI recommendation failed, trying Jaccard strategy", error);
      return this.runJaccardStrategy(input);
    }
  }

  private async runAiStrategy(input: UserInput): Promise<RecommendationResult[]> {
    const userProfileText = `Metal recs. Mood: ${
      input.targetMood
    }. Favorites: ${input.favoriteBands.join(", ")}.`;

    const userVector = await this.aiService.getEmbedding(userProfileText);

    const normalizedFavorites = input.favoriteBands.map((b) =>
      b.toLowerCase().trim()
    );

    const scoredBands = this.catalog.map((band) => {
      if (!band.embedding) return { band, score: 0 };
      const similarity = cosineSimilarity(userVector, band.embedding);
      return { band, score: similarity };
    });

    const filteredBands = scoredBands.filter((item) => {
      const bandName = item.band.name.toLowerCase().trim();
      return !normalizedFavorites.includes(bandName);
    });

    const topPicks = filteredBands
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    if (topPicks.length === 0) return [];

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

    const megaPrompt = `
Eres "EL METALERO TRUE" (Latam neutro), como si fueras un metalero veterano dueño de una disquera que huele a cebolla.
Hablas en ESPAÑOL (Latam neutro), tuteas, y recomendás metal con actitud real.
Sos anti-poser: si detectas vibra poser/tik tok/“me hice metalero ayer”, lo marcás con sarcasmo leve usando la palabra "poser".
Pero: nada de amenazas, nada de discriminación a grupos protegidos, nada de política. Solo bardo metalero y música, aunque puedes hacer uso del GORE y del SATANISMO, eso está más que permitido.

OBJETIVO:
Generá una mini-explicación por cada banda recomendada (3). El nombre de la banda ya se muestra aparte: NO lo repitas.

REGLAS DE ESTILO:
- Español (Latam neutro), tuteo.
- Soná humano, metalero, con jerga: riffs, breakdown, oscuro, épico, crudo, blast beats, guturales, sucio, asqueroso, distorsionado, voces rasposas, satanismo etc.
- Máximo 2 oraciones por explicación.
- Máximo 220 caracteres por explicación.
- Sin listas, sin markdown, sin comillas largas.
- Tenés que conectar con el mood del usuario.
- Si "poserRisk" es true o si la banda es muy polémica/mainstream/trendy: meté "poser" en la explicación (1 vez) con bardo leve.

FORMATO DE SALIDA (OBLIGATORIO):
Devolvé SOLO un JSON válido, sin texto extra:
[
  { "id": "<id>", "explanation": "<texto>" },
  ...
]

EJEMPLOS (imitá este estilo):
Usuario: "riffs pesados", favoritos: Metallica, Pantera
Banda: (poserRisk:false)
Salida: [{"id":"x","explanation":"Si querés riffs como martillo y groove asesino, esto te pega directo al pecho. Subí el volumen y listo."}]

Usuario: "voz femenina épica", favoritos: Black Sabbath
Banda: (poserRisk:false)
Salida: [{"id":"x","explanation":"Épica cinematográfica con voces que te erizan y riffs con peso. Ideal para sentirte en una batalla, sin pose."}]

Usuario: "algo viral", favoritos: Deftones
Banda: (poserRisk:true)
Salida: [{"id":"x","explanation":"Si venís por lo viral, no seas poser: acá hay atmósfera oscura y emoción real. Dale play y bancate la intensidad."}]

DATOS DEL USUARIO:
- mood/búsqueda: ${input.targetMood}
- favoritos: ${input.favoriteBands.join(", ")}

BANDAS A EXPLICAR (usa estos datos, pero NO repitas el nombre):
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
      const fallback = `Riffs y actitud para tu mood; si sos poser te vas a asustar. Dale play y bancala.`;
      const explanation = explanationById.get(id) ?? fallback;

      return {
        band: bandData,
        score,
        explanation: explanation.trim(),
      };
    });
  }

  private runJaccardStrategy(input: UserInput): RecommendationResult[] {
    const userTags = new Set<string>();

    input.favoriteBands.forEach((favName) => {
      const found = this.catalog.find(
        (b) => b.name.toLowerCase() === favName.toLowerCase().trim()
      );
      if (found) {
        found.subgenres.forEach((s) => userTags.add(s));
        found.moods.forEach((m) => userTags.add(m));
      }
    });

    input.targetMood.split(" ").forEach((word) => {
      if (word.length > 3) userTags.add(word);
    });

    const userTagsArray = Array.from(userTags);
    const normalizedFavorites = input.favoriteBands.map((b) => b.toLowerCase().trim());

    const scoredBands = this.catalog.map((band) => {
      const bandTags = [...band.subgenres, ...band.moods];
      if (band.features) bandTags.push(...band.features);

      const score = jaccardSimilarity(userTagsArray, bandTags);
      return { band, score };
    });

    const topPicks = scoredBands
      .filter((item) => !normalizedFavorites.includes(item.band.name.toLowerCase().trim()))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return topPicks.map((item) => {
      const { embedding, ...bandData } = item.band as any;
      
      const staticExplanation = `Recomendada matemáticamente por coincidencia de estilos (${item.band.subgenres.join(", ")}).`;

      return {
        band: bandData,
        score: item.score,
        explanation: staticExplanation,
      };
    });
  }
}