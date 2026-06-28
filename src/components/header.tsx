import Link from "next/link";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SearchBar } from "./search-bar";

export async function Header() {
  const session = await auth();
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    take: 12,
  });

  return (
    <header>
      {/* Barre du haut — bleu nuit foncé */}
      <div className="bg-primary-dark text-white/80 text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5">
          <span>Grossiste B2B — réservé aux professionnels</span>
          <span className="hidden sm:block">Livraison 24-72h · Paiement sécurisé</span>
        </div>
      </div>

      {/* Bandeau principal — bleu nuit */}
      <div className="bg-primary text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Link href="/" className="font-display text-2xl font-bold tracking-tight">
            CARROSSERIE<span className="text-accent">PRO</span>
          </Link>
          <div className="flex-1">
            <SearchBar />
          </div>
          <nav className="flex items-center gap-4 text-sm">
            {session?.user ? (
              <>
                <Link href="/compte" className="hover:text-accent">
                  {session.user.name ?? "Mon compte"}
                </Link>
                {session.user.role === "ADMIN" && (
                  <Link href="/admin" className="hover:text-accent">
                    Admin
                  </Link>
                )}
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  <button className="hover:text-accent">Déconnexion</button>
                </form>
              </>
            ) : (
              <>
                <Link href="/connexion" className="hover:text-accent">
                  Connexion
                </Link>
                <Link href="/inscription" className="btn-accent py-1.5">
                  Inscription pro
                </Link>
              </>
            )}
            <Link href="/panier" className="hover:text-accent">
              Panier
            </Link>
          </nav>
        </div>
      </div>

      {/* Navigation catégories */}
      <nav className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-x-5 gap-y-1 px-4 py-2 text-sm">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/categorie/${c.slug}`}
              className="text-ink/70 hover:text-accent"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
