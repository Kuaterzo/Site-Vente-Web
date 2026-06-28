import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-display text-6xl font-bold text-accent">404</p>
      <h1 className="mt-2 font-display text-2xl font-bold">Page introuvable</h1>
      <p className="mt-2 text-ink/60">Cette page n'existe pas ou a été déplacée.</p>
      <Link href="/" className="btn-accent mt-6">Retour à l'accueil</Link>
    </div>
  );
}
