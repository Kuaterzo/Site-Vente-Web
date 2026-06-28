import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export default async function InvoicesPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/compte/factures");

  const invoices = await prisma.invoice.findMany({
    where: { order: { userId: session.user.id } },
    include: { order: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Mes factures</h1>

      {invoices.length === 0 ? (
        <p className="mt-6 text-ink/60">Aucune facture disponible.</p>
      ) : (
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-ink/50">
              <th className="pb-2">N° facture</th>
              <th className="pb-2">Date</th>
              <th className="pb-2 text-right">Montant TTC</th>
              <th className="pb-2 text-right">PDF</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-line">
                <td className="py-3 font-medium">{inv.number}</td>
                <td className="py-3">{inv.createdAt.toLocaleDateString("fr-FR")}</td>
                <td className="py-3 text-right">{formatPrice(inv.order.totalTtc)}</td>
                <td className="py-3 text-right">
                  <a
                    href={inv.url ?? `/api/factures/${inv.id}`}
                    className="text-accent underline"
                    target="_blank"
                    rel="noopener"
                  >
                    Télécharger
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
