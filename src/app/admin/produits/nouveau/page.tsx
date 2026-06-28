import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Nouveau produit</h1>
      <p className="text-sm text-ink/60">
        Créez la fiche, puis ajoutez les conditionnements, paliers et fiches techniques.
      </p>
      <section className="card p-5">
        <ProductForm categories={categories} />
      </section>
      <Link href="/admin/produits" className="text-sm text-ink/60 hover:text-accent">← Retour à la liste</Link>
    </div>
  );
}
