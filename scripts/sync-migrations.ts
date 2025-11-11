import { execSync } from "child_process";
import { randomBytes } from "crypto";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

/**
 * Pre-commit Hook: Sync Optimized Migrations
 *
 * This script ensures xata-migrations.json stays in sync with schema.prisma.
 * It runs automatically on git commit when schema.prisma is modified.
 *
 * Workflow:
 * 1. Pull latest migrations from Xata
 * 2. Optimize them (107 → 19 migrations)
 * 3. Update xata-migrations.json
 * 4. Add to git commit
 */

// Load environment variables
dotenv.config();

const MIGRATIONS_FOLDER = ".xata/migrations";
const OPTIMIZED_FILE = "xata-migrations.json";

/**
 * Extracts branch from DATABASE_URL
 */
function getBranchFromDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL not found in environment variables");
  }

  // Extract branch from URL format: /database:branch?params
  // First, remove query parameters by splitting on ?
  const urlWithoutParams = databaseUrl.split("?")[0];

  // Extract the path part after the last /
  const pathMatch = urlWithoutParams.match(/\/([^/]+)$/);

  if (!pathMatch || !pathMatch[1]) {
    throw new Error(
      "Could not extract database path from DATABASE_URL. Expected format: postgresql://.../<database>:<branch>?..."
    );
  }

  const databasePath = pathMatch[1];
  const parts = databasePath.split(":");

  if (parts.length < 2) {
    throw new Error(
      "Could not extract branch from DATABASE_URL. Expected format: postgresql://.../<database>:<branch>?..."
    );
  }

  return parts[1];
}

const BRANCH = getBranchFromDatabaseUrl();

interface Migration {
  id: string;
  [key: string]: any;
}

interface TableState {
  columns: Map<string, any>;
  metadata: {
    replicaIdentity: boolean;
    trigger: boolean;
  };
  sqlCreated?: boolean;
  originalSql?: string;
}

class MigrationSyncer {
  private migrations: Migration[] = [];
  private optimizedMigrations: Migration[] = [];
  private addToGit: boolean = false;

  constructor(addToGit: boolean = false) {
    this.addToGit = addToGit;
  }

  private generateMigrationId(): string {
    return `mig_${randomBytes(10).toString("hex")}`;
  }

  async run() {
    console.log("🔄 Syncing optimized migrations with Xata...\n");

    try {
      // Step 1: Pull from Xata
      this.pullFromXata();

      // Step 2: Optimize
      this.optimizeMigrations();

      // Step 3: Write optimized file
      this.writeOptimizedFile();

      // Step 4: Add to git (if requested)
      if (this.addToGit) {
        this.addToGitCommit();
      }

      console.log("\n✅ Optimized migrations synced successfully!");
    } catch (error) {
      console.error("\n❌ Failed to sync migrations:", error);
      process.exit(1);
    }
  }

  private pullFromXata() {
    console.log("📥 Step 1: Pulling migrations from Xata...");

    // Clean up existing migrations folder
    if (fs.existsSync(MIGRATIONS_FOLDER)) {
      fs.rmSync(MIGRATIONS_FOLDER, { recursive: true, force: true });
    }

    // Pull migrations
    try {
      execSync(`xata pull ${BRANCH}`, { stdio: "pipe" });
    } catch (error) {
      console.error(
        "Failed to pull from Xata. Make sure you have valid credentials."
      );
      throw error;
    }

    // Read migrations
    const ledgerPath = path.join(MIGRATIONS_FOLDER, ".ledger");
    if (!fs.existsSync(ledgerPath)) {
      console.log("⚠️  No migrations found in Xata");
      return;
    }

    const ledger = fs
      .readFileSync(ledgerPath, "utf-8")
      .split("\n")
      .filter((line) => !!line.trim());

    this.migrations = ledger.reduce((acc, line) => {
      const migrationPath = path.join(MIGRATIONS_FOLDER, `${line}.json`);
      const json = JSON.parse(fs.readFileSync(migrationPath, "utf-8")) as any;

      return [
        ...acc,
        ...json.migration.operations.map((item: any) => ({
          ...item,
          id: json.name,
        })),
      ];
    }, [] as Migration[]);

    console.log(`   Found ${this.migrations.length} migrations`);
  }

