export function PromoBadge({ percent }: { percent: number }) {
  return (
    <span className="rounded bg-promo px-1.5 py-0.5 text-xs font-bold text-white">
      −{percent} %
    </span>
  );
}

export function PublicPriceBadge() {
  return (
    <span className="rounded border border-line bg-page px-1.5 py-0.5 text-xs font-medium text-ink/70">
      Prix public
    </span>
  );
}

export function StockBadge({ stock }: { stock: number }) {
  if (stock > 0)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-stock">
        <span className="h-2 w-2 rounded-full bg-stock" /> En stock
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-ink/40">
      <span className="h-2 w-2 rounded-full bg-ink/30" /> Sur commande
    </span>
  );
}
