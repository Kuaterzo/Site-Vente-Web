"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export type LoginState = { error?: string };

export async function loginUser(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  // Limite les tentatives : 5 / minute / IP (anti brute-force).
  if (!rateLimit(await clientKey("login"), 5, 60_000)) {
    return { error: "Trop de tentatives. Réessayez dans une minute." };
  }
  const callbackUrl = (formData.get("callbackUrl") as string) || "/compte";
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: callbackUrl,
    });
    return {};
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "Email ou mot de passe incorrect." };
    }
    throw e; // redirect interne de NextAuth
  }
}
