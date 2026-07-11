# TODO detaillee - Plateforme de simulation Excellantia

Objectif : construire une plateforme qui simule les conditions d'une epreuve Excellantia en RDC, avec entrainement personnel, salles collectives publiques/privees, questions stockees en JSON, statistiques avancees et classements partageables.

## Phase 0 - Cadrage produit
- [x] Valider le nom de la plateforme
- [x] Valider les 4 rubriques officielles
  - [x] Mathematiques
  - [x] Francais
  - [x] Anglais
  - [x] Culture generale
- [x] Valider le format standard d'une epreuve
  - [x] 100 questions
  - [x] 25 questions par rubrique
  - [x] 100 minutes
  - [x] toutes les questions visibles des le debut
- [x] Valider les statuts d'une salle
  - [x] En attente
  - [x] Programmee
  - [x] En cours
  - [x] Terminee
  - [x] Annulee
- [x] Valider les types de salles
  - [x] Publique
  - [x] Privee avec code d'acces
- [x] Valider les modes de temps
  - [x] Temps absolu uniforme pour tous
  - [x] Temps relatif propre a chaque candidat

## Phase 1 - Base technique
- [x] Initialiser le projet applicatif
- [x] Installer et configurer Prisma
- [x] Choisir la base de donnees
- [x] Creer le schema Prisma initial
- [x] Configurer les variables d'environnement
- [x] Ajouter les scripts de migration Prisma
- [x] Ajouter un script de seed
- [x] Ajouter les validations cote serveur
- [x] Ajouter les tests de base

## Phase 2 - Utilisateurs et authentification par code
- [x] Creer le modele `User`
  - [x] `fullname`
  - [x] `code` unique a 14 chiffres
  - [x] `role`
  - [x] dates de creation et mise a jour
- [x] Creer les roles
  - [x] `ADMIN`
  - [x] `CANDIDATE`
- [x] Creer une page de connexion par code a 14 chiffres
- [x] Verifier que le code contient exactement 14 chiffres
- [x] Refuser l'acces si le code n'existe pas
- [x] Ouvrir une session utilisateur apres connexion
- [x] Permettre au candidat de rester connecte sans retaper le code a chaque action
- [x] Creer la deconnexion
- [x] Proteger les pages admin
- [x] Proteger les pages candidat

## Phase 3 - Seed des administrateurs
- [x] Creer `prisma/seed.ts`
- [x] Creer un admin principal au demarrage
  - [x] fullname par defaut
  - [x] code admin a 14 chiffres
  - [x] role `ADMIN`
- [x] Permettre plusieurs admins dans le seed si necessaire
- [x] Utiliser `upsert` pour eviter les doublons
- [x] Documenter les codes admin initiaux
- [x] Ajouter une commande `prisma db seed`

## Phase 4 - Import et gestion des candidats
- [x] Creer une page admin de gestion des candidats
- [x] Ajouter un candidat manuellement
  - [x] fullname
  - [x] code a 14 chiffres
  - [x] role
- [x] Importer des candidats depuis un fichier JSON
- [x] Definir le format JSON attendu
  - [x] `fullname`
  - [x] `code`
  - [x] `role`
- [x] Valider les doublons de code
- [x] Valider les codes invalides
- [x] Afficher un rapport d'import
  - [x] candidats crees
  - [x] candidats ignores
  - [x] erreurs
- [x] Permettre de desactiver un candidat
- [x] Permettre de modifier un fullname
- [x] Permettre de rechercher un candidat

## Phase 5 - Stockage des questions en JSON
- [x] Creer le dossier `data/questions`
- [x] Creer les 4 fichiers JSON principaux
  - [x] `data/questions/maths.json`
  - [x] `data/questions/francais.json`
  - [x] `data/questions/anglais.json`
  - [x] `data/questions/culture-generale.json`
- [x] Creer le dossier `data/passages`
- [x] Creer les fichiers de textes
  - [x] `data/passages/francais.json`
  - [x] `data/passages/anglais.json`
- [x] Definir le schema d'une question JSON
  - [x] id unique
  - [x] subject
  - [x] topic
  - [x] subtopic
  - [x] difficulty
  - [x] statement
  - [x] options
  - [x] answerIndex
  - [x] explanation obligatoire
  - [x] optionExplanations
  - [x] passageId optionnel
  - [x] scope RDC/international pour culture generale
- [x] Definir les difficultes
  - [x] EASY
  - [x] MEDIUM
  - [x] HARD
- [x] Definir les rubriques
  - [x] MATH
  - [x] FRENCH
  - [x] ENGLISH
  - [x] GENERAL_CULTURE
- [x] Definir la portee culture generale
  - [x] DRC
  - [x] INTERNATIONAL

