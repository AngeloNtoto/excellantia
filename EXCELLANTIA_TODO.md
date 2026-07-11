# TODO detaillee - Plateforme de simulation Excellantia

Objectif : construire une plateforme qui simule les conditions d'une epreuve Excellantia en RDC, avec entrainement personnel, salles collectives publiques/privees, questions stockees en JSON, statistiques avancees et classements partageables.

## Phase 0 - Cadrage produit
- [ ] Valider le nom de la plateforme
- [ ] Valider les 4 rubriques officielles
  - [ ] Mathematiques
  - [ ] Francais
  - [ ] Anglais
  - [ ] Culture generale
- [ ] Valider le format standard d'une epreuve
  - [ ] 100 questions
  - [ ] 25 questions par rubrique
  - [ ] 100 minutes
  - [ ] toutes les questions visibles des le debut
- [ ] Valider les statuts d'une salle
  - [ ] En attente
  - [ ] Programmee
  - [ ] En cours
  - [ ] Terminee
  - [ ] Annulee
- [ ] Valider les types de salles
  - [ ] Publique
  - [ ] Privee avec code d'acces
- [ ] Valider les modes de temps
  - [ ] Temps absolu uniforme pour tous
  - [ ] Temps relatif propre a chaque candidat

## Phase 1 - Base technique
- [ ] Initialiser le projet applicatif
- [ ] Installer et configurer Prisma
- [ ] Choisir la base de donnees
- [ ] Creer le schema Prisma initial
- [ ] Configurer les variables d'environnement
- [ ] Ajouter les scripts de migration Prisma
- [ ] Ajouter un script de seed
- [ ] Ajouter les validations cote serveur
- [ ] Ajouter les tests de base

## Phase 2 - Utilisateurs et authentification par code
- [ ] Creer le modele `User`
  - [ ] `fullname`
  - [ ] `code` unique a 14 chiffres
  - [ ] `role`
  - [ ] dates de creation et mise a jour
- [ ] Creer les roles
  - [ ] `ADMIN`
  - [ ] `CANDIDATE`
- [ ] Creer une page de connexion par code a 14 chiffres
- [ ] Verifier que le code contient exactement 14 chiffres
- [ ] Refuser l'acces si le code n'existe pas
- [ ] Ouvrir une session utilisateur apres connexion
- [ ] Permettre au candidat de rester connecte sans retaper le code a chaque action
- [ ] Creer la deconnexion
- [ ] Proteger les pages admin
- [ ] Proteger les pages candidat

## Phase 3 - Seed des administrateurs
- [ ] Creer `prisma/seed.ts`
- [ ] Creer un admin principal au demarrage
  - [ ] fullname par defaut
  - [ ] code admin a 14 chiffres
  - [ ] role `ADMIN`
- [ ] Permettre plusieurs admins dans le seed si necessaire
- [ ] Utiliser `upsert` pour eviter les doublons
- [ ] Documenter les codes admin initiaux
- [ ] Ajouter une commande `prisma db seed`

## Phase 4 - Import et gestion des candidats
- [ ] Creer une page admin de gestion des candidats
- [ ] Ajouter un candidat manuellement
  - [ ] fullname
  - [ ] code a 14 chiffres
  - [ ] role
- [ ] Importer des candidats depuis un fichier JSON
- [ ] Definir le format JSON attendu
  - [ ] `fullname`
  - [ ] `code`
  - [ ] `role`
- [ ] Valider les doublons de code
- [ ] Valider les codes invalides
- [ ] Afficher un rapport d'import
  - [ ] candidats crees
  - [ ] candidats ignores
  - [ ] erreurs
- [ ] Permettre de desactiver un candidat
- [ ] Permettre de modifier un fullname
- [ ] Permettre de rechercher un candidat

## Phase 5 - Stockage des questions en JSON
- [ ] Creer le dossier `data/questions`
- [ ] Creer les 4 fichiers JSON principaux
  - [ ] `data/questions/maths.json`
  - [ ] `data/questions/francais.json`
  - [ ] `data/questions/anglais.json`
  - [ ] `data/questions/culture-generale.json`
