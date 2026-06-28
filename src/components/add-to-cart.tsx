"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/actions/cart";
import { formatPrice } from "@/lib/utils";
import { PriceDisplay } from "./price-display";

type Variant = {
  id: string;
  packaging: string;
  priceHt: number;
  oldPriceHt: number | null;
  stock: number;
  tiers: { minQty: number; priceHt: number }[];
};

// Sélecteur de conditionnement + quantité + ajout panier.
export function AddToCart({
  variants,
  priceVisible,
  canBuy,
}: {
  variants: Variant[];
  priceVisible: boolean;
  canBuy: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(variants[0]?.id);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const variant = variants.find((v) => v.id === selected) ?? variants[0];
  if (!variant) return null;

  // Prix applicable selon paliers
  const applicable = variant.tiers
    .filter((t) => qty >= t.minQty)
    .sort((a, b) => b.minQty - a.minQty)[0];
  const unitPrice = applicable ? applicable.priceHt : variant.priceHt;

  const submit = () => {
    setMsg(null);
    startTransition(async () => {
      const res = await addToCart(variant.id, qty);
      if (res?.error) setMsg(res.error);
      else {
        setMsg("Ajouté au panier ✓");
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-4">
      {variants.length > 1 && (
        <div>
          <label className="mb-1 block text-sm font-medium">Conditionnement</label>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelected(v.id)}
                className={`rounded-md border px-3 py-1.5 text-sm ${
                  v.id === selected
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-line hover:border-accent"
                }`}
              >
                {v.packaging}
              </button>
            ))}
          </div>
        </div>
      )}

      <PriceDisplay
        priceHt={unitPrice}
        oldPriceHt={variant.oldPriceHt}
        visible={priceVisible}
        size="lg"
      />

      {priceVisible && variant.tiers.length > 0 && (
        <div className="rounded-md border border-line bg-page p-3 text-sm">
          <p className="mb-1 font-medium">Tarifs dégressifs</p>
          <ul className="space-y-0.5 text-ink/70">
            <li>1+ : {formatPrice(variant.priceHt)} HT</li>
            {variant.tiers
              .sort((a, b) => a.minQty - b.minQty)
              .map((t) => (
                <li key={t.minQty}>
                  {t.minQty}+ : {formatPrice(t.priceHt)} HT
                </li>
              ))}
          </ul>
        </div>
      )}

      {canBuy ? (
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
            className="w-20 rounded-md border border-line px-3 py-2"
            aria-label="Quantité"
          />
          <button onClick={submit} disabled={pending} className="btn-accent flex-1">
            {pending ? "Ajout…" : "Ajouter au panier"}
          </button>
        </div>
      ) : (
        <p className="rounded-md border border-line bg-page p-3 text-sm text-ink/70">
          L'ajout au panier est réservé aux comptes professionnels validés.{" "}
          <a href="/connexion" className="text-accent underline">
            Connectez-vous
          </a>
          .
        </p>
      )}

      {msg && <p className="text-sm font-medium text-stock">{msg}</p>}
    </div>
  );
}
