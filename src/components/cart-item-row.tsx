"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCartItem, removeCartItem } from "@/lib/actions/cart";
import { formatPrice } from "@/lib/utils";
import type { CartLine } from "@/lib/cart-data";

export function CartItemRow({ line }: { line: CartLine }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const change = (qty: number) =>
    startTransition(async () => {
      await updateCartItem(line.itemId, qty);
      router.refresh();
    });

  const remove = () =>
    startTransition(async () => {
      await removeCartItem(line.itemId);
      router.refresh();
    });

  return (
    <tr className="border-b border-line">
      <td className="py-3">
        <p className="text-xs font-semibold uppercase text-primary">{line.brand}</p>
        <p className="font-medium">{line.productName}</p>
        <p className="text-sm text-ink/50">{line.packaging}</p>
        {line.quantity > line.stock && (
          <p className="text-xs font-medium text-promo">
            Stock insuffisant ({line.stock} dispo)
          </p>
        )}
      </td>
      <td className="py-3 text-right">{formatPrice(line.unitPriceHt)}</td>
      <td className="py-3">
        <div className="flex items-center justify-center gap-1">
          <button onClick={() => change(line.quantity - 1)} disabled={pending} className="btn-outline h-8 w-8 p-0">−</button>
          <span className="w-8 text-center">{line.quantity}</span>
          <button onClick={() => change(line.quantity + 1)} disabled={pending} className="btn-outline h-8 w-8 p-0">+</button>
        </div>
      </td>
      <td className="py-3 text-right font-medium">{formatPrice(line.lineHt)}</td>
      <td className="py-3 text-right">
        <button onClick={remove} disabled={pending} className="text-sm text-promo hover:underline">
          Retirer
        </button>
      </td>
    </tr>
  );
}
