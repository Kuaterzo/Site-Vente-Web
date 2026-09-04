# Documentation technique — Carrosserie Pro

Documentation du code du site e-commerce **B2B** (grossiste carrosserie auto).
Elle explique l'architecture, le modèle de données, la logique métier et le rôle
de chaque fichier. À lire avec le [README](./README.md) (démarrage) et
[DEPLOY-CLEVER-CLOUD.md](./DEPLOY-CLEVER-CLOUD.md) (mise en production).

---

## 1. Vue d'ensemble

Application **Next.js 15 (App Router)** rendue côté serveur. Les pages catalogue
sont des Server Components qui lisent PostgreSQL via Prisma ; les mutations
(panier, commande, admin, inscription) passent par des **Server Actions**. Aucune
API REST publique côté client hormis les routes techniques (`/api/auth`,
`/api/webhooks/stripe`, `/api/factures/[id]`).

Principe métier structurant : **les prix et la commande sont réservés aux
professionnels validés**, avec une exception par produit (`isPublicPrice`) qui
rend le tarif visible à tous. Cette règle est centralisée dans un seul module
(`src/lib/pricing.ts`) et appliquée partout.

### Flux principaux

```
Inscription pro (SIRET) ──► compte PENDING ──► validation admin ──► APPROVED
                                                                      │
Visiteur ──► catalogue (prix masqués sauf « prix public »)            │
Pro validé ──► voit les prix ──► panier ──► commande ──► Stripe ──► facture PDF
Admin ──► back-office (produits, stocks, commandes, validation, prix public)
```

---

## 2. Stack & arborescence

| Couche | Techno |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Style | Tailwind CSS (charte couleur 90/10) |
| Base de données | PostgreSQL + Prisma |
| Auth | Auth.js (NextAuth v5) — credentials, session JWT |
| Paiement | Stripe (CB / SEPA) + webhook |
| Validation | Zod |
| PDF | pdfkit |
| Tests | `node:test` (runner natif) |

```
src/
├── app/                 Routes (App Router)
│   ├── (pages publiques : accueil, categorie, produit, recherche, légales)
│   ├── compte/          Espace client (dashboard, commandes, factures)
│   ├── admin/           Back-office (protégé rôle ADMIN)
│   └── api/             auth, webhooks/stripe, factures/[id]
├── components/          Composants UI (dont admin/)
├── lib/                 Logique métier
│   ├── actions/         Server Actions (mutations)
│   └── (prisma, pricing, cart-data, stripe, invoice-pdf, rate-limit, utils)
└── middleware.ts        Pré-filtrage Edge des routes protégées
prisma/
├── schema.prisma        Modèle de données
├── migrations/          Migrations SQL versionnées
└── seed.ts              Données de démonstration
```

---

## 3. Modèle de données (`prisma/schema.prisma`)

Montants monétaires stockés en **centimes** (entiers) pour éviter les erreurs de
flottant ; le formatage en euros se fait à l'affichage (`formatPrice`).

| Entité | Rôle | Champs / relations notables |
|---|---|---|
| `User` | Compte pro ou admin | `role` (CUSTOMER/ADMIN), `status` (PENDING/APPROVED/REJECTED), `siret`, `vatNumber` |
| `Company` | Infos société liées au user | 1-1 avec `User` |
| `Address` | Adresses facturation/livraison | `type` (BILLING/SHIPPING) |
| `Category` | Catégories (arbre) | auto-relation `parent`/`children` |
| `Product` | Fiche produit | `isPublicPrice`, `isFeatured`, `grain` (abrasifs) |
| `ProductVariant` | Conditionnement | `packaging`, `priceHt`, `oldPriceHt`, `vatRate`, `stock` |
| `PriceTier` | Palier dégressif | `minQty`, `priceHt` (par variante) |
| `TechnicalSheet` | Fiche technique | `label` (FDS/TDS), `url` |
| `Cart` / `CartItem` | Panier | unicité `(cartId, variantId)` |
| `Order` / `OrderItem` | Commande | `status`, totaux figés, prix figé par ligne |
| `Invoice` | Facture | `number`, 1-1 avec `Order` |

Points d'attention :
- Les `OrderItem` **figent** `productName`, `packaging`, `unitPriceHt` et
  `vatRate` au moment de la commande : la facture reste correcte même si le
  produit change ensuite.
- Le statut de validation (`AccountStatus`) est la clé du contrôle d'accès
  métier (voir §5).

Une modification de schéma se fait via `prisma migrate dev --name <x>` (dev) puis
`prisma migrate deploy` (prod). Ex. la migration `add_product_grain` a ajouté le
champ `Product.grain`.

---

## 4. Logique métier centrale

### 4.1 Visibilité des prix & droit d'achat — `src/lib/pricing.ts`

Trois fonctions pures, testées, utilisées partout :

