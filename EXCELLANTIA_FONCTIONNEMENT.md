# Fonctionnement detaille - Plateforme Excellantia

Ce document decrit le fonctionnement attendu de la plateforme de simulation Excellantia. Il sert de reference produit avant implementation.

## 1. Idee generale

La plateforme simule une epreuve Excellantia telle qu'elle pourrait se derouler pour des laureats du bac en RDC.

Une epreuve standard contient :
- 100 questions
- 25 questions de mathematiques
- 25 questions de francais
- 25 questions d'anglais
- 25 questions de culture generale
- 100 minutes de composition

La plateforme ne doit pas fonctionner comme un quiz question par question. Des le debut de l'epreuve, le candidat doit avoir acces a toutes les questions.

Il peut :
- lire toutes les questions
- repondre dans l'ordre qu'il veut
- revenir sur une question
- modifier une reponse avant soumission
- marquer une question a revoir
- voir son avancement par rubrique
- soumettre avant la fin

La correction n'est disponible qu'apres soumission ou fin de salle.

## 2. Principes fondamentaux

### 2.1 Utilisateurs preinscrits

Un candidat ne cree pas librement son compte.

Les utilisateurs sont crees :
- manuellement par un administrateur
- ou par import JSON

Chaque utilisateur a :
- un fullname
- un code unique a 14 chiffres
- un role

Le code a 14 chiffres est l'identifiant de connexion a la plateforme.

Le candidat utilise ce code pour se connecter a son espace. Une fois connecte, il n'a pas besoin de retaper son code pour commencer une salle, voir son dashboard ou consulter son historique.

### 2.2 Roles

La plateforme connait deux roles principaux :

`ADMIN`
- gere les utilisateurs
- importe les candidats
- cree les salles
- programme les salles
- demarre les salles
- consulte les classements
- consulte les statistiques
- partage les resultats

`CANDIDATE`
- se connecte avec son code a 14 chiffres
- accede a son dashboard
- entre dans les salles disponibles
- fait des entrainements personnels
- consulte ses resultats
- consulte les anciennes salles autorisees
- peut visiter les profils/statistiques autorises

## 3. Connexion

### 3.1 Connexion par code

La page de connexion contient un champ :

```txt
Code candidat
[______________]
Se connecter
```

Regles :
- le code doit contenir exactement 14 chiffres
- le code doit exister en base
- le code doit appartenir a un utilisateur actif
- si le code est valide, l'utilisateur arrive sur son dashboard
- si le code est invalide, l'acces est refuse

Le code ne doit jamais etre affiche publiquement dans les profils ou classements.

### 3.2 Session utilisateur

Apres connexion, l'utilisateur reste connecte.

Il peut aller vers :
- dashboard
- salles
- entrainement personnel
- resultats
- profils

Il n'a pas besoin de retaper son code a 14 chiffres pour rejoindre une salle publique ou consulter son historique.

## 4. Admins initiaux

Au depart, la plateforme doit pouvoir creer au moins un administrateur via seed Prisma.

Exemple :

```txt
fullname: Administrateur Principal
code: 00000000000001
role: ADMIN
```

Le seed doit utiliser une logique idempotente, par exemple `upsert`, pour ne pas creer plusieurs fois le meme admin.

## 5. Import des candidats

L'administrateur peut importer les candidats depuis un fichier JSON.

Format attendu :

```json
[
  {
    "fullname": "KABONGO Jean Pierre",
    "code": "25072006123456",
    "role": "CANDIDATE"
  },
  {
    "fullname": "MUKENDI Grace Divine",
    "code": "25072006987654",
    "role": "CANDIDATE"
  }
]
```

Validation :
- `fullname` est obligatoire
- `code` est obligatoire
- `code` doit contenir exactement 14 chiffres
- `code` doit etre unique
- `role` doit etre valide

Apres import, l'admin voit un rapport :
- nombre de candidats crees
- nombre de candidats ignores
- nombre d'erreurs
- liste des lignes invalides

## 6. Stockage des questions

Les questions ne sont pas stockees en base de donnees.

