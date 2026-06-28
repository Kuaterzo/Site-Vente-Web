import { prisma } from "@/lib/prisma";
import { AccountActions } from "@/components/admin/account-actions";

const STATUS: Record<string, string> = {
  PENDING: "En attente",
  APPROVED: "Validé",
  REJECTED: "Refusé",
};

export default async function AdminAccountsPage() {
  const users = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Comptes professionnels</h1>

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-ink/50">
            <th className="pb-2">Entreprise</th>
            <th className="pb-2">SIRET / TVA</th>
            <th className="pb-2">Email</th>
            <th className="pb-2">Statut</th>
            <th className="pb-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-line">
              <td className="py-3">
                <p className="font-medium">{u.companyName}</p>
                {u.sector && <p className="text-xs text-ink/50">{u.sector}</p>}
              </td>
              <td className="py-3 text-ink/70">
                {u.siret}
                {u.vatNumber && <><br />{u.vatNumber}</>}
              </td>
              <td className="py-3 text-ink/70">{u.email}</td>
              <td className="py-3">
                <span className={u.status === "APPROVED" ? "text-stock" : u.status === "REJECTED" ? "text-promo" : "text-accent"}>
                  {STATUS[u.status]}
                </span>
              </td>
              <td className="py-3">
                <AccountActions userId={u.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
