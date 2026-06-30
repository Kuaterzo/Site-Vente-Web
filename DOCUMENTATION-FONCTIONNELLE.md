# Documentation fonctionnelle — Carrosserie Pro

> Site e-commerce **B2B** de vente en gros de peintures et consommables pour
> carrosseries et garages professionnels. L'accès aux tarifs et à la commande
> est réservé aux **comptes professionnels validés**.

Ce document décrit le **comportement fonctionnel** de l'application : acteurs,
règles métier, parcours utilisateurs et écrans. Pour la mise en route technique,
voir [`README.md`](./README.md) ; pour le déploiement, voir
[`DEPLOY-CLEVER-CLOUD.md`](./DEPLOY-CLEVER-CLOUD.md).

---

## 1. Vue d'ensemble

L'application est une boutique en ligne où :

- Le **catalogue** (produits, descriptions, fiches techniques) est public.
- Les **prix** ne sont visibles que par les professionnels validés — sauf
  pour les produits explicitement marqués « prix public ».
- **Commander** (ajout au panier, paiement, facture) est strictement réservé
  aux professionnels validés.
- Un **back-office** permet à l'administrateur de gérer le catalogue, les
  stocks, les commandes et de valider les comptes.

L'application est mono-vendeur (l'émetteur des factures est unique :
« Carrosserie Pro SAS »).

### Stack technique

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Prisma · PostgreSQL ·
Auth.js (NextAuth v5) · Stripe · Zod · PDFKit.

---

## 2. Acteurs et rôles

| Acteur | Rôle / statut | Droits |
|---|---|---|
| **Visiteur** | non connecté | Voit le catalogue, les fiches produits et les prix « publics ». Ne voit pas les prix réservés, ne peut pas commander. |
| **Pro en attente** | `CUSTOMER` / `PENDING` | Compte créé mais non validé. Mêmes droits qu'un visiteur connecté ; bandeau l'informant que l'accès aux tarifs est en attente. |
| **Pro validé** | `CUSTOMER` / `APPROVED` | Voit tous les prix, ajoute au panier, commande, paye, télécharge ses factures, recommande. |
| **Pro refusé** | `CUSTOMER` / `REJECTED` | Accès équivalent à un visiteur connecté (prix réservés masqués, achat bloqué). |
| **Administrateur** | `ADMIN` | Accès complet au back-office + tous les droits d'un pro validé (les prix lui sont toujours visibles). |

Deux dimensions distinctes décrivent un utilisateur :

