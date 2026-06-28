"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Accès refusé");
}

// Validation / refus d'un compte pro (vérification SIRET/KBIS).
export async function setAccountStatus(
  userId: string,
  status: "APPROVED" | "REJECTED" | "PENDING",
) {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { status } });
  revalidatePath("/admin/comptes");
}

// Active/désactive l'affichage "prix public" d'un produit.
export async function togglePublicPrice(productId: string, value: boolean) {
  await requireAdmin();
  await prisma.product.update({ where: { id: productId }, data: { isPublicPrice: value } });
  revalidatePath("/admin/produits");
}

// Mise à jour du stock d'un conditionnement.
export async function updateStock(variantId: string, stock: number) {
  await requireAdmin();
  await prisma.productVariant.update({
    where: { id: variantId },
    data: { stock: Math.max(0, Math.floor(stock)) },
  });
  revalidatePath("/admin/produits");
}

// Changement de statut d'une commande.
export async function setOrderStatus(
  orderId: string,
  status: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED",
) {
  await requireAdmin();
  await prisma.order.update({ where: { id: orderId }, data: { status } });
  revalidatePath("/admin/commandes");
}
