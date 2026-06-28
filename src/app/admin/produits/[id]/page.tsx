import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import {
  saveVariant,
  deleteVariant,
  addPriceTier,
  deletePriceTier,
  addTechSheet,
  deleteTechSheet,
  deleteProduct,
} from "@/lib/actions/admin-products";

const euros = (cents: number) => (cents / 100).toFixed(2);

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { variants: { include: { priceTiers: true } }, techSheets: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Éditer : {product.name}</h1>
        <form action={deleteProduct.bind(null, product.id)}>
          <button className="text-sm text-promo hover:underline">Supprimer le produit</button>
        </form>
      </div>

      <section className="card p-5">
        <ProductForm product={product} categories={categories} />
      </section>

      {/* Conditionnements */}
      <section className="card p-5">
        <h2 className="font-display text-lg font-semibold">Conditionnements</h2>
        <div className="mt-4 space-y-4">
          {product.variants.map((v) => (
            <div key={v.id} className="rounded-md border border-line p-3">
              <form action={saveVariant.bind(null, product.id, v.id)} className="grid items-end gap-2 sm:grid-cols-6">
                <Input label="Conditionnement" name="packaging" defaultValue={v.packaging} />
                <Input label="SKU" name="sku" defaultValue={v.sku} />
                <Input label="Prix HT (€)" name="priceHt" type="number" step="0.01" defaultValue={euros(v.priceHt)} />
                <Input label="Ancien prix (€)" name="oldPriceHt" type="number" step="0.01" defaultValue={v.oldPriceHt ? euros(v.oldPriceHt) : ""} />
                <Input label="Stock" name="stock" type="number" defaultValue={String(v.stock)} />
                <Input label="TVA %" name="vatRate" type="number" defaultValue={String(v.vatRate)} />
                <div className="flex gap-2 sm:col-span-6">
                  <button className="btn-accent py-1.5">Enregistrer</button>
                </div>
              </form>

              {/* Paliers dégressifs */}
              <div className="mt-3 border-t border-line pt-3">
                <p className="text-sm font-medium">Paliers dégressifs</p>
                <ul className="mt-1 space-y-1 text-sm">
                  {v.priceTiers.sort((a, b) => a.minQty - b.minQty).map((t) => (
                    <li key={t.id} className="flex items-center gap-3">
                      <span>{t.minQty}+ : {euros(t.priceHt)} € HT</span>
                      <form action={deletePriceTier.bind(null, product.id, t.id)}>
                        <button className="text-xs text-promo hover:underline">retirer</button>
                      </form>
                    </li>
                  ))}
                </ul>
                <form action={addPriceTier.bind(null, product.id, v.id)} className="mt-2 flex items-end gap-2">
                  <Input label="Qté min" name="minQty" type="number" />
                  <Input label="Prix HT (€)" name="tierPrice" type="number" step="0.01" />
                  <button className="btn-outline py-1.5">Ajouter palier</button>
                </form>
              </div>

              <form action={deleteVariant.bind(null, product.id, v.id)} className="mt-2">
                <button className="text-xs text-promo hover:underline">Supprimer ce conditionnement</button>
              </form>
            </div>
          ))}
        </div>

        {/* Ajout d'un conditionnement */}
        <form action={saveVariant.bind(null, product.id, null)} className="mt-4 grid items-end gap-2 rounded-md bg-page p-3 sm:grid-cols-6">
          <Input label="Conditionnement" name="packaging" />
          <Input label="SKU" name="sku" />
          <Input label="Prix HT (€)" name="priceHt" type="number" step="0.01" />
          <Input label="Ancien prix (€)" name="oldPriceHt" type="number" step="0.01" />
          <Input label="Stock" name="stock" type="number" defaultValue="0" />
          <Input label="TVA %" name="vatRate" type="number" defaultValue="20" />
          <div className="sm:col-span-6">
            <button className="btn-accent py-1.5">Ajouter un conditionnement</button>
          </div>
        </form>
      </section>

      {/* Fiches techniques */}
      <section className="card p-5">
        <h2 className="font-display text-lg font-semibold">Fiches techniques</h2>
        <ul className="mt-3 space-y-1 text-sm">
          {product.techSheets.map((s) => (
            <li key={s.id} className="flex items-center gap-3">
              <a href={s.url} className="text-accent underline" target="_blank" rel="noopener">{s.label}</a>
              <form action={deleteTechSheet.bind(null, product.id, s.id)}>
                <button className="text-xs text-promo hover:underline">retirer</button>
              </form>
            </li>
          ))}
        </ul>
        <form action={addTechSheet.bind(null, product.id)} className="mt-2 flex items-end gap-2">
          <Input label="Label" name="label" placeholder="FDS / TDS" />
          <Input label="URL" name="url" placeholder="https://…" />
          <button className="btn-outline py-1.5">Ajouter</button>
        </form>
      </section>

      <Link href="/admin/produits" className="text-sm text-ink/60 hover:text-accent">← Retour à la liste</Link>
    </div>
  );
}

function Input({
  label,
  name,
  type = "text",
  step,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  step?: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-ink/60">{label}</span>
      <input
        name={name}
        type={type}
        step={step}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-md border border-line px-2 py-1.5"
      />
    </label>
  );
}
