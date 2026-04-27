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
- **Validation**: class-validator with whitelist + forbidNonWhitelisted + `@MaxLength()` sur tous les champs string des DTOs
- **Throttling**: 120 requêtes/minute par IP (ThrottlerModule). Augmenté de 30 à 120 pour supporter les déclarations avec beaucoup de DAE (saveAll = 1 PATCH parent + N PATCH devices)
- **Pagination**: max 100 résultats par requête (cap `Math.min(limit, 100)` côté admin)
- **Transactions**: `addDevice`, `updateDevice`, `removeDevice` dans `prisma.$transaction()`
- **Swagger**: available at `/api/docs` in dev mode

### Web (Next.js 16)

- **Router**: App Router with route groups
- **UI**: shadcn/ui (new-york style) + Radix primitives
- **Styling**: Tailwind CSS v4, OKLCH CSS variables, theme in `globals.css`
- **Animations**: ScrollReveal (IntersectionObserver), StatCounter
- **Forms**: react-hook-form + zod (souscrire), native forms (declaration, contact)
- **Images**: optimisation Next.js activée, CDN CloudFront dans `remotePatterns`. Utiliser `<Image>` de `next/image` (pas `<img>`). Exceptions : `unoptimized` pour les images admin-uploadées (URLs dynamiques), SVG flags (`/flags/*.svg`), images blog. Pour les logos et images statiques CloudFront : `width` + `height` + className CSS. Pour fond hero : `fill priority`. Alias `FlagImage`/`NextImage` si conflit de nom avec lucide-react
- **Accessibility (WCAG 2.1)** : tous les Label+Input/Select ont des paires `htmlFor`/`id`. Pour `SelectTrigger` Radix : `id` sur `<SelectTrigger>` (pas `<Select>`). Plusieurs instances → préfixe unique (`dae-${index}-nom`). Champs obligatoires : `aria-required="true"`
- **AbortController** : tous les `useEffect` avec `fetch`/`apiFetch` ont un `AbortController` et `return () => ctrl.abort()`. Pour les `useCallback` fetcheurs : paramètre `signal?: AbortSignal` optionnel. Catch : filtrer `err.name !== "AbortError"`. Guard `!signal?.aborted` avant `setLoading(false)`
- **SEO**: metadata OpenGraph/Twitter dans root layout, metadata par page (via template `%s | DéclarerDéfibrillateur.fr`), `sitemap.ts`, `robots.ts`
- **Tests**: Vitest + React Testing Library. `npm test` dans `web/`. Tests couvrent serialization, validation, manufacturers
- **Port**: 3020 (local dev), 3000 (Docker internal)
- **API Proxy** : `next.config.mjs` rewrites `/api/*` → `http://localhost:3021/api/*` en dev — utiliser des URLs relatives (`/api/...`) pour les fetch
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
│   ├── page.tsx + HomeClient.tsx                # Page d'accueil (server + client)
│   ├── obligations/page.tsx     # Obligations légales DAE
│   ├── guide-erp/page.tsx       # Guide ERP et catégories
│   ├── tarifs/page.tsx          # Plans tarifaires
│   ├── a-propos/page.tsx        # Notre mission
│   ├── contact/page.tsx + ContactClient.tsx
│   ├── mentions-legales/page.tsx
│   ├── politique-de-confidentialite/page.tsx + PolitiqueClient.tsx
│   ├── declaration/page.tsx + DeclarationPageClient.tsx
│   ├── trouver-un-dae/page.tsx  # Désactivé (notFound(), code conservé)
│   ├── blog/page.tsx + BlogListClient.tsx
│   ├── blog/[slug]/page.tsx + BlogArticleClient.tsx
│   └── defibrillateur/page.tsx + DefibrillatorClient.tsx
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
| `DaeMapFrance.tsx` | Section "En chiffres" : compteurs animés + carte Leaflet des DAE via API Géo'DAE (data.gouv.fr) avec auto-refresh au zoom/pan | Oui |
| `DaeMapFranceMapInner.tsx` | Carte Leaflet interne pour DaeMapFrance (dynamic import, SSR disabled) | Oui |
| `DeclarationForm.tsx` | Formulaire de déclaration DAE multi-étapes (4 steps) | Oui |

### Declaration Form Components (`components/declarerdae/declaration/`)

Le formulaire de déclaration multi-étapes (v2) avec auto-save serveur :

