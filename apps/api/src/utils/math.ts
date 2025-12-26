export function cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
        throw new Error('Vectors must be of the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
        return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function jaccardSimilarity(setA: string[], setB: string[]): number {
  const a = new Set(setA.map(s => s.toLowerCase().trim()));
  const b = new Set(setB.map(s => s.toLowerCase().trim()));

  let intersectionCount = 0;
  a.forEach(item => {
    if (b.has(item)) {
      intersectionCount++;
    }
  });

  const unionCount = a.size + b.size - intersectionCount;

  if (unionCount === 0) return 0;

  return intersectionCount / unionCount;
}