import { execSync } from "child_process";
import fs from "fs";

const migrationsFolderPath = ".xata/migrations";

const getBranchMigrations = (branch: string) => {
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

  return migrationJson;
};

const pushBranchSchema = (branch: string, migrations: any[]) => {
  const migrationsFolderPath = ".xata/migrations";
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

  execSync(`xata push ${branch} -y`, { stdio: "inherit" });
};

// Parse CLI arguments
const args = process.argv.slice(2);
const fromBranch = args[0] || "dev";
const toBranch = args[1] || "main";
const lastCommonMigrationId = args[2] || "";

(() => {
  const fromMigrations = getBranchMigrations(fromBranch);
  const toMigrations = getBranchMigrations(toBranch);

  // Find the index of the last common migration
  let ix = -1;
  if (lastCommonMigrationId) {
    console.log("lastCommonMigrationId provided: ", lastCommonMigrationId);
    for (let i = fromMigrations.length - 1; i >= 0; i--) {
      if (fromMigrations[i].id === lastCommonMigrationId) {
        ix = i;
        break;
      }
    }
  } else {
    for (let j = toMigrations.length - 1; j >= 0; j--) {
      const migTo = toMigrations[j];
      for (let i = fromMigrations.length - 1; i >= 0; i--) {
        if (fromMigrations[i].id === migTo.id) {
          ix = i;
          break;
        }
      }
      if (ix !== -1) break;
    }
  }

  // Get the new migrations from the from branch (beyond the common point)
  const newMigrations = fromMigrations.slice(ix + 1);

  // remove any duplicate migrations in newMigrations that already exist in toMigrations
  const toMigrationIds = new Set(toMigrations.map((item: any) => item.id));
  const filteredNewMigrations = newMigrations.filter(
    (item: any) => !toMigrationIds.has(item.id)
  );

  // Prepare the final migration JSON: common + existing to migrations + new from migrations
  const finalMigrationJson = [...toMigrations, ...filteredNewMigrations];

  if (filteredNewMigrations.length > 0) {
    pushBranchSchema(toBranch, finalMigrationJson);
  } else {
    console.log("No new migrations to apply.");
  }
})();
