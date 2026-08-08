# TODO — Transformation : Laboratoire Interactif d'Ingénierie & Robotique

> **Statut : EN ATTENTE D'APPROBATION**
> Objectif : transformer la plateforme de mathématiques en la meilleure plateforme mondiale pour apprendre les mathématiques, la mécanique et la physique nécessaires à la robotique.
> Philosophie : *Manipuler → Observer → Découvrir → Formaliser → Appliquer au robot*. Jamais de théorie gratuite.

---

## Légende

- Difficulté : 🟢 facile · 🟡 moyen · 🔴 difficile
- Priorité : **P0** (fondation, bloquant) · **P1** (cœur de valeur) · **P2** (enrichissement) · **P3** (ambitieux / plus tard)

---

## PHASE 0 — Fondations techniques (P0)

Objectif : mettre en place l'infrastructure de simulation réutilisable AVANT d'écrire le moindre contenu.

- [ ] **0.1** Installer les dépendances de simulation 🟢
  - `three`, `@react-three/fiber`, `@react-three/drei` → rendu 3D (bras robotiques, drones, scènes)
  - `@react-three/rapier` → physique 3D (gravité, collisions, articulations)
  - `matter-js` → physique 2D légère (leviers, poulies, projectiles) — plus simple que Rapier pour la 2D
  - `leva` → panneaux de contrôle de paramètres (masse, gravité, frottement…) avec un look "labo"
  - `motion` (Framer Motion) → animations UI et transitions pédagogiques
  - Réutiliser l'existant : `d3`, `mathjs`, `zustand`, `katex` (déjà installés)
- [ ] **0.2** Créer le moteur de simulation partagé `lib/simulation/` 🔴
  - `lib/simulation/engine.ts` — boucle temps fixe (fixed timestep + interpolation), play/pause/reset/vitesse
  - `lib/simulation/integrators.ts` — Euler, Euler semi-implicite, RK4 (réutilisable pour ODE, PID, pendules)
  - `lib/simulation/kinematics.ts` — cinématique directe/inverse 2D (FK/IK), Jacobienne
  - `lib/simulation/dynamics.ts` — moments, couples, inertie, centre de gravité, énergie
  - `lib/simulation/controllers.ts` — PID générique, profils trapézoïdaux, filtres (réutilisé partout)
- [ ] **0.3** Créer les hooks réutilisables `hooks/` 🟡
  - `use-simulation-loop.ts` — requestAnimationFrame + timestep fixe
  - `use-draggable.ts` — glisser des points/masses/articulations (souris + tactile)
  - `use-sim-params.ts` — état des paramètres d'une simulation (branché sur Leva ou sliders maison)
- [ ] **0.4** Créer le "kit labo" de composants UI `components/lab/` 🟡
  - `sim-canvas.tsx` — cadre standard de simulation (plein écran, reset, ralenti, aide)
  - `control-panel.tsx` — sliders/boutons stylés "laboratoire"
  - `data-readout.tsx` — affichage temps réel des grandeurs (vitesse, couple, énergie…)
  - `live-graph.tsx` — graphe temps réel défilant (d3) : consigne vs mesure, énergie, position
  - `challenge-card.tsx` — mini-défi avec objectif mesurable ("atteins la cible en < 2 s sans dépassement")
  - `discovery-reveal.tsx` — l'équation ne s'affiche QU'APRÈS la manipulation (progressive disclosure)
- [ ] **0.5** Étendre le pipeline MDX 🟢
  - Enregistrer les nouveaux composants dans `components/mdx/mdx-components.tsx`
  - Nouveau frontmatter : `robots: []` (bras, drone, rover…), `simulations: []`, `difficulty`, `prerequisites`
- [ ] **0.6** Store de progression enrichi `store/` 🟢
  - Suivi des défis réussis, badges, temps passé par simulation (Zustand + Dexie existants)

---

## PHASE 1 — Refonte pédagogique & UX (P0/P1)

- [ ] **1.1** Nouveau modèle de leçon "Expérience" 🟡 — **P0**
  - Structure imposée : *Situation réelle → Manipulation → Observation → Hypothèse → Découverte → Équation → Application robotique → Mini-défi*
  - Template MDX `content/_templates/experience.mdx` documentant le modèle
- [ ] **1.2** Refonte du dashboard en "Atelier" 🟡 — **P1**
  - Page d'accueil orientée robots : "Que veux-tu construire ? Bras robotique / Rover / Drone / Quadrupède"
  - Chaque robot = un parcours qui traverse maths + mécanique + contrôle
  - Carte de progression visuelle par robot (quelles notions débloquées)
- [ ] **1.3** Identité visuelle "laboratoire" 🟡 — **P1**
  - Thème sombre type instrument scientifique (inspiration GeoGebra/PhET/Brilliant, identité propre)
  - Design tokens dans `globals.css`, 3-5 couleurs, typographie technique
- [ ] **1.4** Barre latérale : regrouper les cours par pôle 🟢 — **P1**
  - Pôles : **Mathématiques** / **Mécanique** / **Robotique & Contrôle** / **Signal & Électronique**

---

