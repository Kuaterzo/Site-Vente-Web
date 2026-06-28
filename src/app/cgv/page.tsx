export const metadata = { title: "CGV — Carrosserie Pro" };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">Conditions Générales de Vente</h1>
      <div className="mt-6 space-y-4 text-ink/80">
        <section>
          <h2 className="font-semibold text-ink">1. Champ d'application</h2>
          <p>Les présentes CGV régissent les ventes entre Carrosserie Pro SAS et ses
          clients professionnels (relations B2B). Toute commande implique l'acceptation
          sans réserve des présentes conditions.</p>
        </section>
        <section>
          <h2 className="font-semibold text-ink">2. Prix</h2>
          <p>Les prix sont indiqués <strong>hors taxes (HT)</strong> en euros. La TVA au
          taux en vigueur est ajoutée au récapitulatif de commande. Les tarifs peuvent
          faire l'objet de remises dégressives selon les quantités commandées.</p>
        </section>
        <section>
          <h2 className="font-semibold text-ink">3. Accès aux tarifs</h2>
          <p>L'accès aux tarifs et la passation de commande sont réservés aux comptes
          professionnels validés après vérification du SIRET/KBIS.</p>
        </section>
        <section>
          <h2 className="font-semibold text-ink">4. Commande et paiement</h2>
          <p>Le paiement s'effectue par carte bancaire ou prélèvement SEPA via notre
          prestataire sécurisé Stripe. La commande est validée à réception du paiement.</p>
        </section>
        <section>
          <h2 className="font-semibold text-ink">5. Livraison</h2>
          <p>Livraison sous 24 à 72h ouvrées selon disponibilité des stocks et zone de
          livraison.</p>
        </section>
        <section>
          <h2 className="font-semibold text-ink">6. Facturation</h2>
          <p>Une facture conforme (numéro, mentions obligatoires, TVA) est émise pour
          chaque commande et disponible dans l'espace client.</p>
        </section>
      </div>
    </div>
  );
}
