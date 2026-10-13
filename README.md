# Cabinet Dentaire Ilyass — site web bilingue (FR / AR)

Site vitrine et prise de rendez-vous en ligne du **Cabinet Dentaire Ilyass**
(Tiflet, Hay Andalos, Maroc), en **français** et en **arabe** (RTL),
avec un espace d'administration protégé.

**Stack :** Next.js 15 (App Router, JavaScript) · Tailwind CSS 4 ·
Firebase Authentication · Cloud Firestore · Lucide React.

---

## 1. Prérequis

- **Node.js 20 ou supérieur** et npm
- Un projet Firebase existant (ici : `med-projet-59540`) avec :
  - l'**Authentification** activée (méthode *E-mail / Mot de passe*) ;
  - **Cloud Firestore** activé ;
  - un **compte de service** (Paramètres du projet → Comptes de service →
    *Générer une nouvelle clé privée*).

## 2. Installation

```bash
npm install
```

## 3. Configuration Firebase

1. Copiez le modèle d'environnement :

   ```bash
   cp .env.local.example .env.local
   ```

2. Renseignez dans `.env.local` :
   - les variables `NEXT_PUBLIC_FIREBASE_*` (celles de votre application web
     Firebase, onglet *Paramètres de votre application* → *Vos applications*) ;
   - `FIREBASE_SERVICE_ACCOUNT_KEY` : le JSON du compte de service
     **sur une seule ligne**, côté serveur uniquement (jamais de préfixe
     `NEXT_PUBLIC_`) ;
   - `NEXT_PUBLIC_SITE_URL` (ex. `https://votre-domaine.fr`).

   > `.env.local` est déjà ignoré par git (`.gitignore`) : il n'est jamais
   > commité.

3. Publiez les règles de sécurité Firestore (obligatoire pour les lectures
   côté navigateur) et, si vous le souhaitez, les index composites
   (recommandé pour de gros volumes — le tableau de bord fonctionne aussi
   sans eux, les requêtes étant filtrées côté serveur) :

   ```bash
   npx firebase-tools login
   npx firebase-tools deploy --only firestore:rules,firestore:indexes
   ```

   Les fichiers `firestore.rules` et `firestore.indexes.json` sont fournis à la
   racine : **refus par défaut**, contenus publics en lecture, création de
   demande de rendez-vous publique validée côté serveur, données médicales et
   patients réservés à l'équipe. Si un index composite manque malgré tout,
   l'API renvoie une erreur claire (503, `index_missing`) au lieu d'un 500.

### Création du premier administrateur (une seule fois)

Aucune inscription n'est possible depuis le site. Créez le premier compte :

```bash
npm run setup:admin -- --email=admin@cabinet.ma --password='MotDePasseFort'
```

Le script crée l'utilisateur dans Firebase Auth, lui attribue le rôle `admin`
(claim personnalisé + document `users/{uid}`) et vous pouvez ensuite vous
connecter sur `/admin/login`.

Pour créer un compte **docteur**, modifiez simplement le rôle dans le script
ou écrivez `users/{uid}` avec `role: "doctor"` depuis la console Firebase.

### Tester sans toucher au vrai projet : émulateur Firebase (optionnel)

Le dépôt contient une configuration d'émulateur (`firebase.json`, ports
Firestore **8085**, Auth **9099**, interface **4000** — le port 8080 étant
souvent occupé). Elle permet de tester tout le site (réservation, conflits,
administration) sans données réelles :

```bash
# 1. démarrer l'émulateur (télécharge les binaires la première fois)
npx firebase-tools emulators:start --only firestore,auth --project med-projet-59540

# 2. lancer le site branché sur l'émulateur (côté serveur)
FIRESTORE_EMULATOR_HOST=127.0.0.1:8085 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 npm run dev

# 3. premier administrateur + contenu de démonstration dans l'émulateur
FIRESTORE_EMULATOR_HOST=127.0.0.1:8085 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 \
  npm run setup:admin -- --email=admin@local.test --password='MotDePasseFort'
```

Pour que **la connexion de l'espace admin** (`/admin/login`, côté navigateur)
utilise aussi l'émulateur, ajoutez temporairement dans `.env.local` :

```
NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
NEXT_PUBLIC_FIREBASE_EMULATOR_HOST=127.0.0.1:8085
```