## Phase 6 - Validateur des questions JSON
- [x] Creer un validateur de banque de questions
- [x] Verifier que chaque question a un id unique
- [x] Verifier que chaque question a exactement 4 options
- [x] Verifier que `answerIndex` est valide
- [x] Verifier que `explanation` est obligatoire et non vide
- [x] Verifier que `optionExplanations`, si present, contient 4 elements
- [x] Verifier que les questions de francais/anglais liees a un texte ont un `passageId` valide
- [x] Verifier que chaque passage existe
- [x] Verifier que les questions de culture generale peuvent avoir un `scope`
- [x] Verifier que les questions RDC sont bien marquees `DRC`
- [x] Afficher les erreurs de validation aux admins
- [x] Bloquer la creation d'une salle si la banque est insuffisante

## Phase 7 - Textes en francais et en anglais
- [x] Creer le schema JSON d'un texte
  - [x] id
  - [x] title
  - [x] language
  - [x] content
  - [x] source optionnelle
- [x] Ajouter des textes francais
- [x] Ajouter des textes anglais
- [x] Permettre aux questions d'etre liees a un texte
- [x] Lors de l'examen, afficher le texte avant ses questions
- [x] Permettre a l'admin de choisir le nombre de questions sur texte en francais
- [x] Permettre a l'admin de choisir le nombre de questions sur texte en anglais
- [x] Verifier que le nombre demande de questions sur texte est disponible

## Phase 8 - Creation d'une epreuve ou salle par admin
- [x] Creer une page admin `Creer une salle`
- [x] Saisir le titre de la salle
- [x] Choisir la duree
  - [x] 100 minutes par defaut
- [x] Choisir le nombre total de questions
  - [x] 100 par defaut
- [x] Choisir la repartition par rubrique
  - [x] 25 maths
  - [x] 25 francais
  - [x] 25 anglais
  - [x] 25 culture generale
- [x] Choisir la visibilite
  - [x] Publique
  - [x] Privee
- [x] Si salle privee, generer ou saisir un code d'acces
- [x] Choisir le mode de temps
  - [x] Absolu
  - [x] Relatif
- [x] Choisir la programmation
  - [x] Date precise
  - [x] Heure precise
  - [x] Fuseau horaire
- [x] Ajouter un bouton admin `Commencer maintenant`
- [x] Si `Commencer maintenant`, demarrer la salle immediatement
- [x] Si salle programmee, la salle devient accessible a l'heure prevue
- [x] Permettre d'annuler une salle programmee
- [x] Permettre de modifier une salle tant qu'elle n'a pas commence

## Phase 9 - Repartition des difficultes
- [x] Ajouter les regles de difficulte par rubrique
- [x] Valeurs par defaut pour chaque rubrique
  - [x] 50% faciles
  - [x] 25% moyennes
  - [x] 25% difficiles
- [x] Permettre a l'admin de modifier les pourcentages
- [x] Verifier que la somme fait 100%
- [x] Convertir les pourcentages en nombre de questions
- [x] Gerer les arrondis pour 25 questions
  - [x] 13 faciles
  - [x] 6 moyennes
  - [x] 6 difficiles
- [x] Verifier que la banque JSON contient assez de questions
- [x] Afficher les insuffisances avant creation

## Phase 10 - Regles speciales par rubrique
- [x] Francais
  - [x] choisir le nombre de questions sur texte
  - [x] choisir le nombre de textes
  - [x] verifier que les questions liees aux textes existent
- [x] Anglais
  - [x] choisir le nombre de questions sur texte
  - [x] choisir le nombre de textes
  - [x] verifier que les questions liees aux textes existent
- [x] Culture generale
  - [x] choisir le nombre de questions nationales RDC
  - [x] choisir le nombre de questions internationales
  - [x] verifier que les questions RDC existent
- [x] Mathematiques
  - [x] verifier que chaque question a une explication de methode
  - [x] verifier que les calculs expliques sont suffisants

## Phase 11 - Generation des questions d'une salle
- [x] Charger les questions depuis les 4 fichiers JSON
- [x] Filtrer par rubrique
- [x] Filtrer par difficulte
- [x] Filtrer par questions sur texte si requis
- [x] Filtrer par portee RDC pour culture generale
- [x] Selectionner exactement le nombre demande
- [x] Melanger les questions dans chaque rubrique si souhaite
- [x] Conserver les rubriques distinctes
- [x] Stocker dans Prisma uniquement les IDs selectionnes
- [x] Stocker la configuration de generation dans la salle
- [x] Empêcher la modification des questions apres demarrage

