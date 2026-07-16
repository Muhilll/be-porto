import "dotenv/config";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { db } from "./connection";

async function runMigrations() {
  try {
    console.log("Running migrations...");
    await migrate(db, {
      migrationsFolder: "./drizzle",
    });
    console.log("Migrations completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigrations();
