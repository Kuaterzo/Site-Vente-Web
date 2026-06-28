# Déploiement sur Clever Cloud

Procédure pas à pas pour héberger l'application sur **Clever Cloud** (PaaS français,
souverain/RGPD). La plateforme gère build, scaling, sauvegardes, mises à jour et SSL —
**pas de PM2, Nginx, Certbot ni `output: standalone`**.

## 1. Pré-requis

```bash
npm install -g clever-tools
clever login
```

## 2. Créer l'application Node.js

```bash
# Depuis la racine du projet
clever create --type node "carrosserie-pro"
```

Clever détecte automatiquement le runtime Node.js depuis `package.json`.

## 3. Add-on PostgreSQL managé

```bash
clever addon create postgresql-addon --plan dev "carrosserie-db"
clever service link-addon "carrosserie-db"
```

L'add-on expose automatiquement la variable `POSTGRESQL_ADDON_URI`. On la mappe sur
`DATABASE_URL` (voir étape suivante). Sauvegardes, mises à jour et SSL sont gérés par
la plateforme.

## 4. Variables d'environnement

```bash
clever env set DATABASE_URL "$(clever env | grep POSTGRESQL_ADDON_URI | cut -d= -f2-)"
clever env set NEXTAUTH_URL "https://<votre-domaine>"
clever env set NEXTAUTH_SECRET "$(openssl rand -base64 32)"
clever env set AUTH_TRUST_HOST true
clever env set STRIPE_SECRET_KEY "sk_live_xxx"
clever env set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY "pk_live_xxx"
clever env set STRIPE_WEBHOOK_SECRET "whsec_xxx"
```

> `DATABASE_URL` peut aussi être renseigné directement avec l'URI de l'add-on depuis la
> console Clever Cloud.

## 5. Hooks de déploiement

À configurer dans la console (Information → Environment variables) ou via CLI :

```bash
clever env set CC_POST_BUILD_HOOK "npm run build"
clever env set CC_RUN_COMMAND "npx prisma migrate deploy && npm run start"
```

- `npm run build` → `prisma generate && next build`
- `npm run start` → `next start -p ${PORT:-8080} -H 0.0.0.0` (Clever fournit `PORT=8080`)
- `prisma migrate deploy` applique les migrations avant le démarrage.

## 6. Première migration + seed

Créez la migration initiale en local, puis seedez la base managée :

```bash
# Migration (génère prisma/migrations)
npx prisma migrate dev --name init

# Seed exécuté UNE FOIS contre l'URI de la base managée
DATABASE_URL="<uri-add-on-postgresql>" npx prisma db seed
```

## 7. Déployer

```bash
git push clever Clever:master   # ou: clever deploy
```

## 8. Domaine + TLS

```bash
clever domain add <votre-domaine>
```

HTTPS est automatique. Aucun certificat à gérer.

## 9. Webhook Stripe

Dans le dashboard Stripe, ajoutez l'endpoint :

```
https://<votre-domaine>/api/webhooks/stripe
```

Évènement à écouter : `checkout.session.completed`. Reportez le `whsec_...` dans
`STRIPE_WEBHOOK_SECRET`.

## 10. Autoscaling (optionnel)

```bash
clever scale --min-instances 1 --max-instances 3
```

## Comptes de démonstration (après seed)

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | `admin@carrosserie-pro.fr` | `admin1234` |
| Pro validé | `pro@atelier.fr` | `pro1234` |
| Pro en attente | `attente@garage.fr` | `pro1234` |
