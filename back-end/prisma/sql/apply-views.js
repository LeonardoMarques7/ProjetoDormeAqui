import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getPrismaClient } from "../migration/helpers/prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const viewsDir = path.join(__dirname, "views");

const numberedSqlFilePattern = /^\d+_.*\.sql$/i;
const destructivePatterns = [
  { label: "DROP TABLE", pattern: /\bdrop\s+table\b/i },
  { label: "TRUNCATE", pattern: /\btruncate\b/i },
  { label: "DELETE FROM", pattern: /\bdelete\s+from\b/i },
  { label: "UPDATE", pattern: /\bupdate\s+/i },
  { label: "INSERT INTO", pattern: /\binsert\s+into\b/i },
  { label: "ALTER TABLE", pattern: /\balter\s+table\b/i },
];

function stripSqlComments(sql) {
  return sql
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

function validateSqlIsAllowed(fileName, sql) {
  const executableSql = stripSqlComments(sql);
  const blocked = destructivePatterns.find(({ pattern }) => pattern.test(executableSql));

  if (blocked) {
    throw new Error(`${fileName} contem comando bloqueado: ${blocked.label}`);
  }

  if (!/\bcreate\s+or\s+replace\s+view\b/i.test(executableSql)) {
    throw new Error(`${fileName} nao contem CREATE OR REPLACE VIEW.`);
  }
}

async function loadViewFiles() {
  const entries = await readdir(viewsDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((fileName) => numberedSqlFilePattern.test(fileName))
    .sort((a, b) => a.localeCompare(b));
}

async function applyViews() {
  const files = await loadViewFiles();

  if (files.length === 0) {
    throw new Error(`Nenhum arquivo de view numerado encontrado em ${viewsDir}.`);
  }

  const prisma = await getPrismaClient();

  try {
    await prisma.$connect();
    console.log(`Aplicando ${files.length} views de ${viewsDir}`);

    for (const fileName of files) {
      const filePath = path.join(viewsDir, fileName);
      const sql = await readFile(filePath, "utf8");

      console.log(`Aplicando ${fileName}...`);
      validateSqlIsAllowed(fileName, sql);

      try {
        await prisma.$executeRawUnsafe(sql);
        console.log(`OK: ${fileName}`);
      } catch (error) {
        console.error(`Erro ao aplicar ${fileName}:`);
        throw error;
      }
    }

    console.log("Views aplicadas com sucesso.");
  } finally {
    await prisma.$disconnect();
  }
}

applyViews().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
