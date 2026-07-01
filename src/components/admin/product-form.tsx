"use client";

import { useActionState } from "react";
import { saveProduct, type ProductFormState } from "@/lib/actions/admin-products";

type Category = { id: string; name: string };
type Product = {
  id: string;
  name: string;
  brand: string;
  categoryId: string;
  supplierRef: string | null;
  description: string | null;
  imageUrl: string | null;
  grain: string | null;
  isPublicPrice: boolean;
  isFeatured: boolean;
};

const initial: ProductFormState = {};

export function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: Category[];
}) {
  const action = saveProduct.bind(null, product?.id ?? null);
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Nom *</span>
          <input name="name" defaultValue={product?.name} required className="w-full rounded-md border border-line px-3 py-2" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Marque *</span>
          <input name="brand" defaultValue={product?.brand} required className="w-full rounded-md border border-line px-3 py-2" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Catégorie *</span>
          <select name="categoryId" defaultValue={product?.categoryId ?? ""} required className="w-full rounded-md border border-line px-3 py-2">
            <option value="" disabled>Choisir…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Référence fournisseur</span>
          <input name="supplierRef" defaultValue={product?.supplierRef ?? ""} className="w-full rounded-md border border-line px-3 py-2" />
        </label>
      </div>

      <label className="block sm:w-1/2">
        <span className="mb-1 block text-sm font-medium">Grain <span className="text-ink/40">(abrasifs)</span></span>
        <input name="grain" defaultValue={product?.grain ?? ""} placeholder="ex. P400" className="w-full rounded-md border border-line px-3 py-2" />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Description</span>
        <textarea name="description" defaultValue={product?.description ?? ""} rows={3} className="w-full rounded-md border border-line px-3 py-2" />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">URL image</span>
        <input name="imageUrl" defaultValue={product?.imageUrl ?? ""} placeholder="https://…" className="w-full rounded-md border border-line px-3 py-2" />
      </label>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isPublicPrice" defaultChecked={product?.isPublicPrice} /> Prix public
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured} /> Mis en avant
        </label>
      </div>

      {state.error && <p className="text-sm text-promo">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn-accent">
        {pending ? "Enregistrement…" : product ? "Enregistrer" : "Créer le produit"}
      </button>
    </form>
  );
}
