import { execSync } from "child_process";
import fs from "fs";
import path from "path";

/**
 * Xata Schema Initialization Script
 *
 * This script initializes a fresh Xata database using the optimized migrations
 * from xata-migrations.json (which is kept in sync with schema.prisma
 * via pre-commit hook).
 *
 * Usage: npm run schema:init
 */

const BRANCH = "main";
const MIGRATIONS_FOLDER = ".xata/migrations";
const OPTIMIZED_FILE = path.join(process.cwd(), "xata-migrations.json");

interface Migration {
  id: string;
  [key: string]: any;
}

class XataSchemaInitializer {
  private migrations: Migration[] = [];

  async run() {
    console.log("🚀 Starting Xata Schema Initialization\n");

    try {
      // Step 1: Load optimized migrations
      this.loadOptimizedMigrations();

      // Step 2: Pull existing migrations and merge first migration ID
      this.pullExistingMigrations();

      // Step 3: Push to Xata
      this.pushToXata();

      console.log("\n✅ Schema initialization completed successfully!");
    } catch (error) {
      console.error("\n❌ Schema initialization failed:", error);
      process.exit(1);
    }
  }

  /**
   * Step 1: Load optimized migrations from file
   */
  private loadOptimizedMigrations() {
    console.log("📖 Step 1: Loading optimized migrations...");

    if (!fs.existsSync(OPTIMIZED_FILE)) {
      throw new Error(
        `Optimized migrations file not found: ${OPTIMIZED_FILE}\n` +
          `Run 'npm run sync:migrations' to generate it.`
      );
    }

    this.migrations = JSON.parse(fs.readFileSync(OPTIMIZED_FILE, "utf-8"));
    // Skip initial create schema migration to avoid conflicts
    this.migrations = this.migrations.slice(1);

    console.log(`   Loaded ${this.migrations.length} optimized migrations`);
  }

  /**
   * Step 2: Pull existing migrations from Xata and copy first migration
   */
  private pullExistingMigrations() {
    console.log("\n📥 Step 2: Pulling existing migrations from Xata...");

    // Clean up existing migrations folder
    if (fs.existsSync(MIGRATIONS_FOLDER)) {
      fs.rmSync(MIGRATIONS_FOLDER, { recursive: true, force: true });
    }

    // Pull existing migrations
    try {
      execSync(`xata pull ${BRANCH}`, { stdio: "pipe" });
    } catch (error) {
      console.log("   No existing migrations found (fresh database)");
      return;
    }
  }

  /**
   * Step 3: Push migrations to Xata
   */
  private pushToXata() {
    console.log("\n📤 Step 3: Pushing migrations to Xata...");

    if (this.migrations.length === 0) {
      console.log("   No migrations to push");
      return;
    }

    // Get unique migration IDs
    const uniqueMigrationIds = [
      ...new Set(this.migrations.map((item) => item.id)),
    ];

    // Append ledger file
    fs.appendFileSync(
      path.join(MIGRATIONS_FOLDER, ".ledger"),
      uniqueMigrationIds.join("\n") + "\n",
      { encoding: "utf-8" }
    );

    // Create migration files
    const startDate = new Date(
      Date.now() - this.migrations.length * 3000
    ).getTime();

    uniqueMigrationIds.forEach((migrationId, ix) => {
      const operations = this.migrations.filter(
        (item) => item.id === migrationId
      );

      const json = JSON.stringify(
        {
          done: true,
          migration: {
            name: migrationId,
            operations: operations.map((item: any) => ({
              ...item,
              id: undefined,
              name: undefined,
            })),
          },
          migrationType: "pgroll",
          name: migrationId,
          schema: "public",
          startedAt: new Date(startDate + ix * 3000).toISOString(),
        },
        null,
        2
      );

      fs.writeFileSync(
        path.join(MIGRATIONS_FOLDER, `${migrationId}.json`),
        json,
        { encoding: "utf-8" }
      );
    });

    console.log(`   Created ${uniqueMigrationIds.length} migration files`);

    // Push to Xata
    try {
      console.log(`   Pushing migrations to Xata branch: ${BRANCH}...`);
      execSync(`xata push ${BRANCH} -y`, { stdio: "inherit" });
    } catch (error) {
      console.error("Failed to push migrations to Xata");
      throw error;
    }

    // Clean up temporary migration files
    console.log("   Cleaning up temporary files...");
    if (fs.existsSync(MIGRATIONS_FOLDER)) {
      fs.rmSync(MIGRATIONS_FOLDER, { recursive: true, force: true });
    }
  }
}

// Main execution
async function main() {
  const initializer = new XataSchemaInitializer();
  await initializer.run();
}

main();
