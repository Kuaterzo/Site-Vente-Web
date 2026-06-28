import type { Session } from "next-auth";

// Un pro est "validé" s'il est connecté et APPROVED (ou admin)
export function isApprovedPro(session: Session | null): boolean {
  if (!session?.user) return false;
  return session.user.role === "ADMIN" || session.user.status === "APPROVED";
}

// Le prix d'un produit est-il visible pour cette session ?
// Visible si produit "prix public" OU pro validé connecté.
export function canSeePrice(
  isPublicPrice: boolean,
  session: Session | null,
): boolean {
  return isPublicPrice || isApprovedPro(session);
}

// L'ajout au panier / commande est toujours réservé aux pros validés.
export function canBuy(session: Session | null): boolean {
  return isApprovedPro(session);
}

type Tier = { minQty: number; priceHt: number };

// Prix HT applicable selon la quantité (paliers dégressifs)
export function tierPrice(basePriceHt: number, tiers: Tier[], qty: number): number {
  const applicable = tiers
    .filter((t) => qty >= t.minQty)
    .sort((a, b) => b.minQty - a.minQty)[0];
  return applicable ? applicable.priceHt : basePriceHt;
}
