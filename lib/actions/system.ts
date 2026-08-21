"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  TrainingAccessConfig,
  DEFAULT_TRAINING_MESSAGE,
} from "@/lib/system-config";

// Ré-exporter pour éviter les imports multiples dans les pages serveur
export type { TrainingAccessConfig };

/**
 * Récupère l'état actuel de la permission de créer des entraînements.
 */
export async function getTrainingAccessStatus(): Promise<TrainingAccessConfig> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "TRAINING_ACCESS" },
    });

    if (!setting) {
      // Aucun paramètre enregistré : les entraînements sont autorisés par défaut
      return { enabled: true, message: DEFAULT_TRAINING_MESSAGE };
    }

    const parsed = JSON.parse(setting.value);
    return {
      enabled: parsed.enabled ?? true,
      message: parsed.message || DEFAULT_TRAINING_MESSAGE,
      reason: parsed.reason || "CUSTOM",
      updatedAt: setting.updatedAt.toISOString(),
    };
  } catch {
    // En cas d'erreur, on laisse les entraînements actifs pour ne pas bloquer par accident
    return { enabled: true, message: DEFAULT_TRAINING_MESSAGE };
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

  const cleanMessage = message.trim() || DEFAULT_TRAINING_MESSAGE;

  await prisma.systemSetting.upsert({
    where: { key: "TRAINING_ACCESS" },
    create: {
      key: "TRAINING_ACCESS",
      value: JSON.stringify({ enabled, message: cleanMessage, reason }),
    },
    update: {
      value: JSON.stringify({ enabled, message: cleanMessage, reason }),
    },
  });

  revalidatePath("/admin");
  revalidatePath("/training");
  return { ok: true, enabled, message: cleanMessage, reason };
}