| Composant | Description |
|-----------|-------------|
| `DeclarationForm.tsx` | Orchestrateur principal : state, auto-save debounced, submit, restore localStorage, login redirect |
| `DeclarationLayout.tsx` | Layout deux colonnes : formulaire + preview latérale |
| `DeclarationStepper.tsx` | Barre de progression 4 étapes |
| `DeclarationPreview.tsx` | Preview en temps réel des données saisies |
| `steps/Step1Exploitant.tsx` | Recherche entreprise + contact exploitant |
| `steps/Step2SiteLocalisation.tsx` | Adresse BAN + carte Leaflet + contact site |
| `steps/Step3Defibrillateurs.tsx` | Gestion multi-DAE (ajout/suppression/édition). Props `deletedDeviceIds` (Set, grisés en bas), `syncedDeviceIds` (Set, badge GéoDAE + corbeille → popup irréversible), `onDeleteSyncedDevice`. Scroll auto vers nouveau DAE ajouté |
| `steps/Step4Recapitulatif.tsx` | Récapitulatif + création compte + soumission |
| `shared/PhonePrefixSelect.tsx` | Dropdown indicatif téléphone (drapeaux, recherche, 249 pays, France+DOM-TOM prioritaires) |
| `shared/AddressAutocomplete.tsx` | Autocomplete adresse via API BAN (géocodage + score précision) |
| `shared/SiteLocationMap.tsx` | Carte Leaflet avec géocodage BAN, marqueur draggable (utilisé aussi dans admin) |
| `shared/LeafletMap.tsx` | Composant carte Leaflet + couche satellite Mapbox (dynamic import, SSR disabled) |
| `shared/EntrepriseSearch.tsx` | Recherche entreprise via API recherche-entreprises.api.gouv.fr |

### GéoDAE Shared Components (`components/declarerdae/geodae/`)

Composants partagés entre le dashboard utilisateur et l'administration pour la gestion GéoDAE :

| Fichier | Description |
|---------|-------------|
| `types.ts` | Interfaces partagées : `GeodaeDaeDevice`, `GeodaeDeclaration`, `DeviceSyncStatus`, `GeodaeSyncApi` |
| `geodae-fields.ts` | `GEODAE_FIELDS` (mapping champs GéoDAE ↔ local), `computeDiffCount()`, `formatGeodaeValue()`, helpers comparaison (téléphones E.164, coordonnées tolérance, nom sans "test") |
| `GeodaeSyncManager.tsx` | Popup de gestion GéoDAE : charge live chaque DAE (batch 3, via `fetchKey` pour re-fetch), compare, affiche état (vert/orange/bleu/rouge erreur/gris supprimé). Cascade icônes : loading → erreur → diffs → non envoyé → supprimé → à jour. Sync individuel : succès → `onDone()` + re-fetch, échec → état erreur + bouton "Réessayer". Sync all inclut devices en erreur. `onDone(allSucceeded?)` retourne Promise. Description mentionne erreurs. API abstraction via prop `api: GeodaeSyncApi` (callbacks). Header/footer fixes, liste scrollable. Labels adaptatifs premier envoi vs mise à jour. Popups confirmation suppression irréversible |
| `GeodaeDetailContent.tsx` | Tableau comparatif champ par champ GéoDAE vs local, détection diffs, card mainteneur declarerdefibrillateur.re, option changement mainteneur |
| `index.ts` | Barrel exports |

### Data Files (`data/`)

| Fichier | Description |
|---------|-------------|
| `phone-prefixes.ts` | 249 indicatifs téléphoniques (drapeaux, codes ISO, France+DOM-TOM prioritaires) |
| `dae-manufacturers.ts` | 15 fabricants DAE et 34 modèles avec durées de garantie. Fonctions `getModelsForManufacturer()`, constante `OTHER_VALUE` pour l'option "Autre" |

### Shared Types & Validation (`types/`, `lib/`)

| Fichier | Description |
|---------|-------------|
| `types/declarations.ts` | Types partagés `DaeDevice`, `Declaration`, `STATUS_LABELS`, `FIELD_LABELS` — source unique pour admin, dashboard et formulaire public |
| `lib/validation.ts` | `isPhoneValid()`, `isPrefixValid()`, `GEODAE_PREFIXES`, `validateDevice()`, `formatDeviceErrors()`, `validateStepFields()` — validation centralisée utilisée par useDeclarationEdit, DeclarationForm et admin |
| `lib/log.ts` | `logError(context, error)` — logging centralisé (console.error en dev, extensible vers Sentry) |

