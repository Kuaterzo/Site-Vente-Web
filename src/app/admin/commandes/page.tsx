import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { OrderStatusSelect } from "@/components/admin/order-status";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { user: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Commandes</h1>

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-ink/50">
            <th className="pb-2">N°</th>
            <th className="pb-2">Client</th>
            <th className="pb-2">Date</th>
            <th className="pb-2 text-right">TTC</th>
            <th className="pb-2">Statut</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-line">
              <td className="py-3 font-medium">{o.number}</td>
              <td className="py-3 text-ink/70">{o.user.companyName}</td>
              <td className="py-3 text-ink/70">{o.createdAt.toLocaleDateString("fr-FR")}</td>
              <td className="py-3 text-right">{formatPrice(o.totalTtc)}</td>
              <td className="py-3"><OrderStatusSelect orderId={o.id} current={o.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
