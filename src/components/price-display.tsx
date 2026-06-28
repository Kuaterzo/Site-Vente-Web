import { formatPrice, discountPercent } from "@/lib/utils";
import { PromoBadge } from "./badges";

// Affiche le prix selon la charte : orange/gras/condensé, ancien prix barré,
// ou encart "verrou" si le prix n'est pas visible.
export function PriceDisplay({
  priceHt,
  oldPriceHt,
  visible,
  size = "md",
}: {
  priceHt: number;
  oldPriceHt?: number | null;
  visible: boolean;
  size?: "md" | "lg";
}) {
  if (!visible) {
    return (
      <div className="rounded-md border border-line bg-page px-3 py-2 text-sm text-ink/60">
        🔒 Connectez-vous pour voir le tarif
      </div>
    );
  }

  const percent = oldPriceHt ? discountPercent(oldPriceHt, priceHt) : 0;
  const priceClass = size === "lg" ? "text-3xl" : "text-xl";

  return (
    <div className="flex flex-wrap items-baseline gap-2">
      {oldPriceHt && oldPriceHt > priceHt && (
        <span className="text-sm text-ink/40 line-through">
          {formatPrice(oldPriceHt)}
        </span>
      )}
      <span className={`price ${priceClass}`}>{formatPrice(priceHt)}</span>
      <span className="text-xs text-ink/50">HT</span>
      {percent > 0 && <PromoBadge percent={percent} />}
    </div>
  );
}