- **`role`** : `CUSTOMER` ou `ADMIN` (autorisation d'accès au back-office).
- **`status`** : `PENDING`, `APPROVED`, `REJECTED` (validation commerciale du
  compte pro).

### Comptes de démonstration (après `prisma db seed`)

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | `admin@carrosserie-pro.fr` | `admin1234` |
| Pro validé | `pro@atelier.fr` | `pro1234` |
| Pro en attente | `attente@garage.fr` | `pro1234` |

---

## 3. Règles métier centrales

Ces règles sont centralisées dans `src/lib/pricing.ts` et appliquées de façon
homogène dans toute l'application.

### 3.1 Visibilité des prix (`canSeePrice`)

Un prix est affiché si **l'une** des conditions est vraie :

- le produit est marqué **« prix public »** (`isPublicPrice = true`) ; **ou**
- l'utilisateur est un **pro validé** connecté (ou un admin).

Sinon, le prix est masqué et remplacé par une invitation à se connecter /
créer un compte pro.

### 3.2 Droit d'achat (`canBuy`)

L'ajout au panier, le passage de commande et la recommande sont **toujours**
réservés aux pros validés (`APPROVED`) ou aux admins — **indépendamment** du
caractère « prix public » d'un produit. Un produit à prix public reste donc
consultable et chiffré par tous, mais commandable uniquement par un pro validé.

### 3.3 Paliers de prix dégressifs (`tierPrice`)

Chaque conditionnement (variante) a un prix HT de base et peut définir des
**paliers** par quantité minimale (`minQty` → `priceHt`). Le prix unitaire
appliqué est celui du palier le plus élevé atteint par la quantité commandée ;
en dessous du premier palier, le prix de base s'applique.

> Exemple (seed) : base hydrodiluable 1 L → 49,00 € HT l'unité, 46,00 € à
> partir de 6, 43,00 € à partir de 12.

Le calcul est appliqué côté panier (`src/lib/cart-data.ts`) au chargement, donc
le prix se met à jour automatiquement quand la quantité change.

### 3.4 Validation des comptes pros

L'inscription crée un compte en statut `PENDING`. L'administrateur vérifie les
informations (SIRET / KBIS) puis passe le compte à `APPROVED` ou `REJECTED`.
Seul un compte `APPROVED` débloque les tarifs réservés et la commande.

### 3.5 Gestion du stock

- Le stock est suivi par **conditionnement** (variante).
- Au passage de commande, un **contrôle anti-survente** vérifie que chaque
  ligne du panier respecte le stock disponible ; sinon la commande est bloquée
  et l'utilisateur renvoyé au panier avec un message d'erreur.
- Le stock est **décrémenté** au moment où la commande passe en `PAID`
  (et non à la création de la commande), dans une transaction.

### 3.6 Montants et TVA

- Tous les montants sont stockés en **centimes, hors taxes** (entiers).
- La TVA est définie par variante (`vatRate`, 20 % par défaut).
- Les totaux commande = somme des lignes HT + TVA arrondie par ligne.

---

## 4. Parcours fonctionnels (front-office)

### 4.1 Navigation et catalogue

- **Accueil** (`/`) : mise en avant des produits « featured », entrée vers les
  catégories.
- **Catégorie** (`/categorie/[slug]`) : liste paginée (12 / page) des produits
  d'une catégorie avec :
  - **Filtres** : marque, conditionnement, fourchette de prix (min/max).
  - **Tri** : prix croissant, prix décroissant, nom.
  - Les options de filtre proposées couvrent toute la catégorie, indépendamment
    des filtres déjà actifs.
- **Fiche produit** (`/produit/[slug]`) : description, marque, référence
  fournisseur, **conditionnements** disponibles avec prix (selon visibilité) et
  paliers dégressifs, **stock**, **fiches techniques** (TDS/FDS) téléchargeables,
  bouton d'ajout au panier (si autorisé).

### 4.2 Recherche (`/recherche?q=...`)

Recherche combinée, optimisée pour le vocabulaire métier :

- **Recherche plein texte PostgreSQL** (configuration `french` : racinisation +
  classement par pertinence) sur le nom, la description et la marque.
- **Recherche `ILIKE`** complémentaire sur la **référence fournisseur** et le
  **SKU** (les références type `MIR-P400` se tokenisent mal en full-text).
- Résultats triés par pertinence, limités à 60.

### 4.3 Inscription pro (`/inscription`)

Formulaire avec validation (Zod) :

- Identifiants : email (unique), mot de passe (≥ 8 caractères).
- Entreprise : raison sociale, **SIRET (14 chiffres)**, n° TVA (optionnel),
  secteur, téléphone.
- **Adresse de facturation** (obligatoire) et **adresse de livraison**
  (optionnelle ; recopie la facturation si non renseignée).

À la soumission, le compte est créé en `PENDING` (mot de passe haché bcrypt),
avec sa société et ses adresses. **Anti-spam** : 3 inscriptions max par IP sur
10 minutes.

### 4.4 Connexion (`/connexion`)

Authentification par identifiants (email + mot de passe) via Auth.js
(stratégie JWT). Le rôle et le statut sont portés par la session.

### 4.5 Panier (`/panier`)

- Affiche les lignes avec prix unitaire **recalculé selon les paliers** et la
  quantité.
- Modification de quantité (suppression si ≤ 0), retrait de ligne.
- Totaux HT / TVA / TTC.
- Signale les ruptures de stock avant commande.

### 4.6 Commande et paiement (`/commande`)

1. Vérification du droit d'achat et du panier non vide.
2. Contrôle de stock (anti-survente).
3. Création de la **commande** en statut `PENDING` avec un **numéro**
   (`CMD-AAAAMM-NNNNN`) et les lignes **figées** (nom, conditionnement, prix
   unitaire, TVA au moment de l'achat).
4. **Paiement** :
   - **Si Stripe est configuré** : redirection vers Stripe Checkout
     (carte ou prélèvement SEPA). Au retour, page de confirmation.
   - **Sinon (mode démo/dev)** : la commande est marquée payée immédiatement.
5. **Confirmation** (`/commande/confirmee`).

La transition vers `PAID` (via webhook Stripe ou mode démo) déclenche, de façon
**idempotente** : décrément du stock, **création de la facture**, et **vidage
du panier**.

### 4.7 Espace compte (`/compte`)

- Vue synthèse : statut du compte, nombre de commandes, informations entreprise
  et adresses. Bandeau spécifique si compte en attente.
- **Mes commandes** (`/compte/commandes`) : historique avec statut, et action
  **« Recommander »** qui recharge les lignes d'une commande passée dans le
  panier.
- **Mes factures** (`/compte/factures`) : téléchargement des **factures PDF**.

### 4.8 Factures PDF (`/api/factures/[id]`)

Génère à la volée (PDFKit) une facture conforme B2B France :

- En-tête vendeur (mentions légales, SIRET, TVA, RCS).
- Bloc client (raison sociale, adresse, SIRET, TVA).
- Lignes détaillées (désignation, quantité, PU HT, TVA, total HT).
- Totaux HT / TVA / TTC.
- Mentions légales obligatoires (pénalités de retard, indemnité forfaitaire
  40 €, pas d'escompte — art. L441-10 C. com.).

**Contrôle d'accès** : seuls le **propriétaire** de la commande ou un **admin**
peuvent télécharger la facture.

### 4.9 Pages légales et statiques

Mentions légales, CGV, politique de confidentialité, bannière cookies,
`robots.txt` et `sitemap.xml` générés, page 404 personnalisée.

---

## 5. Back-office administrateur (`/admin`)

Accès protégé : **rôle `ADMIN` requis** (sinon redirection). Toutes les actions
serveur revérifient le rôle (`requireAdmin`).

| Écran | Fonctions |
|---|---|
| **Tableau de bord** (`/admin`) | Indicateurs : nombre de produits, comptes en attente, commandes, **CA TTC** (hors commandes annulées). |
| **Produits** (`/admin/produits`) | Liste, création, édition, suppression de produits ; bascule **« prix public »** ; mise à jour rapide du **stock**. |
| **Fiche produit admin** (`/admin/produits/[id]`) | Édition produit (nom, marque, catégorie, réf., description, image, mises en avant) ; gestion des **conditionnements** (prix, ancien prix barré, TVA, stock, SKU) ; **paliers de prix** ; **fiches techniques** (label + URL). |
| **Nouveau produit** (`/admin/produits/nouveau`) | Création (slug unique dérivé du nom). |
| **Catégories** (`/admin/categories`) | Gestion de l'arborescence des catégories. |
| **Commandes** (`/admin/commandes`) | Suivi et changement de **statut** des commandes (`PENDING` → `PAID` → `SHIPPED` → `DELIVERED`, ou `CANCELLED`). |
| **Comptes pros** (`/admin/comptes`) | **Validation / refus** des comptes (`APPROVED` / `REJECTED` / `PENDING`). |

---

## 6. Modèle de données (fonctionnel)

Schéma Prisma (`prisma/schema.prisma`). Entités principales :

- **User** — compte pro/admin : identifiants, `role`, `status`, infos société
  (raison sociale, SIRET, TVA, secteur, téléphone). Relations : Company,
  Address[], Cart[], Order[].
- **Company** — société rattachée au compte (1–1).
- **Address** — adresses `BILLING` / `SHIPPING`.
- **Category** — arborescence (auto-relation parent/enfants), `slug` unique.
- **Product** — produit : marque, réf. fournisseur, image, `isPublicPrice`,
  `isFeatured`, catégorie. Relations : ProductVariant[], TechnicalSheet[].
- **ProductVariant** — conditionnement : `packaging`, `sku` unique, `priceHt`,
  `oldPriceHt` (promo), `vatRate`, `stock`. Relations : PriceTier[].
- **PriceTier** — palier dégressif (`minQty` → `priceHt`).
- **TechnicalSheet** — document (TDS/FDS) : label + URL.
- **Cart / CartItem** — panier utilisateur ; unicité `(cartId, variantId)`.
- **Order / OrderItem** — commande + lignes **figées** au moment de l'achat
  (nom produit, conditionnement, prix unitaire, TVA). Statut, totaux, numéro
  unique, session Stripe, adresse.
- **Invoice** — facture (1–1 avec Order), numéro unique (`CMD…` → `FAC…`).

### Catégories métier (seed)

Peintures & bases · Vernis · Apprêts & sous-couches · Mastics · Durcisseurs &
diluants · Abrasifs · Masquage & protection · Pistolets & application ·
Outillage · EPI / Protection · Dégraissants & nettoyants · Entretien & finition.

---

## 7. Sécurité et contrôle d'accès

Le contrôle d'accès est appliqué à plusieurs niveaux (défense en profondeur) :

1. **Middleware Edge** (`src/middleware.ts`) : pré-filtrage des routes
   protégées (`/admin`, `/compte`, `/panier`, `/commande`) — redirige vers la
   connexion si aucun cookie de session, **avant** d'atteindre la page.
2. **Couche serveur (autoritaire)** : chaque page/layout protégé revérifie la
   session et le rôle/statut avec accès base (ex. `AdminLayout` exige `ADMIN`).
3. **Server actions** : chaque action sensible revérifie les droits
   (`canBuy`, `requireAdmin`) — un appel direct sans droit échoue.
4. **API factures** : vérification propriétaire ou admin.
5. **Rate limiting** (`src/lib/rate-limit.ts`) : limiteur en mémoire par IP
   (ex. inscription). À remplacer par Redis en cas de fort autoscaling.
6. **Mots de passe** : hachés avec **bcrypt**.
7. **Validation des entrées** : **Zod** sur l'inscription, la connexion et les
   formulaires produit admin.
8. **Webhook Stripe** : vérification de la **signature** ; rejet si invalide.

---

## 8. Intégrations externes

| Intégration | Rôle | Comportement si non configuré |
|---|---|---|
| **Stripe Checkout** | Paiement CB / SEPA, redirection hébergée. | Mode démo : la commande est marquée payée directement. |
| **Webhook Stripe** | Confirme le paiement (`checkout.session.completed`) → marque la commande payée. | Endpoint renvoie 503 si Stripe non configuré. |
| **PDFKit** | Génération des factures PDF à la volée. | — |
| **PostgreSQL full-text** | Recherche métier (config `french`). | — |

---

## 9. Configuration

Variables d'environnement (`.env.example`) :

| Variable | Usage |
|---|---|
| `DATABASE_URL` | Connexion PostgreSQL. |
| `NEXTAUTH_URL` | URL publique de l'app (URLs de retour Stripe, callbacks). |
| `NEXTAUTH_SECRET` | Secret de signature des sessions JWT. |
| `AUTH_TRUST_HOST` | Confiance à l'hôte (déploiement). |
| `STRIPE_SECRET_KEY` | Clé serveur Stripe (absente ⇒ mode démo). |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clé publique Stripe (front). |
| `STRIPE_WEBHOOK_SECRET` | Vérification de signature des webhooks. |

---

## 10. Identité visuelle

Base neutre (bleu nuit `#0F2A43` + gris) avec un accent orange `#F97316`
**réservé exclusivement** aux **prix, badges et boutons d'action** (règle 90/10).
