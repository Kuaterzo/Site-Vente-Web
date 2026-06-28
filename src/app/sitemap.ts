import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

// Généré à la requête (accès DB) — évite l'appel base pendant le build.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ select: { slug: true } }),
    prisma.product.findMany({ select: { slug: true, updatedAt: true } }),
  ]);

  return [
    { url: base, priority: 1 },
    { url: `${base}/inscription` },
    ...categories.map((c) => ({ url: `${base}/categorie/${c.slug}` })),
    ...products.map((p) => ({ url: `${base}/produit/${p.slug}`, lastModified: p.updatedAt })),
  ];
}
