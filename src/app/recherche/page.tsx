import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canSeePrice } from "@/lib/pricing";
import { ProductCard, type ProductCardData } from "@/components/product-card";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const session = await auth();
  const query = (q ?? "").trim();

  const products = query
    ? await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { brand: { contains: query, mode: "insensitive" } },
            { supplierRef: { contains: query, mode: "insensitive" } },
            { variants: { some: { sku: { contains: query, mode: "insensitive" } } } },
          ],
        },
        include: { variants: { orderBy: { priceHt: "asc" } } },
      })
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="font-display text-2xl font-bold">
        Recherche{query && ` : « ${query} »`}
      </h1>
      <p className="mt-1 text-sm text-ink/60">{products.length} résultat(s)</p>

      {products.length === 0 ? (
        <p className="mt-6 text-ink/60">
          {query ? "Aucun produit ne correspond à votre recherche." : "Saisissez un mot-clé ou une référence."}
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p as unknown as ProductCardData}
              priceVisible={canSeePrice(p.isPublicPrice, session)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
