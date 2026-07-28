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

const seedUser = {
  email: "ksnirob@gmail.com",
  name: "Nirob",
  timezone: "Asia/Dhaka",
  passwordHash: "$2b$12$ov6pr8q.tv79Rk.YCgR4puegl7QzeOU8nB65q/5ULrGJ2S3X9wViS"
};

async function main() {
  const user = await prisma.user.upsert({
    where: { email: seedUser.email },
    create: seedUser,
    update: {
      name: seedUser.name,
      timezone: seedUser.timezone,
      passwordHash: seedUser.passwordHash
    },
    select: {
      id: true,
      email: true
    }
  });

  console.log(`Seeded credentials user: ${user.email} (${user.id})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