### Shared Hooks (`hooks/`)

| Hook | Description |
|------|-------------|
| `useDaeDeviceForm.ts` | Logique partagée fabricant/modèle "Autre" + maintenance OUI/NON — utilisé par DaeDeviceForm (public) et DeviceEditForm (admin) |
| `useDeclarationEdit.ts` | Hook d'édition dashboard — state, dirty tracking, save all, validation via `validateStepFields` |

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
- **Z-index Leaflet/Radix** : `.leaflet-container { z-index: 0 }` pour isoler les cartes, `[data-radix-popper-content-wrapper] { z-index: 9999 !important }` pour que les dropdowns Radix (Select, Popover) flottent toujours au-dessus. Tous les `SelectContent` dans les formulaires DAE utilisent `position="popper" sideOffset={4}`

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
npm test                   # Run Vitest test suite
npm run test:watch         # Watch mode
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
- Admin seed: `guilhem.rossi@gmail.com` / `changeme12345`
- **Modèles principaux** : User, Declaration, DaeDevice, DeclarationAuditLog, Subscription, ShopSettings, BlogArticle, BlogCategory, RgpdConsent
- **ShopSettings** : config SMTP, GéoDAE, maintenance, RGPD/DPO, et **authentification** (`skipEmailVerification`, `skip2FA` — Booleans, default false). Configurables dans Admin > Réglages > onglet Général
- **Declaration** : champs exploitant (`expt*`), site (`adr*`, `tel*`), coordonnées GPS (`latCoor1`, `longCoor1`, `xyPrecis`), préfixes téléphone (`exptTel1Prefix`, `tel1Prefix`, `tel2Prefix`). **Champs supprimés du code** (colonnes DB conservées) : `categorieERP`
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

**Pages serveur** (obligations, guide-erp, tarifs, a-propos, mentions-legales) : metadata directe + JSX.

**Pages client** (home, declaration, contact, blog, politique, defibrillateur) : pattern server/client split :
```tsx
// page.tsx — server component avec metadata
import type { Metadata } from "next";
import MyPageClient from "./MyPageClient";
export const metadata: Metadata = { title: "...", description: "...", alternates: { canonical: "/..." } };
export default function MyPage() { return <MyPageClient />; }

// MyPageClient.tsx — "use client" avec hooks, state, interactivité
```