- `isApprovedPro(session)` — l'utilisateur est-il un pro validé (ou admin) ?
- `canSeePrice(isPublicPrice, session)` — le prix est visible si le produit est
  « prix public » **ou** si l'utilisateur est un pro validé.
- `canBuy(session)` — l'ajout au panier et la commande sont **toujours** réservés
  aux pros validés, même sur un produit à prix public.
- `tierPrice(basePriceHt, tiers, qty)` — renvoie le prix unitaire applicable
  selon la quantité (palier dégressif le plus avantageux atteint).

> Toute page/action qui affiche un prix appelle `canSeePrice` ; toute mutation
> d'achat appelle `canBuy`. C'est le point unique de vérité de la règle B2B.

### 4.2 Panier & totaux — `src/lib/cart-data.ts`

`loadCart(userId)` charge le panier, applique les paliers (`tierPrice`) et calcule
les totaux HT/TVA/TTC. Réutilisé à l'identique par la page panier et le tunnel de
commande pour garantir la cohérence des montants.

### 4.3 Prix / promo à l'affichage — `src/lib/utils.ts`

- `formatPrice(cents)` → `"12,34 €"` (Intl fr-FR).
- `discountPercent(old, new)` → pourcentage de remise (0 si pas de promo).

---

## 5. Authentification & sécurité

### 5.1 Auth.js — `src/auth.ts`

- Provider **credentials** (email + mot de passe) ; vérification bcrypt.
- Session **JWT** : le `role` et le `status` sont injectés dans le token
  (callback `jwt`) puis exposés dans `session.user` (callback `session`), ce qui
  évite un appel base à chaque vérification d'accès.
- Route handler NextAuth : `src/app/api/auth/[...nextauth]/route.ts`.

### 5.2 Protection des routes — défense en profondeur

1. **Middleware Edge** (`src/middleware.ts`) : pré-filtre `/admin`, `/compte`,
   `/panier`, `/commande` — redirige vers `/connexion` si aucun cookie de session.
   Rapide, mais **non autoritaire**.
2. **Contrôle serveur autoritaire** : le layout admin
   (`src/app/admin/layout.tsx`) vérifie `role === ADMIN` avec accès base ; les
   pages `/compte` et les actions vérifient l'authentification et le statut.
3. **Actions admin** : chaque action (`src/lib/actions/admin*.ts`) revérifie le
   rôle côté serveur (`requireAdmin`) — on ne fait jamais confiance au client.

### 5.3 Rate limiting — `src/lib/rate-limit.ts`

Limiteur en mémoire (fenêtre glissante) par IP appliqué à la connexion
(5/min) et à l'inscription (3/10 min), contre le brute-force et le spam.
> En autoscaling horizontal fort, le remplacer par un store partagé (Redis).

### 5.4 Validation des entrées

Tous les formulaires sensibles valident via **Zod** (inscription, connexion,
produit admin) avant tout accès base.

---

## 6. Modules fonctionnels

### 6.1 Catalogue (public)

| Fichier | Rôle |
|---|---|
| `app/page.tsx` | Accueil : hero, catégories, sélection (`isFeatured`), marques, réassurance |
| `app/categorie/[slug]/page.tsx` | Liste filtrable + triable + **paginée** (12/page) |
| `components/catalog-filters.tsx` | Filtres marque / conditionnement / **grain** / plage de prix / tri (via querystring) |
| `app/produit/[slug]/page.tsx` | Fiche : specs, grain, conditionnements, paliers, fiche technique |
| `app/recherche/page.tsx` | Recherche **plein texte PostgreSQL** (`french`, ranking) + ILIKE réf/SKU |
| `components/product-card.tsx` | Carte dense (marque, nom, réf, stock, prix) |
| `components/price-display.tsx` | Prix orange/gras, ancien prix barré, ou encart « 🔒 Connectez-vous » |
| `components/badges.tsx` | Badges « Prix public », « −X % », « En stock » |

Le tri par prix et le filtre prix s'appliquent sur le **prix du conditionnement
le moins cher** (premier variant trié). La recherche full-text est expliquée dans
`recherche/page.tsx` (fonction `searchProductIds`).

### 6.2 Comptes pros

| Fichier | Rôle |
|---|---|
| `app/inscription/page.tsx` + `lib/actions/auth.ts` | Inscription SIRET → compte PENDING |
| `app/connexion/page.tsx` + `lib/actions/login.ts` | Connexion (rate-limitée) |
| `app/compte/page.tsx` | Tableau de bord (statut, société, adresses) |
| `app/compte/commandes/page.tsx` + `lib/actions/reorder.ts` | Historique + **recommander** |
| `app/compte/factures/page.tsx` | Liste des factures (lien PDF) |

Le workflow de validation : inscription crée un `User` en `PENDING` ; tant qu'il
n'est pas `APPROVED` par l'admin, `canSeePrice`/`canBuy` renvoient false (prix
masqués, commande bloquée).

### 6.3 Panier, commande & paiement

