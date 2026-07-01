import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canSeePrice, canBuy } from "@/lib/pricing";
import { AddToCart } from "@/components/add-to-cart";
import { PublicPriceBadge, StockBadge } from "@/components/badges";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      techSheets: true,
      variants: { orderBy: { priceHt: "asc" }, include: { priceTiers: true } },
    },
  });
  if (!product) notFound();

  const priceVisible = canSeePrice(product.isPublicPrice, session);
  const variants = product.variants.map((v) => ({
    id: v.id,
    packaging: v.packaging,
    priceHt: v.priceHt,
    oldPriceHt: v.oldPriceHt,
    stock: v.stock,
    tiers: v.priceTiers.map((t) => ({ minQty: t.minQty, priceHt: t.priceHt })),
  }));
  const maxStock = Math.max(...product.variants.map((v) => v.stock), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav className="mb-4 text-sm text-ink/50">
        <Link href="/" className="hover:text-accent">Accueil</Link> /{" "}
        <Link href={`/categorie/${product.category.slug}`} className="hover:text-accent">
          {product.category.name}
        </Link>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="card flex aspect-square items-center justify-center bg-white">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" />
          ) : (
            <span className="font-display text-6xl text-ink/15">{product.brand}</span>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              {product.brand}
            </p>
            {product.isPublicPrice && <PublicPriceBadge />}
          </div>
          <h1 className="mt-1 font-display text-3xl font-bold">{product.name}</h1>
          {product.supplierRef && (
            <p className="mt-1 text-sm text-ink/50">Réf. fournisseur : {product.supplierRef}</p>
          )}
          {product.grain && (
            <p className="mt-1 text-sm text-ink/50">Grain : <span className="font-medium text-ink">{product.grain}</span></p>
          )}
          <div className="mt-2">
            <StockBadge stock={maxStock} />
          </div>

          {product.description && (
            <p className="mt-4 text-ink/80">{product.description}</p>
          )}

          <div className="mt-6">
            <AddToCart
              variants={variants}
              priceVisible={priceVisible}
              canBuy={canBuy(session)}
            />
          </div>

          {product.techSheets.length > 0 && (
            <div className="mt-6 border-t border-line pt-4">
              <p className="mb-2 text-sm font-semibold">Fiches techniques</p>
              <ul className="space-y-1 text-sm">
                {product.techSheets.map((s) => (
                  <li key={s.id}>
                    <a href={s.url} className="text-accent underline" target="_blank" rel="noopener">
                      📄 {s.label} (PDF)
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
