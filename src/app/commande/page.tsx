import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canBuy } from "@/lib/pricing";
import { loadCart } from "@/lib/cart-data";
import { formatPrice } from "@/lib/utils";
import { checkout } from "@/lib/actions/checkout";

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/commande");
  if (!canBuy(session)) redirect("/panier");

  const [cart, addresses] = await Promise.all([
    loadCart(session.user.id),
    prisma.address.findMany({ where: { userId: session.user.id } }),
  ]);
  if (cart.lines.length === 0) redirect("/panier");

  const shipping = addresses.filter((a) => a.type === "SHIPPING");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Commande</h1>

      <form action={checkout} className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="font-display text-lg font-semibold">Adresse de livraison</h2>
            <div className="mt-3 space-y-2">
              {(shipping.length ? shipping : addresses).map((a, i) => (
                <label key={a.id} className="flex items-start gap-2 text-sm">
                  <input type="radio" name="addressId" value={a.id} defaultChecked={i === 0} className="mt-1" />
                  <span>{a.line1}, {a.zip} {a.city}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <h2 className="font-display text-lg font-semibold">Articles</h2>
            <ul className="mt-3 divide-y divide-line text-sm">
              {cart.lines.map((l) => (
                <li key={l.itemId} className="flex justify-between py-2">
                  <span>{l.quantity} × {l.productName} ({l.packaging})</span>
                  <span className="font-medium">{formatPrice(l.lineHt)} HT</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="card h-fit space-y-2 p-5">
          <div className="flex justify-between text-sm">
            <span>Total HT</span><span className="font-medium">{formatPrice(cart.totalHt)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>TVA</span><span className="font-medium">{formatPrice(cart.totalVat)}</span>
          </div>
          <div className="flex justify-between border-t border-line pt-2 text-lg">
            <span className="font-semibold">Total TTC</span>
            <span className="price text-2xl">{formatPrice(cart.totalTtc)}</span>
          </div>
          <button type="submit" className="btn-accent mt-3 w-full">Payer (CB / SEPA)</button>
          <p className="text-center text-xs text-ink/50">Paiement sécurisé via Stripe</p>
        </div>
      </form>
    </div>
  );
}