**Supprimez ces deux lignes avant toute mise en production** (avec les
variables `FIRESTORE_EMULATOR_HOST` / `FIREBASE_AUTH_EMULATOR_HOST`, elles
désignent uniquement l'émulateur local). Sans émulateur, le site lit
 Firestore en lecture publique et bascule sur le contenu de démonstration.

## 4. Démarrage en local

```bash
npm run dev
```

Site public : **<http://localhost:3000>**
Espace staff : **<http://localhost:3000/admin/login>**

## 5. Commandes utiles

| Commande          | Rôle                                        |
| ----------------- | ------------------------------------------- |
| `npm run dev`     | serveur de développement                    |
| `npm run build`   | build de production                         |
| `npm start`       | serveur de production                       |
| `npm run lint`    | analyse ESLint                              |
| `npm test`        | tests unitaires (disponibilité/validation)  |
| `npm run setup:admin` | création du premier administrateur      |

## 6. Structure du projet

```
src/
  app/                 pages App Router
    (site)/            site public : /, /about, /services, /contact,
                       /appointment, /track, /privacy
    admin/             espace staff : /admin et ses sections
    api/               routes API (publiques et protégées)
  components/          composants (site, pages, admin, ui)
  context/             contexte de langue (FR/AR)
  lib/                 dictionnaire i18n, validation, disponibilités,
                       accès Firestore, SDK Admin côté serveur
public/images/         photographies dentaires locales (licence libre)
scripts/               création d'administrateur, utilitaires
tests/                 tests unitaires
firestore.rules        règles de sécurité (refus par défaut)
firestore.indexes.json index Firestore
```

## 7. Fonctionnement des rendez-vous

1. Le patient remplit les 5 étapes (soin → praticien → date et heure →
   coordonnées → vérification).
2. La demande est créée **en attente** avec un numéro de référence
   (`CDI-XXXXXX`) : ce numéro — et jamais un identifiant interne — permet de
   suivre la demande sur `/track` (référence + téléphone).
3. Le créneau est verrouillé **de façon atomique** dans `slotLocks` :
   deux demandes simultanées ne peuvent pas obtenir le même créneau.
4. Une demande en attente occupe le créneau pendant la durée configurable
   (`pendingHoldHours`, 48 h par défaut) puis expire automatiquement.
5. L'équipe confirme, refuse, reporte ou réaffecte depuis
   `/admin/appointments` — chaque action revérifie les conflits côté serveur.

**Règle d'or :** le serveur ne fait jamais confiance au navigateur. Toutes les
validations (date, horaires, fuseau `Africa/Casablanca`, conflits) sont
refaites dans les routes API.

## 8. Déploiement sur Vercel

1. Poussez le projet sur un dépôt Git puis importez-le sur Vercel.
2. Reprenez **exactement** les variables d'environnement de `.env.local`
   dans *Settings → Environment Variables* (dont
   `FIREBASE_SERVICE_ACCOUNT_KEY`, en la collant sur une seule ligne).
3. Déployez : `next build` est détecté automatiquement.
4. Mettez à jour `NEXT_PUBLIC_SITE_URL` avec votre domaine final puis
   redéployez.

## 9. Contenu de démonstration

Au premier démarrage, si Firestore est vide, le site **et l'API** retombent
automatiquement sur les mêmes contenus de démonstration clairement marqués
(badge **Démo**) : soins, praticiens et horaires d'exemple. Les
identifiants `demo-*` fonctionnent donc partout (réservation publique,
API `/api/availability`) sans rien écrire dans votre base.

Pour écrire ces mêmes données dans Firestore (et pouvoir les modifier),
trois solutions au choix :

```bash
# 1. depuis un terminal, sans compte administrateur
npm run seed

# 2. depuis l'espace staff → Paramètres → « Charger les données de démonstration »

# 3. via l'API : POST /api/admin/seed (rôle admin requis)
```

Le script `npm run seed` ne crée que les documents **manquants** : aucune
donnée existante n'est écrasée.

> Les noms de praticiens, qualifications, photos, horaires et tarifs réels du
> cabinet ne sont **jamais inventés** : renseignez-les depuis l'administration.

## 10. Langues

- Bouton FR / AR visible dans l'en-tête et le pied de page ;
- la langue choisie est mémorisée (`localStorage`) et appliquée avant le
  premier rendu (pas de clignotement) ;
- le passage en arabe bascule automatiquement le document en `dir="rtl"` avec
  les polices adaptées (Inter pour le français, Cairo pour l'arabe).
