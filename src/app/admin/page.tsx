import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export default async function AdminDashboard() {
  const [products, pending, orders, revenue] = await Promise.all([
    prisma.product.count(),
    prisma.user.count({ where: { status: "PENDING" } }),
    prisma.order.count(),
    prisma.order.aggregate({ where: { status: { not: "CANCELLED" } }, _sum: { totalTtc: true } }),
  ]);

  const cards = [
    { label: "Produits", value: products, href: "/admin/produits" },
    { label: "Comptes en attente", value: pending, href: "/admin/comptes" },
    { label: "Commandes", value: orders, href: "/admin/commandes" },
    { label: "CA TTC", value: formatPrice(revenue._sum.totalTtc ?? 0), href: "/admin/commandes" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Tableau de bord</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="card p-5 hover:border-accent">
            <p className="font-display text-3xl font-bold text-accent">{c.value}</p>
            <p className="text-sm text-ink/60">{c.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