### Dashboard utilisateur (`/dashboard`)
- **DashboardShell** : guard redirige vers `/` si `user === null`. Si `emailVerified === false` → gate "Plus qu'une étape !" avec bouton "Renvoyer l'email de vérification" (cooldown 60s persisté dans localStorage). Onglets navigation (Mes déclarations, Profil, Modifier, Mot de passe, Mes données)
- **Mes déclarations** (`mes-declarations/page.tsx`) : liste des déclarations, filtres par statut (dont "En attente d'envoi" pour COMPLETE), highlight animé d'un brouillon lié après login (param `?linked={id}`, bordure bleue + pulse 3s + scroll auto). Badges GéoDAE : "Envoi GéoDAE requis" (amber, COMPLETE non envoyé), "Partiellement synchronisé" (bleu), "GéoDAE synchronisé" (vert, VALIDATED)
- **Détail déclaration** (`mes-declarations/[id]/page.tsx`) : mode édition multi-étapes pour DRAFT, COMPLETE et VALIDATED via `useDeclarationEdit` hook. Vue ReadonlyView uniquement pour CANCELLED. Validation par étape avec erreurs détaillées par DAE + scroll auto vers le bloc d'erreurs + scroll auto vers le stepper à chaque changement d'étape. Utilise les mêmes composants Step1/Step2/Step3 que le formulaire public
- **Panneau GéoDAE utilisateur** : affiché quand statut COMPLETE ou VALIDATED. Bandeau "Dernière étape" (bleu, visible si COMPLETE + rien envoyé) avec CTA "Envoyer vers GéoDAE". Panneau technique avec badges par device (cliquables → popup détail), bouton "Envoyer" / "Mettre à jour" / "Réessayer l'envoi". Auto-transition COMPLETE → VALIDATED après sync complète réussie. État `needsResync` dérivé des timestamps (`computeNeedsResync` : compare `decl.updatedAt` vs `max(geodaeLastSync)`) → persiste au rechargement de page. Passe aussi à true quand l'utilisateur sauvegarde des modifications ou quand le sync manager détecte des diffs (additif via `onDiffsFound`). Ne repasse à false qu'après sync réussie de TOUS les devices (`onDone(allSucceeded)`). Panneau orange + badges devices orange + warning dans l'aperçu latéral (cliquable, scrolle vers le panneau). Bandeau warning interne "Les informations ont été modifiées..." quand `needsResync`. Badges : "Synchronisé" (vert), "Partiellement synchronisé" (bleu), "Échec" (rouge), "Non envoyé" (amber), "Mise à jour requise" (amber pulsant). Compteurs détaillés (N en échec, N non envoyés) dans le texte de résumé. `loadDecl` ne provoque pas de spinner au reload (évite le démontage de la popup ouverte)
- **Gestion GéoDAE** (`GeodaeSyncManager`) : popup avec header/footer fixes et liste scrollable, ouverte depuis "Mettre à jour" / "Envoyer vers GéoDAE". Charge les données live de chaque DAE depuis l'API GéoDAE (par batch de 3 pour éviter le rate-limiting), compare avec les données locales (`computeDiffCount`), affiche l'état par device (vert = à jour, orange = différences, bleu = non envoyé, rouge = erreur, gris = supprimé). Cascade d'icônes : loading → erreur → diffs → non envoyé → supprimé → à jour. Labels adaptatifs : premier envoi → "Envoyer" / "Envoyer vers GéoDAE (N)", mise à jour → "Synchroniser" / "Tout mettre à jour (N)", erreur → "Réessayer". Actions : envoyer/synchroniser un DAE individuellement (succès → `onDone()` + re-fetch via `setFetchKey`, échec → état erreur sur le device avec message), envoyer/mettre à jour tous ceux qui nécessitent une action (y compris devices en erreur), supprimer un DAE (popup irréversible, succès → `onDone()` + re-fetch), "Tout supprimer de GéoDAE" (popup irréversible → annule la déclaration → redirige vers la liste). Description popup mentionne les erreurs. `onDone(allSucceeded?)` : le parent ne reset `needsResync` que si `allSucceeded !== false`. Remonte les diffs trouvées au parent via `onDiffsFound` (additif : ne met jamais `needsResync` à false)
- **Popup détail GéoDAE** : clic sur un badge DAE synchronisé → popup avec données live récupérées depuis l'API GéoDAE. Tableau comparatif GéoDAE vs local (uniquement les champs du formulaire) avec détection des différences (coordonnées avec tolérance 0.00001, téléphones normalisés E.164 avec préfixes, nom sans préfixe "test", précision GPS avec tolérance 0.0001). Card mainteneur en bas (declarerdefibrillateur.re) avec option "Changer de mainteneur" (suppression définitive de la fiche GéoDAE, le nouveau mainteneur doit redéclarer)
- **Suppression DAE synchronisés** : le bouton corbeille reste visible dans le formulaire d'édition (Step 3) avec badge "GéoDAE" à côté. Le clic ouvre une popup de confirmation irréversible qui supprime le DAE de GéoDAE (`deleteSingleDevice`), puis le device apparaît grisé, barré, en dernière position dans le formulaire, non éditable. Backend `removeMyDevice` bloque aussi la suppression directe (sans passage par GéoDAE) avec erreur 400
- **Annulation utilisateur** : endpoint `POST /api/declarations/my/:id/cancel` — change le statut en CANCELLED avec audit log. Déclenché automatiquement quand tous les DAE sont supprimés de GéoDAE
- **useDeclarationEdit** (`hooks/useDeclarationEdit.ts`) : hook d'édition pour le dashboard — gestion state formulaire, dirty tracking, save all (parent + devices), validation détaillée par étape et par DAE

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
- **Liste** (`admin/declarations/page.tsx`) : colonnes N°, Date, Exploitant, Compte (email + badge vérifié/non vérifié), Ville, DAE (count), GéoDAE (synced/total avec badge couleur), Statut. KPI en haut, filtres rapides, recherche avancée
- **Détail** (`admin/declarations/[id]/page.tsx` + sous-composants) :
  - **Header 4 colonnes** (pleine largeur) : Exploitant + Site + DAE cards + Notes éditables
  - Badge statut, titre "Demande #N", lien compte utilisateur avec badge emailVerified (checkmark vert / "Non vérifié" amber), date
  - **Navigation par boutons pill** (pas de tabs shadcn) : Exploitant / Site / DAE / Historique
  - **Sous-navigation DAE** : cards cliquables par device (numéro, nom, fabricant-modèle, badge état, S/N)
  - **Composants extraits** : `AdminDeclHistory.tsx` (timeline audit), `AdminDeclGeodae.tsx` (card sync GéoDAE + badges), `AdminCancelDialog.tsx` (popup annulation 5 raisons + email)
