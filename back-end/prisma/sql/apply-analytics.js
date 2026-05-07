import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getPrismaClient } from "../migration/helpers/prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlDirectories = [
  path.join(__dirname, "materialized-views"),
  path.join(__dirname, "functions"),
];

const numberedSqlFilePattern = /^\d+_.*\.sql$/i;
const destructivePatterns = [
  { label: "DROP TABLE", pattern: /\bdrop\s+table\b/i },
  { label: "TRUNCATE", pattern: /\btruncate\b/i },
  { label: "DELETE FROM", pattern: /\bdelete\s+from\b/i },
  { label: "UPDATE", pattern: /\bupdate\s+/i },
  { label: "INSERT INTO", pattern: /\binsert\s+into\b/i },
  { label: "ALTER TABLE", pattern: /\balter\s+table\b/i },
  { label: "DROP MATERIALIZED VIEW", pattern: /\bdrop\s+materialized\s+view\b/i },
  { label: "DROP FUNCTION", pattern: /\bdrop\s+function\b/i },
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

  const allowed =
    /\bcreate\s+materialized\s+view\s+if\s+not\s+exists\b/i.test(executableSql) ||
    /\bcreate\s+unique\s+index\s+if\s+not\s+exists\b/i.test(executableSql) ||
    /\bcreate\s+index\s+if\s+not\s+exists\b/i.test(executableSql) ||
    /\bcreate\s+or\s+replace\s+function\b/i.test(executableSql);

  if (!allowed) {
    throw new Error(`${fileName} nao contem comando analitico permitido.`);
  }
}

async function loadSqlFiles() {
  const files = [];

  for (const directory of sqlDirectories) {
    const entries = await readdir(directory, { withFileTypes: true });
    const directoryFiles = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((fileName) => numberedSqlFilePattern.test(fileName))
      .sort((a, b) => a.localeCompare(b))
      .map((fileName) => ({
        fileName,
        filePath: path.join(directory, fileName),
      }));

    files.push(...directoryFiles);
  }

  return files;
}

async function applyAnalytics() {
  const files = await loadSqlFiles();

  if (files.length === 0) {
    throw new Error("Nenhum SQL analitico numerado encontrado.");
  }

  const prisma = await getPrismaClient();

  try {
    await prisma.$connect();
    console.log(`Aplicando ${files.length} arquivos analiticos.`);

    for (const { fileName, filePath } of files) {
      const sql = await readFile(filePath, "utf8");

      console.log(`Aplicando ${fileName}...`);
      validateSqlIsAllowed(fileName, sql);
      await prisma.$executeRawUnsafe(sql);
      console.log(`OK: ${fileName}`);
    }

    await prisma.$executeRawUnsafe("REFRESH MATERIALIZED VIEW mv_host_dashboard_summary_monthly");
    console.log("OK: refresh mv_host_dashboard_summary_monthly");
  } finally {
    await prisma.$disconnect();
  }
}

applyAnalytics().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
