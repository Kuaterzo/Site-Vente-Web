export const metadata = { title: "Mentions légales — Carrosserie Pro" };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 prose-sm">
      <h1 className="font-display text-3xl font-bold">Mentions légales</h1>
      <div className="mt-6 space-y-4 text-ink/80">
        <section>
          <h2 className="font-semibold text-ink">Éditeur</h2>
          <p>Carrosserie Pro SAS — Capital social : 50 000 €. Siège : 1 rue de l'Atelier, 75000 Paris.
          RCS Paris 000 000 000. SIRET 000 000 000 00000. TVA intracommunautaire FR00 000000000.</p>
        </section>
        <section>
          <h2 className="font-semibold text-ink">Directeur de la publication</h2>
          <p>Le représentant légal de Carrosserie Pro SAS.</p>
        </section>
        <section>
          <h2 className="font-semibold text-ink">Hébergement</h2>
          <p>Clever Cloud SAS — 4 rue Voltaire, 44000 Nantes, France.</p>
        </section>
        <section>
          <h2 className="font-semibold text-ink">Contact</h2>
          <p>contact@carrosserie-pro.fr</p>
        </section>
      </div>
    </div>
  );
}
