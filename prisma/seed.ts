import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seed Excellantia...");

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

  console.log(`✅ Admin : ${admin.fullname} (code: ${admin.code})`);

  // Candidats de démonstration
  const demoCandiates = [
    { fullname: "KABONGO Jean Pierre", code: "25072006123456", role: "CANDIDATE" as const },
    { fullname: "MUKENDI Grace Divine", code: "25072006987654", role: "CANDIDATE" as const },
    { fullname: "ILUNGA Patrick Mutombo", code: "25072006111222", role: "CANDIDATE" as const },
    { fullname: "NGALULA Prisca", code: "25072006333444", role: "CANDIDATE" as const },
    { fullname: "KASONGO Théodore", code: "25072006555666", role: "CANDIDATE" as const },
  ];

  for (const candidate of demoCandiates) {
    await prisma.user.upsert({
      where: { code: candidate.code },
      update: {},
      create: { ...candidate, isActive: true },
    });
  }

  console.log(`✅ ${demoCandiates.length} candidats de démonstration créés.`);
  console.log("\n📋 Codes d'accès admin :");
  console.log("   Code admin : 00000000000001");
  console.log("\n👤 Codes candidats demo :");
  for (const c of demoCandiates) {
    console.log(`   ${c.fullname.padEnd(30)} → ${c.code}`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
