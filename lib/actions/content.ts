"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { createTextContentSchema, updateTextContentSchema, createQuestionSchema } from "@/lib/validations";

/**
 * Vérifie que l'utilisateur est administrateur avant toute opération de gestion de contenu.
 */
async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/");
  return session;
}

/**
 * Récupère un aperçu des textes créés et le nombre de questions liées.
 */
export async function getAdminContentOverview() {
  await requireAdmin();

  return prisma.textContent.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { questions: true } } },
  });
}

/**
 * Création d'un texte de lecture / compréhension.
 */
export async function createTextContentAction(formData: FormData) {
  const admin = await requireAdmin();

  const raw = {
    title: formData.get("title") as string,
    language: (formData.get("language") as string) || "FR",
    content: formData.get("content") as string,
    source: (formData.get("source") as string) || undefined,
    mode: (formData.get("mode") as string) || undefined,
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
  };

  const result = createTextContentSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const questionsJsonRaw = formData.get("questionsJson") as string;
  let attachedCount = 0;

  const text = await prisma.textContent.create({
    data: {
      title: result.data.title,
      language: result.data.language,
      content: result.data.content,
      source: result.data.source ?? null,
      mode: result.data.mode ?? null,
      isActive: result.data.isActive,
      createdById: admin.id,
    },
  });

  // Importer les questions JSON associées si fournies lors de la création
  if (questionsJsonRaw && questionsJsonRaw.trim() !== "") {
    try {
      const parsedQuestions = JSON.parse(questionsJsonRaw);
      const list = Array.isArray(parsedQuestions) ? parsedQuestions : [parsedQuestions];
      for (const q of list) {
        if (!q || typeof q !== "object") continue;
        const parsed = createQuestionSchema.safeParse({
          ...q,
          textContentId: text.id,
          mode: q.mode || result.data.mode || undefined,
          subject: result.data.language === "EN" ? "ENGLISH" : "FRENCH",
          difficulty: q.difficulty || "MEDIUM",
          options: Array.isArray(q.options) ? q.options : [],
          answerIndex: q.answerIndex ?? 0,
          type: "PASSAGE_BASED",
          source: q.source || "USER_CREATED",
        });

        if (parsed.success) {
          await prisma.question.create({
            data: {
              textContentId: text.id,
              subject: parsed.data.subject,
              topic: parsed.data.topic ?? null,
              subtopic: parsed.data.subtopic ?? null,
              difficulty: parsed.data.difficulty,
              language: parsed.data.language,
              statement: parsed.data.statement,
              options: parsed.data.options,
              answerIndex: parsed.data.answerIndex,
              explanation: parsed.data.explanation ?? null,
              optionExplanations: parsed.data.optionExplanations
                ? parsed.data.optionExplanations.filter((v): v is string => Boolean(v))
                : undefined,
              type: "PASSAGE_BASED",
              source: parsed.data.source,
              mode: parsed.data.mode ?? null,
              createdById: admin.id,
            },
          });
          attachedCount++;
        }
      }
    } catch {
      // JSON questions ignored if malformed, text remains created
    }
  }

  revalidatePath("/admin/contenus");
  return { ok: true, textId: text.id, attachedCount };
}

/**
 * Modification des détails d'un texte de lecture (titre, langue, source, contenu, mode, statut).
 * Met également à jour la matière et la langue des questions qui lui sont associées si la langue change.
 */
export async function updateTextContentAction(formData: FormData) {
  await requireAdmin();

  const raw = {
    id: formData.get("id") as string,
    title: formData.get("title") as string,
    language: (formData.get("language") as string) || "FR",
    content: formData.get("content") as string,
    source: (formData.get("source") as string) || undefined,
    mode: (formData.get("mode") as string) || undefined,
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
  };

  const result = updateTextContentSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Données de modification invalides." };
  }

  try {
    const updatedText = await prisma.textContent.update({
      where: { id: result.data.id },
      data: {
        title: result.data.title,
        language: result.data.language,
        content: result.data.content,
        source: result.data.source ?? null,
        mode: result.data.mode ?? null,
        isActive: result.data.isActive,
      },
    });

    // Mettre à jour la langue et la matière des questions liées pour rester synchrone
    await prisma.question.updateMany({
      where: { textContentId: result.data.id },
      data: {
        language: result.data.language,
        subject: result.data.language === "EN" ? "ENGLISH" : "FRENCH",
      },
    });

    revalidatePath("/admin/contenus");
    return { ok: true, text: updatedText };
  } catch (error: any) {
    return { error: error?.message || "Erreur lors de la mise à jour du texte." };
  }
}

/**
 * Importation directe d'un lot de questions JSON pour un texte existant.
 */
