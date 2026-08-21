"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface TrainingAccessConfig {
  enabled: boolean;
  message: string;
  reason?: string;
  updatedAt?: string;
}

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

const DEFAULT_CONFIG: TrainingAccessConfig = {
  enabled: true,
  message:
    "La création d'entraînements individuels est temporairement suspendue par l'administration.",
  reason: "MAINTENANCE",
};

/**
 * Récupère l'état actuel de la permission de créer des entraînements.
 */
export async function getTrainingAccessStatus(): Promise<TrainingAccessConfig> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "TRAINING_ACCESS" },
    });

    if (!setting) return DEFAULT_CONFIG;

    const parsed = JSON.parse(setting.value);
    return {
      enabled: parsed.enabled ?? true,
      message: parsed.message || DEFAULT_CONFIG.message,
      reason: parsed.reason || "CUSTOM",
      updatedAt: setting.updatedAt.toISOString(),
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

/**
 * Met à jour la permission de création d'entraînements (Admin uniquement).
 */
export async function updateTrainingAccessAction(
  enabled: boolean,
  message: string,
  reason = "CUSTOM"
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/");
  }

  const cleanMessage = message.trim() || DEFAULT_CONFIG.message;

  await prisma.systemSetting.upsert({
    where: { key: "TRAINING_ACCESS" },
    create: {
      key: "TRAINING_ACCESS",
      value: JSON.stringify({
        enabled,
        message: cleanMessage,
        reason,
      }),
    },
    update: {
      value: JSON.stringify({
        enabled,
        message: cleanMessage,
        reason,
      }),
    },
  });

  revalidatePath("/admin");
  revalidatePath("/training");
  return { ok: true, enabled, message: cleanMessage, reason };
}
