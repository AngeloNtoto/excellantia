"use server";

import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { createSession, destroySession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const raw = { code: formData.get("code") as string };
  const result = loginSchema.safeParse(raw);

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const user = await prisma.user.findUnique({
    where: { code: result.data.code },
  });

  if (!user || !user.isActive) {
    return { error: "Code invalide ou compte désactivé." };
  }

  await createSession({
    id: user.id,
    fullname: user.fullname,
    code: user.code,
    role: user.role as "ADMIN" | "CANDIDATE",
  });

  redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}
