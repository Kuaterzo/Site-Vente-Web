import { prisma } from "@/lib/prisma";
import { tierPrice } from "@/lib/pricing";

export type CartLine = {
  itemId: string;
  variantId: string;
  productName: string;
  packaging: string;
  brand: string;
  quantity: number;
  unitPriceHt: number;
  vatRate: number;
  lineHt: number;
  stock: number;
};

export type CartSummary = {
  lines: CartLine[];
  totalHt: number;
  totalVat: number;
  totalTtc: number;
};

// Charge le panier de l'utilisateur et applique les paliers de prix.
export async function loadCart(userId: string): Promise<CartSummary> {
  const cart = await prisma.cart.findFirst({
    where: { userId },
    include: {
      items: {
        include: {
          variant: {
            include: { product: true, priceTiers: true },
          },
        },
      },
    },
  });

  const lines: CartLine[] = [];
  let totalHt = 0;
  let totalVat = 0;

  for (const item of cart?.items ?? []) {
    const v = item.variant;
    const tiers = v.priceTiers.map((t) => ({ minQty: t.minQty, priceHt: t.priceHt }));
    const unit = tierPrice(v.priceHt, tiers, item.quantity);
    const lineHt = unit * item.quantity;
    totalHt += lineHt;
    totalVat += Math.round((lineHt * v.vatRate) / 100);
    lines.push({
      itemId: item.id,
      variantId: v.id,
      productName: v.product.name,
      packaging: v.packaging,
      brand: v.product.brand,
      quantity: item.quantity,
      unitPriceHt: unit,
      vatRate: v.vatRate,
      lineHt,
      stock: v.stock,
    });
  }

  return { lines, totalHt, totalVat, totalTtc: totalHt + totalVat };
}