- [ ] Creer le dossier `data/passages`
- [ ] Creer les fichiers de textes
  - [ ] `data/passages/francais.json`
  - [ ] `data/passages/anglais.json`
- [ ] Definir le schema d'une question JSON
  - [ ] id unique
  - [ ] subject
  - [ ] topic
  - [ ] subtopic
  - [ ] difficulty
  - [ ] statement
  - [ ] options
  - [ ] answerIndex
  - [ ] explanation obligatoire
  - [ ] optionExplanations
  - [ ] passageId optionnel
  - [ ] scope RDC/international pour culture generale
- [ ] Definir les difficultes
  - [ ] EASY
  - [ ] MEDIUM
  - [ ] HARD
- [ ] Definir les rubriques
  - [ ] MATH
  - [ ] FRENCH
  - [ ] ENGLISH
  - [ ] GENERAL_CULTURE
- [ ] Definir la portee culture generale
  - [ ] DRC
  - [ ] INTERNATIONAL

## Phase 6 - Validateur des questions JSON
- [ ] Creer un validateur de banque de questions
- [ ] Verifier que chaque question a un id unique
- [ ] Verifier que chaque question a exactement 4 options
- [ ] Verifier que `answerIndex` est valide
- [ ] Verifier que `explanation` est obligatoire et non vide
- [ ] Verifier que `optionExplanations`, si present, contient 4 elements
- [ ] Verifier que les questions de francais/anglais liees a un texte ont un `passageId` valide
- [ ] Verifier que chaque passage existe
- [ ] Verifier que les questions de culture generale peuvent avoir un `scope`
- [ ] Verifier que les questions RDC sont bien marquees `DRC`
- [ ] Afficher les erreurs de validation aux admins
- [ ] Bloquer la creation d'une salle si la banque est insuffisante

## Phase 7 - Textes en francais et en anglais
- [ ] Creer le schema JSON d'un texte
  - [ ] id
  - [ ] title
  - [ ] language
  - [ ] content
  - [ ] source optionnelle
- [ ] Ajouter des textes francais
- [ ] Ajouter des textes anglais
- [ ] Permettre aux questions d'etre liees a un texte
- [ ] Lors de l'examen, afficher le texte avant ses questions
- [ ] Permettre a l'admin de choisir le nombre de questions sur texte en francais
- [ ] Permettre a l'admin de choisir le nombre de questions sur texte en anglais
- [ ] Verifier que le nombre demande de questions sur texte est disponible

## Phase 8 - Creation d'une epreuve ou salle par admin
- [ ] Creer une page admin `Creer une salle`
- [ ] Saisir le titre de la salle
- [ ] Choisir la duree
  - [ ] 100 minutes par defaut
- [ ] Choisir le nombre total de questions
  - [ ] 100 par defaut
- [ ] Choisir la repartition par rubrique
  - [ ] 25 maths
  - [ ] 25 francais
  - [ ] 25 anglais
  - [ ] 25 culture generale
- [ ] Choisir la visibilite
  - [ ] Publique
  - [ ] Privee
- [ ] Si salle privee, generer ou saisir un code d'acces
- [ ] Choisir le mode de temps
  - [ ] Absolu
  - [ ] Relatif
- [ ] Choisir la programmation
  - [ ] Date precise
  - [ ] Heure precise
  - [ ] Fuseau horaire
- [ ] Ajouter un bouton admin `Commencer maintenant`
- [ ] Si `Commencer maintenant`, demarrer la salle immediatement
- [ ] Si salle programmee, la salle devient accessible a l'heure prevue
- [ ] Permettre d'annuler une salle programmee
- [ ] Permettre de modifier une salle tant qu'elle n'a pas commence

## Phase 9 - Repartition des difficultes
- [ ] Ajouter les regles de difficulte par rubrique
- [ ] Valeurs par defaut pour chaque rubrique
  - [ ] 50% faciles
  - [ ] 25% moyennes
  - [ ] 25% difficiles
