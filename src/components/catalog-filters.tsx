"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Filtres latéraux du catalogue : marque, conditionnement, plage de prix + tri.
// Tous les filtres sont reflétés dans l'URL (querystring) pour rester partageables.
export function CatalogFilters({
  brands,
  packagings,
  grains = [],
}: {
  brands: string[];
  packagings: string[];
  grains?: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`${pathname}?${next.toString()}`);
  };

  const FilterGroup = ({
    title,
    paramKey,
    options,
  }: {
    title: string;
    paramKey: string;
    options: string[];
  }) => (
    <div>
      <p className="mb-2 font-semibold">{title}</p>
      <div className="space-y-1 text-sm">
        <button
          onClick={() => setParam(paramKey, "")}
          className={`block hover:text-accent ${!params.get(paramKey) ? "font-semibold text-accent" : "text-ink/70"}`}
        >
          Tous
        </button>
        {options.map((o) => (
          <button
            key={o}
            onClick={() => setParam(paramKey, o)}
            className={`block text-left hover:text-accent ${params.get(paramKey) === o ? "font-semibold text-accent" : "text-ink/70"}`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <aside className="space-y-6">
      {brands.length > 0 && <FilterGroup title="Marque" paramKey="brand" options={brands} />}
      {packagings.length > 0 && (
        <FilterGroup title="Conditionnement" paramKey="packaging" options={packagings} />
      )}
      {grains.length > 0 && <FilterGroup title="Grain" paramKey="grain" options={grains} />}

      <div>
        <p className="mb-2 font-semibold">Prix HT (€)</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="min"
            defaultValue={params.get("min") ?? ""}
            onBlur={(e) => setParam("min", e.target.value)}
            className="w-20 rounded-md border border-line px-2 py-1 text-sm"
          />
          <span className="text-ink/40">–</span>
          <input
            type="number"
            placeholder="max"
            defaultValue={params.get("max") ?? ""}
            onBlur={(e) => setParam("max", e.target.value)}
            className="w-20 rounded-md border border-line px-2 py-1 text-sm"
          />
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