| Fichier | Rôle |
|---|---|
| `app/panier/page.tsx` + `lib/actions/cart.ts` | Panier (add/update/remove), alertes stock |
| `components/add-to-cart.tsx` | Sélecteur conditionnement + quantité + paliers |
| `app/commande/page.tsx` + `lib/actions/checkout.ts` | Tunnel + création commande |
| `lib/stripe.ts` | Client Stripe + génération de numéro de commande |
| `app/api/webhooks/stripe/route.ts` | Webhook `checkout.session.completed` |
| `app/commande/confirmee/page.tsx` | Confirmation (consciente du statut réel) |

Détails importants (`lib/actions/checkout.ts`) :
- **Contrôle de stock** avant création de commande (anti-survente) → redirection
  `/panier?error=stock` si dépassement.
- Si Stripe est configuré : création d'une `checkout.session`, la commande est
  marquée **payée par le webhook** (source de vérité). Sinon (dev/démo) :
  `markOrderPaid` immédiat.
- `markOrderPaid` est **idempotent** : passe la commande en `PAID`, décrémente le
  stock, crée la facture, vide le panier — le tout dans une transaction.

### 6.4 Factures PDF

| Fichier | Rôle |
|---|---|
| `lib/invoice-pdf.ts` | Génère le PDF (pdfkit) : émetteur, client SIRET/TVA, lignes HT, TVA, TTC, mentions légales B2B |
| `app/api/factures/[id]/route.ts` | Téléchargement protégé (**propriétaire ou admin**) |

> `pdfkit` est déclaré dans `serverExternalPackages` (`next.config.ts`) pour ne
> pas être bundlé (il lit ses polices `.afm` via `fs`).

### 6.5 Back-office admin (`/admin/*`, rôle ADMIN)

| Fichier | Rôle |
|---|---|
| `app/admin/layout.tsx` | Garde d'accès + navigation |
| `app/admin/page.tsx` | Tableau de bord (compteurs, CA) |
| `app/admin/produits/*` + `lib/actions/admin-products.ts` | **CRUD produit complet** : fiche, variantes, paliers, fiches techniques, grain |
| `components/admin/product-form.tsx` | Formulaire produit (création/édition) |
| `components/admin/product-controls.tsx` | Toggle « prix public » + édition stock inline |
| `app/admin/comptes/page.tsx` + `components/admin/account-actions.tsx` | **Validation des comptes** (approuver/refuser) |
| `app/admin/commandes/page.tsx` + `components/admin/order-status.tsx` | Suivi + changement de statut |
| `app/admin/categories/page.tsx` | Catégories + nb de produits |

Les actions admin convertissent les prix saisis en euros vers des centimes
(`eurosToCents`) et génèrent un slug unique à la création (`slugify`).

---

## 7. Charte visuelle

Définie dans `tailwind.config.ts` et `src/app/globals.css`. Règle **90/10** :
~90 % de neutres (bleu nuit `#0F2A43` + gris), **orange `#F97316` réservé aux prix,
badges et boutons d'action**. Classes utilitaires clés : `.price`, `.btn-accent`,
`.btn-outline`, `.card`. Typo : titres condensés (Barlow Semi Condensed), texte
courant Inter. Accessibilité : focus visible, `prefers-reduced-motion`, contrastes
WCAG AA.

---

## 8. Configuration & déploiement

- **Variables d'env** : voir `.env.example` (`DATABASE_URL`, `NEXTAUTH_*`,
  `AUTH_TRUST_HOST`, `STRIPE_*`).
- **Scripts** (`package.json`) : `build` (`prisma generate && next build`),
  `start` (`next start` sur `$PORT`), `test`, `lint`.
- **Cible Clever Cloud** : écoute `process.env.PORT`, PostgreSQL managé en add-on,
  migrations via `prisma migrate deploy`. Procédure complète dans
  `DEPLOY-CLEVER-CLOUD.md`.

---

## 9. Tests

`src/lib/pricing.test.ts` (runner `node:test`, lancé par `npm test`) couvre la
logique critique : visibilité des prix (`canSeePrice`), droit d'achat (`canBuy`),
paliers dégressifs (`tierPrice`), remise (`discountPercent`), formatage
(`formatPrice`). Ce sont les règles dont une régression coûterait le plus cher
(prix affichés à tort, mauvais tarif facturé).

---

## 10. Conventions de code

- **Montants en centimes** partout ; formatage à l'affichage uniquement.
- **Server Components par défaut** ; `"use client"` seulement quand
  l'interactivité l'exige (formulaires dynamiques, filtres, toggles).
- **Server Actions** dans `src/lib/actions/` ; chaque action sensible revérifie
  l'autorisation côté serveur.
- **Un composant = un fichier**, fichiers courts et modulaires.
- Commentaires en français sur les décisions non triviales (règles B2B, sécurité,
  contournements techniques comme l'externalisation de pdfkit).
