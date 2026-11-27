# HospitIA

Concierge IA multilingue et espace de gestion pour hôtels indépendants et résidences en **France et en Suisse**.

## Fonctionnalités connectées

- Site vitrine responsive et identité visuelle HospitIA.
- Création de compte hôtelier, confirmation e-mail, connexion et réinitialisation de mot de passe via Supabase Auth.
- Création atomique du premier établissement et rattachement propriétaire sécurisé, avec reprise d'un onboarding interrompu.
- Espace multi-établissements, avec changement de contexte pour les comptes autorisés.
- Tableau de bord alimenté par les données Supabase.
- Base de connaissances avec publication et dépublication des réponses utilisées par le concierge.
- Concierge client public par URL/QR code, avec génération de réponses via OpenAI Responses API.
- Enregistrement des conversations et historique réservé aux membres de l'hôtel.
- Formulaire public de demandes à la réception, avec suivi des statuts par l'équipe.
- Gestion du parc de chambres et des statuts opérationnels.
- Statistiques calculées à partir des activités enregistrées.
- Paramètres d'établissement (nom, ville, pays, langue).

## Stack technique

- Next.js 16 + React 19 + TypeScript.
- Supabase Auth, PostgreSQL, Data API, Row Level Security.
- OpenAI Node SDK et Responses API (clé exclusivement côté serveur).
- Tailwind CSS.

## Démarrage local

Prérequis : Node.js 24.
```bash
npm install
cp .env.example .env.local
npm run dev
```
Ouvrir http://localhost:3000.

## Variables d'environnement

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- Les variables `NEXT_PUBLIC_*` sont publiques et ne doivent contenir que l'URL Supabase et la clé publishable.
- `OPENAI_API_KEY` doit être ajoutée côté serveur dans Vercel comme variable `Sensitive`, pour Preview, Production et Development.
- Ne jamais committer une clé OpenAI, une clé Supabase secrète/service-role ou un mot de passe.

## Configuration Supabase

1. Créer le projet dans une région adaptée à la résidence des données.
2. Pour une nouvelle base, exécuter `supabase/schema.sql` dans SQL Editor. Les migrations suivantes sont également archivées dans `supabase/migrations/`.
3. Dans Supabase Auth, vérifier l'URL du site et autoriser les URL de redirection utilisées en développement et en prévisualisation Vercel (notamment `/auth/callback`).
4. Activer la confirmation d'adresse e-mail si souhaité. Le parcours d'inscription utilise un callback PKCE.
5. Les nouveaux utilisateurs créent leur compte à `/register`, puis leur premier établissement à `/onboarding`.
6. L'équipe peut ajouter des informations vérifiées dans la base de connaissances ; seules les lignes `is_public = true` sont accessibles au concierge public.

## Routes principales

- `/` : site vitrine.
- `/register` : création de compte.
- `/login` : connexion / mot de passe oublié.
- `/auth/callback` : confirmation / échange PKCE.
- `/reset-password` : choix d'un nouveau mot de passe.
- `/onboarding` : création du premier établissement.
- `/dashboard` : tableau de bord.
- `/dashboard/concierge` : lien client et historique des conversations.
- `/dashboard/facts` : base de connaissances.
- `/dashboard/rooms` : chambres et statuts.
- `/dashboard/requests` : demandes clients.
- `/dashboard/stats` : indicateurs d'activité.
- `/dashboard/settings` : informations de l'établissement.
- `/guest/<HOTEL_UUID>` : concierge public client.

## OpenAI

Le chat public lit uniquement les informations de l'hôtel explicitement publiées, construit les instructions serveur et appelle `client.responses.create`. Le serveur persiste la question et la réponse dans `public.conversations`. Les échanges n'utilisent pas la conservation de réponses OpenAI (`store: false`).

Sans `OPENAI_API_KEY`, l'interface et les autres modules fonctionnent, mais le concierge renvoie un message indiquant qu'il n'est pas activé.

## Données et droits

- Chaque table métier exposée dispose de RLS.
- Les membres ne voient que les lignes de leurs établissements.
- Les clients anonymes ne peuvent lire que les hôtels actifs et les fiches publiques.
- Les clients anonymes peuvent soumettre une conversation ou une demande pour un hôtel actif ; ils ne peuvent pas lire les historiques.
- Les rôles propriétaires/responsables gèrent les informations et les chambres ; les membres peuvent consulter et actualiser les statuts opérationnels autorisés.
- Le premier propriétaire d'un hôtel est créé par un flux authentifié, sans fonction `SECURITY DEFINER` publique.

## Contrôles qualité

```bash
npm run typecheck
npm run build
```

GitHub Actions exécute la vérification TypeScript et la compilation de production à chaque commit.

## Limites avant un pilote hôtelier réel

Cette version est une **V1 fonctionnelle à valider**, pas encore une mise en production certifiée :

- Le rate limiting du chat et des demandes est actuellement en mémoire par instance ; ajouter un limiteur distribué (Upstash/Redis ou équivalent) avant un trafic public important.
- La protection anti-spam, CAPTCHA et les quotas/tokens par hôtel restent à compléter.
- Les tests automatisés d'isolation entre deux hôtels et de toutes les politiques RLS restent à écrire.
- Définir les politiques de conservation, effacement, export, consentement et notices RGPD (France) / LPD (Suisse).
- Mettre en place journalisation, alertes et redaction des données personnelles dans les logs.
- Vérifier les contrats de sous-traitance, transferts éventuels et localisation de chaque prestataire.
- Compléter la gestion des équipes/invitations, les réservations, les notifications réception et la facturation.
- Ne pas saisir de données bancaires, de pièces d'identité ou de données sensibles dans le concierge.
- Le taux d'occupation est calculé à partir du nombre de chambres et de leur statut opérationnel, pas à partir d'un PMS ou d'un moteur de réservations.

Voir `docs/SECURITY-CHECKLIST.md` et `docs/DEPLOYMENT.md` avant tout pilote.
