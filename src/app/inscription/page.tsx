"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerUser, type RegisterState } from "@/lib/actions/auth";

const initial: RegisterState = {};

function Field({
  name,
  label,
  type = "text",
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">
        {label} {required && <span className="text-promo">*</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-md border border-line px-3 py-2"
      />
    </label>
  );
}

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerUser, initial);

  if (state.success) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Demande enregistrée ✓</h1>
        <p className="mt-3 text-ink/70">
          Votre compte est <strong>en attente de validation</strong>. Après
          vérification de votre SIRET/KBIS, vous aurez accès aux tarifs et à la
          commande. Vous pouvez vous connecter dès maintenant.
        </p>
        <Link href="/connexion" className="btn-accent mt-6">Se connecter</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Inscription professionnelle</h1>
      <p className="mt-1 text-sm text-ink/60">
        Réservé aux professionnels. Accès aux tarifs après validation de votre SIRET.
      </p>

      <form action={action} className="mt-6 space-y-6">
        <fieldset className="space-y-4">
          <legend className="mb-2 font-display text-lg font-semibold">Identifiants</legend>
          <Field name="email" label="Email professionnel" type="email" required />
          <Field name="password" label="Mot de passe" type="password" required />
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="mb-2 font-display text-lg font-semibold">Entreprise</legend>
          <Field name="companyName" label="Raison sociale" required />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="siret" label="SIRET (14 chiffres)" required />
            <Field name="vatNumber" label="N° TVA intracommunautaire" />
          </div>
          <Field name="sector" label="Secteur d'activité" />
          <Field name="phone" label="Téléphone" />
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="mb-2 font-display text-lg font-semibold">Facturation</legend>
          <Field name="billingLine1" label="Adresse" required />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="billingZip" label="Code postal" required />
            <Field name="billingCity" label="Ville" required />
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="mb-2 font-display text-lg font-semibold">
            Livraison <span className="text-sm font-normal text-ink/50">(si différente)</span>
          </legend>
          <Field name="shippingLine1" label="Adresse" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="shippingZip" label="Code postal" />
            <Field name="shippingCity" label="Ville" />
          </div>
        </fieldset>

        {state.error && (
          <p className="rounded-md border border-promo/30 bg-promo/5 p-3 text-sm text-promo">
            {state.error}
          </p>
        )}

        <button type="submit" disabled={pending} className="btn-accent w-full">
          {pending ? "Envoi…" : "Créer mon compte pro"}
        </button>
        <p className="text-center text-sm text-ink/60">
          Déjà inscrit ? <Link href="/connexion" className="text-accent underline">Connexion</Link>
        </p>
      </form>
    </div>
  );
}
