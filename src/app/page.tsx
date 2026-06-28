import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canSeePrice } from "@/lib/pricing";
import { ProductCard, type ProductCardData } from "@/components/product-card";

export default async function HomePage() {
  const session = await auth();
  const [categories, featured] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: { isFeatured: true },
      include: { variants: { orderBy: { priceHt: "asc" } } },
      take: 8,
    }),
  ]);

  const brands = ["Standox", "Glasurit", "PPG", "3M", "Mirka", "SATA"];

  return (
    <div className="mx-auto max-w-7xl px-4">
      {/* Hero */}
      <section className="my-6 overflow-hidden rounded-xl bg-primary text-white">
        <div className="grid gap-6 p-8 md:grid-cols-2 md:p-12">
          <div className="flex flex-col justify-center">
            <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
              Tout l'atelier carrosserie, au tarif pro.
            </h1>
            <p className="mt-3 text-white/70">
              Peintures, vernis, abrasifs, masquage et consommables des plus
              grandes marques. Réservé aux professionnels validés.
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/categorie/peintures-bases" className="btn-accent">
                Voir le catalogue
              </Link>
              <Link href="/inscription" className="btn-outline border-white/30 bg-transparent text-white hover:bg-white/10">
                Créer un compte pro
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            {[
              ["24-72h", "Livraison rapide"],
              ["Sécurisé", "Paiement CB / SEPA"],
              ["Pro", "Tarifs dégressifs"],
            ].map(([t, s]) => (
              <div key={t} className="flex flex-col justify-center rounded-lg bg-white/5 p-4">
                <span className="font-display text-2xl font-bold text-accent">{t}</span>
                <span className="text-white/60">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catégories */}
      <section className="my-10">
        <h2 className="font-display text-2xl font-bold">Catégories</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/categorie/${c.slug}`}
              className="card flex items-center justify-center p-4 text-center text-sm font-medium hover:border-accent hover:text-accent"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Produits en avant */}
      <section className="my-10">
        <h2 className="font-display text-2xl font-bold">Sélection</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard
              key={p.id}
              product={p as unknown as ProductCardData}
              priceVisible={canSeePrice(p.isPublicPrice, session)}
            />
          ))}
        </div>
      </section>

      {/* Marques */}
      <section className="my-10">
        <h2 className="font-display text-2xl font-bold">Nos marques</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {brands.map((b) => (
            <span key={b} className="card px-5 py-3 font-display text-lg font-semibold text-primary">
              {b}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
