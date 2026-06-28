import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 bg-primary text-white/80">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 text-sm md:grid-cols-4">
        <div>
          <p className="font-display text-lg font-bold text-white">
            CARROSSERIE<span className="text-accent">PRO</span>
          </p>
          <p className="mt-2 text-white/60">
            Grossiste B2B en peintures et consommables pour carrosseries et
            garages professionnels.
          </p>
        </div>
        <div>
          <p className="mb-2 font-semibold text-white">Catalogue</p>
          <ul className="space-y-1">
            <li><Link href="/categorie/peintures-bases" className="hover:text-accent">Peintures & bases</Link></li>
            <li><Link href="/categorie/vernis" className="hover:text-accent">Vernis</Link></li>
            <li><Link href="/categorie/abrasifs" className="hover:text-accent">Abrasifs</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-2 font-semibold text-white">Compte</p>
          <ul className="space-y-1">
            <li><Link href="/inscription" className="hover:text-accent">Inscription pro</Link></li>
            <li><Link href="/connexion" className="hover:text-accent">Connexion</Link></li>
            <li><Link href="/compte/commandes" className="hover:text-accent">Mes commandes</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-2 font-semibold text-white">Informations</p>
          <ul className="space-y-1">
            <li><Link href="/mentions-legales" className="hover:text-accent">Mentions légales</Link></li>
            <li><Link href="/cgv" className="hover:text-accent">CGV</Link></li>
            <li><Link href="/confidentialite" className="hover:text-accent">Confidentialité</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Carrosserie Pro — Prix HT réservés aux professionnels.
      </div>
    </footer>
  );
}
