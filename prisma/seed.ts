import { PrismaClient, Role, AccountStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Catégories du §4 du brief
const CATEGORIES: { name: string; slug: string }[] = [
  { name: "Peintures & bases", slug: "peintures-bases" },
  { name: "Vernis", slug: "vernis" },
  { name: "Apprêts & sous-couches", slug: "apprets-sous-couches" },
  { name: "Mastics", slug: "mastics" },
  { name: "Durcisseurs & diluants", slug: "durcisseurs-diluants" },
  { name: "Abrasifs / Papier à poncer", slug: "abrasifs" },
  { name: "Masquage & protection", slug: "masquage-protection" },
  { name: "Pistolets & application", slug: "pistolets-application" },
  { name: "Outillage", slug: "outillage" },
  { name: "EPI / Protection", slug: "epi-protection" },
  { name: "Dégraissants & nettoyants", slug: "degraissants-nettoyants" },
  { name: "Produits d'entretien & finition", slug: "entretien-finition" },
];

type SeedProduct = {
  name: string;
  slug: string;
  brand: string;
  supplierRef: string;
  categorySlug: string;
  description: string;
  isPublicPrice?: boolean;
  isFeatured?: boolean;
  variants: {
    packaging: string;
    sku: string;
    priceHt: number; // centimes
    oldPriceHt?: number;
    stock: number;
    tiers?: { minQty: number; priceHt: number }[];
  }[];
};

const PRODUCTS: SeedProduct[] = [
  {
    name: "Base hydrodiluable teinte",
    slug: "base-hydro-teinte",
    brand: "Standox",
    supplierRef: "STX-HYD-100",
    categorySlug: "peintures-bases",
    description:
      "Base mate hydrodiluable haute opacité pour teintes carrosserie. Conforme directive COV.",
    isFeatured: true,
    variants: [
      {
        packaging: "1 L",
        sku: "STX-HYD-1L",
        priceHt: 4900,
        stock: 42,
        tiers: [
          { minQty: 6, priceHt: 4600 },
          { minQty: 12, priceHt: 4300 },
        ],
      },
      { packaging: "3,5 L", sku: "STX-HYD-35L", priceHt: 15900, stock: 18 },
    ],
  },
  {
    name: "Vernis UHS Express",
    slug: "vernis-uhs-express",
    brand: "Glasurit",
    supplierRef: "GLA-UHS-923",
    categorySlug: "vernis",
    description:
      "Vernis UHS séchage rapide, haut extrait sec, brillant profond. Idéal réparation.",
    isFeatured: true,
    variants: [
      {
        packaging: "1 L",
        sku: "GLA-UHS-1L",
        priceHt: 6200,
        oldPriceHt: 7400,
        stock: 30,
      },
      { packaging: "5 L", sku: "GLA-UHS-5L", priceHt: 28500, stock: 9 },
    ],
  },
  {
    name: "Apprêt garnissant 2K gris",
    slug: "appret-garnissant-2k-gris",
    brand: "PPG",
    supplierRef: "PPG-APP-2K",
    categorySlug: "apprets-sous-couches",
    description: "Apprêt 2K garnissant ponçable, excellent pouvoir garnissant.",
    isPublicPrice: true,
    variants: [
      { packaging: "1 L", sku: "PPG-APP-1L", priceHt: 3400, stock: 55 },
      { packaging: "5 L", sku: "PPG-APP-5L", priceHt: 14900, stock: 12 },
    ],
  },
  {
    name: "Mastic polyester multi-usage",
    slug: "mastic-polyester-multi",
    brand: "3M",
    supplierRef: "3M-MAST-501",
    categorySlug: "mastics",
    description: "Mastic polyester léger, application facile, ponçage rapide.",
    isPublicPrice: true,
    isFeatured: true,
    variants: [
      {
        packaging: "Boîte 1,5 kg",
        sku: "3M-MAST-15",
        priceHt: 1890,
        stock: 80,
        tiers: [{ minQty: 12, priceHt: 1690 }],
      },
    ],
  },
  {
    name: "Durcisseur standard 2K",
    slug: "durcisseur-standard-2k",
    brand: "Standox",
    supplierRef: "STX-DUR-20",
    categorySlug: "durcisseurs-diluants",
    description: "Durcisseur pour vernis et apprêts 2K, vitesse standard.",
    variants: [
      { packaging: "0,5 L", sku: "STX-DUR-05L", priceHt: 2200, stock: 40 },
      { packaging: "2,5 L", sku: "STX-DUR-25L", priceHt: 9800, stock: 15 },
    ],
  },
  {
    name: "Disques abrasifs P400 (boîte 100)",
    slug: "disques-abrasifs-p400",
    brand: "Mirka",
    supplierRef: "MIR-ABR-P400",
    categorySlug: "abrasifs",
    description: "Disques abrasifs Ø150 mm, grain P400, multi-trous, longue durée.",
    isPublicPrice: true,
    variants: [
      {
        packaging: "Boîte de 100",
        sku: "MIR-P400-100",
        priceHt: 4500,
        oldPriceHt: 5200,
        stock: 60,
        tiers: [{ minQty: 5, priceHt: 4100 }],
      },
    ],
  },
  {
    name: "Ruban de masquage 30 mm",
    slug: "ruban-masquage-30mm",
    brand: "3M",
    supplierRef: "3M-MASK-30",
    categorySlug: "masquage-protection",
    description: "Ruban de masquage haute température, dépose nette sans résidu.",
    isPublicPrice: true,
    variants: [
      {
        packaging: "Carton de 48",
        sku: "3M-MASK-30-C48",
        priceHt: 5400,
        stock: 25,
      },
    ],
  },
  {
    name: "Pistolet à peinture HVLP 1.3",
    slug: "pistolet-hvlp-13",
    brand: "SATA",
    supplierRef: "SATA-HVLP-13",
    categorySlug: "pistolets-application",
    description: "Pistolet gravité HVLP, buse 1.3 mm, godet 600 ml. Finition pro.",
    isFeatured: true,
    variants: [
      { packaging: "Unité", sku: "SATA-HVLP-13-U", priceHt: 48900, stock: 7 },
    ],
  },
  {
    name: "Ponceuse orbitale pneumatique",
    slug: "ponceuse-orbitale-pneu",
    brand: "Mirka",
    supplierRef: "MIR-PONC-150",
    categorySlug: "outillage",
    description: "Ponceuse orbitale Ø150 mm, course 5 mm, aspiration intégrée.",
    variants: [
      { packaging: "Unité", sku: "MIR-PONC-U", priceHt: 32900, stock: 5 },
    ],
  },
  {
    name: "Masque respiratoire A2P3",
    slug: "masque-a2p3",
    brand: "3M",
    supplierRef: "3M-EPI-A2P3",
    categorySlug: "epi-protection",
    description: "Demi-masque avec filtres A2P3, protection solvants et particules.",
    isPublicPrice: true,
    variants: [
      { packaging: "Kit complet", sku: "3M-A2P3-KIT", priceHt: 4900, stock: 33 },
    ],
  },
  {
    name: "Dégraissant antisilicone",
    slug: "degraissant-antisilicone",
    brand: "PPG",
    supplierRef: "PPG-DEG-AS",
    categorySlug: "degraissants-nettoyants",
    description: "Nettoyant antisilicone pour préparation de surface avant peinture.",
    isPublicPrice: true,
    variants: [
      { packaging: "5 L", sku: "PPG-DEG-5L", priceHt: 3900, stock: 28 },
    ],
  },
  {
    name: "Polish de finition one-step",
    slug: "polish-finition-onestep",
    brand: "3M",
    supplierRef: "3M-POL-OS",
    categorySlug: "entretien-finition",
    description: "Polish one-step abrasif et lustrant, finition miroir sans hologrammes.",
    variants: [
      { packaging: "1 L", sku: "3M-POL-1L", priceHt: 3200, stock: 22 },
    ],
  },
];

async function main() {
  console.log("Seed: catégories…");
  const categoryByslug = new Map<string, string>();
  for (const c of CATEGORIES) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: c,
    });
    categoryByslug.set(c.slug, cat.id);
  }

  console.log("Seed: produits…");
  for (const p of PRODUCTS) {
    const categoryId = categoryByslug.get(p.categorySlug)!;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        brand: p.brand,
        description: p.description,
        isPublicPrice: p.isPublicPrice ?? false,
        isFeatured: p.isFeatured ?? false,
      },
      create: {
        name: p.name,
        slug: p.slug,
        brand: p.brand,
        supplierRef: p.supplierRef,
        description: p.description,
        categoryId,
        isPublicPrice: p.isPublicPrice ?? false,
        isFeatured: p.isFeatured ?? false,
      },
    });

    // Fiche technique factice
    await prisma.technicalSheet.deleteMany({ where: { productId: product.id } });
    await prisma.technicalSheet.create({
      data: { productId: product.id, label: "TDS", url: "/docs/tds-exemple.pdf" },
    });

    for (const v of p.variants) {
      const variant = await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {
          packaging: v.packaging,
          priceHt: v.priceHt,
          oldPriceHt: v.oldPriceHt ?? null,
          stock: v.stock,
        },
        create: {
          productId: product.id,
          packaging: v.packaging,
          sku: v.sku,
          priceHt: v.priceHt,
          oldPriceHt: v.oldPriceHt ?? null,
          stock: v.stock,
        },
      });
      await prisma.priceTier.deleteMany({ where: { variantId: variant.id } });
      if (v.tiers) {
        for (const t of v.tiers) {
          await prisma.priceTier.create({
            data: { variantId: variant.id, minQty: t.minQty, priceHt: t.priceHt },
          });
        }
      }
    }
  }

  console.log("Seed: comptes…");
  const adminPass = await bcrypt.hash("admin1234", 10);
  await prisma.user.upsert({
    where: { email: "admin@carrosserie-pro.fr" },
    update: {},
    create: {
      email: "admin@carrosserie-pro.fr",
      passwordHash: adminPass,
      role: Role.ADMIN,
      status: AccountStatus.APPROVED,
      companyName: "Carrosserie Pro",
      siret: "00000000000000",
    },
  });

  const proPass = await bcrypt.hash("pro1234", 10);
  await prisma.user.upsert({
    where: { email: "pro@atelier.fr" },
    update: {},
    create: {
      email: "pro@atelier.fr",
      passwordHash: proPass,
      role: Role.CUSTOMER,
      status: AccountStatus.APPROVED,
      companyName: "Atelier Dupont",
      siret: "12345678900012",
      vatNumber: "FR12345678900",
      sector: "Carrosserie",
    },
  });

  await prisma.user.upsert({
    where: { email: "attente@garage.fr" },
    update: {},
    create: {
      email: "attente@garage.fr",
      passwordHash: proPass,
      role: Role.CUSTOMER,
      status: AccountStatus.PENDING,
      companyName: "Garage Martin",
      siret: "98765432100021",
      sector: "Garage",
    },
  });

  console.log("Seed terminé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
