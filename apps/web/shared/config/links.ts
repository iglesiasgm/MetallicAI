export function normalizeLinks(links: any) {
  if (!links) return [];
  return Array.isArray(links) ? links : [links];
}

export function pickLink(links: any, key: "spotify" | "youtube" | "instagram") {
  const arr = normalizeLinks(links);
  return arr.find((l) => l?.[key]?.trim())?.[key] as string | undefined;
}