export async function importQuestionsForTextAction(textId: string, questionsJson: unknown) {
  const admin = await requireAdmin();

  const text = await prisma.textContent.findUnique({
    where: { id: textId },
  });

  if (!text) {
    return { ok: false, createdQuestions: 0, errors: ["Texte introuvable."] };
  }

  let items: unknown[] = [];
  if (Array.isArray(questionsJson)) {
    items = questionsJson;
  } else if (questionsJson && typeof questionsJson === "object") {
    const obj = questionsJson as Record<string, unknown>;
    items = Array.isArray(obj.questions) ? (obj.questions as unknown[]) : [obj];
  } else {
    return { ok: false, createdQuestions: 0, errors: ["Format JSON invalide. Doit être un tableau de questions."] };
  }

  let createdQuestions = 0;
  const errors: string[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item || typeof item !== "object") {
      errors.push(`Question #${i + 1} : Format invalide.`);
      continue;
    }

    const q = item as Record<string, unknown>;
    const parsed = createQuestionSchema.safeParse({
      ...q,
      textContentId: text.id,
      subject: text.language === "EN" ? "ENGLISH" : "FRENCH",
      difficulty: q.difficulty || "MEDIUM",
      options: Array.isArray(q.options) ? q.options : [],
      answerIndex: q.answerIndex ?? 0,
      type: "PASSAGE_BASED",
      source: q.source || "USER_CREATED",
    });

    if (!parsed.success) {
      errors.push(`Question #${i + 1} invalide : ${parsed.error.issues[0]?.message}`);
      continue;
    }

    try {
      await prisma.question.create({
        data: {
          textContentId: text.id,
          subject: parsed.data.subject,
          topic: parsed.data.topic ?? null,
          subtopic: parsed.data.subtopic ?? null,
          difficulty: parsed.data.difficulty,
          language: parsed.data.language,
          statement: parsed.data.statement,
          options: parsed.data.options,
          answerIndex: parsed.data.answerIndex,
          explanation: parsed.data.explanation ?? null,
          optionExplanations: parsed.data.optionExplanations
            ? parsed.data.optionExplanations.filter((v): v is string => Boolean(v))
            : undefined,
          type: "PASSAGE_BASED",
          source: parsed.data.source,
          createdById: admin.id,
        },
      });
      createdQuestions++;
    } catch (err: any) {
      errors.push(`Question #${i + 1} : ${err?.message || "Erreur base de données"}`);
    }
  }

  revalidatePath("/admin/contenus");
  return {
    ok: errors.length === 0,
    createdQuestions,
    errors,
  };
}

/**
 * Suppression d'un texte de lecture.
 */
export async function deleteTextContentAction(textId: string) {
  await requireAdmin();

  try {
    // Dissocier d'abord les questions liées en mettant textContentId à null
    await prisma.question.updateMany({
      where: { textContentId: textId },
      data: { textContentId: null },
    });

    await prisma.textContent.delete({
      where: { id: textId },
    });

    revalidatePath("/admin/contenus");
    return { ok: true };
  } catch (error: any) {
    return { error: error?.message || "Erreur lors de la suppression du texte." };
  }
}

/**
 * Création d'une question (autonome ou liée à un texte).
 */
export async function createQuestionAction(formData: FormData) {
  const admin = await requireAdmin();

  const textContentIdRaw = formData.get("textContentId") as string;
  const textContentId = textContentIdRaw && textContentIdRaw.trim() !== "" ? textContentIdRaw.trim() : null;

  const optExplanationsRaw = [
    formData.get("optionExplanation1") as string,
    formData.get("optionExplanation2") as string,
    formData.get("optionExplanation3") as string,
    formData.get("optionExplanation4") as string,
  ].filter(Boolean);

  const raw = {
    textContentId,
    subject: formData.get("subject") as string,
    topic: (formData.get("topic") as string) || undefined,
    subtopic: (formData.get("subtopic") as string) || undefined,
    difficulty: formData.get("difficulty") as string,
    language: (formData.get("language") as string) || "FR",
    statement: formData.get("statement") as string,
    options: [
      formData.get("option1") as string,
      formData.get("option2") as string,
      formData.get("option3") as string,
      formData.get("option4") as string,
    ],
    answerIndex: formData.get("answerIndex") as string,
    explanation: (formData.get("explanation") as string) || undefined,
    optionExplanations: optExplanationsRaw.length > 0 ? optExplanationsRaw : undefined,
    type: textContentId ? "PASSAGE_BASED" : ((formData.get("type") as string) || "MULTIPLE_CHOICE"),
    source: (formData.get("source") as string) || "USER_CREATED",
    mode: (formData.get("mode") as string) || undefined,
    scope: (formData.get("scope") as string) || undefined,
    passageId: (formData.get("passageId") as string) || undefined,
  };

  const result = createQuestionSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const question = await prisma.question.create({
    data: {
      textContentId: result.data.textContentId ?? null,
      subject: result.data.subject,
      topic: result.data.topic ?? null,
      subtopic: result.data.subtopic ?? null,
      difficulty: result.data.difficulty,
      language: result.data.language,
      statement: result.data.statement,
      options: result.data.options,
      answerIndex: result.data.answerIndex,
      explanation: result.data.explanation ?? null,
      optionExplanations: result.data.optionExplanations
        ? result.data.optionExplanations.filter((value): value is string => Boolean(value))
        : undefined,
      passageId: result.data.passageId ?? null,
      scope: result.data.scope ?? null,
      type: result.data.type,
      source: result.data.source,
      mode: result.data.mode ?? null,
      createdById: admin.id,
    },
  });

  revalidatePath("/admin/contenus");
  return { ok: true, questionId: question.id };
}

