import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canSeePrice } from "@/lib/pricing";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { CatalogFilters } from "@/components/catalog-filters";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ brand?: string; sort?: string }>;
}) {
  const { slug } = await params;
  const { brand, sort } = await searchParams;
  const session = await auth();

  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const products = await prisma.product.findMany({
    where: { categoryId: category.id, ...(brand ? { brand } : {}) },
    include: { variants: { orderBy: { priceHt: "asc" } } },
  });

  // Tri appliqué côté serveur (prix du 1er conditionnement)
  const sorted = [...products].sort((a, b) => {
    const pa = a.variants[0]?.priceHt ?? 0;
    const pb = b.variants[0]?.priceHt ?? 0;
    if (sort === "price-asc") return pa - pb;
    if (sort === "price-desc") return pb - pa;
    if (sort === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  const brands = [...new Set(products.map((p) => p.brand))].sort();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="font-display text-3xl font-bold">{category.name}</h1>
      <p className="mt-1 text-sm text-ink/60">{sorted.length} produit(s)</p>

      <div className="mt-6 grid gap-8 md:grid-cols-[200px_1fr]">
        <CatalogFilters brands={brands} />
        <div>
          {sorted.length === 0 ? (
            <p className="text-ink/60">Aucun produit dans cette catégorie.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {sorted.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p as unknown as ProductCardData}
                  priceVisible={canSeePrice(p.isPublicPrice, session)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
