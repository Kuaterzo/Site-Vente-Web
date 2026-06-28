import { headers } from "next/headers";

// Rate limiter en mémoire (fenêtre glissante). Suffisant pour un MVP mono/peu
// d'instances ; à remplacer par Redis si fort autoscaling horizontal.
const hits = new Map<string, number[]>();

export async function clientKey(scope: string): Promise<string> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown";
  return `${scope}:${ip}`;
}

// Renvoie true si la requête est autorisée, false si la limite est atteinte.
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}
