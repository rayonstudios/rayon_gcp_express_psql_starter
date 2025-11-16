import { execSync } from "child_process";
import { importSecrets, isPRMerged } from "./helpers";

importSecrets();

const base = process.argv[2] || "dev";
const target = process.argv[3] || "main";
const lastCommonMigrationId = process.argv[4] || "";

(async () => {
  if (!process.env.FORCE && !isPRMerged(process.env.COMMIT_MSG || "", base)) {
    console.log(`No PR merge detected from ${base} to ${target}. Exiting...`);
    return;
  }

  console.log(`Migration started from ${base} to ${target}...`);

  execSync(`npm install -g @xata.io/cli@latest`);
  execSync(
    `npx tsx ./scripts/sync-branch-schema ${base} ${target} ${lastCommonMigrationId}`,
    {
      stdio: "inherit",
    }
  );
  execSync(`rm -rf .xata/migrations`);
})();