Elles sont stockees en JSON dans 4 fichiers :

```txt
data/questions/maths.json
data/questions/francais.json
data/questions/anglais.json
data/questions/culture-generale.json
```

Les textes de comprehension peuvent etre stockes dans :

```txt
data/passages/francais.json
data/passages/anglais.json
```

La base Prisma ne stocke que :
- les utilisateurs
- les salles
- les tentatives
- les reponses donnees
- les IDs des questions selectionnees
- les scores
- les statistiques

## 7. Format d'une question JSON

Une question doit contenir :

```json
{
  "id": "math-001",
  "subject": "MATH",
  "topic": "Equations",
  "subtopic": "Premier degre",
  "difficulty": "EASY",
  "statement": "Resoudre 2x + 5 = 17.",
  "options": ["x = 4", "x = 5", "x = 6", "x = 7"],
  "answerIndex": 2,
  "explanation": "On soustrait 5 aux deux membres : 2x = 12. Ensuite on divise par 2, donc x = 6.",
  "optionExplanations": [
    "Faux : x = 4 donne 13.",
    "Faux : x = 5 donne 15.",
    "Correct : x = 6 donne 17.",
    "Faux : x = 7 donne 19."
  ]
}
```

Champs obligatoires :
- `id`
- `subject`
- `difficulty`
- `statement`
- `options`
- `answerIndex`
- `explanation`

`explanation` est obligatoire pour toutes les questions.

Pour les mathematiques, l'explication doit montrer comment trouver la reponse.

Pour les textes, l'explication doit justifier la reponse a partir du texte.

Pour la culture generale, l'explication doit donner le fait, le contexte ou la precision utile.

## 8. Questions sur textes en francais et anglais

Certaines questions de francais et d'anglais peuvent etre liees a un texte.

Exemple de passage :

```json
{
  "id": "fr-passage-001",
  "title": "Texte sur l'education",
  "language": "FR",
  "content": "..."
}
```

Exemple de question liee :

```json
{
  "id": "fr-texte-001-q01",
  "subject": "FRENCH",
  "type": "PASSAGE_QUESTION",
  "passageId": "fr-passage-001",
  "difficulty": "MEDIUM",
  "statement": "Quelle est l'idee principale du texte ?",
  "options": ["...", "...", "...", "..."],
  "answerIndex": 1,
  "explanation": "La bonne reponse est B parce que le texte insiste principalement sur..."
}
```

Lors de la creation d'une salle, l'admin peut choisir :
- le nombre de questions sur texte en francais
- le nombre de questions sur texte en anglais
- le nombre de textes a utiliser

La plateforme doit verifier que les fichiers JSON contiennent assez de questions liees aux textes.

## 9. Culture generale RDC

Les questions de culture generale doivent pouvoir distinguer :
- questions nationales RDC
- questions internationales

Exemple :

```json
{
  "id": "cg-001",
  "subject": "GENERAL_CULTURE",
  "scope": "DRC",
  "difficulty": "EASY",
  "statement": "Quelle est la capitale de la RDC ?",
  "options": ["Lubumbashi", "Kinshasa", "Goma", "Kisangani"],
  "answerIndex": 1,
  "explanation": "Kinshasa est la capitale de la Republique democratique du Congo."
}
```

Lors de la creation d'une salle, l'admin peut choisir combien de questions de culture generale doivent etre nationales RDC.

Exemple :

```txt
Culture generale : 25 questions
Questions RDC : 10
Questions internationales : 15
```

## 10. Salles

Une salle represente une epreuve collective ou personnelle.

Elle contient :
- un titre
- une duree
- un statut
- une visibilite
- un mode de temps
- une date/heure de demarrage eventuelle
- une date/heure de fin eventuelle
- les IDs des questions selectionnees
- les tentatives des candidats

### 10.1 Statuts

`WAITING`
- la salle existe mais n'a pas encore commence

`SCHEDULED`
- la salle est programmee pour une date et une heure precises

`RUNNING`
- la salle est en cours

`CLOSED`
- la salle est terminee

