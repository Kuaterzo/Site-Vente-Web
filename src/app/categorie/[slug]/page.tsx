import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canSeePrice } from "@/lib/pricing";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { CatalogFilters } from "@/components/catalog-filters";

const PER_PAGE = 12;

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    brand?: string;
    packaging?: string;
    min?: string;
    max?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const session = await auth();

  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  // Filtres DB : catégorie + marque + conditionnement (au moins une variante).
  const products = await prisma.product.findMany({
    where: {
      categoryId: category.id,
      ...(sp.brand ? { brand: sp.brand } : {}),
      ...(sp.packaging ? { variants: { some: { packaging: sp.packaging } } } : {}),
    },
    include: { variants: { orderBy: { priceHt: "asc" } } },
  });

  // Filtre prix (sur le prix mini affiché) + tri, en mémoire (catalogue par catégorie restreint).
  const min = sp.min ? Number(sp.min) * 100 : null;
  const max = sp.max ? Number(sp.max) * 100 : null;
  const filtered = products.filter((p) => {
    const price = p.variants[0]?.priceHt ?? 0;
    if (min !== null && price < min) return false;
    if (max !== null && price > max) return false;
    return true;
  });

  filtered.sort((a, b) => {
    const pa = a.variants[0]?.priceHt ?? 0;
    const pb = b.variants[0]?.priceHt ?? 0;
    if (sp.sort === "price-asc") return pa - pb;
    if (sp.sort === "price-desc") return pb - pa;
    if (sp.sort === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  // Pagination
  const page = Math.max(1, Number(sp.page) || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Options de filtres (toutes les valeurs de la catégorie, indépendamment des filtres actifs)
  const allInCategory = await prisma.product.findMany({
    where: { categoryId: category.id },
    select: { brand: true, variants: { select: { packaging: true } } },
  });
  const brands = [...new Set(allInCategory.map((p) => p.brand))].sort();
  const packagings = [
    ...new Set(allInCategory.flatMap((p) => p.variants.map((v) => v.packaging))),
  ].sort();

  // Construit un lien de page en conservant les filtres actifs
  const pageHref = (n: number) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (v && k !== "page") q.set(k, String(v));
    q.set("page", String(n));
    return `?${q.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="font-display text-3xl font-bold">{category.name}</h1>
      <p className="mt-1 text-sm text-ink/60">{filtered.length} produit(s)</p>

      <div className="mt-6 grid gap-8 md:grid-cols-[200px_1fr]">
        <CatalogFilters brands={brands} packagings={packagings} />
        <div>
          {pageItems.length === 0 ? (
            <p className="text-ink/60">Aucun produit ne correspond à ces filtres.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {pageItems.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p as unknown as ProductCardData}
                    priceVisible={canSeePrice(p.isPublicPrice, session)}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <nav className="mt-8 flex justify-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <Link
                      key={n}
                      href={pageHref(n)}
                      className={`rounded-md px-3 py-1.5 text-sm ${
                        n === page ? "bg-accent text-white" : "border border-line hover:border-accent"
                      }`}
                    >
                      {n}
                    </Link>
                  ))}
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
