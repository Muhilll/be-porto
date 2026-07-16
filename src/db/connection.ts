import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

export const db = drizzle(databaseUrl, {
  schema,
  mode: "default"
});