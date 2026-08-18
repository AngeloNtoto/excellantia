# Refonte partielle de la plateforme - TODO & plan d'implémentation

## Objectif
Refondre le cœur de la plateforme autour d'une base de données centralisée, en remplaçant la logique actuelle basée sur des fichiers JSON par une gestion dynamique des textes, des questions et des salles depuis l'interface admin.

## TODO global

### 1) Modèle de données et migration
- [ ] Créer les tables de contenu : `TextContent`, `Question`, `QuestionTag`, `RoomQuestionPool`.
- [ ] Ajouter les enums suivants : `Language`, `QuestionType`, `ContentScope`, `RoomMode`, `TimingMode`, `QuestionSource`.
- [ ] Ne garder que 2 modes principaux : `TRAINING` et `SIMULATION`.
- [ ] Considérer `salon` et `simulation` comme la même logique métier : une salle est un mode de simulation, avec ou sans questions d'entraînement.
- [ ] Séparer les questions créées par un utilisateur de celles ajoutées dans un contexte de salle / simulation.
- [ ] Stocker le texte et les questions associées en base, avec relation explicite entre `TextContent` et `Question`.
- [ ] Supprimer la dépendance actuelle aux fichiers JSON comme source principale de vérité.
- [ ] Préparer une migration des données existantes vers le schéma Prisma sans casser les écrans existants.

### 2) Gestion admin des textes et des questions
- [ ] Créer un écran admin pour ajouter un texte avec : titre, langue, type, contexte, statut actif.
- [ ] Permettre l'ajout de questions associées au texte depuis l'interface admin.
- [ ] Supporter deux modes de saisie :
  - [ ] formulaire standard
  - [ ] import JSON
- [ ] Ajouter la possibilité de choisir le domaine / matière au moment de la question.
- [ ] Ajouter la distinction entre :
  - [ ] entraînement personnel
  - [ ] simulation / salon
- [ ] Ajouter un contrôle de validation pour les champs obligatoires : texte, réponse, explication, difficulté, sujet, type.
- [ ] Prévoir un système de recherche / filtrage des textes et questions en base.

### 3) Refactor du moteur de génération de salle
- [ ] Ajouter dans la création de salle une option : "Inclure des questions d'entraînement".
- [ ] Permettre à l'admin de choisir si la salle est en mode `TRAINING` ou `SIMULATION`.
- [ ] Faire en sorte qu'un salon admin soit simplement une salle de simulation, avec possibilité d'ajouter un pool d'entraînement supplémentaire.
- [ ] Générer les questions directement depuis la base plutôt qu'à partir des fichiers JSON.
- [ ] Séparer la logique de sélection : pool de base / pool d'entraînement / pool de simulation.
- [ ] Gérer les sujets et thèmes sélectionnés à partir des données DB.

### 4) Réforme du système de timing
- [ ] Introduire un niveau de timing supplémentaire basé sur le temps attribué par sujet / matière.
- [ ] Calculer le temps global selon le nombre de questions par sujet et le niveau de difficulté.
- [ ] Définir une règle de répartition : temps total = somme des temps attribués par domaine.
- [ ] Permettre une logique de "temps de pause" / "temps d'attente" après fin rapide.
- [ ] Si un candidat termine avant le temps alloué, il reste en attente jusqu'à ce que le temps global s'écoule pour tout le monde.
- [ ] Désactiver/retirer le stockage JSON pour le timing et la logique de salle.
- [ ] Enregistrer la politique de timing dans la base pour chaque salle.

### 5) Logique métier des salles et des tentatives
- [ ] Adapter le flux de création de salle pour prendre en compte le nouveau modèle de questions et de timing.
- [ ] Modifier les tentatives pour tenir compte du temps de pause / temps d'attente.
- [ ] Gérer le statut de salle selon : attente, planifiée, en cours, fermée, annulée.
- [ ] Ajouter le calcul d'un temps de fin effectif par matière et par candidat.
- [ ] Prévoir le cas où plusieurs candidats terminent à des moments différents.
- [ ] S'assurer qu'une tentative soumise après expiration du temps n'est plus modifiable.
- [ ] Bloquer toute modification d'une réponse dès que la tentative est déjà soumise et que le temps est écoulé.

