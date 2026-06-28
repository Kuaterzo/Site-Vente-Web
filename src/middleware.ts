import { NextResponse, type NextRequest } from "next/server";

// Pré-filtrage Edge des routes protégées (défense en profondeur).
// Le contrôle de rôle/statut autoritaire reste fait côté serveur (layout/pages
// avec accès DB) ; ici on bloque simplement l'accès non authentifié au plus tôt.
const PROTECTED = ["/admin", "/compte", "/panier", "/commande"];

function hasSessionCookie(req: NextRequest): boolean {
  // Auth.js v5 : "authjs.session-token" (dev) / "__Secure-authjs.session-token" (prod)
  return req.cookies
    .getAll()
    .some((c) => c.name.endsWith("authjs.session-token") && c.value.length > 0);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!needsAuth) return NextResponse.next();

  if (!hasSessionCookie(req)) {
    const url = new URL("/connexion", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/compte/:path*", "/panier", "/commande/:path*"],
};
