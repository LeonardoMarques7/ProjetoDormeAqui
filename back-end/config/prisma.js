import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

let prismaClient;

async function loadPrismaClientConstructor() {
  const candidates = [
    new URL("../generated/prisma/client.js", import.meta.url).href,
    new URL("../generated/prisma/index.js", import.meta.url).href,
    "@prisma/client",
  ];
  const failures = [];

  for (const candidate of candidates) {
    try {
      const module = await import(candidate);
      if (module.PrismaClient) {
        return module.PrismaClient;
      }
      failures.push(`${candidate}: PrismaClient export not found`);
    } catch (error) {
      failures.push(`${candidate}: ${error.message}`);
    }
  }

  throw new Error(
    [
      "Nao foi possivel carregar o PrismaClient.",
      "Execute `npx prisma generate` dentro de back-end antes de iniciar o servidor.",
      "Tentativas:",
      ...failures.map((failure) => `- ${failure}`),
    ].join("\n"),
  );
}

export async function getPrismaClient() {
  if (!prismaClient) {
    const PrismaClient = await loadPrismaClientConstructor();
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    prismaClient = new PrismaClient({ adapter });
  }

  return prismaClient;
}

export async function connectPrisma() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL nao esta definida para conexao PostgreSQL/Prisma.");
  }

  const prisma = await getPrismaClient();
  await prisma.$connect();
  console.log("Conexao PostgreSQL/Prisma estabelecida.");
  return prisma;
}

export async function disconnectPrisma() {
  if (!prismaClient) {
    return;
  }

  await prismaClient.$disconnect();
  prismaClient = null;
}
