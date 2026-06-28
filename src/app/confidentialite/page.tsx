export const metadata = { title: "Politique de confidentialité — Carrosserie Pro" };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">Politique de confidentialité</h1>
      <div className="mt-6 space-y-4 text-ink/80">
        <section>
          <h2 className="font-semibold text-ink">Responsable du traitement</h2>
          <p>Carrosserie Pro SAS est responsable du traitement des données personnelles
          collectées sur ce site, conformément au RGPD.</p>
        </section>
        <section>
          <h2 className="font-semibold text-ink">Données collectées</h2>
          <p>Lors de l'inscription : email, raison sociale, SIRET, n° TVA, secteur,
          adresses de facturation et de livraison, téléphone. Lors des commandes :
          historique d'achat et de facturation.</p>
        </section>
        <section>
          <h2 className="font-semibold text-ink">Finalités</h2>
          <p>Gestion des comptes professionnels, traitement des commandes, facturation,
          relation client et obligations légales/comptables.</p>
        </section>
        <section>
          <h2 className="font-semibold text-ink">Conservation</h2>
          <p>Les données de facturation sont conservées 10 ans (obligation légale). Les
          données de compte sont conservées tant que le compte est actif.</p>
        </section>
        <section>
          <h2 className="font-semibold text-ink">Vos droits</h2>
          <p>Vous disposez d'un droit d'accès, de rectification, d'effacement, de
          limitation et de portabilité. Pour les exercer : contact@carrosserie-pro.fr.
          Vous pouvez introduire une réclamation auprès de la CNIL.</p>
        </section>
        <section>
          <h2 className="font-semibold text-ink">Cookies</h2>
          <p>Seuls des cookies strictement nécessaires (session, panier) sont utilisés.
          Aucun cookie publicitaire ou de traçage tiers.</p>
        </section>
      </div>
    </div>
  );
}