`CANCELLED`
- la salle a ete annulee

### 10.2 Visibilite

`PUBLIC`
- tout utilisateur connecte peut voir la salle
- tout utilisateur connecte peut entrer si la salle est en cours ou ouverte

`PRIVATE`
- la salle est protegee par un code d'acces
- l'utilisateur doit entrer le code de salle pour y acceder

Le code de salle privee est different du code candidat a 14 chiffres.

Exemple :

```txt
Code candidat : 25072006123456
Code salle privee : EXC-2026-A1
```

## 11. Programmation d'une salle

Lors de la creation d'une salle, l'admin a deux possibilites :

### 11.1 Programmer la salle

L'admin choisit :
- une date precise
- une heure precise
- une duree
- un mode de temps

La salle apparait comme `SCHEDULED`.

Dans la page salles, les candidats voient :

```txt
Simulation Excellantia 01
Statut : Programmee
Debut : 18 juillet 2026 a 09:00
Commence dans : 2 jours 3 heures
```

Quand l'heure arrive, la salle peut passer en `RUNNING` via :
- action serveur automatique
- verification au chargement de la page
- tache planifiee

### 11.2 Commencer maintenant

L'admin peut cliquer sur :

```txt
Commencer maintenant
```

Dans ce cas :
- `startsAt` est fixe immediatement
- le statut passe a `RUNNING`
- si le temps est absolu, `endsAt = startsAt + durationMin`
- les candidats peuvent entrer tout de suite

Ce bouton doit etre visible pour les admins sur les salles en attente ou programmees.

## 12. Modes de temps

### 12.1 Temps absolu

Tout le monde partage le meme temps.

Exemple :
- debut : 09:00
- fin : 10:40

Un candidat qui arrive a 09:20 n'a plus que 80 minutes.

S'il est deconnecte puis revient avant 10:40, il reprend sa tentative.

S'il revient apres 10:40, sa copie est soumise automatiquement.

### 12.2 Temps relatif

Chaque candidat a son propre temps a partir du debut de sa tentative.

Exemple :
- duree : 100 minutes
- candidat A commence a 09:00, finit a 10:40
- candidat B commence a 09:15, finit a 10:55

Selon la regle choisie, si le candidat est deconnecte, sa copie peut etre automatiquement soumise.

Le temps restant doit toujours etre calcule cote serveur, pas uniquement dans le navigateur.

## 13. Page Salles

Apres connexion, l'utilisateur peut cliquer sur `Salles`.

La page affiche :
- salles en cours
- salles programmees
- anciennes salles
- salles publiques
- salles privees accessibles

Pour une salle en cours, afficher :

```txt
Titre : Simulation Excellantia 01
Statut : En cours
Temps restant : 42 min 18 s
Participants : 128
Type : Publique
Bouton : Entrer
```

Pour une salle privee :

```txt
Titre : Simulation privee Groupe A
Statut : En cours
Temps restant : 58 min
Type : Privee
Bouton : Entrer le code
```

Pour une ancienne salle :

```txt
Titre : Simulation Excellantia 01
Statut : Terminee
Participants : 128
Moyenne : 67%
Boutons : Voir classement / Voir stats / Voir questions
```

## 14. Interface d'examen

L'examen affiche toutes les questions des les premieres secondes.

Les rubriques sont separees :

```txt
Mathematiques
Questions 1 a 25

Francais
Questions 26 a 50

Anglais
Questions 51 a 75

Culture generale
Questions 76 a 100
```

Le candidat peut :
- repondre dans n'importe quel ordre
- modifier ses reponses
- marquer une question a revoir
- voir le nombre de questions repondues
- voir le temps restant
- soumettre

Il ne voit pas :
- la bonne reponse
- les explications
- son score provisoire

## 15. Soumission

Une tentative peut etre soumise :
- manuellement par le candidat
- automatiquement quand le temps expire
- automatiquement selon la regle de deconnexion en temps relatif

Apres soumission :
- les reponses sont verrouillees
- le score est calcule
- le candidat peut voir sa correction si la salle le permet
- l'admin peut voir le statut de la copie