### 6) Frontend et interface d'administration
- [ ] Créer les écrans admin pour :
  - ajout de textes
  - ajout de questions
  - import JSON
  - gestion des salles
  - paramétrage du timing
- [ ] Mettre à jour les écrans de salle pour afficher la nouvelle configuration de temps.
- [ ] Ajouter des états visuels pour les questions d'entraînement vs simulation.
- [ ] Consolider les composants de formulaire existants pour le nouveau schéma.

### 7) Sécurité, validation et QA
- [ ] Vérifier les permissions d'accès admin.
- [ ] Valider les imports JSON et les formulaires côté serveur.
- [ ] Ajouter des tests de logique de génération, timing et relation texte-question.
- [ ] Vérifier les migrations Prisma et les cas limite.
- [ ] Faire une passe de regression sur les pages salles, dashboard et exam.
- [ ] Tester le cas "soumission expirée => lecture seule".

## Plan d'implémentation recommandé

### Phase 1 - Modèle et fondations
1. Modifier le schéma Prisma avec les tables et enums nécessaires.
2. Ajouter les relations entre `User`, `Room`, `TextContent`, `Question`, `Attempt` et `RoomAccess`.
3. Valider le design avec un schéma de données réaliste pour le cas d'usage : `TRAINING` vs `SIMULATION`, timing par matière.
4. Préparer la migration SQL / Prisma et les seed de base.

### Phase 2 - Administration du contenu
1. Développer le formulaire d'ajout de texte.
2. Développer le formulaire d'ajout de questions liées.
3. Ajouter le mode import JSON pour les textes et questions.
4. Implémenter les filtres par langue, sujet, type et source.

### Phase 3 - Salles et génération dynamique
1. Adapter la création de salle à la nouvelle logique DB.
2. Ajouter la case "inclure des questions d'entraînement".
3. Séparer les sources de questions selon le type de contexte.
4. Tester le moteur de sélection selon sujet, thème et difficulté.

### Phase 4 - Timing avancé
1. Introduire le calcul de temps par sujet.
2. Ajouter la logique de pause / attente lorsque le candidat termine plus tôt.
3. Enregistrer les règles dans `Room.config` ou dans une table dédiée `RoomTimingConfig`.
4. Ajuster le contrôle automatique de fermeture de salle.
5. Ajouter une règle de blocage : si le temps est expiré et la tentative déjà soumise, aucune modification n'est acceptée.

### Phase 5 - UI / bugs / migration progressive
1. Mettre à jour les pages admin et candidat.
2. Retirer progressivement le chargement depuis `data/questions/*.json`.
3. Supprimer les points de dépendance JSON encore actifs.
4. Vérifier les flux de création, participation et correction.
5. Vérifier explicitement le cas de soumission expirée / lecture seule.

## Décision d'architecture

### Structure cible recommandée
- `TextContent` : stocke le texte pédagogique / passage / support.
- `Question` : stocke une question reliée à un texte, à un sujet et à une source.
- `QuestionSource` : distingue `USER_CREATED`, `ROOM_GENERATED`, `TRAINING`, `SIMULATION`.
- `Room` : stocke l'option d'inclusion d'un pool d'entraînement dans une salle de simulation.
- `RoomTimingConfig` : stocke la politique de timing par matière et la logique de pause.

### Ce qu'il faut enlever
- Les dépendances directes à `lib/questions.ts` comme source de vérité.
- Les chargements basés sur les fichiers JSON dans les flux de génération.
- Les logiques métier qui supposent qu'une question est uniquement issue d'un fichier local.

## Recommandation de livraison
Livrer la refonte par étapes, dans l'ordre suivant :
1. Base de données + migration
2. Gestion admin texte + question
3. Génération questions à partir de la DB
4. Timing avancé
5. UI + tests de régression

Cela évite de casser les flux existants pendant la transition, tout en respectant le fait que le salon et la simulation sont un seul et même mode principal.

## Prochaine action concrète
Commencer par la Phase 1 uniquement : schéma Prisma, modèles, enums, puis migration minimale. Une fois validée, passer à l'administration des textes et questions, puis au timing avancé.
