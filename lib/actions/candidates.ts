"use server";

import { prisma } from "@/lib/prisma";
import { candidateImportSchema } from "@/lib/validations";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ─── Guard admin ──────────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/");
  return session;
}

// ─── Lister les candidats ─────────────────────────────────────────────────────

export async function getCandidates(search?: string) {
  await requireAdmin();
  return prisma.user.findMany({
    where: search
      ? { fullname: { contains: search, mode: "insensitive" } }
      : undefined,
    orderBy: { createdAt: "desc" },
  });
}

// ─── Ajouter un candidat ──────────────────────────────────────────────────────

export async function addCandidateAction(formData: FormData) {
  await requireAdmin();

  const raw = {
    fullname: formData.get("fullname") as string,
    code: formData.get("code") as string,
    role: (formData.get("role") as string) || "CANDIDATE",
  };

  const result = candidateImportSchema.element.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const existing = await prisma.user.findUnique({ where: { code: result.data.code } });
  if (existing) {
    return { error: `Code déjà utilisé par ${existing.fullname}.` };
  }

  await prisma.user.create({ data: result.data });
  revalidatePath("/admin/candidats");
  return { ok: true };
}

// ─── Import JSON ──────────────────────────────────────────────────────────────

export interface ImportReport {
  created: number;
  skipped: number;
  errors: Array<{ index: number; message: string }>;
}

export async function importCandidatesAction(json: unknown): Promise<ImportReport> {
  await requireAdmin();

  const result = candidateImportSchema.safeParse(json);
  if (!result.success) {
    return {
      created: 0,
      skipped: 0,
      errors: [{ index: -1, message: "Format JSON invalide : tableau attendu." }],
    };
  }

  const rows = result.data;
  const report: ImportReport = { created: 0, skipped: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const existing = await prisma.user.findUnique({ where: { code: row.code } });
      if (existing) {
        report.skipped++;
        continue;
      }
      await prisma.user.create({ data: row });
      report.created++;
    } catch (e) {
      report.errors.push({ index: i, message: String(e) });
    }
  }

  revalidatePath("/admin/candidats");
  return report;
}

// ─── Activer / désactiver un candidat ────────────────────────────────────────

export async function toggleCandidateAction(id: string) {
  await requireAdmin();
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return { error: "Utilisateur introuvable." };

  await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
  });

  revalidatePath("/admin/candidats");
  return { ok: true };
}

// ─── Modifier le nom ──────────────────────────────────────────────────────────

export async function updateCandidateNameAction(id: string, fullname: string) {
  await requireAdmin();
  if (!fullname.trim()) return { error: "Le nom est obligatoire." };

  await prisma.user.update({ where: { id }, data: { fullname: fullname.trim() } });
  revalidatePath("/admin/candidats");
  return { ok: true };
}

// ─── Supprimer un candidat ────────────────────────────────────────────────────

export async function deleteCandidateAction(id: string) {
  await requireAdmin();
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return { error: "Utilisateur introuvable." };

  // Delete the user and all associated records (attempts, answers) via cascade if configured,
  // or explicitly if cascade is not set. Assuming Prisma handles cascade on Attempts.
  await prisma.user.delete({ where: { id } });

  revalidatePath("/admin/candidats");
  return { ok: true };
}
