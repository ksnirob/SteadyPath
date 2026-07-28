const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
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
  const email = "ksnirob@gmail.com";
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      passwordHash: true
    }
  });

  console.log(
    JSON.stringify(
      {
        exists: Boolean(user),
        id: user?.id,
        email: user?.email,
        hasPasswordHash: Boolean(user?.passwordHash),
        passwordMatches: user?.passwordHash ? await bcrypt.compare("681074@ks", user.passwordHash) : false
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
