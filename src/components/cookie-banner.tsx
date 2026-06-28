"use client";

import { useEffect, useState } from "react";

// Bandeau cookies conforme RGPD (consentement explicite, mémorisé).
export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("cookie-consent")) setShow(true);
  }, []);

  if (!show) return null;

  const decide = (value: string) => {
    localStorage.setItem("cookie-consent", value);
    setShow(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white p-4 shadow-lg">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 text-sm md:flex-row">
        <p className="flex-1 text-ink/80">
          Nous utilisons uniquement des cookies nécessaires au fonctionnement du
          site (session, panier). Voir notre{" "}
          <a href="/confidentialite" className="text-accent underline">
            politique de confidentialité
          </a>
          .
        </p>
        <div className="flex gap-2">
          <button onClick={() => decide("essential")} className="btn-outline py-1.5">
            Refuser
          </button>
          <button onClick={() => decide("all")} className="btn-accent py-1.5">
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
