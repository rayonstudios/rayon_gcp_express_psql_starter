import { execSync } from "child_process";
import fs from "fs";

// This script is used to pull the latest migrations from Xata and convert them into
// an operations JSON -> xata-migrations.json which is used to initialize the
// database schema through npm run shcema:initialize

const branch = "main";
const migrationsFolderPath = ".xata/migrations";

if (fs.existsSync(migrationsFolderPath)) {
  fs.rmSync(migrationsFolderPath, { recursive: true, force: true });
}

execSync(`xata pull ${branch}`, { stdio: "inherit" });

const ledger = fs
  .readFileSync(".xata/migrations/.ledger", { encoding: "utf-8" })
  .split("\n")
  .filter((line) => !!line.trim());

const migrationJson = ledger.reduce((acc, line) => {
  const json = JSON.parse(
    fs.readFileSync(`.xata/migrations/${line}.json`, { encoding: "utf-8" })
  ) as any;
  return [
    ...acc,
    ...json.migration.operations.map((item: any) => ({
      ...item,
      id: json.name,
    })),
  ];
}, [] as any);

fs.writeFileSync(
  "xata-migrations.json",
  JSON.stringify(migrationJson, null, 2),
  { encoding: "utf-8" }
);
