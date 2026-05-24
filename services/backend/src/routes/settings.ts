import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { inArray } from "drizzle-orm";
import type { Env } from "../db";
import { createDb, settings } from "../db";
import { settingsSchema } from "../lib/validators";

const app = new OpenAPIHono<{ Bindings: Env }>();

const settingsResponseSchema = z.object({
  prepTimeMins: z.number(),
  autoAccept: z.boolean(),
  isOpen: z.boolean(),
  openingHours: z.record(z.any()),
});

const DEFAULT_SETTINGS = {
  prepTimeMins: 15,
  autoAccept: false,
  isOpen: true,
  openingHours: {
    monday: { open: "09:00", close: "22:00", closed: false },
    tuesday: { open: "09:00", close: "22:00", closed: false },
    wednesday: { open: "09:00", close: "22:00", closed: false },
    thursday: { open: "09:00", close: "22:00", closed: false },
    friday: { open: "09:00", close: "23:00", closed: false },
    saturday: { open: "10:00", close: "23:00", closed: false },
    sunday: { open: "10:00", close: "21:00", closed: false },
  },
};

app.openapi(
  createRoute({
    tags: ["settings"],
    method: "get",
    path: "/",
    responses: {
      200: {
        content: { "application/json": { schema: settingsResponseSchema } },
        description: "Current settings",
      },
    },
  }),
  async (c) => {
    const db = createDb(c.env.DATABASE_URL);
    const keys = Object.keys(DEFAULT_SETTINGS);
    const rows = await db
      .select()
      .from(settings)
      .where(inArray(settings.key, keys));

    const result: Record<string, unknown> = { ...DEFAULT_SETTINGS };
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return c.json(result as z.infer<typeof settingsResponseSchema>, 200);
  }
);

app.openapi(
  createRoute({
    tags: ["settings"],
    method: "put",
    path: "/",
    request: {
      body: { content: { "application/json": { schema: settingsSchema } } },
    },
    responses: {
      200: {
        content: { "application/json": { schema: settingsResponseSchema } },
        description: "Updated settings",
      },
    },
  }),
  async (c) => {
    const db = createDb(c.env.DATABASE_URL);
    const body = c.req.valid("json");

    const entries = Object.entries(body).filter(([, v]) => v !== undefined);
    if (entries.length > 0) {
      await Promise.all(
        entries.map(([key, value]) =>
          db
            .insert(settings)
            .values({
              key,
              value: value as unknown as Record<string, unknown>,
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: settings.key,
              set: {
                value: value as unknown as Record<string, unknown>,
                updatedAt: new Date(),
              },
            })
        )
      );
    }

    // Return full current settings
    const keys = Object.keys(DEFAULT_SETTINGS);
    const rows = await db
      .select()
      .from(settings)
      .where(inArray(settings.key, keys));
    const result: Record<string, unknown> = { ...DEFAULT_SETTINGS };
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return c.json(result as z.infer<typeof settingsResponseSchema>);
  }
);

export { app as settingsRouter };
