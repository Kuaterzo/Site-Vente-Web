import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { canBuy } from "@/lib/pricing";
import { loadCart } from "@/lib/cart-data";
import { formatPrice } from "@/lib/utils";
import { CartItemRow } from "@/components/cart-item-row";

export default async function CartPage() {
  const session = await auth();

  if (!session?.user) redirect("/connexion?callbackUrl=/panier");
  if (!canBuy(session)) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Compte en attente de validation</h1>
        <p className="mt-2 text-ink/70">
          Votre compte doit être validé par notre équipe avant de pouvoir commander.
        </p>
      </div>
    );
  }

  const cart = await loadCart(session.user.id);

  if (cart.lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Votre panier est vide</h1>
        <Link href="/" className="btn-accent mt-4">Parcourir le catalogue</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="font-display text-3xl font-bold">Mon panier</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-ink/50">
              <th className="pb-2">Produit</th>
              <th className="pb-2 text-right">P.U. HT</th>
              <th className="pb-2 text-center">Qté</th>
              <th className="pb-2 text-right">Total HT</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cart.lines.map((l) => (
              <CartItemRow key={l.itemId} line={l} />
            ))}
          </tbody>
        </table>

        <div className="card h-fit space-y-2 p-5">
          <div className="flex justify-between text-sm">
            <span>Total HT</span>
            <span className="font-medium">{formatPrice(cart.totalHt)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>TVA</span>
            <span className="font-medium">{formatPrice(cart.totalVat)}</span>
          </div>
          <div className="flex justify-between border-t border-line pt-2 text-lg">
            <span className="font-semibold">Total TTC</span>
            <span className="price text-2xl">{formatPrice(cart.totalTtc)}</span>
          </div>
          <Link href="/commande" className="btn-accent mt-3 w-full">
            Passer la commande
          </Link>
        </div>
      </div>
    </div>
  );
}
