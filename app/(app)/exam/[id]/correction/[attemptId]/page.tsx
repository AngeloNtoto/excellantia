import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getQuestionsByIds, getAllPassages } from "@/lib/questions";
import { SUBJECT_LABELS } from "@/lib/types";
import { CollapsibleSection } from "./collapsible-section";

export default async function CorrectionPage({ params }: { params: Promise<{ id: string, attemptId: string }> }) {
  const { attemptId } = await params;
  const session = await getSession();
  if (!session) redirect("/");

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: { room: true, answers: true }
  });

  if (!attempt) redirect("/dashboard");
  if (attempt.userId !== session.id && session.role !== "ADMIN") redirect("/dashboard");
  if (attempt.status === "IN_PROGRESS") redirect(`/exam/${attempt.id}`);

  const room = attempt.room;
  
  const isTraining = room.visibility === "PRIVATE" && room.createdById === attempt.userId;
  const isClosed = room.status === "CLOSED";
  const now = new Date();
  const isTimeUp = room.endsAt ? room.endsAt <= now : false;
  
  if (!isTraining && !isClosed && !isTimeUp) {
    return (
      <main className="page" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center" }}>
        <div style={{ background: "var(--bg-muted)", padding: 40, borderRadius: "var(--radius-lg)", maxWidth: 500 }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 16 }}>Correction indisponible</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
            Votre copie a bien été soumise. La correction et votre score seront disponibles dès que l&apos;épreuve sera clôturée pour l&apos;ensemble des candidats ou à la fin du temps réglementaire.
          </p>
          <a href="/dashboard" className="btn btn-primary">Retour à l&apos;accueil</a>
        </div>
      </main>
    );
  }

  const questions = getQuestionsByIds(room.questionIds as string[]);
  const passages = getAllPassages();
  const answersMap = new Map<string, number | null>(
    attempt.answers.map((answer: any) => [answer.questionId, answer.selectedIndex])
  );

  const scoreBySubject = attempt.scoreBySubject as Record<string, number> | null;

  return (
    <main className="page">
      <div style={{ marginBottom: 40, textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 8 }}>Résultats de l'Examen</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.125rem" }}>{room.title}</p>
      </div>

      <div className="card" style={{ padding: "32px 40px", marginBottom: 48, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Score global</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{ fontSize: "3rem", fontWeight: 800, color: (attempt.percentage ?? 0) >= 50 ? "var(--success)" : "var(--error)" }}>
              {attempt.percentage}%
            </span>
            <span style={{ fontSize: "1.25rem", color: "var(--text-muted)", fontWeight: 500 }}>
              ({attempt.score} / {questions.length})
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 32, flexWrap: "wrap", justifyContent: "center" }}>
          {scoreBySubject && Object.entries(SUBJECT_LABELS).map(([key, label]) => {
            const subjCount = questions.filter(q => q.subject === key).length;
            if (subjCount === 0) return null;
            const s = scoreBySubject[key] ?? 0;
            const pct = Math.round((s / subjCount) * 100);
            return (
              <div key={key} style={{ textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: `var(--${key.toLowerCase()}-light, var(--bg-muted))`, color: `var(--${key.toLowerCase()}, var(--accent))`, fontSize: "1.125rem", fontWeight: 700, margin: "0 auto 8px" }}>
                  {pct}%
                </div>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>{label}</p>
              </div>
            );
          })}
        </div>
      </div>

      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 24 }}>Correction détaillée</h2>
      
      <div>
        {Object.entries(
          questions.reduce((acc, q) => {
            if (!acc[q.subject]) acc[q.subject] = [];
            acc[q.subject].push(q);
            return acc;
          }, {} as Record<string, typeof questions>)
        ).map(([subject, subQuestions]) => (
          <CollapsibleSection key={subject} title={SUBJECT_LABELS[subject as keyof typeof SUBJECT_LABELS]} count={subQuestions.length}>
            {(() => {
              const passagesGroup = new Map<string | null, typeof subQuestions>();
              subQuestions.forEach(q => {
                const pId = q.passageId || null;
                if (!passagesGroup.has(pId)) passagesGroup.set(pId, []);
                passagesGroup.get(pId)!.push(q);
              });

              return Array.from(passagesGroup.entries()).map(([passageId, pQuestions]) => {
                const passage = passageId ? passages.find(p => p.id === passageId) : null;
                return (
                  <div key={passageId || "no-passage"} style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                    {passage && (
                      <div style={{ 
                        background: "var(--bg-muted)", padding: 24, borderRadius: "var(--radius-md)", 
                        borderLeft: "4px solid var(--accent)", fontSize: "0.9375rem", lineHeight: 1.6
                      }}>
                        <h4 style={{ margin: "0 0 16px 0", fontWeight: 700, fontSize: "1.125rem" }}>{passage.title}</h4>
                        <div style={{ whiteSpace: "pre-wrap", color: "var(--text-secondary)" }}>{passage.content}</div>
                      </div>
                    )}
                    {pQuestions.map((q) => {
                      const i = questions.findIndex(orig => orig.id === q.id);
                      const selected = answersMap.get(q.id);
                      const isCorrect = selected === q.answerIndex;
                      const isUnanswered = selected === null || selected === undefined;
                      
                      return (
                        <div key={q.id} className="card" style={{ padding: 24, borderLeft: `4px solid ${isCorrect ? "var(--success)" : isUnanswered ? "var(--warning)" : "var(--error)"}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                            <span className={`badge badge-${q.subject.toLowerCase()}`}>{SUBJECT_LABELS[q.subject as keyof typeof SUBJECT_LABELS]}</span>
                            <span className={`badge ${isCorrect ? "badge-success" : isUnanswered ? "badge-warning" : "badge-error"}`}>
                              {isCorrect ? "Correct" : isUnanswered ? "Non répondu" : "Incorrect"}
                            </span>
                          </div>
                          
                          <p style={{ fontSize: "1.0625rem", fontWeight: 500, marginBottom: 20 }}>
                            {i + 1}. {q.statement}
                          </p>

                          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                            {q.options.map((opt, optIdx) => {
                              const isExpected = optIdx === q.answerIndex;
                              const isUserSelection = optIdx === selected;
                              
                              let bg = "transparent";
                              let border = "var(--border)";
                              let color = "var(--text-primary)";
                              
                              if (isExpected) {
                                bg = "var(--success-light)"; border = "var(--success)"; color = "var(--success)";
                              } else if (isUserSelection && !isCorrect) {
                                bg = "var(--error-light)"; border = "var(--error)"; color = "var(--error)";
                              }
                              
                              return (
                                <div key={optIdx} style={{ padding: "10px 16px", borderRadius: "var(--radius-sm)", border: `1px solid ${border}`, background: bg, color: color, fontSize: "0.9375rem", display: "flex", alignItems: "center", gap: 12 }}>
                                  <span style={{ fontWeight: 600 }}>{String.fromCharCode(65 + optIdx)}.</span>
                                  <span>{opt}</span>
                                  {isUserSelection && <span style={{ marginLeft: "auto", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Votre réponse</span>}
                                </div>
                              );
                            })}
                          </div>

                          <div style={{ background: "var(--bg-muted)", padding: 20, borderRadius: "var(--radius-sm)" }}>
                            <h4 style={{ fontSize: "0.875rem", fontWeight: 700, marginBottom: 8, color: "var(--text-primary)" }}>Explication</h4>
                            <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", margin: 0 }}>{q.explanation}</p>
                            
                            {q.optionExplanations && (
                              <ul style={{ marginTop: 12, paddingLeft: 20, fontSize: "0.875rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 4 }}>
                                {q.optionExplanations.map((exp, idx) => (
                                  <li key={idx}><strong>{String.fromCharCode(65 + idx)}.</strong> {exp}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              });
            })()}
          </CollapsibleSection>
        ))}
      </div>
    </main>
  );
}
