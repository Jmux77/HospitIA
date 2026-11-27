# HospitIA

Concierge IA multilingue et plateforme SaaS destinée aux hôtels indépendants en **France et en Suisse**.

## Fonctionnalités présentes dans cette fondation V1
- Site vitrine responsive.
- Authentification hôtelière par Supabase.
- Tableau de bord par établissement.
- Base de connaissances saisie et validée par l'hôtel.
- Chat concierge public par URL/QR code.
- Réponses générées par OpenAI à partir des seules informations publiées par l'hôtel.
- Schéma PostgreSQL multi-établissements avec politiques RLS.

## Stack technique
- Next.js 16 + React 19 + TypeScript.
- Supabase Auth, PostgreSQL, RLS.
- OpenAI Node SDK (clé exclusivement côté serveur).
- Tailwind CSS.

## Démarrage local
Prérequis : Node.js 24 ou supérieur.
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
Ne jamais committer `.env.local`, une clé OpenAI, une clé Supabase secrète/service-role ou un mot de passe de base de données.

## Configuration Supabase
1. Créer un projet dans une région adaptée à la résidence des données des hôtels.
2. Exécuter `supabase/schema.sql` dans SQL Editor.
3. Créer un utilisateur pilote dans Authentication.
4. Créer l'hôtel et son propriétaire avec leurs vrais UUID :
```sql
insert into public.hotels(name,slug,city,country,language,plan)
values ('Hôtel Démo HospitIA','hotel-demo','Annecy','FR','fr','business')
returning id;
-- Utiliser l'UUID retourné et l'UUID Auth réel :
insert into public.hotel_members(hotel_id,user_id,role)
values ('HOTEL_UUID','AUTH_USER_UUID','owner');
```
5. Ajouter des informations réelles uniquement après vérification par l'hôtel.

## Routes
- `/` : site vitrine.
- `/demo` : aperçu statique du concierge.
- `/login` : connexion hôtelier.
- `/dashboard` : espace établissement.
- `/dashboard/facts` : base de connaissances.
- `/guest/<HOTEL_UUID>` : concierge client.
- `POST /api/chat` : API conversationnelle.

## Limites connues de cette fondation
Cette V1 est un prototype technique, pas un SaaS autorisé à traiter de vrais clients en production.
- Pas de limiteur anti-abus / rate limiting robuste sur le chat public.
- Les conversations ne sont pas encore enregistrées.
- Pas encore de traitement des demandes client ni de notifications réception.
- Pas de paiement ou gestion d'abonnements Stripe.
- Pas de tests automatisés d'isolation entre hôtels.
- Seules les lignes `hotel_facts` explicitement marquées `is_public = true` sont lisibles par les visiteurs du concierge ; ne jamais y publier de données internes ou personnelles.
- Pas encore de gestion de la conservation, du droit à l'effacement ou du consentement.

Lire `docs/SECURITY-CHECKLIST.md` et `docs/DEPLOYMENT.md` avant tout pilote. Vérifier les obligations RGPD en France et LPD/révFADP en Suisse, les contrats de sous-traitance et le lieu de traitement des données.

## Roadmap
Voir `ROADMAP.md` et `docs/PRODUCT-ROADMAP.md`.
