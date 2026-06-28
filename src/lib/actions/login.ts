"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type LoginState = { error?: string };

export async function loginUser(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
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
