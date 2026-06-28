import Link from "next/link";
import { PriceDisplay } from "./price-display";
import { PublicPriceBadge, StockBadge } from "./badges";

type CardVariant = {
  priceHt: number;
  oldPriceHt: number | null;
  stock: number;
  packaging: string;
};

export type ProductCardData = {
  slug: string;
  name: string;
  brand: string;
  supplierRef: string | null;
  imageUrl: string | null;
  isPublicPrice: boolean;
  variants: CardVariant[];
};

// Carte produit dense : marque, nom, référence, conditionnement, stock, prix.
export function ProductCard({
  product,
  priceVisible,
}: {
  product: ProductCardData;
  priceVisible: boolean;
}) {
  const v = product.variants[0];
  return (
    <Link
      href={`/produit/${product.slug}`}
      className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square bg-page">
        {/* Visuel produit (placeholder si absent) */}
        <div className="flex h-full items-center justify-center text-ink/20">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <span className="font-display text-4xl">{product.brand}</span>
          )}
        </div>
        {product.isPublicPrice && (
          <div className="absolute left-2 top-2">
            <PublicPriceBadge />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          {product.brand}
        </p>
        <p className="line-clamp-2 text-sm font-medium text-ink group-hover:text-accent">
          {product.name}
        </p>
        {product.supplierRef && (
          <p className="text-xs text-ink/50">Réf. {product.supplierRef}</p>
        )}
        {v && <p className="text-xs text-ink/50">Dès {v.packaging}</p>}
        <div className="mt-auto pt-2">
          {v && <StockBadge stock={v.stock} />}
          <div className="mt-1">
            {v && (
              <PriceDisplay
                priceHt={v.priceHt}
                oldPriceHt={v.oldPriceHt}
                visible={priceVisible}
              />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
