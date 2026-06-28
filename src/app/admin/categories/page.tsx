import { prisma } from "@/lib/prisma";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Catégories</h1>
      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-ink/50">
            <th className="pb-2">Nom</th>
            <th className="pb-2">Slug</th>
            <th className="pb-2 text-right">Produits</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id} className="border-b border-line">
              <td className="py-3 font-medium">{c.name}</td>
              <td className="py-3 text-ink/50">{c.slug}</td>
              <td className="py-3 text-right">{c._count.products}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
