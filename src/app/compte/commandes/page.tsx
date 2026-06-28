import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { reorder } from "@/lib/actions/reorder";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "En attente",
  PAID: "Payée",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/compte/commandes");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Mes commandes</h1>

      {orders.length === 0 ? (
        <p className="mt-6 text-ink/60">Aucune commande pour le moment.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-display text-lg font-semibold">N° {o.number}</p>
                  <p className="text-sm text-ink/50">
                    {o.createdAt.toLocaleDateString("fr-FR")} · {o.items.length} article(s)
                  </p>
                </div>
                <div className="text-right">
                  <span className="rounded bg-page px-2 py-1 text-xs font-medium">
                    {STATUS_LABEL[o.status]}
                  </span>
                  <p className="price mt-1 text-xl">{formatPrice(o.totalTtc)}</p>
                </div>
              </div>
              <ul className="mt-3 border-t border-line pt-3 text-sm text-ink/70">
                {o.items.map((it) => (
                  <li key={it.id}>
                    {it.quantity} × {it.productName} ({it.packaging})
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex gap-3">
                <form action={reorder.bind(null, o.id)}>
                  <button className="btn-accent py-1.5">Recommander</button>
                </form>
                <Link href="/compte/factures" className="btn-outline py-1.5">Facture</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
