# HospitIA — Security and privacy gate

État : V1 fonctionnelle, validation sécurité et conformité encore nécessaire avant un pilote hôtelier avec des clients réels.

## Mesures déjà présentes

- [x] RLS activé sur les tables publiques métier : hotels, hotel_members, hotel_facts, conversations, guest_requests et hotel_rooms.
- [x] Lecture des hôtels réservée aux hôtels actifs pour le concierge public et aux membres/propriétaires pour l'espace privé.
- [x] Les visiteurs anonymes ne peuvent lire que les fiches explicitement publiées (`hotel_facts.is_public = true`).
- [x] Les conversations et demandes sont accessibles en lecture uniquement aux membres de l'établissement concerné.
- [x] Les insertions anonymes sont limitées aux hôtels actifs et aux colonnes nécessaires.
- [x] Les clés OpenAI et Supabase secrètes ne sont pas incluses dans le navigateur ou le dépôt.
- [x] L'identité Supabase est vérifiée par les claims JWT côté serveur avant l'accès aux espaces hôteliers.
- [x] Le premier établissement est rattaché à l'utilisateur authentifié via des politiques RLS, sans fonction `SECURITY DEFINER` exposée publiquement.
- [x] L'API OpenAI est appelée côté serveur et utilise `store: false`.
- [x] Une limitation basique des requêtes chat et demandes clients existe par instance.

## À terminer avant un pilote externe

- [ ] Remplacer le limiteur en mémoire par un rate limiter distribué et persistant.
- [ ] Ajouter CAPTCHA / protection anti-automatisation sur les endpoints publics.
- [ ] Définir un plafond quotidien de messages et de tokens par établissement.
- [ ] Ajouter tests automatisés RLS avec deux établissements, deux propriétaires et plusieurs rôles.
- [ ] Ajouter tests d'intégration pour le chat, les demandes, le changement d'établissement et les permissions.
- [ ] Définir durée de conservation des conversations et demandes, suppression, export et droits d'accès.
- [ ] Publier notices de confidentialité, informations sur le traitement IA et conditions d'utilisation.
- [ ] Vérifier accords de traitement des données, transferts internationaux et sous-traitants.
- [ ] Mettre en place une journalisation d'audit et une surveillance avec masquage des données.
- [ ] Ajouter un parcours d'urgence / transfert à un membre humain.
- [ ] Vérifier la conformité aux exigences européennes et suisses applicables à la transparence de l'IA.
- [ ] Configurer sauvegardes et procédure de restauration testée.
- [ ] Définir rôles complets, invitations d'équipe et révocation des accès.
- [ ] Ajouter quotas, facturation et webhooks seulement après choix des offres et validation des coûts.

## Données à ne jamais collecter dans le concierge

- Informations de carte bancaire ou de paiement.
- Copies de pièces d'identité, mots de passe et codes d'accès privés.
- Données médicales ou autres données sensibles.
- Informations personnelles qui ne sont pas nécessaires pour répondre à la demande du voyageur.

## Points d'attention techniques

- Les insertions anonymes de conversations et demandes sont autorisées par RLS pour un hôtel actif. Elles doivent être protégées par un limiteur distribué et une surveillance anti-abus avant une exposition importante.
- Le limiteur en mémoire ne constitue pas un contrôle fiable entre plusieurs instances serverless.
- L'historique stocke les questions et réponses pour la réception. La durée de conservation et l'effacement doivent être définis avant l'usage client.
- Les taux d'occupation affichés reflètent les statuts de chambres saisis dans HospitIA ; ils ne sont pas synchronisés avec un PMS.
