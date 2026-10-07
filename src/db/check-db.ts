import "dotenv/config";
import { db } from "./connection";
import { sql } from "drizzle-orm";

async function main() {
  try {
    const [tables] = await db.execute(sql`SHOW TABLES FROM porto_db;`);
    console.log("=== TABLES IN porto_db ===");
    console.log(tables);
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}

main();
