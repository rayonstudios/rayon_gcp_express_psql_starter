import { execSync } from "child_process";
import fs from "fs";

// This script is used to initialize the database schema in xata with the schema
// needed for the starter kit to run

const branch = "main";
const migrationsFolderPath = ".xata/migrations";

const migrations = JSON.parse(
  fs.readFileSync("xata-migrations.json", { encoding: "utf-8" })
) as any;
const uniqueMigrations = [...new Set(migrations.map((item: any) => item.id))];

if (fs.existsSync(migrationsFolderPath)) {
  fs.readdirSync(migrationsFolderPath).forEach((file) =>
    fs.rmSync(`${migrationsFolderPath}/${file}`, {
      recursive: true,
      force: true,
    })
  );
} else {
  fs.mkdirSync(migrationsFolderPath);
}

fs.writeFileSync(
  ".xata/migrations/.ledger",
  uniqueMigrations.join("\n") + "\n",
  { encoding: "utf-8" }
);

const startDate = new Date(Date.now() - migrations.length * 3000).getTime();
uniqueMigrations.forEach((migration: any, ix) => {
  const operations = migrations.filter((item: any) => item.id === migration);
  const json = JSON.stringify(
    {
      done: true,
      migration: {
        name: migration,
        operations: operations.map((item: any) => ({
          ...item,
          id: undefined,
          name: undefined,
        })),
      },
      migrationType: "pgroll",
      name: migration,
      schema: "public",
      startedAt: new Date(startDate + ix * 3000).toISOString(),
    },
    null,
    2
  );

  fs.writeFileSync(`.xata/migrations/${migration}.json`, json, {
    encoding: "utf-8",
  });
});

execSync(`xata push ${branch}`, { stdio: "inherit" });