- **Statuts** : DRAFT → COMPLETE → VALIDATED → CANCELLED (+ CANCELLED → COMPLETE pour réactivation). Labels utilisateur : COMPLETE = "Finaliser l'envoi", VALIDATED = "Validée"
- **Annulation** : popup avec 5 raisons prédéfinies, email pré-rempli éditable, envoi automatique au déclarant (en dev → adminEmail des réglages)
- **Formulaires d'édition admin** : `ExploitantEditForm` (recherche entreprise + contact), `SiteEditForm` (carte + géocodage + contact), `DeviceEditForm` (tous champs DAE) — tous avec `PhonePrefixSelect` pour les téléphones
- **GéoDAE admin** : même panneau et popup que le dashboard utilisateur, utilisant les composants partagés `GeodaeSyncManager` + `GeodaeDetailContent` (`@/components/declarerdae/geodae/`). Visible pour COMPLETE et VALIDATED. Badges DAE cliquables → popup détail live. Bouton "Mettre à jour" / "Envoyer vers GéoDAE" ouvre le sync manager avec comparaison live par device. Endpoints admin : `GET /api/admin/geodae/fetch/:deviceId` (fetch live), `POST /api/admin/geodae/delete-device/:deviceId` (suppression individuelle), `POST /api/admin/geodae/send/:declarationId`, `POST /api/admin/geodae/delete/:declarationId` (batch). API callbacks injectés via la prop `api` du `GeodaeSyncManager`
- **Audit trail** : modèle `DeclarationAuditLog` — chaque modification admin/utilisateur est loguée (action, fieldName, oldValue, newValue, adminId/initiatorId, deviceId)
- **Pas d'affichage d'ID technique** ni d'étape X/4
- **Pas de noms de champs GéoDAE** dans les labels (expt_rais, etc.)

