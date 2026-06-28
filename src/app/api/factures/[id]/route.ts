import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildInvoicePdf } from "@/lib/invoice-pdf";

export const runtime = "nodejs";

// Télécharge la facture PDF d'une commande (propriétaire ou admin uniquement).
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          items: true,
          user: true,
          address: true,
        },
      },
    },
  });
  if (!invoice) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  // Contrôle d'accès : le client propriétaire ou un admin.
  const isOwner = invoice.order.userId === session.user.id;
  if (!isOwner && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const o = invoice.order;
  const pdf = await buildInvoicePdf({
    invoiceNumber: invoice.number,
    orderNumber: o.number,
    date: invoice.createdAt,
    customer: {
      companyName: o.user.companyName,
      siret: o.user.siret,
      vatNumber: o.user.vatNumber,
      address: o.address
        ? { line1: o.address.line1, line2: o.address.line2, zip: o.address.zip, city: o.address.city }
        : null,
    },
    items: o.items.map((it) => ({
      productName: it.productName,
      packaging: it.packaging,
      quantity: it.quantity,
      unitPriceHt: it.unitPriceHt,
      vatRate: it.vatRate,
    })),
    totalHt: o.totalHt,
    totalVat: o.totalVat,
    totalTtc: o.totalTtc,
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.number}.pdf"`,
    },
  });
}
