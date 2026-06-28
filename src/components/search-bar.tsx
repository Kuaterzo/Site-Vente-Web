"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim()) router.push(`/recherche?q=${encodeURIComponent(q.trim())}`);
      }}
      className="flex"
    >
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Rechercher par nom, marque ou référence…"
        aria-label="Recherche"
        className="w-full rounded-l-md border-0 px-3 py-2 text-ink"
      />
      <button type="submit" className="btn-accent rounded-l-none">
        OK
      </button>
    </form>
  );
}
