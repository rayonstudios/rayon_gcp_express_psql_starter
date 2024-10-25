import { execSync, spawnSync } from "child_process";
import fs from "fs";
import { importSecrets, isPRMerged, updateSecret } from "./helpers";

importSecrets();

const base = process.argv[2] || "dev";
const target = process.argv[3] || "main";
console.log(`migration completing from ${base} to ${target}`);

(async () => {
  if (!isPRMerged(process.env.COMMIT_MSG || "", base)) {
    console.log(`No PR merge detected from ${base} to ${target}. Exiting...`);
    return;
  }

  const output = execSync(`xata migrate status ${target}`).toString();
  const status = output.trim().split("\n")[1].split(/\s+/)[3];
  console.log("status: ", status);

  if (status === "active") {
    spawnSync(`xata migrate complete ${target}`, {
      stdio: "inherit",
      shell: true,
    });

    const baseLedger = fs
      .readFileSync(`.xata/migrations-${base}/.ledger`, "utf-8")
      .trim()
      .split("\n");
    const newLastMigrationId = baseLedger.at(-1) || "";
    console.log("newLastMigrationId: ", newLastMigrationId);
    await updateSecret("_LAST_MIGRATION_ID", newLastMigrationId, base);
  }

  execSync(`rm -rf .xata/migrations-${base}`);
  execSync(`rm -rf .xata/migrations-${target}`);
})();