/**
 * Suppression d'une question individuelle.
 */
export async function deleteQuestionAction(questionId: string) {
  await requireAdmin();

  try {
    await prisma.question.delete({
      where: { id: questionId },
    });

    revalidatePath("/admin/contenus");
    return { ok: true };
  } catch (error: any) {
    return { error: error?.message || "Erreur lors de la suppression de la question." };
  }
}

/**
 * Suppression groupée de questions.
 */
export async function deleteManyQuestionsAction(questionIds: string[]) {
  await requireAdmin();

  if (!questionIds || questionIds.length === 0) {
    return { error: "Aucune question sélectionnée." };
  }

  try {
    const res = await prisma.question.deleteMany({
      where: { id: { in: questionIds } },
    });

    revalidatePath("/admin/contenus");
    return { ok: true, deleted: res.count };
  } catch (error: any) {
    return { error: error?.message || "Erreur lors de la suppression des questions." };
  }
}

/**
 * Vider toutes les questions de la base de données.
 */
export async function clearAllQuestionsAction() {
  await requireAdmin();

  try {
    const res = await prisma.question.deleteMany({});
    revalidatePath("/admin/contenus");
    return { ok: true, deleted: res.count };
  } catch (error: any) {
    return { error: error?.message || "Erreur lors de la suppression de toutes les questions." };
  }
}

/**
 * Supprimer toutes les questions d'une matière / domaine spécifique.
 */
export async function deleteQuestionsBySubjectAction(subject: "MATH" | "FRENCH" | "ENGLISH" | "GENERAL_CULTURE") {
  await requireAdmin();

  try {
    const res = await prisma.question.deleteMany({
      where: { subject },
    });
    revalidatePath("/admin/contenus");
    return { ok: true, deleted: res.count };
  } catch (error: any) {
    return { error: error?.message || `Erreur lors de la suppression des questions de ${subject}.` };
  }
}

/**
 * Vider tout le contenu pédagogique (Questions et Textes).
 */
export async function clearAllContentAction() {
  await requireAdmin();

  try {
    const questionsRes = await prisma.question.deleteMany({});
    const textsRes = await prisma.textContent.deleteMany({});
    revalidatePath("/admin/contenus");
    return { ok: true, deletedQuestions: questionsRes.count, deletedTexts: textsRes.count };
  } catch (error: any) {
    return { error: error?.message || "Erreur lors du nettoyage complet des contenus." };
  }
}

/**
 * Import universel de contenu JSON (Fichier uploadé ou texte collé).
 * Supporte :
 * 1. Un tableau direct de questions (ex: maths.json, culture-generale.json)
 * 2. Un tableau de textes avec questions (ex: passages avec questions associées)
 * 3. Un objet enveloppant { questions: [...] } ou { texts: [...] }
 */
