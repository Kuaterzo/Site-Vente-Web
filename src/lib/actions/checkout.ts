"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canBuy } from "@/lib/pricing";
import { loadCart } from "@/lib/cart-data";
import { stripe, generateOrderNumber } from "@/lib/stripe";

// Crée la commande (statut PENDING) à partir du panier, puis lance le paiement.
export async function checkout(formData: FormData) {
  const session = await auth();
  if (!canBuy(session)) redirect("/connexion?callbackUrl=/commande");
  const userId = session!.user.id;

  const cart = await loadCart(userId);
  if (cart.lines.length === 0) redirect("/panier");

  const addressId = (formData.get("addressId") as string) || null;
  const number = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      number,
      userId,
      addressId,
      status: "PENDING",
      totalHt: cart.totalHt,
      totalVat: cart.totalVat,
      totalTtc: cart.totalTtc,
      items: {
        create: cart.lines.map((l) => ({
          variantId: l.variantId,
          productName: l.productName,
          packaging: l.packaging,
          unitPriceHt: l.unitPriceHt,
          vatRate: l.vatRate,
          quantity: l.quantity,
        })),
      },
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  // Paiement Stripe si configuré ; sinon, validation directe (dev/démo).
  if (stripe) {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "sepa_debit"],
      line_items: cart.lines.map((l) => ({
        quantity: l.quantity,
        price_data: {
          currency: "eur",
          unit_amount: l.unitPriceHt + Math.round((l.unitPriceHt * l.vatRate) / 100),
          product_data: { name: `${l.productName} — ${l.packaging}` },
        },
      })),
      success_url: `${baseUrl}/commande/confirmee?order=${order.id}`,
      cancel_url: `${baseUrl}/panier`,
      metadata: { orderId: order.id },
    });
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSession: checkoutSession.id },
    });
    redirect(checkoutSession.url!);
  }

  // Fallback démo : on marque payé et on génère la facture immédiatement.
  await markOrderPaid(order.id);
  redirect(`/commande/confirmee?order=${order.id}`);
}

// Passe une commande en payée + crée la facture (idempotent).
export async function markOrderPaid(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { invoice: true, items: true },
  });
  if (!order || order.status === "PAID") return;

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: "PAID" } });
    // Décrément du stock
    for (const it of order.items) {
      await tx.productVariant.update({
        where: { id: it.variantId },
        data: { stock: { decrement: it.quantity } },
      });
    }
    if (!order.invoice) {
      await tx.invoice.create({
        data: { orderId, number: order.number.replace("CMD", "FAC") },
      });
    }
    // Vide le panier
    const cart = await tx.cart.findFirst({ where: { userId: order.userId } });
    if (cart) await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
  });
}
