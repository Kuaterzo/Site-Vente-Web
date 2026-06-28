"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Accès refusé");
}

// "12,34" ou "12.34" → 1234 centimes
function eurosToCents(v: FormDataEntryValue | null): number {
  const n = Number(String(v ?? "").replace(",", ".").trim());
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const productSchema = z.object({
  name: z.string().min(2),
  brand: z.string().min(1),
  categoryId: z.string().min(1),
  supplierRef: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

export type ProductFormState = { error?: string };

export async function saveProduct(
  productId: string | null,
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Champs produit invalides." };
  const v = parsed.data;

  const data = {
    name: v.name,
    brand: v.brand,
    categoryId: v.categoryId,
    supplierRef: v.supplierRef || null,
    description: v.description || null,
    imageUrl: v.imageUrl || null,
    isPublicPrice: formData.get("isPublicPrice") === "on",
    isFeatured: formData.get("isFeatured") === "on",
  };

  let id = productId;
  if (id) {
    await prisma.product.update({ where: { id }, data });
  } else {
    // slug unique dérivé du nom
    let slug = slugify(v.name);
    if (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }
    const created = await prisma.product.create({ data: { ...data, slug } });
    id = created.id;
  }

  revalidatePath("/admin/produits");
  redirect(`/admin/produits/${id}`);
}

export async function deleteProduct(productId: string) {
  await requireAdmin();
  await prisma.product.delete({ where: { id: productId } });
  revalidatePath("/admin/produits");
  redirect("/admin/produits");
}

const variantSchema = z.object({
  packaging: z.string().min(1),
  sku: z.string().min(1),
});

export async function saveVariant(productId: string, variantId: string | null, formData: FormData) {
  await requireAdmin();
  const parsed = variantSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const data = {
    packaging: parsed.data.packaging,
    sku: parsed.data.sku,
    priceHt: eurosToCents(formData.get("priceHt")),
    oldPriceHt: formData.get("oldPriceHt") ? eurosToCents(formData.get("oldPriceHt")) : null,
    vatRate: Number(formData.get("vatRate") || 20),
    stock: Number(formData.get("stock") || 0),
  };

  if (variantId) {
    await prisma.productVariant.update({ where: { id: variantId }, data });
  } else {
    await prisma.productVariant.create({ data: { ...data, productId } });
  }
  revalidatePath(`/admin/produits/${productId}`);
}

export async function deleteVariant(productId: string, variantId: string) {
  await requireAdmin();
  await prisma.productVariant.delete({ where: { id: variantId } });
  revalidatePath(`/admin/produits/${productId}`);
}

export async function addPriceTier(productId: string, variantId: string, formData: FormData) {
  await requireAdmin();
  const minQty = Number(formData.get("minQty") || 0);
  const priceHt = eurosToCents(formData.get("tierPrice"));
  if (minQty > 1 && priceHt > 0) {
    await prisma.priceTier.create({ data: { variantId, minQty, priceHt } });
  }
  revalidatePath(`/admin/produits/${productId}`);
}

export async function deletePriceTier(productId: string, tierId: string) {
  await requireAdmin();
  await prisma.priceTier.delete({ where: { id: tierId } });
  revalidatePath(`/admin/produits/${productId}`);
}

export async function addTechSheet(productId: string, formData: FormData) {
  await requireAdmin();
  const label = String(formData.get("label") || "").trim();
  const url = String(formData.get("url") || "").trim();
  if (label && url) {
    await prisma.technicalSheet.create({ data: { productId, label, url } });
  }
  revalidatePath(`/admin/produits/${productId}`);
}

export async function deleteTechSheet(productId: string, sheetId: string) {
  await requireAdmin();
  await prisma.technicalSheet.delete({ where: { id: sheetId } });
  revalidatePath(`/admin/produits/${productId}`);
}