- [ ] Permettre a l'admin de modifier les pourcentages
- [ ] Verifier que la somme fait 100%
- [ ] Convertir les pourcentages en nombre de questions
- [ ] Gerer les arrondis pour 25 questions
  - [ ] 13 faciles
  - [ ] 6 moyennes
  - [ ] 6 difficiles
- [ ] Verifier que la banque JSON contient assez de questions
- [ ] Afficher les insuffisances avant creation

## Phase 10 - Regles speciales par rubrique
- [ ] Francais
  - [ ] choisir le nombre de questions sur texte
  - [ ] choisir le nombre de textes
  - [ ] verifier que les questions liees aux textes existent
- [ ] Anglais
  - [ ] choisir le nombre de questions sur texte
  - [ ] choisir le nombre de textes
  - [ ] verifier que les questions liees aux textes existent
- [ ] Culture generale
  - [ ] choisir le nombre de questions nationales RDC
  - [ ] choisir le nombre de questions internationales
  - [ ] verifier que les questions RDC existent
- [ ] Mathematiques
  - [ ] verifier que chaque question a une explication de methode
  - [ ] verifier que les calculs expliques sont suffisants

## Phase 11 - Generation des questions d'une salle
- [ ] Charger les questions depuis les 4 fichiers JSON
- [ ] Filtrer par rubrique
- [ ] Filtrer par difficulte
- [ ] Filtrer par questions sur texte si requis
- [ ] Filtrer par portee RDC pour culture generale
- [ ] Selectionner exactement le nombre demande
- [ ] Melanger les questions dans chaque rubrique si souhaite
- [ ] Conserver les rubriques distinctes
- [ ] Stocker dans Prisma uniquement les IDs selectionnes
- [ ] Stocker la configuration de generation dans la salle
- [ ] Empêcher la modification des questions apres demarrage

## Phase 12 - Mode entrainement personnel
- [ ] Permettre a un candidat de lancer un entrainement personnel
- [ ] Choisir les rubriques a inclure
- [ ] Choisir la duree
- [ ] Choisir la difficulte
- [ ] Generer les questions depuis JSON
- [ ] Afficher toutes les questions des le debut
- [ ] Sauvegarder les reponses
- [ ] Corriger avec explications
- [ ] Enregistrer les stats dans l'historique personnel

## Phase 13 - Page salles
- [ ] Creer la page `/rooms`
- [ ] Afficher les salles en cours
- [ ] Afficher les salles programmees
- [ ] Afficher les salles precedentes
- [ ] Afficher les salles publiques
- [ ] Afficher les salles privees accessibles
- [ ] Permettre d'entrer un code d'acces pour une salle privee
- [ ] Afficher le statut de chaque salle
- [ ] Afficher les minutes restantes pour une salle en cours
- [ ] Afficher la date et l'heure de demarrage pour une salle programmee
- [ ] Afficher le nombre de participants
- [ ] Afficher un bouton `Entrer`
- [ ] Afficher un bouton `Voir classement` pour une salle terminee
- [ ] Afficher un bouton `Voir stats` pour une salle terminee

## Phase 14 - Acces aux salles privees
- [ ] Ajouter `accessCode` sur les salles privees
- [ ] Verifier le code d'acces avant entree
- [ ] Memoriser que l'utilisateur a obtenu l'acces a la salle
- [ ] Permettre a l'admin de regenerer un code d'acces tant que la salle n'a pas commence
- [ ] Masquer les details sensibles d'une salle privee non autorisee
- [ ] Permettre a l'admin de voir toutes les salles

## Phase 15 - Salle d'examen
- [ ] Creer l'interface d'examen
- [ ] Afficher les 100 questions des les premieres secondes
- [ ] Ne pas forcer le defilement question par question
- [ ] Distinguer clairement les rubriques
  - [ ] Mathematiques
  - [ ] Francais
  - [ ] Anglais
  - [ ] Culture generale
