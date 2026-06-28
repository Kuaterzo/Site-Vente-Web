"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canBuy } from "@/lib/pricing";

async function getOrCreateCart(userId: string) {
  const existing = await prisma.cart.findFirst({ where: { userId } });
  if (existing) return existing;
  return prisma.cart.create({ data: { userId } });
}

export async function addToCart(variantId: string, quantity: number) {
  const session = await auth();
  if (!canBuy(session)) {
    return { error: "Réservé aux comptes professionnels validés." };
  }
  const qty = Math.max(1, Math.floor(quantity));
  const cart = await getOrCreateCart(session!.user.id);

  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
    update: { quantity: { increment: qty } },
    create: { cartId: cart.id, variantId, quantity: qty },
  });

  revalidatePath("/panier");
  return { ok: true };
}

export async function updateCartItem(itemId: string, quantity: number) {
  const session = await auth();
  if (!canBuy(session)) return { error: "Non autorisé." };

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
  } else {
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: Math.floor(quantity) },
    });
  }
  revalidatePath("/panier");
  return { ok: true };
}

export async function removeCartItem(itemId: string) {
  const session = await auth();
  if (!canBuy(session)) return { error: "Non autorisé." };
  await prisma.cartItem.delete({ where: { id: itemId } });
  revalidatePath("/panier");
  return { ok: true };
}
