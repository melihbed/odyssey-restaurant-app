// The database connection
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export function createDb(envUrl?: string) {
  const url = envUrl || process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  const sql = neon(url);
  return drizzle(sql);
}

// export create db function that every route calls to get a DB connection
export type Db = ReturnType<typeof createDb>;
export * from "./schema";