  private optimizeMigrations() {
    console.log("\n🔧 Step 2: Optimizing migrations...");

    if (this.migrations.length === 0) {
      console.log("   No migrations to optimize");
      return;
    }

    const operations = this.analyzeMigrations();
    this.generateOptimizedMigrations(operations);

    const reduction = (
      (1 - this.optimizedMigrations.length / this.migrations.length) *
      100
    ).toFixed(1);

    console.log(`   Original: ${this.migrations.length} migrations`);
    console.log(`   Optimized: ${this.optimizedMigrations.length} migrations`);
    console.log(`   Reduction: ${reduction}%`);
  }

  private analyzeMigrations() {
    const operations = {
      schemas: new Set<string>(),
      tables: new Map<string, TableState>(),
    };

    for (const migration of this.migrations) {
      // Track schema creation
      if (migration.sql?.up?.includes("CREATE SCHEMA")) {
        const match = migration.sql.up.match(/CREATE SCHEMA "([^"]+)"/);
        if (match) {
          operations.schemas.add(match[1]);
        }
      }

      // Track table creation
      if (migration.create_table) {
        const tableName = migration.create_table.name;
        operations.tables.set(tableName, {
          columns: new Map(),
          metadata: {
            replicaIdentity: false,
            trigger: false,
          },
        });

        for (const col of migration.create_table.columns) {
          operations.tables.get(tableName)!.columns.set(col.name, { ...col });
        }
      }

      // Track raw SQL table creation
      if (migration.sql?.up?.includes("CREATE TABLE")) {
        const match = migration.sql.up.match(/CREATE TABLE (\w+)/);
        if (match) {
          const tableName = match[1];
          if (!operations.tables.has(tableName)) {
            operations.tables.set(tableName, {
              columns: new Map(),
              metadata: {
                replicaIdentity: false,
                trigger: false,
              },
              sqlCreated: true,
              originalSql: migration.sql.up,
            });
          }
        }
      }

      // Track table drops
      if (migration.drop_table) {
        operations.tables.delete(migration.drop_table.name);
      }

      // Track column additions
      if (migration.add_column) {
        const table = operations.tables.get(migration.add_column.table);
        if (table) {
          table.columns.set(migration.add_column.column.name, {
            ...migration.add_column.column,
            up: migration.add_column.up,
          });
        }
      }

      // Track column drops
      if (migration.drop_column) {
        const table = operations.tables.get(migration.drop_column.table);
        if (table) {
          table.columns.delete(migration.drop_column.column);
        }
      }

      // Track column alterations
      if (migration.alter_column) {
        const table = operations.tables.get(migration.alter_column.table);
        if (table) {
          const oldName = migration.alter_column.column;
          const newName = migration.alter_column.name;

          if (newName && newName !== oldName) {
            const col = table.columns.get(oldName);
            if (col) {
              table.columns.delete(oldName);
              table.columns.set(newName, { ...col, name: newName });
            }
          } else {
            const col = table.columns.get(oldName);
            if (col) {
              if (migration.alter_column.nullable !== undefined) {
                col.nullable = migration.alter_column.nullable;
              }
              if (migration.alter_column.unique !== undefined) {
                col.unique = true;
              }
              if (migration.alter_column.type !== undefined) {
                col.type = migration.alter_column.type;
              }
              if (migration.alter_column.default !== undefined) {
                col.default = migration.alter_column.default;
              }
              if (migration.alter_column.up !== undefined) {
                col.up = migration.alter_column.up;
              }
              if (migration.alter_column.down !== undefined) {
                col.down = migration.alter_column.down;
              }
            }
          }
        }
      }

      // Track replica identity
      if (
        migration.sql?.up?.includes("REPLICA IDENTITY") ||
        migration.set_replica_identity
      ) {
        const tableName =
          migration.set_replica_identity?.table ||
          this.extractTableName(migration.sql?.up);
        if (tableName && operations.tables.has(tableName)) {
          operations.tables.get(tableName)!.metadata.replicaIdentity = true;
        }
      }

      // Track triggers
      if (migration.sql?.up?.includes("CREATE TRIGGER")) {
        const tableName = this.extractTableName(migration.sql.up);
        if (tableName && operations.tables.has(tableName)) {
          operations.tables.get(tableName)!.metadata.trigger = true;
        }
      }
    }

