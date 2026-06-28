"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Filtres latéraux du catalogue : marque + tri. Met à jour l'URL (querystring).
export function CatalogFilters({ brands }: { brands: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`${pathname}?${next.toString()}`);
  };

  return (
    <aside className="space-y-6">
      <div>
        <p className="mb-2 font-semibold">Marque</p>
        <div className="space-y-1 text-sm">
          <button
            onClick={() => setParam("brand", "")}
            className={`block hover:text-accent ${!params.get("brand") ? "font-semibold text-accent" : "text-ink/70"}`}
          >
            Toutes
          </button>
          {brands.map((b) => (
            <button
              key={b}
              onClick={() => setParam("brand", b)}
              className={`block hover:text-accent ${params.get("brand") === b ? "font-semibold text-accent" : "text-ink/70"}`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 font-semibold">Trier par</p>
        <select
          value={params.get("sort") ?? ""}
          onChange={(e) => setParam("sort", e.target.value)}
          className="w-full rounded-md border border-line bg-white px-2 py-1.5 text-sm"
        >
          <option value="">Pertinence</option>
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix décroissant</option>
          <option value="name">Nom (A-Z)</option>
        </select>
      </div>
    </aside>
  );
}