## PHASE 2 — Nouveau domaine : MÉCANIQUE (P1)

Nouveau cours `content/courses/mecanique/` — chaque chapitre suit le modèle "Expérience" et est lié à un robot réel.

- [ ] **2.1 Chapitre 1 — Statique & équilibre** 🟡
  - Leçons : forces, moments, centre de gravité, équilibre
  - Simulations : balance interactive (glisser des masses), robot qui bascule ou pas (CG déplaçable), bras en équilibre
  - Robots : quadrupède (stabilité), bras robotique (couple de maintien)
- [ ] **2.2 Chapitre 2 — Leviers, poulies & transmissions simples** 🟡
  - Simulations : levier à longueur variable, palan à N poulies, avantage mécanique mesuré en direct
  - Robots : pince robotique, treuil, exosquelette
- [ ] **2.3 Chapitre 3 — Engrenages, courroies & réducteurs** 🔴
  - Simulations : engrenages qu'on fait tourner à la souris (rapport de réduction visible), train d'engrenages constructible, courroie/chaîne, différentiel
  - Robots : réducteur de servomoteur, CNC, voiture (différentiel)
- [ ] **2.4 Chapitre 4 — Cinématique du solide** 🟡
  - Simulations : trajectoires, vitesse/accélération vectorielles, roulement sans glissement, odométrie d'un robot à roues
  - Robots : robot mobile différentiel, roue codeuse
- [ ] **2.5 Chapitre 5 — Dynamique : couple, inertie, frottements** 🔴
  - Simulations : moteur + charge (inertie réglable), démarrage/freinage, frottement sec vs visqueux, chenilles vs roues
  - Robots : bras robotique (dimensionner un moteur), rover en pente
- [ ] **2.6 Chapitre 6 — Énergie, travail, puissance, rendement** 🟡
  - Simulations : chaîne énergétique batterie → moteur → réducteur → roue avec pertes visibles, montée d'une côte
  - Robots : autonomie d'un drone, dimensionnement batterie
- [ ] **2.7 Chapitre 7 — Ressorts, amortisseurs & vibrations** 🔴
  - Simulations : masse-ressort-amortisseur (raideur/amortissement réglables), suspension de rover sur terrain bosselé, résonance
  - Robots : suspension, pattes élastiques de quadrupède, amortissement d'un bras
- [ ] **2.8 Chapitre 8 — Mécanismes & liaisons** 🔴
  - Simulations : constructeur de mécanismes 2D (pivot, glissière, bielle-manivelle, 4 barres), pantographe
  - Robots : jambe de quadrupède (4 barres), pince parallèle
- [ ] **2.9 Chapitre 9 — Résistance des matériaux (initiation)** 🟡 — **P2**
  - Simulations : poutre qui fléchit sous charge (position/intensité réglables), section et matériau
  - Robots : châssis, bras qui plie sous charge
- [ ] **2.10 Chapitre 10 — Actionneurs** 🔴
  - Simulations : moteur DC (couple/vitesse/courant), servomoteur (asservissement visible), moteur pas-à-pas (pas par pas), vérin
  - Robots : tous — choisir le bon actionneur pour chaque usage

---

## PHASE 3 — Simulations phares transverses (P1/P2)

Grandes simulations réutilisées dans plusieurs cours (maths ↔ mécanique ↔ robotique).

- [ ] **3.1 Bras robotique 2D interactif v2** 🔴 — **P1**
  - Upgrade du `robot-arm.tsx` existant : 2-3 articulations, glisser l'effecteur (IK), espace de travail visible, couples affichés, mode "moteurs réels" (limites de couple)
  - Notions : trigonométrie, matrices, Jacobienne, moments
