const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const envPath = path.join(process.cwd(), ".env");

if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex);
    const value = trimmed.slice(separatorIndex + 1).replace(/^"(.*)"$/, "$1");
    process.env[key] = value;
  }
}

const prisma = new PrismaClient();

async function main() {
  const counts = {
    users: await prisma.user.count(),
    triggers: await prisma.triggerEvent.count(),
    journals: await prisma.journalEntry.count(),
    episodes: await prisma.ocdEpisode.count(),
    checkIns: await prisma.dailyCheckIn.count(),
    erp: await prisma.erpExercise.count()
  };

  const rows = {
    users: await prisma.user.findMany({ select: { id: true, email: true } }),
    triggers: await prisma.triggerEvent.findMany({
      select: { id: true, label: true, intensity: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    erp: await prisma.erpExercise.findMany({
      select: { id: true, title: true, difficulty: true, status: true },
      orderBy: { createdAt: "desc" },
      take: 5
    })
  };

  console.log(JSON.stringify({ counts, rows }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
