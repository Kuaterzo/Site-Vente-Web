"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Mot de passe : 8 caractères minimum"),
  companyName: z.string().min(2, "Raison sociale requise"),
  siret: z.string().regex(/^\d{14}$/, "SIRET : 14 chiffres"),
  vatNumber: z.string().optional(),
  sector: z.string().optional(),
  phone: z.string().optional(),
  billingLine1: z.string().min(2, "Adresse de facturation requise"),
  billingZip: z.string().min(4, "Code postal requis"),
  billingCity: z.string().min(2, "Ville requise"),
  shippingLine1: z.string().optional(),
  shippingZip: z.string().optional(),
  shippingCity: z.string().optional(),
});

export type RegisterState = { error?: string; success?: boolean };

export async function registerUser(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  // Anti-spam : 3 inscriptions / 10 min / IP.
  if (!rateLimit(await clientKey("register"), 3, 600_000)) {
    return { error: "Trop de demandes. Réessayez plus tard." };
  }
  const data = Object.fromEntries(formData) as Record<string, string>;
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Formulaire invalide" };
  }
  const v = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: v.email } });
  if (existing) return { error: "Un compte existe déjà avec cet email." };

  const passwordHash = await bcrypt.hash(v.password, 10);

  // Compte créé en statut PENDING : accès complet après validation admin.
  await prisma.user.create({
    data: {
      email: v.email,
      passwordHash,
      companyName: v.companyName,
      siret: v.siret,
      vatNumber: v.vatNumber || null,
      sector: v.sector || null,
      phone: v.phone || null,
      company: {
        create: { name: v.companyName, siret: v.siret, vatNumber: v.vatNumber || null },
      },
      addresses: {
        create: [
          {
            type: "BILLING",
            line1: v.billingLine1,
            zip: v.billingZip,
            city: v.billingCity,
          },
          {
            type: "SHIPPING",
            line1: v.shippingLine1 || v.billingLine1,
            zip: v.shippingZip || v.billingZip,
            city: v.shippingCity || v.billingCity,
          },
        ],
      },
    },
  });

  return { success: true };
}
