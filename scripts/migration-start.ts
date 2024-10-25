import { execSync, spawnSync } from "child_process";
import fs from "fs";
import { fetchSecret, importSecrets, isPRMerged } from "./helpers";

importSecrets();

const base = process.argv[2] || "dev";
const target = process.argv[3] || "main";

async function getLastMigrationId() {
  execSync;
  let lastMigrationId = await fetchSecret("_LAST_MIGRATION_ID", base);
  if (!lastMigrationId) {
    const baseLedger = fs
      .readFileSync(`.xata/migrations-${base}/.ledger`, "utf-8")
      .trim()
      .split("\n");

    const targetLedger = fs
      .readFileSync(`.xata/migrations-${target}/.ledger`, "utf-8")
      .trim()
      .split("\n");

    // Get the last migration id from base ledger by comparing with target ledger
    const ix = baseLedger.findIndex(
      (migration) => !targetLedger.includes(migration)
    );
    lastMigrationId = baseLedger[ix - 1] || baseLedger[0];
  }

  return lastMigrationId;
}

async function getMigrationDiff() {
  const lastMigrationId = await getLastMigrationId();
  console.log("lastMigrationId: ", lastMigrationId);

  const baseLedger = fs
    .readFileSync(`.xata/migrations-${base}/.ledger`, "utf-8")
    .trim()
    .split("\n");
  const toMigrate = baseLedger.slice(baseLedger.indexOf(lastMigrationId) + 1);

  let json: any[] = [];
  for (const migration of toMigrate) {
    const migrationFile = require(`.xata/migrations-${base}/${migration}.json`);
    json = [...json, ...migrationFile.migration.operations];
  }

  return json;
}

(async () => {
  if (!isPRMerged(process.env.COMMIT_MSG || "", base)) {
    console.log(`No PR merge detected from ${base} to ${target}. Exiting...`);
    return;
  }

  console.log(`migration started from ${base} to ${target}`);

  execSync(`npx xatapull ${base}`);
  execSync(`mv .xata/migrations .xata/migrations-${base}`);

  execSync(`npx xatapull ${target}`);
  execSync(`mv .xata/migrations .xata/migrations-${target}`);

  const diff = await getMigrationDiff();
  console.log(diff);

  if (diff.length) {
    spawnSync(
      `npx xatamigrate start ${target} --migration-json '${JSON.stringify(diff)}'`,
      {
        stdio: "inherit",
        shell: true,
      }
    );
  }
})();
