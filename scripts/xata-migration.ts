import { execSync } from "child_process";
import { importSecrets, isPRMerged } from "./helpers";

importSecrets();

const base = process.argv[2] || "dev";
const target = process.argv[3] || "main";

(async () => {
  if (!process.env.FORCE && !isPRMerged(process.env.COMMIT_MSG || "", base)) {
    console.log(`No PR merge detected from ${base} to ${target}. Exiting...`);
    return;
  }

  console.log(`Migration started from ${base} to ${target}...`);

  execSync(`xata pull ${base}`);
  execSync(`xata push ${target} -y`);
  execSync(`rm -rf .xata/migrations`);
})();
