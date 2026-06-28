"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canBuy } from "@/lib/pricing";

// Recommande rapide : recharge les lignes d'une commande dans le panier.
export async function reorder(orderId: string) {
  const session = await auth();
  if (!canBuy(session)) return;
  const userId = session!.user.id;

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });
  if (!order) return;

  const cart =
    (await prisma.cart.findFirst({ where: { userId } })) ??
    (await prisma.cart.create({ data: { userId } }));

  for (const item of order.items) {
    await prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId: cart.id, variantId: item.variantId } },
      update: { quantity: { increment: item.quantity } },
      create: { cartId: cart.id, variantId: item.variantId, quantity: item.quantity },
    });
  }

  revalidatePath("/panier");
  redirect("/panier");
}
