"use client";

import { useState, useTransition } from "react";
import { togglePublicPrice, updateStock } from "@/lib/actions/admin";

export function PublicPriceToggle({
  productId,
  initial,
}: {
  productId: string;
  initial: boolean;
}) {
  const [on, setOn] = useState(initial);
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() =>
        start(async () => {
          await togglePublicPrice(productId, !on);
          setOn(!on);
        })
      }
      disabled={pending}
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        on ? "bg-accent text-white" : "border border-line text-ink/60"
      }`}
    >
      {on ? "Prix public ✓" : "Prix masqué"}
    </button>
  );
}

export function StockInput({
  variantId,
  initial,
}: {
  variantId: string;
  initial: number;
}) {
  const [value, setValue] = useState(initial);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  return (
    <span className="inline-flex items-center gap-1">
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => { setValue(Number(e.target.value)); setSaved(false); }}
        className="w-16 rounded border border-line px-1.5 py-0.5 text-sm"
      />
      <button
        onClick={() =>
          start(async () => {
            await updateStock(variantId, value);
            setSaved(true);
          })
        }
        disabled={pending}
        className="text-xs text-accent hover:underline"
      >
        {saved ? "✓" : "OK"}
      </button>
    </span>
  );
}