### Declaration Form (`/declaration`)
- **Page publique** dans le route group `(landing)`
- **4 étapes** : Exploitant → Site → Défibrillateurs → Récapitulatif
- **Auto-save** : chaque champ est sauvé en brouillon côté serveur (debounce 1s), flush avant soumission et avant redirect login
- **Post-soumission** : si `emailVerified === false` → écran bleu "Vérifiez votre email" avec bouton renvoyer (cooldown 60s localStorage). Si vérifié → redirection directe vers `/dashboard/mes-declarations/{draftId}` avec toast "Finalisez l'envoi vers GéoDAE"
- **Rappel déclarations existantes** : si l'utilisateur est connecté et a déjà des déclarations, un bandeau bleu s'affiche au-dessus du formulaire avec la liste (max 3), badges statut + GéoDAE, liens vers le détail (via `Link` Next.js), bouton "Voir mes déclarations", lien "Continuer une nouvelle déclaration" pour masquer
- **Login redirect** : quand un utilisateur anonyme se connecte depuis `/declaration`, le formulaire flush les saves en attente, lie le brouillon au compte (`POST /api/declarations/draft/:id/link`), nettoie localStorage, et redirige vers `/dashboard/mes-declarations?linked={draftId}` avec highlight animé du brouillon lié. Header passe `skipRedirect` à `AuthDialog` quand `pathname === "/declaration"` pour que la redirection soit gérée par le formulaire
- **Recherche entité** : autocomplete via API `recherche-entreprises.api.gouv.fr` (debounce 200ms)
- **Géocodage** : adresse via Base Adresse Nationale (`api-adresse.data.gouv.fr`), carte Leaflet + Mapbox satellite. Le score de précision BAN est stocké dans `xyPrecis` et envoyé à GéoDAE comme `xy_precis`
- **Upload photos** : endpoint public `POST /api/upload` (fichier unique, 5MB max), URLs relatives via proxy Next.js
- **Fabricant / Modèle** : selects cascadés depuis `@/data/dae-manufacturers.ts` (15 fabricants, 34 modèles). Quand on choisit un fabricant, les modèles se filtrent. Option "Autre" affiche un champ libre. Logique partagée via `useDaeDeviceForm` hook (`onFabChange`, `onModelChange`, `fabAutre`, `modelAutre`). Utilisé par `DaeDeviceForm` (public) et `DeviceEditForm` (admin)
- **Type d'établissement** : select simple (`typeERP`), pas de catégorie ERP (champ `categorieERP` supprimé des UI, colonne DB conservée)
- **Maintenance / Installation** : questionnaire "Le DAE a-t-il déjà subi une maintenance ?" (OuiNonSwitch, défaut "NON"). Si OUI → date dernière maintenance (obligatoire) + date installation (facultatif). Si NON → date installation (obligatoire), `dermnt` copie automatiquement `dateInstal`. Champ `hadMaintenance` stocké dans le state device (UI only, pas envoyé au backend via whitelist `DEVICE_API_FIELDS`). Logique partagée via `useDaeDeviceForm` hook (handlers `onMaintenanceToggle`, `onFabChange`, `onModelChange`). Restauration depuis le serveur : `dermnt === dateInstal` → "NON", sinon → "OUI"
- **Validation frontend centralisée** (`lib/validation.ts`) : 11 champs obligatoires par DAE. Erreurs détaillées par DAE : "DAE 1 (nom) : fabricant, n° série". Message maintenance contextuel : "date de maintenance" (OUI) ou "date d'installation" (NON) selon `hadMaintenance`. **Téléphones** : `exptTel1` et `tel1` obligatoires (9 chiffres + indicatif FR/DOM-TOM), `tel2` facultatif mais validé si rempli. Fonctions partagées `isPhoneValid()`, `isPrefixValid()`, `validateDevice()`, `validateStepFields()` utilisées par useDeclarationEdit, DeclarationForm et admin
- **Sérialisation device** : `serializeDevice()` utilise un whitelist de champs (pas de spread) pour éviter d'envoyer `id`, `declarationId` etc. au backend (forbidNonWhitelisted)
- **Champs supprimés** : typeDAE, dtprBat, fabSiren, mntRais, mntSiren, freqMnt, idEuro, accPcsec, accAcc — retirés des types, formulaires, vues admin/dashboard (colonnes DB et DTOs backend conservés). `typeDAE` encore accepté par le backend (optionnel) mais plus envoyé par le frontend
- **Labels péremption électrodes** : "Date de péremption des électrodes adultes" (`dtprLcad`) et "Date de péremption des électrodes pédiatriques" (`dtprLcped`)
- **Prefixes téléphone** : stockés en base (exptTel1Prefix, tel1Prefix, tel2Prefix) — codes ISO pays via `@/data/phone-prefixes.ts`. Composant `PhonePrefixSelect` utilisé à la fois dans le formulaire public et dans les formulaires d'édition admin (ExploitantEditForm, SiteEditForm)

