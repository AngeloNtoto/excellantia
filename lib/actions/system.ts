"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DEFAULT_TRAINING_MESSAGE } from "@/lib/system-config";

// NOTE: TrainingAccessConfig est défini dans lib/system-config.ts
// Importez-le directement depuis là dans vos composants serveur/client.

/**
 * Récupère l'état actuel de la permission de créer des entraînements.
 */
export async function getTrainingAccessStatus() {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "TRAINING_ACCESS" },
    });

    if (!setting) {
      // Aucun paramètre enregistré : les entraînements sont autorisés par défaut
      return { enabled: true as boolean, message: DEFAULT_TRAINING_MESSAGE, reason: undefined as string | undefined, updatedAt: undefined as string | undefined };
    }

    const parsed = JSON.parse(setting.value);
    return {
      enabled: (parsed.enabled ?? true) as boolean,
      message: (parsed.message || DEFAULT_TRAINING_MESSAGE) as string,
      reason: (parsed.reason || "CUSTOM") as string | undefined,
      updatedAt: setting.updatedAt.toISOString() as string | undefined,
    };
  } catch {
    // En cas d'erreur, on laisse les entraînements actifs pour ne pas bloquer par accident
    return { enabled: true as boolean, message: DEFAULT_TRAINING_MESSAGE, reason: undefined as string | undefined, updatedAt: undefined as string | undefined };
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
