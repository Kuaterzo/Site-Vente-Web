import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

const NAV = [
  ["/admin", "Tableau de bord"],
  ["/admin/produits", "Produits"],
  ["/admin/categories", "Catégories"],
  ["/admin/commandes", "Commandes"],
  ["/admin/comptes", "Comptes pros"],
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  // Protection de toutes les routes /admin/* : rôle ADMIN requis.
  if (!session?.user) redirect("/connexion?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/");

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:grid-cols-[200px_1fr]">
      <aside>
        <p className="font-display text-lg font-bold">Back-office</p>
        <nav className="mt-3 space-y-1 text-sm">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} className="block rounded px-2 py-1.5 hover:bg-page hover:text-accent">
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
