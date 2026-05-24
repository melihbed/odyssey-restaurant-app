import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export function createDb(url?: string) {
  const rawUrl = url || process.env.DATABASE_URL;

  if (!rawUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  // Neon's HTTP driver does not support channel_binding — strip it so the
  // URL passes neon()'s validation even when Postgres clients append it.
  const parsed = new URL(rawUrl);
  parsed.searchParams.delete("channel_binding");
  const dbUrl = parsed.toString();

  return drizzle(neon(dbUrl), { schema });
}

export type Db = ReturnType<typeof createDb>;
export type Env = { DATABASE_URL: string };
export * from "./schema";
