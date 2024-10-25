import { execSync, spawnSync } from "child_process";
import fs from "fs";
import { importSecrets, isPRMerged, shortPoll, updateSecret } from "./helpers";

importSecrets();

const base = process.argv[2] || "dev";
const target = process.argv[3] || "main";
console.log(`starting migration completion from ${base} to ${target}`);

function getMigrationStatus() {
  const output = execSync(`xata migrate status ${target}`).toString();
  return output.trim().split("\n")[1].split(/\s+/)[3];
}

(async () => {
  if (!isPRMerged(process.env.COMMIT_MSG || "", base)) {
    console.log(`No PR merge detected from ${base} to ${target}. Exiting...`);
    return;
  }

  const status = getMigrationStatus();
  console.log("status: ", status);

  if (status === "active") {
    spawnSync(`xata migrate complete ${target}`, {
      stdio: "inherit",
      shell: true,
    });
  }

  const isCompleted = await shortPoll(() => {
    const status = getMigrationStatus();
    if (status === "completed") return true;
    if (status === "active") return undefined; //continue polling
    return false;
  }, 3000);

  if (isCompleted) {
    console.log(`migration completed from ${base} to ${target}`);

    execSync(`xata pull ${base}`);
    execSync(`mv .xata/migrations .xata/migrations-${base}`);

    execSync(`xata pull ${target}`);
    execSync(`mv .xata/migrations .xata/migrations-${target}`);

    async function updateLastMigrationId(branch: string) {
      const ledger = fs
        .readFileSync(`.xata/migrations-${branch}/.ledger`, "utf-8")
        .trim()
        .split("\n");
      const newLastMigrationId = ledger.at(-1) || "";
      console.log(`${base} newLastMigrationId: `, newLastMigrationId);

      await updateSecret("_LAST_MIGRATION_ID", newLastMigrationId, branch);
    }

    await updateLastMigrationId(base);
    await updateLastMigrationId(target);

    execSync(`rm -rf .xata/migrations-${base}`);
    execSync(`rm -rf .xata/migrations-${target}`);

    console.log("updated _LAST_MIGRATION_ID for both branches");
  }
})();
