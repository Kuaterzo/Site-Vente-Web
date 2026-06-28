"use client";

import { useTransition } from "react";
import { setAccountStatus } from "@/lib/actions/admin";

export function AccountActions({ userId }: { userId: string }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex gap-2">
      <button
        onClick={() => start(() => setAccountStatus(userId, "APPROVED"))}
        disabled={pending}
        className="rounded bg-stock px-3 py-1 text-xs font-medium text-white"
      >
        Valider
      </button>
      <button
        onClick={() => start(() => setAccountStatus(userId, "REJECTED"))}
        disabled={pending}
        className="rounded border border-promo px-3 py-1 text-xs font-medium text-promo"
      >
        Refuser
      </button>
    </div>
  );
}
