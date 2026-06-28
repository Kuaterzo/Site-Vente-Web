"use client";

import { useTransition } from "react";
import { setOrderStatus } from "@/lib/actions/admin";

const OPTIONS = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
const LABEL: Record<string, string> = {
  PENDING: "En attente",
  PAID: "Payée",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

export function OrderStatusSelect({
  orderId,
  current,
}: {
  orderId: string;
  current: string;
}) {
  const [pending, start] = useTransition();
  return (
    <select
      defaultValue={current}
      disabled={pending}
      onChange={(e) =>
        start(() => setOrderStatus(orderId, e.target.value as (typeof OPTIONS)[number]))
      }
      className="rounded border border-line px-2 py-1 text-sm"
    >
      {OPTIONS.map((o) => (
        <option key={o} value={o}>{LABEL[o]}</option>
      ))}
    </select>
  );
}
