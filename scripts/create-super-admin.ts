import { Role } from "#/src/lib/utils/roles";
import authService from "#/src/modules/auth/auth.service";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

dotenv.config();

const prisma = new PrismaClient();

interface ScriptArgs {
  email: string;
  password: string;
  name: string;
}

function parseArgs(): ScriptArgs {
  return yargs(hideBin(process.argv))
    .option("email", {
      alias: "e",
      type: "string",
      demandOption: true,
    })
    .option("password", {
      alias: "p",
      type: "string",
      demandOption: true,
    })
    .option("name", {
      alias: "n",
      type: "string",
      default: "Super Admin",
    })
    .example(
      "npm run create:superadmin -- --email admin@example.com --password securepass123",
      'Create super admin with default name "Super Admin"'
    )
    .example(
      'npm run create:superadmin -- -e admin@example.com -p securepass123 -n "John Doe"',
      "Create super admin with custom name using short aliases"
    )
    .help()
    .alias("help", "h")
    .parseSync() as ScriptArgs;
}

async function createSuperAdmin() {
  try {
    const args = parseArgs();

    console.log("Creating super admin user...");
    console.log(`Email: ${args.email}`);
    console.log(`Name: ${args.name}`);

    // Hash the password
    const password_hash = await authService.hashPassword(args.password);

    // Create the super admin user
    const user = await prisma.users.create({
      data: {
        email: args.email,
        name: args.name,
        password_hash,
        role: Role.SUPER_ADMIN,
        email_verified: true,
        fcm_tokens: [],
      },
    });

    console.log("\n✓ Super admin user created successfully!");
    console.log(`User ID: ${user.id}`);
  } catch (error) {
    console.error("Error creating super admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
