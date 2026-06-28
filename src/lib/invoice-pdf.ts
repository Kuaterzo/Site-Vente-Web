import PDFDocument from "pdfkit";
import { formatPrice } from "@/lib/utils";

// Données nécessaires à l'édition d'une facture conforme (B2B France).
export type InvoiceData = {
  invoiceNumber: string;
  orderNumber: string;
  date: Date;
  customer: {
    companyName: string;
    siret: string;
    vatNumber: string | null;
    address?: { line1: string; line2: string | null; zip: string; city: string } | null;
  };
  items: {
    productName: string;
    packaging: string;
    quantity: number;
    unitPriceHt: number;
    vatRate: number;
  }[];
  totalHt: number;
  totalVat: number;
  totalTtc: number;
};

// Émetteur (mentions légales obligatoires).
const SELLER = {
  name: "Carrosserie Pro SAS",
  address: "1 rue de l'Atelier, 75000 Paris",
  siret: "SIRET 000 000 000 00000",
  vat: "TVA FR00 000000000",
  rcs: "RCS Paris 000 000 000 — Capital 50 000 €",
  email: "contact@carrosserie-pro.fr",
};

// Génère le PDF de la facture et renvoie un Buffer.
export function buildInvoicePdf(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const accent = "#F97316";
    const ink = "#16202B";

    // En-tête vendeur
    doc.fillColor(ink).fontSize(20).font("Helvetica-Bold").text("CARROSSERIE", 50, 50, { continued: true });
    doc.fillColor(accent).text("PRO");
    doc.fillColor(ink).font("Helvetica").fontSize(9);
    doc.text(SELLER.address, 50, 78);
    doc.text(`${SELLER.siret} — ${SELLER.vat}`);
    doc.text(SELLER.rcs);
    doc.text(SELLER.email);

    // Bloc facture (droite)
    doc.fontSize(16).font("Helvetica-Bold").fillColor(ink).text("FACTURE", 380, 50, { align: "right" });
    doc.fontSize(10).font("Helvetica");
    doc.text(`N° ${data.invoiceNumber}`, 380, 75, { align: "right" });
    doc.text(`Commande ${data.orderNumber}`, { align: "right" });
    doc.text(`Date : ${data.date.toLocaleDateString("fr-FR")}`, { align: "right" });

    // Client
    doc.moveTo(50, 140).lineTo(545, 140).strokeColor("#E5E7EB").stroke();
    doc.fontSize(10).font("Helvetica-Bold").fillColor(ink).text("Facturé à", 50, 155);
    doc.font("Helvetica").fontSize(10);
    doc.text(data.customer.companyName);
    if (data.customer.address) {
      const a = data.customer.address;
      doc.text(a.line1);
      if (a.line2) doc.text(a.line2);
      doc.text(`${a.zip} ${a.city}`);
    }
    doc.text(`SIRET : ${data.customer.siret}`);
    if (data.customer.vatNumber) doc.text(`TVA : ${data.customer.vatNumber}`);

    // Tableau des lignes
    let y = 250;
    const cols = { name: 50, qty: 320, pu: 380, vat: 450, total: 495 };
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#0F2A43");
    doc.text("Désignation", cols.name, y);
    doc.text("Qté", cols.qty, y);
    doc.text("P.U. HT", cols.pu, y);
    doc.text("TVA", cols.vat, y);
    doc.text("Total HT", cols.total, y);
    y += 14;
    doc.moveTo(50, y).lineTo(545, y).strokeColor("#E5E7EB").stroke();
    y += 8;

    doc.font("Helvetica").fillColor(ink).fontSize(9);
    for (const it of data.items) {
      const lineHt = it.unitPriceHt * it.quantity;
      doc.text(`${it.productName} — ${it.packaging}`, cols.name, y, { width: 260 });
      doc.text(String(it.quantity), cols.qty, y);
      doc.text(formatPrice(it.unitPriceHt), cols.pu, y);
      doc.text(`${it.vatRate}%`, cols.vat, y);
      doc.text(formatPrice(lineHt), cols.total, y);
      y += 20;
    }

    // Totaux
    y += 10;
    doc.moveTo(320, y).lineTo(545, y).strokeColor("#E5E7EB").stroke();
    y += 10;
    const totalLine = (label: string, value: string, bold = false) => {
      doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(bold ? 11 : 10);
      doc.fillColor(ink).text(label, 380, y);
      doc.text(value, cols.total, y, { align: "left" });
      y += bold ? 20 : 16;
    };
    totalLine("Total HT", formatPrice(data.totalHt));
    totalLine("TVA", formatPrice(data.totalVat));
    totalLine("Total TTC", formatPrice(data.totalTtc), true);

    // Mentions légales bas de page
    doc.font("Helvetica").fontSize(8).fillColor("#6B7280");
    doc.text(
      "Prix exprimés en euros. Vente entre professionnels (B2B). " +
        "Pénalités de retard au taux légal en vigueur ; indemnité forfaitaire pour frais de recouvrement de 40 € (art. L441-10 C. com.). " +
        "Pas d'escompte pour paiement anticipé.",
      50,
      760,
      { width: 495, align: "center" },
    );

    doc.end();
  });
}
