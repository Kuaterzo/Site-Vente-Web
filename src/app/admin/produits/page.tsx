import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { PublicPriceToggle, StockInput } from "@/components/admin/product-controls";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true, variants: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Produits</h1>
      <p className="mt-1 text-sm text-ink/60">{products.length} produit(s)</p>

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-ink/50">
            <th className="pb-2">Produit</th>
            <th className="pb-2">Catégorie</th>
            <th className="pb-2">Conditionnements / Stock</th>
            <th className="pb-2">Visibilité prix</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-line align-top">
              <td className="py-3">
                <p className="text-xs font-semibold uppercase text-primary">{p.brand}</p>
                <p className="font-medium">{p.name}</p>
              </td>
              <td className="py-3 text-ink/70">{p.category.name}</td>
              <td className="py-3">
                <ul className="space-y-1">
                  {p.variants.map((v) => (
                    <li key={v.id} className="flex items-center gap-2">
                      <span className="text-ink/70">{v.packaging} — {formatPrice(v.priceHt)}</span>
                      <StockInput variantId={v.id} initial={v.stock} />
                    </li>
                  ))}
                </ul>
              </td>
              <td className="py-3">
                <PublicPriceToggle productId={p.id} initial={p.isPublicPrice} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