- [ ] Afficher les textes francais/anglais avant les questions liees
- [ ] Permettre de repondre dans n'importe quel ordre
- [ ] Permettre de modifier une reponse avant soumission
- [ ] Permettre de marquer une question a revoir
- [ ] Afficher le nombre de questions repondues par rubrique
- [ ] Afficher le temps restant
- [ ] Afficher un bouton `Soumettre`
- [ ] Demander confirmation avant soumission manuelle
- [ ] Soumettre automatiquement a la fin du temps

## Phase 16 - Gestion du temps
- [ ] Calculer le temps cote serveur
- [ ] Ne pas faire confiance uniquement au navigateur
- [ ] Temps absolu
  - [ ] une heure de debut commune
  - [ ] une heure de fin commune
  - [ ] reprise possible apres deconnexion si temps restant
- [ ] Temps relatif
  - [ ] duree propre a chaque tentative
  - [ ] soumission automatique si deconnexion selon la regle choisie
- [ ] Salle programmee
  - [ ] afficher `Commence dans X minutes`
  - [ ] demarrer automatiquement a l'heure prevue ou via action serveur
- [ ] Commencer maintenant
  - [ ] demarrer immediatement
  - [ ] fixer `startsAt`
  - [ ] fixer `endsAt` si temps absolu

## Phase 17 - Sauvegarde des reponses
- [ ] Creer le modele `Attempt`
- [ ] Creer le modele `Answer`
- [ ] Sauvegarder chaque reponse
- [ ] Sauvegarder les questions marquees a revoir
- [ ] Restaurer les reponses apres rafraichissement
- [ ] Restaurer la tentative si la salle absolue est toujours en cours
- [ ] Verifier qu'une tentative soumise ne peut plus etre modifiee

## Phase 18 - Correction detaillee
- [ ] Calculer le score global
- [ ] Calculer le pourcentage global
- [ ] Calculer le score par rubrique
- [ ] Corriger chaque question
- [ ] Afficher la bonne reponse
- [ ] Afficher l'explication obligatoire
- [ ] Afficher les explications des options si disponibles
- [ ] Pour les maths, afficher la methode de resolution
- [ ] Pour les textes, expliquer la preuve dans le texte
- [ ] Pour la culture generale, expliquer le fait ou le contexte
- [ ] Afficher les questions non repondues

## Phase 19 - Classement collectif
- [ ] Generer le classement d'une salle terminee
- [ ] Trier du plus haut pourcentage au plus faible
- [ ] Departager les egalites par temps de soumission
- [ ] Puis departager par ordre alphabetique si necessaire
- [ ] Afficher fullname
- [ ] Afficher pourcentage
- [ ] Afficher score sur 100
- [ ] Afficher score par rubrique
- [ ] Afficher statut de soumission
- [ ] Permettre a l'admin de partager le classement WhatsApp
- [ ] Generer un message WhatsApp propre et lisible

## Phase 20 - Statistiques d'une ancienne salle
- [ ] Afficher les stats globales de la salle
  - [ ] nombre de participants
  - [ ] moyenne
  - [ ] meilleur score
  - [ ] score le plus faible
  - [ ] ecart-type
  - [ ] taux de soumission
- [ ] Afficher les stats par rubrique
  - [ ] moyenne maths
  - [ ] moyenne francais
  - [ ] moyenne anglais
  - [ ] moyenne culture generale
- [ ] Afficher les questions les plus ratees
- [ ] Afficher le nombre d'echecs par question
- [ ] Afficher le taux d'echec par question
- [ ] Afficher les questions les mieux reussies
- [ ] Afficher les themes les plus faibles
- [ ] Afficher les themes les plus forts
- [ ] Permettre de consulter les questions et corrections de la salle

