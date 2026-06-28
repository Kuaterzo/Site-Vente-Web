import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canSeePrice } from "@/lib/pricing";
import { ProductCard, type ProductCardData } from "@/components/product-card";

// Recherche plein texte PostgreSQL (config 'french' : stemming + ranking) sur
// nom/description/marque, complétée d'un ILIKE sur référence/SKU (les références
// type "MIR-P400" se tokenisent mal en full-text).
async function searchProductIds(query: string): Promise<string[]> {
  const like = `%${query}%`;
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT p.id,
      ts_rank(
        to_tsvector('french',
          coalesce(p.name,'') || ' ' || coalesce(p.description,'') || ' ' || coalesce(p.brand,'')),
        websearch_to_tsquery('french', ${query})
      ) AS rank
    FROM "Product" p
    WHERE to_tsvector('french',
            coalesce(p.name,'') || ' ' || coalesce(p.description,'') || ' ' || coalesce(p.brand,''))
          @@ websearch_to_tsquery('french', ${query})
      OR p."supplierRef" ILIKE ${like}
      OR p.name ILIKE ${like}
      OR EXISTS (
        SELECT 1 FROM "ProductVariant" v WHERE v."productId" = p.id AND v.sku ILIKE ${like}
      )
    ORDER BY rank DESC
    LIMIT 60`;
  return rows.map((r) => r.id);
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const session = await auth();
  const query = (q ?? "").trim();

  let products: ProductCardData[] = [];
  if (query) {
    const ids = await searchProductIds(query);
    const found = await prisma.product.findMany({
      where: { id: { in: ids } },
      include: { variants: { orderBy: { priceHt: "asc" } } },
    });
    // Conserve l'ordre de pertinence renvoyé par la requête full-text
    const byId = new Map(found.map((p) => [p.id, p]));
    products = ids
      .map((id) => byId.get(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p)) as unknown as ProductCardData[];
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="font-display text-2xl font-bold">
        Recherche{query && ` : « ${query} »`}
      </h1>
      <p className="mt-1 text-sm text-ink/60">{products.length} résultat(s)</p>

      {products.length === 0 ? (
        <p className="mt-6 text-ink/60">
          {query
            ? "Aucun produit ne correspond à votre recherche."
            : "Saisissez un mot-clé ou une référence."}
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard
              key={p.slug}
              product={p}
              priceVisible={canSeePrice(p.isPublicPrice, session)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