### GéoDAE Integration (`api/src/geodae/`)
- **API cible** : `catalogue.atlasante.fr` (ressource `8777a504-6c3e-4abe-8100-60bb58767faa`). Documentation API v1.6 dans `tmp/GEODAE_API_DOCUMENTATION_V1.6.pdf`
- **Auth** : Basic auth → PHPSESSID cookie, avec retry automatique sur 401/403. Session TTL 25 min avec invalidation automatique
- **Timeout** : 10s sur tous les appels axios (instance partagée)
- **Erreurs** : messages sanitisés côté client, détail complet dans les logs serveur
- **Mapper** (`geodae-mapper.ts`) : transforme Declaration + DaeDevice en GeoJSON FeatureCollection pour l'API GéoDAE. `mnt_siren`/`mnt_rais` proviennent uniquement de ShopSettings (options), plus des champs device
- **Téléphones** : convertis en E.164 via `geodae-phone.ts` (utilise les préfixes ISO stockés en base)
- **Photos** : converties en base64 data URI depuis le dossier `uploads/`
- **Coordonnées** : `device.daeLat/daeLng` prioritaire, sinon `decl.latCoor1/longCoor1` ; précision BAN dans `xy_precis`
- **Modes** : test mode (préfixe "test " au nom DAE) configurable dans ShopSettings
- **CRUD** : POST (create) / PATCH (update via `geodaeGid`) / GET (fetch fiche live par GID) — résultats stockés sur DaeDevice (`geodaeGid`, `geodaeStatus`, `geodaeLastSync`, `geodaeLastError`)
- **Suppression** : `deleteSingleDevice()` PATCH `etat_fonct: "Supprimé définitivement"` — l'API GéoDAE ne supporte pas DELETE, pas de transfert de mainteneur possible. Le nouveau mainteneur doit redéclarer le DAE. Backend `removeMyDevice` bloque la suppression de devices synchronisés (geodaeGid + status != DELETED)
- **Throttling** : 500ms de délai entre chaque appel API GéoDAE dans `sendDeclarationToGeodae` et `deleteFromGeodae`. Frontend fetch live par batch de 3
- **Envoi admin** : déclarations COMPLETE et VALIDATED, endpoints sous `/api/admin/geodae/` (send/:declarationId, delete/:declarationId, fetch/:deviceId, delete-device/:deviceId, retry/:deviceId, status/:declarationId, test-connection). Utilise le `GeodaeSyncManager` partagé avec callbacks admin. Card GéoDAE admin alignée avec dashboard : bandeau warning `needsResync`, badges (Synchronisé/Partiellement synchronisé/Échec/Non envoyé/Mise à jour requise), compteurs détaillés, bouton "Réessayer l'envoi", `computeNeedsResync` au chargement et après `reloadDeclAndLogs`
- **Envoi utilisateur** : déclarations COMPLETE ou VALIDATED, endpoints sous `/api/declarations/my/:id/geodae/` (send, retry, status, fetch/:deviceId, delete/:deviceId, cancel). Ownership check via `getUserDeclaration()`. Auto-transition COMPLETE → VALIDATED après sync complète réussie (audit log `STATUS_CHANGE` avec metadata `reason: "Auto-validated after successful GéoDAE sync"`). Paramètre `allowedStatuses` dans `sendDeclarationToGeodae()` et `retryDevice()` (default `["VALIDATED"]` pour admin, `["COMPLETE", "VALIDATED"]` pour users). Annulation automatique de la déclaration (→ CANCELLED) quand tous les DAE sont supprimés de GéoDAE

### Authentication
- JWT tokens (access in memory, refresh in HTTP-only cookie)
- `AuthDialog` component for login/register/2FA modal. Prop `skipRedirect` (default `false`). Header passe `skipRedirect={pathname === "/declaration"}`. La popup ne se ferme que par la croix (pas de clic extérieur)
- **Email verification** : obligatoire avant accès au dashboard. Configurable via `ShopSettings.skipEmailVerification`. L'endpoint `GET /api/auth/verify-email` auto-login l'utilisateur (retourne accessToken + pose cookie refresh) puis redirige vers `/dashboard/mes-declarations`
- **2FA** : code 6 chiffres par email, 10 min d'expiration. Configurable via `ShopSettings.skip2FA`. Remplace l'ancien bypass `NODE_ENV !== "production"`
- **AuthDialog login error** : si email non vérifié, affiche un bloc bleu (pas rouge) avec bouton "Renvoyer l'email de vérification" + cooldown 60s anti-spam persisté dans localStorage
- **Session expirée** : quand `apiFetch` reçoit un 401 et que le refresh token échoue, toast "Votre session a expiré" + dispatch `auth:session-expired`. `AuthProvider` écoute cet événement et met `user` à null → `DashboardShell` redirige vers `/`
- **Verify-email page** (`/verify-email`) : auto-login + redirect vers dashboard si succès, bouton "Recevoir un nouveau lien" + cooldown si lien expiré. Messages en français
- `AdminGuard` component for admin-only routes
- `useAuth()` hook from `@/lib/auth.tsx`
- API calls via `apiFetch()` from `@/lib/api.ts` (auto token refresh on 401, session expiry handling)

### Mail Service (`api/src/mail/`)
- SMTP configuré dans ShopSettings (host, port, user, pass, from) — OVH `ssl0.ovh.net:465`
- **Dev override** : méthode `devRecipient()` redirige tous les emails vers `adminEmail` en dev (`NODE_ENV !== "production"`). Appliqué à : vérification email, code login, reset password, annulation déclaration
- Templates : vérification email, code 2FA, reset password, confirmation souscription, annulation déclaration
- Cache config 60s

### Content references
- CDN images from CloudFront (`d2xsxph8kpxj0f.cloudfront.net`)
- Legal references: Loi 2018-527, Décrets 2018-1186, 2018-1259, Arrêté 29/10/2019, Décret 2007-705
- Base nationale: Géo'DAE (Ministère de la Santé)