## Phase 21 - Dashboard candidat
- [ ] Afficher fullname
- [ ] Afficher role
- [ ] Afficher dernier score
- [ ] Afficher moyenne generale
- [ ] Afficher meilleur score
- [ ] Afficher nombre de tentatives
- [ ] Afficher historique personnel
- [ ] Afficher historique collectif
- [ ] Afficher moyenne par rubrique
- [ ] Afficher ecart-type personnel
- [ ] Afficher temps moyen par question
- [ ] Afficher points forts
- [ ] Afficher points faibles
- [ ] Afficher recommandations
- [ ] Afficher salles disponibles

## Phase 22 - Profils utilisateurs
- [ ] Creer une page profil utilisateur
- [ ] Permettre a chacun de voir son propre profil
- [ ] Permettre de visiter le profil statistique d'un autre candidat si autorise
- [ ] Permettre a l'admin de voir tous les profils
- [ ] Afficher les stats publiques
- [ ] Masquer les donnees sensibles
- [ ] Ne jamais afficher le code a 14 chiffres publiquement
- [ ] Afficher l'historique des salles participees
- [ ] Afficher les forces/faiblesses du candidat

## Phase 23 - Dashboard admin
- [ ] Afficher les salles en cours
- [ ] Afficher les salles programmees
- [ ] Afficher les salles terminees
- [ ] Afficher les candidats inscrits
- [ ] Afficher les admins
- [ ] Afficher les erreurs de banque JSON
- [ ] Creer une salle
- [ ] Programmer une salle
- [ ] Commencer une salle maintenant
- [ ] Fermer une salle
- [ ] Voir les classements
- [ ] Voir les statistiques de salle
- [ ] Importer les candidats
- [ ] Valider les questions JSON

## Phase 24 - Partage WhatsApp
- [ ] Creer un generateur de texte de classement
- [ ] Inclure titre de la salle
- [ ] Inclure date
- [ ] Inclure duree
- [ ] Inclure nombre de participants
- [ ] Inclure classement par pourcentage
- [ ] Inclure fullname
- [ ] Inclure score
- [ ] Inclure pourcentage
- [ ] Generer un lien `https://wa.me/?text=...`
- [ ] Tester sur mobile

## Phase 25 - Securite et anti-triche
- [ ] Calculer le temps restant cote serveur
- [ ] Bloquer les modifications apres soumission
- [ ] Bloquer l'acces aux corrections avant la fin
- [ ] Proteger les salles privees
- [ ] Journaliser les soumissions automatiques
- [ ] Journaliser les deconnexions si necessaire
- [ ] Eviter d'exposer les bonnes reponses pendant l'examen
- [ ] Eviter d'exposer les codes utilisateurs dans les profils publics

## Phase 26 - Tests
- [ ] Tester la connexion par code
- [ ] Tester l'import candidats JSON
- [ ] Tester le seed admin
- [ ] Tester la validation des questions JSON
- [ ] Tester la generation d'une salle
- [ ] Tester une salle publique
- [ ] Tester une salle privee avec code
- [ ] Tester une salle programmee
- [ ] Tester `Commencer maintenant`
- [ ] Tester le temps absolu
- [ ] Tester le temps relatif
- [ ] Tester la soumission automatique
- [ ] Tester la correction detaillee
- [ ] Tester le classement
- [ ] Tester le partage WhatsApp
- [ ] Tester les stats d'ancienne salle
- [ ] Tester les profils

## Phase 27 - MVP minimum livrable
- [ ] Connexion par code a 14 chiffres
- [ ] Seed admin
- [ ] Import candidats JSON
- [ ] Questions en 4 fichiers JSON
- [ ] Validateur JSON
- [ ] Creation de salle publique/privee
- [ ] Programmation d'une salle
- [ ] Bouton `Commencer maintenant`
- [ ] Salle d'examen avec 100 questions visibles
- [ ] Sauvegarde des reponses
- [ ] Soumission automatique
- [ ] Correction detaillee
- [ ] Classement
- [ ] Anciennes salles consultables
- [ ] Stats de salle
- [ ] Dashboard candidat
- [ ] Profils consultables