## 16. Correction detaillee

Chaque correction doit afficher :
- la question
- la reponse du candidat
- la bonne reponse
- l'explication
- les explications des options si disponibles

Pour les mathematiques :
- montrer les etapes
- expliquer pourquoi la reponse est correcte
- mentionner les erreurs classiques si utile

Pour le francais et l'anglais :
- citer ou paraphraser l'indice du texte
- expliquer le vocabulaire ou la grammaire si necessaire

Pour la culture generale :
- donner le fait correct
- donner le contexte ou une precision utile

## 17. Classement

Apres une salle terminee, l'admin peut voir le classement.

Le classement est trie :
1. du meilleur pourcentage au plus faible
2. en cas d'egalite, par temps de soumission
3. en cas de nouvelle egalite, par ordre alphabetique

Chaque ligne affiche :
- rang
- fullname
- score
- pourcentage
- score par rubrique
- statut de soumission

Exemple :

```txt
1. KABONGO Jean Pierre - 86%
2. MUKENDI Grace Divine - 82%
3. ILUNGA Patrick - 75%
```

L'admin peut partager ce classement sur WhatsApp.

## 18. Partage WhatsApp

Le bouton `Partager sur WhatsApp` genere un message texte.

Exemple :

```txt
Resultats - Simulation Excellantia 01

1. KABONGO Jean Pierre - 86%
2. MUKENDI Grace Divine - 82%
3. ILUNGA Patrick - 75%

Participants : 128
Duree : 100 minutes
Questions : 100
```

Le lien utilise :

```txt
https://wa.me/?text=...
```

## 19. Anciennes salles

Une salle terminee reste consultable.

On peut y voir :
- classement
- questions
- bonnes reponses
- corrections
- statistiques globales
- statistiques par rubrique
- questions les plus ratees
- questions les mieux reussies
- nombre d'echecs par question
- taux d'echec par question

Les anciennes salles permettent de comprendre ce qui a bloque le groupe.

## 20. Statistiques de salle

Pour chaque salle terminee, calculer :
- nombre de participants
- moyenne globale
- meilleur score
- score le plus faible
- ecart-type
- taux de soumission
- score moyen par rubrique
- temps moyen de soumission

Pour chaque question :
- nombre de bonnes reponses
- nombre de mauvaises reponses
- nombre de non-reponses
- taux de reussite
- taux d'echec

Les questions les plus ratees doivent etre visibles clairement.

Exemple :

```txt
Questions les plus ratees

1. Math Q12 - 82% d'echec
2. Anglais Q08 - 76% d'echec
3. Culture RDC Q21 - 71% d'echec
```

## 21. Dashboard candidat

Le dashboard candidat affiche :
- fullname
- dernier score
- moyenne generale
- meilleur score
- nombre de tentatives
- moyenne par rubrique
- ecart-type personnel
- historique des entrainements personnels
- historique des salles collectives
- points forts
- points faibles
- recommandations
- salles disponibles

Exemples de recommandations :

```txt
Tu es fort en Francais : moyenne 21/25.
Priorite : revoir les equations et les problemes de proportionnalite.
Tu perds souvent des points en culture generale RDC.
```

## 22. Profils utilisateurs

La plateforme peut permettre de visiter les profils statistiques.

Un profil affiche :
- fullname
- role
- nombre de salles participees
- moyenne globale
- meilleur score
- moyenne par rubrique
- points forts
- points faibles
- historique public autorise

Regles :
- un candidat voit son propre profil
- un admin voit tous les profils
- les profils des autres candidats peuvent etre visibles si la plateforme l'autorise
- le code a 14 chiffres ne doit pas etre expose publiquement

## 23. Dashboard admin

L'admin voit :
- salles en cours
- salles programmees
- salles terminees
- candidats
- admins
- import JSON
- validation des questions JSON
- creation de salle
- bouton commencer maintenant
- classements
- statistiques
- profils utilisateurs