## Phase 12 - Mode entrainement personnel
- [x] Permettre a un candidat de lancer un entrainement personnel
- [x] Choisir les rubriques a inclure
- [x] Choisir la duree
- [x] Choisir la difficulte
- [x] Generer les questions depuis JSON
- [x] Afficher toutes les questions des le debut
- [x] Sauvegarder les reponses
- [x] Corriger avec explications
- [x] Enregistrer les stats dans l'historique personnel

## Phase 13 - Page salles
- [x] Creer la page `/rooms`
- [x] Afficher les salles en cours
- [x] Afficher les salles programmees
- [x] Afficher les salles precedentes
- [x] Afficher les salles publiques
- [x] Afficher les salles privees accessibles
- [x] Permettre d'entrer un code d'acces pour une salle privee
- [x] Afficher le statut de chaque salle
- [x] Afficher les minutes restantes pour une salle en cours
- [x] Afficher la date et l'heure de demarrage pour une salle programmee
- [x] Afficher le nombre de participants
- [x] Afficher un bouton `Entrer`
- [x] Afficher un bouton `Voir classement` pour une salle terminee
- [x] Afficher un bouton `Voir stats` pour une salle terminee

## Phase 14 - Acces aux salles privees
- [x] Ajouter `accessCode` sur les salles privees
- [x] Verifier le code d'acces avant entree
- [x] Memoriser que l'utilisateur a obtenu l'acces a la salle
- [x] Permettre a l'admin de regenerer un code d'acces tant que la salle n'a pas commence
- [x] Masquer les details sensibles d'une salle privee non autorisee
- [x] Permettre a l'admin de voir toutes les salles

## Phase 15 - Salle d'examen
- [x] Creer l'interface d'examen
- [x] Afficher les 100 questions des les premieres secondes
- [x] Ne pas forcer le defilement question par question
- [x] Distinguer clairement les rubriques
  - [x] Mathematiques
  - [x] Francais
  - [x] Anglais
  - [x] Culture generale
- [x] Afficher les textes francais/anglais avant les questions liees
- [x] Permettre de repondre dans n'importe quel ordre
- [x] Permettre de modifier une reponse avant soumission
- [x] Permettre de marquer une question a revoir
- [x] Afficher le nombre de questions repondues par rubrique
- [x] Afficher le temps restant
- [x] Afficher un bouton `Soumettre`
- [x] Demander confirmation avant soumission manuelle
- [x] Soumettre automatiquement a la fin du temps

## Phase 16 - Gestion du temps
- [x] Calculer le temps cote serveur
- [x] Ne pas faire confiance uniquement au navigateur
- [x] Temps absolu
  - [x] une heure de debut commune
  - [x] une heure de fin commune
  - [x] reprise possible apres deconnexion si temps restant
- [x] Temps relatif
  - [x] duree propre a chaque tentative
  - [x] soumission automatique si deconnexion selon la regle choisie
- [x] Salle programmee
  - [x] afficher `Commence dans X minutes`
  - [x] demarrer automatiquement a l'heure prevue ou via action serveur
- [x] Commencer maintenant
  - [x] demarrer immediatement
  - [x] fixer `startsAt`
  - [x] fixer `endsAt` si temps absolu

## Phase 17 - Sauvegarde des reponses
- [x] Creer le modele `Attempt`
- [x] Creer le modele `Answer`
- [x] Sauvegarder chaque reponse
- [x] Sauvegarder les questions marquees a revoir
- [x] Restaurer les reponses apres rafraichissement
- [x] Restaurer la tentative si la salle absolue est toujours en cours
- [x] Verifier qu'une tentative soumise ne peut plus etre modifiee

## Phase 18 - Correction detaillee
- [x] Calculer le score global
- [x] Calculer le pourcentage global
- [x] Calculer le score par rubrique
- [x] Corriger chaque question
- [x] Afficher la bonne reponse
- [x] Afficher l'explication obligatoire
- [x] Afficher les explications des options si disponibles
- [x] Pour les maths, afficher la methode de resolution
- [x] Pour les textes, expliquer la preuve dans le texte
- [x] Pour la culture generale, expliquer le fait ou le contexte
- [x] Afficher les questions non repondues

## Phase 19 - Classement collectif
- [x] Generer le classement d'une salle terminee
- [x] Trier du plus haut pourcentage au plus faible
- [x] Departager les egalites par temps de soumission
- [x] Puis departager par ordre alphabetique si necessaire
- [x] Afficher fullname
- [x] Afficher pourcentage
- [x] Afficher score sur 100
- [x] Afficher score par rubrique
- [x] Afficher statut de soumission
- [x] Permettre a l'admin de partager le classement WhatsApp
- [x] Generer un message WhatsApp propre et lisible

