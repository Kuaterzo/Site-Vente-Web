import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export default async function OrderConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;
  const session = await auth();
  if (!session?.user || !orderId) redirect("/");

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.user.id },
  });
  if (!order) redirect("/");

  const paid = order.status === "PAID";

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="font-display text-3xl font-bold text-stock">
        {paid ? "Commande confirmée ✓" : "Commande enregistrée"}
      </h1>
      <p className="mt-3 text-ink/70">
        Merci ! Votre commande <strong>{order.number}</strong> d'un montant de{" "}
        <span className="price">{formatPrice(order.totalTtc)}</span>{" "}
        {paid
          ? "a bien été payée et confirmée."
          : "est enregistrée. La confirmation de paiement vous sera notifiée sous peu."}
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/compte/commandes" className="btn-accent">Mes commandes</Link>
        <Link href="/compte/factures" className="btn-outline">Mes factures</Link>
      </div>
    </div>
  );
}
