"use client";

import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginUser, type LoginState } from "@/lib/actions/login";

const initial: LoginState = {};

function LoginForm() {
  const [state, action, pending] = useActionState(loginUser, initial);
  const callbackUrl = useSearchParams().get("callbackUrl") ?? "/compte";

  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Email</span>
        <input name="email" type="email" required className="w-full rounded-md border border-line px-3 py-2" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Mot de passe</span>
        <input name="password" type="password" required className="w-full rounded-md border border-line px-3 py-2" />
      </label>
      {state.error && (
        <p className="rounded-md border border-promo/30 bg-promo/5 p-3 text-sm text-promo">{state.error}</p>
      )}
      <button type="submit" disabled={pending} className="btn-accent w-full">
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-display text-3xl font-bold">Connexion</h1>
      <Suspense>
        <LoginForm />
      </Suspense>
      <p className="mt-4 text-center text-sm text-ink/60">
        Pas encore de compte ? <Link href="/inscription" className="text-accent underline">Inscription pro</Link>
      </p>
    </div>
  );
}
