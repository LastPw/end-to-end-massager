import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

function parseSqlitePath(): string | null {
  const url = process.env.DATABASE_URL || "";
  if (!url.startsWith("file:")) {
    return null;
  }
  return url.replace("file:", "");
}

function isPostgresUrl(): boolean {
  const url = process.env.DATABASE_URL || "";
  return url.startsWith("postgres://") || url.startsWith("postgresql://");
}

async function main() {
  if (isPostgresUrl()) {
    const backupDir = path.join(process.cwd(), "backups");
    fs.mkdirSync(backupDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const target = path.join(backupDir, `pg-${stamp}.sql`);
    await new Promise<void>((resolve, reject) => {
      const child = spawn("pg_dump", [process.env.DATABASE_URL || ""], {
        stdio: ["ignore", fs.openSync(target, "w"), "inherit"]
      });
      child.on("error", reject);
      child.on("exit", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error("pg_dump failed"));
        }
      });
    });
    console.log(`Backup created: ${target}`);
    return;
  }
  const dbPath = parseSqlitePath();
  if (!dbPath) {
    console.error("DATABASE_URL must be file: for sqlite backups.");
    process.exit(1);
  }
  const source = path.resolve(process.cwd(), dbPath);
  if (!fs.existsSync(source)) {
    console.error(`Database file not found: ${source}`);
    process.exit(1);
  }
  const backupDir = path.join(process.cwd(), "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const target = path.join(backupDir, `db-${stamp}.sqlite`);
  fs.copyFileSync(source, target);
  console.log(`Backup created: ${target}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
