/**
 * Constantes et types partagés pour le système de paramètres d'accès.
 * Ce fichier ne contient PAS de "use server" — il est importable côté client et serveur.
 */

export interface TrainingAccessConfig {
  enabled: boolean;
  message: string;
  reason?: string;
  updatedAt?: string;
}

/** Message par défaut si aucun paramètre n'est enregistré en base */
export const DEFAULT_TRAINING_MESSAGE =
  "La création d'entraînements individuels est temporairement suspendue par l'administration.";

/** Modèles de messages prédéfinis proposés à l'admin */
export const DEFAULT_TRAINING_LOCK_PRESETS = [
  {
    id: "SIMULATION_LIVE",
    title: "Simulation collective en cours",
    description: "Concentrer tous les candidats sur l'épreuve officielle",
    message:
      "Une session de simulation collective officielle est actuellement en ligne. La création d'entraînements individuels est temporairement suspendue afin de mobiliser l'attention et les ressources sur l'épreuve.",
  },
  {
    id: "MAINTENANCE",
    title: "Maintenance technique",
    description: "Mise à jour de la base pédagogique ou du serveur",
    message:
      "La création d'entraînements est momentanément indisponible en raison d'une maintenance technique et d'une mise à jour de la banque de questions. Veuillez réessayer dans quelques instants.",
  },
  {
    id: "PREPARATION",
    title: "Préparation des épreuves",
    description: "Restrictions administratives préalables",
    message:
      "L'accès aux entraînements libres est temporairement restreint par l'administration dans le cadre de la préparation des prochaines sessions d'évaluation.",
  },
];
