import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "En attente de validation",
  APPROVED: "Validé",
  REJECTED: "Refusé",
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/compte");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { addresses: true, _count: { select: { orders: true } } },
  });
  if (!user) redirect("/connexion");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Mon compte</h1>

      {user.status === "PENDING" && (
        <div className="mt-4 rounded-md border border-accent/30 bg-accent/5 p-4 text-sm">
          Votre compte est <strong>en attente de validation</strong>. L'accès aux
          tarifs et à la commande sera ouvert après vérification.
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link href="/compte/commandes" className="card p-5 hover:border-accent">
          <p className="font-display text-2xl font-bold text-accent">{user._count.orders}</p>
          <p className="text-sm text-ink/60">Commandes</p>
        </Link>
        <Link href="/compte/factures" className="card p-5 hover:border-accent">
          <p className="font-semibold">Mes factures</p>
          <p className="text-sm text-ink/60">Télécharger les PDF</p>
        </Link>
        <div className="card p-5">
          <p className="font-semibold">Statut</p>
          <p className="text-sm text-ink/60">{STATUS_LABEL[user.status]}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-display text-lg font-semibold">Entreprise</h2>
          <dl className="mt-2 space-y-1 text-sm text-ink/70">
            <div><dt className="inline font-medium">Raison sociale :</dt> {user.companyName}</div>
            <div><dt className="inline font-medium">SIRET :</dt> {user.siret}</div>
            {user.vatNumber && <div><dt className="inline font-medium">TVA :</dt> {user.vatNumber}</div>}
            {user.sector && <div><dt className="inline font-medium">Secteur :</dt> {user.sector}</div>}
          </dl>
        </div>
        <div className="card p-5">
          <h2 className="font-display text-lg font-semibold">Adresses</h2>
          <div className="mt-2 space-y-2 text-sm text-ink/70">
            {user.addresses.map((a) => (
              <div key={a.id}>
                <p className="font-medium">{a.type === "BILLING" ? "Facturation" : "Livraison"}</p>
                <p>{a.line1}, {a.zip} {a.city}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