export async function importContentBundleAction(
  json: unknown,
  importMode: "SIMULATION" | "TRAINING" = "SIMULATION",
) {
  const admin = await requireAdmin();

  // Déterminer le format du JSON
  let items: unknown[] = [];

  if (Array.isArray(json)) {
    items = json;
  } else if (json && typeof json === "object") {
    const obj = json as Record<string, unknown>;
    if (Array.isArray(obj.questions)) {
      items = obj.questions;
    } else if (Array.isArray(obj.texts) || Array.isArray(obj.passages)) {
      items = (obj.texts || obj.passages) as unknown[];
    } else {
      items = [obj];
    }
  } else {
    return {
      ok: false,
      createdQuestions: 0,
      createdTexts: 0,
      errors: ["Le JSON fourni doit être un tableau d'éléments ou un objet valide."],
    };
  }

  let createdQuestions = 0;
  let createdTexts = 0;
  const errors: string[] = [];

  for (let i = 0; i < items.length; i += 1) {
    const entry = items[i];
    if (!entry || typeof entry !== "object") {
      errors.push(`Élément #${i + 1} : Format invalide.`);
      continue;
    }

    const item = entry as Record<string, unknown>;

    // Cas 1 : L'élément est un Texte (avec ou sans questions imbriquées)
    if (typeof item.title === "string" && typeof item.content === "string" && !item.statement) {
      try {
        const rawTextMode = typeof item.mode === "string" ? item.mode.toUpperCase().trim() : undefined;
        const textMode = (rawTextMode === "TRAINING" || rawTextMode === "SIMULATION")
          ? rawTextMode
          : rawTextMode === "UNIVERSAL" || rawTextMode === "ALL"
            ? null
            : (importMode === "TRAINING" || importMode === "SIMULATION") ? importMode : null;

        const text = await prisma.textContent.create({
          data: {
            title: item.title,
            language: (item.language === "EN" ? "EN" : "FR") as "FR" | "EN",
            content: item.content,
            source: typeof item.source === "string" ? item.source : null,
            mode: textMode,
            isActive: item.isActive !== false,
            createdById: admin.id,
          },
        });
        createdTexts += 1;

        // Importer les questions associées si présentes
        if (Array.isArray(item.questions)) {
          for (let qIdx = 0; qIdx < item.questions.length; qIdx += 1) {
            const q = item.questions[qIdx];
            const parsed = createQuestionSchema.safeParse({
              textContentId: text.id,
              ...q,
              mode: q.mode || textMode || importMode,
              subject: q.subject || (item.language === "EN" ? "ENGLISH" : "FRENCH"),
              difficulty: q.difficulty || "MEDIUM",
              options: Array.isArray(q.options) ? q.options : [],
              answerIndex: q.answerIndex ?? 0,
              type: "PASSAGE_BASED",
              source: q.source || "USER_CREATED",
            });

            if (parsed.success) {
              await prisma.question.create({
                data: {
                  textContentId: text.id,
                  subject: parsed.data.subject,
                  topic: parsed.data.topic ?? null,
                  subtopic: parsed.data.subtopic ?? null,
                  difficulty: parsed.data.difficulty,
                  language: parsed.data.language,
                  statement: parsed.data.statement,
                  options: parsed.data.options,
                  answerIndex: parsed.data.answerIndex,
                  explanation: parsed.data.explanation ?? null,
                  optionExplanations: parsed.data.optionExplanations
                    ? parsed.data.optionExplanations.filter((v): v is string => Boolean(v))
                    : undefined,
                  passageId: parsed.data.passageId ?? text.id,
                  scope: parsed.data.scope ?? null,
                  type: parsed.data.type,
                  source: parsed.data.source,
                  mode: parsed.data.mode ?? null,
                  createdById: admin.id,
                },
              });
              createdQuestions += 1;
            } else {
              errors.push(`Texte "${item.title}" - Question #${qIdx + 1} invalide : ${parsed.error.issues[0]?.message}`);
            }
          }
        }
      } catch (err: any) {
        errors.push(`Erreur texte "${item.title}" : ${err?.message || "Erreur DB"}`);
      }
      continue;
    }

    // Cas 2 : L'élément est une Question autonome ou avec passageId
    if (typeof item.statement === "string" || item.options) {
      const parsed = createQuestionSchema.safeParse({
        ...item,
        mode: item.mode || importMode,
        subject: item.subject,
        difficulty: item.difficulty || "MEDIUM",
        options: Array.isArray(item.options) ? item.options : [],
        answerIndex: item.answerIndex ?? 0,
        source: item.source || "USER_CREATED",
      });

      if (!parsed.success) {
        errors.push(`Question #${i + 1} invalide : ${parsed.error.issues[0]?.message}`);
        continue;
      }

      try {
        await prisma.question.create({
          data: {
            textContentId: parsed.data.textContentId ?? null,
            subject: parsed.data.subject,
            topic: parsed.data.topic ?? null,
            subtopic: parsed.data.subtopic ?? null,
            difficulty: parsed.data.difficulty,
            language: parsed.data.language,
            statement: parsed.data.statement,
            options: parsed.data.options,
            answerIndex: parsed.data.answerIndex,
            explanation: parsed.data.explanation ?? null,
            optionExplanations: parsed.data.optionExplanations
              ? parsed.data.optionExplanations.filter((v): v is string => Boolean(v))
              : undefined,
            passageId: parsed.data.passageId ?? null,
            scope: parsed.data.scope ?? null,
            type: parsed.data.type,
            source: parsed.data.source,
            mode: parsed.data.mode ?? null,
            createdById: admin.id,
          },
        });
        createdQuestions += 1;
      } catch (err: any) {
        errors.push(`Question #${i + 1} (${parsed.data.statement.slice(0, 30)}...) : ${err?.message || "Erreur DB"}`);
      }
      continue;
    }

    errors.push(`Élément #${i + 1} : Ne correspond ni à un texte ni à une question reconnue.`);
  }

  revalidatePath("/admin/contenus");
  return {
    ok: errors.length === 0,
    createdQuestions,
    createdTexts,
    errors,
  };
}