## Phase 20 - Statistiques d'une ancienne salle
- [x] Afficher les stats globales de la salle
  - [x] nombre de participants
  - [x] moyenne
  - [x] meilleur score
  - [x] score le plus faible
  - [x] ecart-type
  - [x] taux de soumission
- [x] Afficher les stats par rubrique
  - [x] moyenne maths
  - [x] moyenne francais
  - [x] moyenne anglais
  - [x] moyenne culture generale
- [x] Afficher les questions les plus ratees
- [x] Afficher le nombre d'echecs par question
- [x] Afficher le taux d'echec par question
- [x] Afficher les questions les mieux reussies
- [x] Afficher les themes les plus faibles
- [x] Afficher les themes les plus forts
- [x] Permettre de consulter les questions et corrections de la salle

## Phase 21 - Dashboard candidat
- [x] Afficher fullname
- [x] Afficher role
- [x] Afficher dernier score
- [x] Afficher moyenne generale
- [x] Afficher meilleur score
- [x] Afficher nombre de tentatives
- [x] Afficher historique personnel
- [x] Afficher historique collectif
- [x] Afficher moyenne par rubrique
- [x] Afficher ecart-type personnel
- [x] Afficher temps moyen par question
- [x] Afficher points forts
- [x] Afficher points faibles
- [x] Afficher recommandations
- [x] Afficher salles disponibles

## Phase 22 - Profils utilisateurs
- [x] Creer une page profil utilisateur
- [x] Permettre a chacun de voir son propre profil
- [x] Permettre de visiter le profil statistique d'un autre candidat si autorise
- [x] Permettre a l'admin de voir tous les profils
- [x] Afficher les stats publiques
- [x] Masquer les donnees sensibles
- [x] Ne jamais afficher le code a 14 chiffres publiquement
- [x] Afficher l'historique des salles participees
- [x] Afficher les forces/faiblesses du candidat

## Phase 23 - Dashboard admin
- [x] Afficher les salles en cours
- [x] Afficher les salles programmees
- [x] Afficher les salles terminees
- [x] Afficher les candidats inscrits
- [x] Afficher les admins
- [x] Afficher les erreurs de banque JSON
- [x] Creer une salle
- [x] Programmer une salle
- [x] Commencer une salle maintenant
- [x] Fermer une salle
- [x] Voir les classements
- [x] Voir les statistiques de salle
- [x] Importer les candidats
- [x] Valider les questions JSON

## Phase 24 - Partage WhatsApp
- [x] Creer un generateur de texte de classement
- [x] Inclure titre de la salle
- [x] Inclure date
- [x] Inclure duree
- [x] Inclure nombre de participants
- [x] Inclure classement par pourcentage
- [x] Inclure fullname
- [x] Inclure score
- [x] Inclure pourcentage
- [x] Generer un lien `https://wa.me/?text=...`
- [x] Tester sur mobile

## Phase 25 - Securite et anti-triche
- [x] Calculer le temps restant cote serveur
- [x] Bloquer les modifications apres soumission
- [x] Bloquer l'acces aux corrections avant la fin
- [x] Proteger les salles privees
- [x] Journaliser les soumissions automatiques
- [x] Journaliser les deconnexions si necessaire
- [x] Eviter d'exposer les bonnes reponses pendant l'examen
- [x] Eviter d'exposer les codes utilisateurs dans les profils publics

## Phase 26 - Tests
- [x] Tester la connexion par code
- [x] Tester l'import candidats JSON
- [x] Tester le seed admin
- [x] Tester la validation des questions JSON
- [x] Tester la generation d'une salle
- [x] Tester une salle publique
- [x] Tester une salle privee avec code
- [x] Tester une salle programmee
- [x] Tester `Commencer maintenant`
- [x] Tester le temps absolu
- [x] Tester le temps relatif
- [x] Tester la soumission automatique
- [x] Tester la correction detaillee
- [x] Tester le classement
- [x] Tester le partage WhatsApp
- [x] Tester les stats d'ancienne salle
- [x] Tester les profils

## Phase 27 - MVP minimum livrable
- [x] Connexion par code a 14 chiffres
- [x] Seed admin
- [x] Import candidats JSON
- [x] Questions en 4 fichiers JSON
- [x] Validateur JSON
- [x] Creation de salle publique/privee
- [x] Programmation d'une salle
- [x] Bouton `Commencer maintenant`
- [x] Salle d'examen avec 100 questions visibles
- [x] Sauvegarde des reponses
- [x] Soumission automatique
- [x] Correction detaillee
- [x] Classement
- [x] Anciennes salles consultables
- [x] Stats de salle
- [x] Dashboard candidat
- [x] Profils consultables
