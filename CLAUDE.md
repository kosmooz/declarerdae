# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**declarerdefibrillateur.fr** est un service simplifié de déclaration de défibrillateurs automatisés externes (DAE) conforme à la réglementation française. La plateforme combine un site vitrine institutionnel (style Service Public Numérique / .gouv.fr) avec une application full-stack pour la gestion des déclarations, la signature de contrats (Yousign) et l'administration.

**Design** : style institutionnel français unifié (front + admin) — Bleu marine (#000091) + Rouge (#E1000F) + Vert (#18753C) + Blanc. Sidebar admin : bleu sombre (#1B1B35). Fonts : Libre Franklin (titres) + Source Sans 3 (corps).

## Architecture

**Monorepo** avec deux services principaux :

```
api/          # NestJS backend (Prisma + PostgreSQL)
web/          # Next.js 16 App Router frontend
nginx/        # Reverse proxy configuration
```

### API (NestJS)

- **ORM**: Prisma with PostgreSQL
- **Auth**: JWT (access + refresh tokens), argon2id password hashing
- **Modules**: Auth, Users, Admin, Mail, Upload, Yousign, Subscriptions, Declarations, Health, Blog, GéoDAE
- **Port**: 3021 (local dev), 3001 (Docker internal)
- **Global prefix**: `/api`
- **Validation**: class-validator with whitelist + forbidNonWhitelisted
- **Swagger**: available at `/api/docs` in dev mode

### Web (Next.js 16)

- **Router**: App Router with route groups
- **UI**: shadcn/ui (new-york style) + Radix primitives
- **Styling**: Tailwind CSS v4, OKLCH CSS variables, theme in `globals.css`
- **Animations**: ScrollReveal (IntersectionObserver), StatCounter
- **Forms**: react-hook-form + zod (souscrire), native forms (declaration, contact)
- **Port**: 3020 (local dev), 3000 (Docker internal)
- **API Proxy** : `next.config.mjs` rewrites `/api/*` → `http://localhost:3021/api/*` en dev — utiliser des URLs relatives (`/api/...`) pour les fetch et les `<img>` src
- **Turbopack** : ne PAS utiliser de caractères Unicode (─, ═, etc.) dans les commentaires JSX `{/* ... */}` — provoque un crash du code frame renderer

### Path Aliases

| Alias | Resolves to |
|-------|-------------|
| `@/*` | `web/src/*` |

## Route Structure

```
web/src/app/
├── (landing)/                    # Route group: pages publiques
│   ├── layout.tsx               # Layout avec Header + Footer declarerdae
│   ├── page.tsx                 # Page d'accueil (landing complète)
│   ├── obligations/page.tsx     # Obligations légales DAE
│   ├── guide-erp/page.tsx       # Guide ERP et catégories
│   ├── tarifs/page.tsx          # Plans tarifaires
│   ├── a-propos/page.tsx        # Notre mission
│   ├── contact/page.tsx         # Formulaire de contact
│   ├── mentions-legales/page.tsx
│   ├── politique-de-confidentialite/page.tsx
│   ├── declaration/page.tsx      # Formulaire de déclaration DAE public
│   ├── blog/                    # Blog public
│   └── defibrillateur/          # Page produit 3D (legacy STAR aid)
├── admin/                        # Dashboard admin (protégé)
│   ├── declarations/            # Gestion déclarations DAE (liste + détail)
│   ├── blog/                    # Gestion blog (CRUD + éditeur blocs)
│   ├── users/                   # Gestion utilisateurs
│   └── reglages/                # Paramètres boutique
├── dashboard/                    # Espace utilisateur (protégé)
├── souscrire/                    # Flux de souscription multi-étapes
├── verify-email/
├── reset-password/
├── layout.tsx                    # Root layout (fonts, providers)
├── globals.css                   # Thème global + CSS custom
├── error.tsx
└── not-found.tsx
```

## Component Architecture

### DeclarerDAE Components (`components/declarerdae/`)

Composants spécifiques au site declarerdefibrillateur.fr :

| Composant | Description | Client? |
|-----------|-------------|---------|
| `Header.tsx` | Header sticky avec tricolor band, nav dropdown, mobile menu | Oui |
| `Footer.tsx` | Footer 4 colonnes, liens institutionnels | Non |
| `Breadcrumb.tsx` | Fil d'Ariane pour pages internes | Non |
| `PageHero.tsx` | Hero compact pour sous-pages (fond bleu, tag, titre, CTA) | Non |
| `CTABanner.tsx` | Bandeau CTA réutilisable (variantes: primary/danger/success) | Non |
| `ScrollReveal.tsx` | Animation de révélation au scroll (IntersectionObserver) | Oui |
| `StatCounter.tsx` | Compteur animé pour statistiques | Oui |
| `StickyFooterCTA.tsx` | CTA flottant mobile (apparaît après scroll) | Oui |
| `TrustBadges.tsx` | Badges de confiance (conformité, attestation, RGPD...) | Non |
| `FAQ.tsx` | Accordéon FAQ (10 questions) | Non |
| `Testimonials.tsx` | Grille de témoignages (4 avis) | Non |
| `DeclarationForm.tsx` | Formulaire de déclaration DAE multi-étapes (4 steps) | Oui |

### Declaration Form Components (`components/declarerdae/declaration/`)

Le formulaire de déclaration multi-étapes (v2) avec auto-save serveur :

| Composant | Description |
|-----------|-------------|
| `DeclarationForm.tsx` | Orchestrateur principal : state, auto-save debounced, submit, restore localStorage |
| `DeclarationLayout.tsx` | Layout deux colonnes : formulaire + preview latérale |
| `DeclarationStepper.tsx` | Barre de progression 4 étapes |
| `DeclarationPreview.tsx` | Preview en temps réel des données saisies |
| `steps/Step1Exploitant.tsx` | Recherche entreprise + contact exploitant |
| `steps/Step2SiteLocalisation.tsx` | Adresse BAN + carte Leaflet + contact site |
| `steps/Step3Defibrillateurs.tsx` | Gestion multi-DAE (ajout/suppression/édition) |
| `steps/Step4Recapitulatif.tsx` | Récapitulatif + création compte + soumission |
| `shared/PhonePrefixSelect.tsx` | Dropdown indicatif téléphone (drapeaux, recherche, 249 pays, France+DOM-TOM prioritaires) |
| `shared/AddressAutocomplete.tsx` | Autocomplete adresse via API BAN (géocodage + score précision) |
| `shared/SiteLocationMap.tsx` | Carte Leaflet avec géocodage BAN, marqueur draggable (utilisé aussi dans admin) |
| `shared/LeafletMap.tsx` | Composant carte Leaflet + couche satellite Mapbox (dynamic import, SSR disabled) |
| `shared/EntrepriseSearch.tsx` | Recherche entreprise via API recherche-entreprises.api.gouv.fr |

### UI Components (`components/ui/`)

Composants shadcn/ui installés : accordion, badge, button, card, dropdown-menu, input, label, select, separator, skeleton, textarea.

### Landing Layout

Le layout `(landing)/layout.tsx` wraps children avec `Header` et `Footer` de `@/components/declarerdae/`. Les pages dans ce groupe n'incluent PAS Header/Footer elles-mêmes.

## CSS Architecture

### Thème (`globals.css`)

- **Palette OKLCH** : primary = bleu marine `oklch(0.22 0.09 264)`, destructive = rouge `oklch(0.52 0.22 25)`
- **Fonts** : `--font-heading: "Libre Franklin"`, `--font-body: "Source Sans 3"` (Google Fonts, chargées dans `layout.tsx`)
- **Container** : `.container` (max-width: 1000px sur lg) pour le contenu standard
- **Container narrow** : `.container-narrow` (max-width: 1280px sur lg) pour les sections full-width (hero, CTA, bandeaux)
- **Alert boxes** : `.alert-info`, `.alert-warning`, `.alert-danger`, `.alert-success` (bordure gauche colorée + fond)
- **Tricolor band** : `.tricolor-band` (bandeau bleu-blanc-rouge, 4px)

### Couleurs clés

| Couleur | Hex | Utilisation |
|---------|-----|-------------|
| Bleu marine | `#000091` | Primary, CTA, titres, header |
| Rouge | `#E1000F` | Danger, urgence, CTA secondaire |
| Vert | `#18753C` | Succès, validation, étapes complétées |
| Jaune/brun | `#92400E` | Avertissements, signalétique |
| Gris clair | `#F6F6F6` | Fonds alternés |
| Gris texte | `#3A3A3A` | Corps de texte |
| Gris léger | `#929292` | Texte secondaire |

## Commands

### API
```bash
cd api
npm install
npm run start:dev          # Dev server on port 3021
npm run build              # Build for production
npx prisma migrate dev     # Run migrations
npx prisma db seed         # Seed database
npx prisma studio          # DB GUI
```

### Web
```bash
cd web
npm install
npm run dev                # Dev server on port 3020
npm run build              # Production build
```

### Docker
```bash
docker-compose up -d postgres    # Start PostgreSQL on port 5440
docker-compose up -d             # Start all services
docker-compose -f docker-compose.prod.yml up -d  # Production
```

## Ports

| Service    | Local Port | Docker Internal |
|------------|-----------|-----------------|
| PostgreSQL | 5440      | 5432            |
| API        | 3021      | 3001            |
| Web        | 3020      | 3000            |
| Nginx      | 8083      | 80              |

## Database

- **PostgreSQL 16** on port 5440
- User: `declarerdae`, DB: `declarerdae`
- Admin seed: `admin@star-aid.fr` / `changeme12345`
- **Modèles principaux** : User, Declaration, DaeDevice, DeclarationAuditLog, Subscription, ShopSettings, BlogArticle, BlogCategory
- **Declaration** : champs exploitant (`expt*`), site (`adr*`, `tel*`), coordonnées GPS (`latCoor1`, `longCoor1`, `xyPrecis`), préfixes téléphone (`exptTel1Prefix`, `tel1Prefix`, `tel2Prefix`)
- **DaeDevice** : coordonnées optionnelles par DAE (`daeLat`, `daeLng`), suivi GéoDAE (`geodaeGid`, `geodaeStatus`, `geodaeLastSync`, `geodaeLastError`). **Champs supprimés du code** (colonnes DB conservées mais non exposées) : `dtprBat`, `fabSiren`, `mntRais`, `mntSiren`, `freqMnt`, `idEuro`, `accPcsec`, `accAcc`
- **DeclarationAuditLog** : trail d'audit complet — action (CREATED/FIELD_UPDATE/STATUS_CHANGE/DEVICE_UPDATE/USER_ATTACHED/GEODAE_SYNC), fieldName, oldValue, newValue, adminId, deviceId, deviceName, metadata

## Environment Variables

### `api/.env`
- `DATABASE_URL` — PostgreSQL connection string (`postgresql://declarerdae:declarerdae_secret@localhost:5440/declarerdae`)
- `JWT_ACCESS_SECRET` — JWT signing secret (min 32 chars)
- `FRONTEND_URL` — Web app URL (`http://localhost:3020`)
- `YOUSIGN_API_KEY` — Yousign API key
- `YOUSIGN_BASE_URL` — Yousign API base URL

GéoDAE credentials are stored in `ShopSettings` (DB), not in `.env` — configurable via admin Réglages.

### `.env.db`
- PostgreSQL credentials (must match DATABASE_URL)

## Styling Conventions

- Use `cn()` from `@/lib/utils` (clsx + tailwind-merge) for className composition
- OKLCH color space for theme variables
- `font-heading` class for headings (Libre Franklin)
- `font-body` class for body text (Source Sans 3)
- Hard-coded hex colors for specific gouv.fr styling (e.g. `text-[#000091]`, `bg-[#F6F6F6]`)
- `.container` for standard content, `.container-narrow` for full-width sections
- Sections alternate between `bg-white` and `bg-[#F6F6F6]` for visual rhythm
- Alert boxes use `.alert-info`, `.alert-danger`, `.alert-success`, `.alert-warning`
- Icons from `lucide-react`

### Admin Styling

L'admin utilise la **même palette gouv.fr** que le front-end (pas de slate/indigo) :

| Couleur | Hex | Utilisation admin |
|---------|-----|-------------------|
| Bleu sombre | `#1B1B35` | Sidebar background |
| Bleu marine | `#000091` | Accents, icônes, liens, badges, focus rings |
| Gris clair | `#F6F6F6` | Fond principal contenu, hovers, badges neutres |
| Gris texte | `#3A3A3A` | Texte principal |
| Gris léger | `#929292` | Labels, texte secondaire, placeholders |
| Gris bordure | `#E5E5E5` | Bordures, séparateurs |

- **Sidebar** : `bg-[#1B1B35]`, tricolor-band en haut, liens `text-white/70`, actif `bg-white/15`
- **Top bar** : breadcrumb avec icône maison + nom de page (via `PAGE_TITLES` dans layout)
- **KPI cards** : style compact minimaliste (icône ronde + label + valeur), regroupées par thème
- **Tables** : headers `text-[#929292]`, hovers `hover:bg-[#F6F6F6]`, badges arrondis
- **Pas de mode dev visuel** : design identique en dev et en production

## Key Patterns

### Page Structure (landing pages)
```tsx
// Server component (no "use client" unless hooks needed)
import Breadcrumb from "@/components/declarerdae/Breadcrumb";
import PageHero from "@/components/declarerdae/PageHero";
import CTABanner from "@/components/declarerdae/CTABanner";
import ScrollReveal from "@/components/declarerdae/ScrollReveal";

export default function MyPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Ma page" }]} />
      <PageHero tag="Catégorie" title="Titre" description="Description" />
      {/* sections */}
      <CTABanner title="CTA" buttonText="Action" href="/#formulaire" variant="primary" />
    </>
  );
}
```

### Admin Layout
- **Layout** (`admin/layout.tsx`) : sidebar + top bar avec breadcrumb dynamique (via `PAGE_TITLES` mapping pathname → label + icône)
- **Sidebar** (`AdminSidebar.tsx`) : titre "DéclarerDéfibrillateur", liens Dashboard/Déclarations/Blog/Utilisateurs/Réglages
- **AdminGuard** : redirige vers `/` si non-admin
- **useDevMode** (`lib/useDevMode.ts`) : fournit couleurs gouv.fr (bleu marine), plus de distinction dev/prod

### Admin Dashboard (`admin/page.tsx`)
- 2 KPI cards compactes (Utilisateurs + Déclarations) avec `KpiItem` component
- Boutons d'accès rapide vers les sections admin
- Données : `/api/admin/dashboard` + `/api/admin/stats` + `/api/admin/declarations/stats`

### Declarations
- **Modèle** : `Declaration` avec champ `number Int @unique @default(autoincrement())` pour numéro de demande
- **Liste** (`admin/declarations/page.tsx`) : colonne N° (#1, #2...), KPI en haut, filtres rapides, recherche avancée
- **Détail** (`admin/declarations/[id]/page.tsx`) :
  - **Header 4 colonnes** (pleine largeur) : Exploitant + Site + DAE cards + Notes éditables
  - Badge statut, titre "Demande #N", lien compte utilisateur, date
  - **Navigation par boutons pill** (pas de tabs shadcn) : Exploitant / Site / DAE / Historique
  - **Sous-navigation DAE** : cards cliquables par device (numéro, nom, fabricant-modèle, badge état, S/N)
  - **Onglet Historique** : timeline verticale des modifications avec avant/après, admin, pastilles colorées par type
- **Statuts** : DRAFT → COMPLETE → VALIDATED → CANCELLED (+ CANCELLED → COMPLETE pour réactivation)
- **Annulation** : popup avec 5 raisons prédéfinies, email pré-rempli éditable, envoi automatique au déclarant (en dev → adminEmail des réglages)
- **Formulaires d'édition admin** : `ExploitantEditForm` (recherche entreprise + contact), `SiteEditForm` (carte + géocodage + contact), `DeviceEditForm` (tous champs DAE) — tous avec `PhonePrefixSelect` pour les téléphones
- **Envoi GéoDAE** : bouton dans la page détail pour envoyer/resynchroniser les DAE vers `catalogue.atlasante.fr` (uniquement déclarations VALIDATED)
- **Audit trail** : modèle `DeclarationAuditLog` — chaque modification admin est loguée (action, fieldName, oldValue, newValue, adminId, deviceId)
- **Pas d'affichage d'ID technique** ni d'étape X/4
- **Pas de noms de champs GéoDAE** dans les labels (expt_rais, etc.)

### Declaration Form (`/declaration`)
- **Page publique** dans le route group `(landing)`
- **4 étapes** : Exploitant → Site → Défibrillateurs → Récapitulatif
- **Auto-save** : chaque champ est sauvé en brouillon côté serveur (debounce 1s), flush avant soumission
- **Recherche entité** : autocomplete via API `recherche-entreprises.api.gouv.fr` (debounce 200ms)
- **Géocodage** : adresse via Base Adresse Nationale (`api-adresse.data.gouv.fr`), carte Leaflet + Mapbox satellite. Le score de précision BAN est stocké dans `xyPrecis` et envoyé à GéoDAE comme `xy_precis`
- **Upload photos** : endpoint public `POST /api/upload` (fichier unique, 5MB max), URLs relatives via proxy Next.js
- **Validation frontend alignée backend** : 10 champs obligatoires par DAE (nom, fabRais, modele, numSerie, etatFonct, acc, accLib, daeMobile, dispJ, dispH)
- **Sérialisation device** : `serializeDevice()` utilise un whitelist de champs (pas de spread) pour éviter d'envoyer `id`, `declarationId` etc. au backend (forbidNonWhitelisted)
- **Champs supprimés** : dtprBat, fabSiren, mntRais, mntSiren, freqMnt, idEuro, accPcsec, accAcc — retirés des types, DTOs, formulaires, vues admin/dashboard et mapper GéoDAE (colonnes DB conservées)
- **Labels péremption électrodes** : "Date de péremption des électrodes adultes" (`dtprLcad`) et "Date de péremption des électrodes pédiatriques" (`dtprLcped`)
- **Prefixes téléphone** : stockés en base (exptTel1Prefix, tel1Prefix, tel2Prefix) — codes ISO pays via `@/data/phone-prefixes.ts`. Composant `PhonePrefixSelect` utilisé à la fois dans le formulaire public et dans les formulaires d'édition admin (ExploitantEditForm, SiteEditForm)

### GéoDAE Integration (`api/src/geodae/`)
- **API cible** : `catalogue.atlasante.fr` (ressource `8777a504-6c3e-4abe-8100-60bb58767faa`)
- **Auth** : Basic auth → PHPSESSID cookie, avec retry automatique sur 401/403
- **Mapper** (`geodae-mapper.ts`) : transforme Declaration + DaeDevice en GeoJSON FeatureCollection pour l'API GéoDAE. `mnt_siren`/`mnt_rais` proviennent uniquement de ShopSettings (options), plus des champs device
- **Téléphones** : convertis en E.164 via `geodae-phone.ts` (utilise les préfixes ISO stockés en base)
- **Photos** : converties en base64 data URI depuis le dossier `uploads/`
- **Coordonnées** : `device.daeLat/daeLng` prioritaire, sinon `decl.latCoor1/longCoor1` ; précision BAN dans `xy_precis`
- **Modes** : test mode (préfixe "test " au nom DAE) configurable dans ShopSettings
- **CRUD** : POST (create) / PATCH (update via `geodaeGid`) — résultats stockés sur DaeDevice (`geodaeGid`, `geodaeStatus`, `geodaeLastSync`, `geodaeLastError`)
- **Envoi** : uniquement sur déclarations VALIDATED, déclenché manuellement depuis l'admin

### Authentication
- JWT tokens (access in memory, refresh in HTTP-only cookie)
- `AuthDialog` component for login/register/2FA modal
- `AdminGuard` component for admin-only routes
- `useAuth()` hook from `@/lib/auth.tsx`
- API calls via `apiFetch()` from `@/lib/api.ts` (auto token refresh on 401)

### Content references
- CDN images from CloudFront (`d2xsxph8kpxj0f.cloudfront.net`)
- Legal references: Loi 2018-527, Décrets 2018-1186, 2018-1259, Arrêté 29/10/2019, Décret 2007-705
- Base nationale: Géo'DAE (Ministère de la Santé)
