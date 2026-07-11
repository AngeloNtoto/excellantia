import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Admin principal (idempotent via upsert)
    const admin = await prisma.user.upsert({
      where: { code: "00000000000001" },
      update: {},
      create: {
        fullname: "Administrateur Principal",
        code: "00000000000001",
        role: "ADMIN",
        isActive: true,
      },
    });

    // Candidats de démonstration
    const demoCandiates = [
      { fullname: "KABONGO Jean Pierre", code: "25072006123456", role: "CANDIDATE" as const },
      { fullname: "MUKENDI Grace Divine", code: "25072006987654", role: "CANDIDATE" as const },
      { fullname: "LUMUMBA Patrice", code: "30061960000000", role: "CANDIDATE" as const },
      { fullname: "TSHISEKEDI Felix", code: "24012019000000", role: "CANDIDATE" as const },
      { fullname: "KIMBANGU Simon", code: "06041921000000", role: "CANDIDATE" as const }
    ];

    let createdCount = 0;
    for (const c of demoCandiates) {
      const existing = await prisma.user.findUnique({ where: { code: c.code } });
      if (!existing) {
        await prisma.user.create({ data: { ...c, isActive: true } });
        createdCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Seed executé avec succès.",
      admin: admin.fullname,
      newCandidatesCreated: createdCount
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