Il peut :
- creer une salle publique
- creer une salle privee
- programmer une salle
- demarrer une salle immediatement
- fermer une salle
- annuler une salle programmee
- importer des candidats
- consulter les erreurs des questions JSON
- partager les resultats WhatsApp

## 24. Modeles Prisma proposes

Les questions restent en JSON. Prisma stocke les donnees dynamiques.

### User

```prisma
model User {
  id        String   @id @default(cuid())
  fullname String
  code      String   @unique
  role      Role     @default(CANDIDATE)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  ADMIN
  CANDIDATE
}
```

### Room

```prisma
model Room {
  id          String         @id @default(cuid())
  title       String
  status      RoomStatus     @default(WAITING)
  visibility  RoomVisibility @default(PUBLIC)
  accessCode  String?
  timeMode    TimeMode
  durationMin Int            @default(100)
  startsAt    DateTime?
  endsAt      DateTime?
  questionIds Json
  config      Json
  createdById String
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}

enum RoomStatus {
  WAITING
  SCHEDULED
  RUNNING
  CLOSED
  CANCELLED
}

enum RoomVisibility {
  PUBLIC
  PRIVATE
}

enum TimeMode {
  ABSOLUTE
  RELATIVE
}
```

### Attempt

```prisma
model Attempt {
  id          String        @id @default(cuid())
  userId      String
  roomId      String
  startedAt   DateTime
  submittedAt DateTime?
  status      AttemptStatus @default(IN_PROGRESS)
  score       Int?
  percentage  Float?
  timeUsedSec Int?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

enum AttemptStatus {
  IN_PROGRESS
  SUBMITTED
  AUTO_SUBMITTED_TIME_EXPIRED
  AUTO_SUBMITTED_DISCONNECTED
}
```

### Answer

```prisma
model Answer {
  id            String   @id @default(cuid())
  attemptId     String
  questionId    String
  selectedIndex Int?
  flagged       Boolean  @default(false)
  updatedAt     DateTime @updatedAt
}
```

### RoomAccess

Pour memoriser l'acces a une salle privee :

```prisma
model RoomAccess {
  id        String   @id @default(cuid())
  roomId    String
  userId    String
  grantedAt DateTime @default(now())

  @@unique([roomId, userId])
}
```

## 25. Generation d'une salle

Quand l'admin cree une salle :
1. la plateforme lit les 4 fichiers JSON
2. elle valide les questions
3. elle applique les filtres de rubrique
4. elle applique les filtres de difficulte
5. elle applique les contraintes de textes francais/anglais
6. elle applique les contraintes RDC pour culture generale
7. elle selectionne exactement les questions necessaires
8. elle stocke seulement les IDs dans `Room.questionIds`
9. elle stocke la configuration dans `Room.config`

Si une contrainte ne peut pas etre satisfaite, la salle n'est pas creee.

Exemple d'erreur :

```txt
Impossible de creer la salle :
Maths HARD : 6 questions demandees, seulement 4 disponibles.
Culture generale RDC : 10 questions demandees, seulement 7 disponibles.
Anglais texte : 8 questions demandees, seulement 5 disponibles.
```

## 26. MVP attendu

La premiere version utilisable doit contenir :
- connexion par code a 14 chiffres
- seed admin
- import candidats JSON
- questions en 4 fichiers JSON
- validateur JSON
- creation de salle publique/privee
- code d'acces pour salle privee
- programmation d'une salle par date et heure
- bouton admin `Commencer maintenant`
- affichage des salles avec minutes restantes
- examen avec toutes les questions visibles
- soumission automatique
- correction detaillee
- classement
- partage WhatsApp
- stats des anciennes salles
- dashboard candidat
- profils utilisateurs consultables

## 27. Resume final

La plateforme Excellantia doit etre une simulation d'examen avec :
- candidats preinscrits
- connexion par code a 14 chiffres
- questions stockees en JSON
- salles publiques ou privees
- salles programmees ou demarrees immediatement
- 100 questions visibles des le debut
- corrections toujours expliquees
- statistiques individuelles et collectives
- anciennes salles consultables
- profils utilisateurs
- classement partageable sur WhatsApp