    return operations;
  }

  private generateOptimizedMigrations(operations: any) {
    // Create schemas
    for (const schema of operations.schemas) {
      this.optimizedMigrations.push({
        sql: {
          up: `CREATE SCHEMA "${schema}";`,
        },
        id: this.generateMigrationId(),
      });
    }

    // Create tables
    for (const [tableName, tableData] of operations.tables) {
      if (tableData.sqlCreated && tableData.originalSql) {
        this.optimizedMigrations.push({
          sql: {
            up: tableData.originalSql,
          },
          id: this.generateMigrationId(),
        });
      } else {
        const columns: any[] = [];
        for (const colData of tableData.columns.values()) {
          columns.push(this.normalizeColumn(colData));
        }

        this.optimizedMigrations.push({
          create_table: {
            name: tableName,
            columns: columns,
          },
          id: this.generateMigrationId(),
        });
      }

      // Add replica identity
      if (tableData.metadata.replicaIdentity) {
        this.optimizedMigrations.push({
          sql: {
            up: `ALTER TABLE "${tableName}" REPLICA IDENTITY FULL`,
            onComplete: true,
          },
          id: this.generateMigrationId(),
        });
      }

      // Add trigger
      if (tableData.metadata.trigger) {
        this.optimizedMigrations.push({
          sql: {
            up: `CREATE TRIGGER xata_maintain_metadata_trigger_pgroll\n  BEFORE INSERT OR UPDATE\n  ON "${tableName}"\n  FOR EACH ROW\n  EXECUTE FUNCTION xata_private.maintain_metadata_trigger_pgroll()`,
            onComplete: true,
          },
          id: this.generateMigrationId(),
        });
      }
    }
  }

  private normalizeColumn(colData: any): any {
    const normalized: any = {
      name: colData.name,
      type: colData.type,
    };

    if (colData.nullable !== undefined) {
      normalized.nullable = colData.nullable;
    }
    if (colData.unique !== undefined) {
      normalized.unique = colData.unique;
    }
    if (colData.default !== undefined) {
      normalized.default = colData.default;
    }
    if (colData.check !== undefined) {
      normalized.check = colData.check;
    }
    if (colData.comment !== undefined) {
      normalized.comment = colData.comment;
    }
    if (colData.references !== undefined) {
      const ref: any = {
        name: colData.references.name,
        table: colData.references.table,
        column: colData.references.column,
      };
      if (colData.references.on_delete) {
        ref.on_delete = colData.references.on_delete;
      }
      normalized.references = ref;
    }

    return normalized;
  }

  private extractTableName(sql: string | undefined): string | null {
    if (!sql) return null;

    const alterMatch = sql.match(/ALTER TABLE "([^"]+)"/);
    if (alterMatch) return alterMatch[1];

    const createTriggerMatch = sql.match(/ON "([^"]+)"/);
    if (createTriggerMatch) return createTriggerMatch[1];

    return null;
  }

  private writeOptimizedFile() {
    console.log("\n📝 Step 3: Writing optimized migrations file...");

    const outputPath = path.join(process.cwd(), OPTIMIZED_FILE);
    fs.writeFileSync(
      outputPath,
      JSON.stringify(this.optimizedMigrations, null, 2)
    );

    console.log(`   Written to: ${OPTIMIZED_FILE}`);
  }

  private addToGitCommit() {
    console.log("\n➕ Step 4: Adding to git commit...");

    try {
      execSync(`git add ${OPTIMIZED_FILE}`, { stdio: "pipe" });
      console.log(`   Added ${OPTIMIZED_FILE} to commit`);
    } catch (error) {
      console.warn(
        "   Could not add to git (this is okay if not in a git repo)"
      );
    }

    // Clean up migrations folder
    if (fs.existsSync(MIGRATIONS_FOLDER)) {
      fs.rmSync(MIGRATIONS_FOLDER, { recursive: true, force: true });
    }
  }
}

// Main execution
async function main() {
  const addToGit = process.argv.includes("--add-to-git");
  const syncer = new MigrationSyncer(addToGit);
  await syncer.run();
}

main();
