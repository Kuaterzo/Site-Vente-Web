import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { markOrderPaid } from "@/lib/actions/checkout";

// Endpoint webhook Stripe (HTTPS sur le domaine de l'app).
export async function POST(req: NextRequest) {
  if (!stripe) return NextResponse.json({ error: "Stripe non configuré" }, { status: 503 });

  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return NextResponse.json({ error: "Signature manquante" }, { status: 400 });

  const body = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { metadata?: { orderId?: string } };
    const orderId = session.metadata?.orderId;
    if (orderId) await markOrderPaid(orderId);
  }

  return NextResponse.json({ received: true });
}
