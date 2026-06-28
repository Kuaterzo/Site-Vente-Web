import Stripe from "stripe";

// Client Stripe (clé serveur). Renvoie null si non configuré (dev sans clés).
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Génère un numéro de commande/facture séquentiel basé sur la date.
export function generateOrderNumber(): string {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
  const rand = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");
  return `CMD-${stamp}-${rand}`;
}