- [ ] **3.2 Simulateur PID v2** 🔴 — **P1**
  - Upgrade du `pid-simulator.tsx` existant : appliqué à des systèmes réels (position d'un bras, altitude d'un drone, vitesse d'un rover), perturbations (vent, charge), défi de réglage chronométré
- [ ] **3.3 Robot mobile / suiveur de ligne programmable** 🔴 — **P1**
  - Éditeur à blocs simples ou sliders (vitesses roues G/D), capteurs simulés, parcours à réussir
  - Notions : cinématique différentielle, boucle de contrôle
- [ ] **3.4 Drone 2D (altitude + assiette)** 🔴 — **P2**
  - Poussée des 2 rotors, vent réglable, stabilisation manuelle puis PID
  - Notions : forces, moments, équations différentielles, contrôle
- [ ] **3.5 Pendule & double pendule** 🟡 — **P2**
  - Énergie visible, chaos du double pendule, lien avec la jambe de robot
- [ ] **3.6 Projectile & balistique** 🟢 — **P2**
  - Lancer de balle (angle/vitesse/gravité/vent), robot lanceur qui doit atteindre une cible
- [ ] **3.7 Bras robotique 3D (react-three-fiber + rapier)** 🔴 — **P2**
  - Scène 3D manipulable, FK/IK 3 axes, visualisation des repères (matrices de rotation en action)
- [ ] **3.8 Filtre de Kalman v2 & fusion de capteurs** 🔴 — **P2**
  - Upgrade du `kalman-demo.tsx` : robot qui se localise avec capteurs bruités, comparaison avec/sans filtre
- [ ] **3.9 Planification de trajectoire & évitement d'obstacles** 🔴 — **P3**
  - Grille interactive, obstacles déplaçables, A*/champs de potentiel visualisés pas à pas
- [ ] **3.10 SLAM simplifié** 🔴 — **P3**
  - Robot qui cartographie une pièce inconnue avec un lidar simulé

---

## PHASE 4 — Rétrofit des cours de maths existants (P1/P2)

Relier chaque cours existant à la robotique, sans tout réécrire.

- [ ] **4.1** Ajouter un encart "Pourquoi en robotique ?" à chaque chapitre existant 🟢 — **P1**
  - Composant MDX `robot-context.tsx` : bras / drone / rover / quadrupède / voiture autonome / CNC / imprimante 3D / satellite / exosquelette
- [ ] **4.2** Algèbre linéaire → rotations d'un bras, changements de repère, transformation caméra 🟡
- [ ] **4.3** Trigonométrie → FK/IK, odométrie, angles d'un servomoteur 🟡
- [ ] **4.4** Analyse (dérivées/intégrales) → vitesse/accélération d'un axe, profils de mouvement CNC 🟡
- [ ] **4.5** Équations différentielles → masse-ressort, moteur DC, réponse d'un drone 🟡
- [ ] **4.6** Fourier → vibrations d'un châssis, filtrage de capteurs 🟡
- [ ] **4.7** Probabilités/Statistiques → bruit de capteurs, incertitude, Kalman 🟡
- [ ] **4.8** Réduire le texte : convertir progressivement les leçons les plus verbeuses au format "Expérience" 🔴 — **P2**

---

## PHASE 5 — Projets fil rouge & gamification (P2/P3)

- [ ] **5.1** Projet "Construis ton bras robotique" 🔴 — **P2**
  - Projet guidé multi-chapitres : choix des longueurs, moteurs, réducteurs, réglage PID → le bras final fonctionne (ou pas !) selon les choix
- [ ] **5.2** Projet "Construis ton rover" 🔴 — **P3**
  - Châssis, roues/chenilles, motorisation, suspension, franchissement d'obstacles
- [ ] **5.3** Système de badges & défis 🟡 — **P2**
  - Badges par compétence, défis chronométrés, "record du labo" local
- [ ] **5.4** Mode "Panne mystère" (idée originale) 🔴 — **P3**
  - Un robot simulé dysfonctionne ; l'élève doit diagnostiquer avec les maths (couple insuffisant ? résonance ? PID instable ?)
- [ ] **5.5** Mode "Ingénieur vs Physique" (idée originale) 🟡 — **P3**
  - L'élève prédit le résultat AVANT de lancer la simulation ; l'écart prédiction/réalité est mesuré et devient le moteur de l'apprentissage

---

## Ordre de développement proposé

| Étape | Contenu | Priorité |
|---|---|---|
| 1 | Phase 0 complète (moteur de simulation + kit labo) | P0 |
| 2 | Phase 1.1 + 1.3 (modèle "Expérience" + identité labo) | P0 |
| 3 | Phase 2 chapitres 1-3 (statique, leviers, engrenages) | P1 |
| 4 | Phase 3.1 + 3.2 (bras v2 + PID v2) | P1 |
| 5 | Phase 1.2 + 1.4 (dashboard Atelier + navigation par pôles) | P1 |
| 6 | Phase 2 chapitres 4-7 | P1 |
| 7 | Phase 4 (rétrofit robotique des maths) | P1/P2 |
| 8 | Phase 3.3 → 3.8 (simulations phares) | P2 |
| 9 | Phase 2 chapitres 8-10 + Phase 5 | P2/P3 |

---

## Choix technologiques (justification)

| Bibliothèque | Usage | Pourquoi |
|---|---|---|
| `matter-js` | Physique 2D | Léger, parfait pour leviers/poulies/projectiles, API simple |
| `@react-three/fiber` + `drei` | 3D | Standard React pour Three.js, écosystème riche |
| `@react-three/rapier` | Physique 3D | Rapier = moteur le plus performant (WASM), articulations robotiques natives |
| `leva` | Panneaux de contrôle | Look "labo scientifique" immédiat, zéro boilerplate |
| `d3` (existant) | Graphes temps réel | Déjà maîtrisé dans le projet |
| `mathjs` (existant) | Calcul symbolique/matriciel | Déjà installé |
| `zustand` (existant) | État des simulations & progression | Déjà installé |
| `motion` | Animations pédagogiques | Révélations progressives, transitions fluides |
| ❌ `cannon-es` | — | Redondant avec Rapier, moins performant |
| ❌ `xstate` | — | Overkill à ce stade ; Zustand suffit |

---

## Ce qui NE change PAS

- Architecture Next.js App Router + MDX + `content/courses/` (totalement respectée)
- Système de progression (Zustand + Dexie)
- Pipeline KaTeX / remark-math
- Les cours existants restent accessibles pendant toute la transformation
