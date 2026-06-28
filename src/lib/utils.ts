import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formate un montant en centimes vers "12,34 €"
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function discountPercent(oldCents: number, newCents: number): number {
  if (!oldCents || oldCents <= newCents) return 0;
  return Math.round(((oldCents - newCents) / oldCents) * 100);
}
