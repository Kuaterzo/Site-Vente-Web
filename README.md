# Carrosserie Pro — Site e-commerce B2B

Site de vente en gros de peintures et consommables pour carrosseries et garages
professionnels. Accès aux tarifs réservé aux comptes pros validés.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Prisma · PostgreSQL ·
Auth.js (NextAuth) · Stripe · Zod.

## Démarrage local

```bash
cp .env.example .env        # renseigner DATABASE_URL, NEXTAUTH_SECRET, etc.
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

App sur http://localhost:3000.

## Comptes de démo (après seed)

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | `admin@carrosserie-pro.fr` | `admin1234` |
| Pro validé | `pro@atelier.fr` | `pro1234` |
| Pro en attente | `attente@garage.fr` | `pro1234` |

## Fonctionnalités (MVP)

- Catalogue par catégorie avec filtres (marque) et tri ; recherche par mot-clé / référence.
- Fiche produit : conditionnements, paliers de prix dégressifs, fiche technique, stock.
- Visibilité du prix configurable par produit (`isPublicPrice`) ; sinon réservé aux pros validés.
- Comptes pros : inscription SIRET → validation admin → accès complet.
- Panier, tunnel de commande, paiement Stripe (CB/SEPA), facture.
- Historique de commandes + **recommander**, factures PDF.
- Back-office admin : produits, stocks, catégories, commandes, validation des comptes,
  activation du « prix public ».

## Déploiement

Voir [`DEPLOY-CLEVER-CLOUD.md`](./DEPLOY-CLEVER-CLOUD.md).

## Charte couleur

Base neutre (bleu nuit `#0F2A43` + gris) avec un accent orange `#F97316` réservé
exclusivement aux **prix, badges et boutons d'action** (règle 90/10).
