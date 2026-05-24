import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { eq, and, asc } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { HTTPException } from "hono/http-exception";
import type { Env } from "../db";
import { createDb, menuCategories, menuItems } from "../db";

const app = new OpenAPIHono<{ Bindings: Env }>();

// ─── Schemas ─────────────────────────────────────────────────────────────────

const categorySelectSchema = createSelectSchema(menuCategories);
const categoryInsertSchema = createInsertSchema(menuCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
const categoryUpdateSchema = categoryInsertSchema.partial();

const menuItemSelectSchema = createSelectSchema(menuItems);
const menuItemInsertSchema = createInsertSchema(menuItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
const menuItemUpdateSchema = menuItemInsertSchema.partial();

const errorSchema = z.object({ message: z.string() });

// ─── Category Routes ─────────────────────────────────────────────────────────

// Each endpoint is defined with a full Zod schema for req and res
app.openapi(
  createRoute({
    tags: ["menu"],
    method: "get",
    path: "/categories",
    responses: {
      200: {
        content: {
          "application/json": { schema: z.array(categorySelectSchema) },
        },
        description: "List categories",
      },
    },
  }),
  async (c) => {
    const db = createDb(c.env.DATABASE_URL);
    const rows = await db
      .select()
      .from(menuCategories)
      .orderBy(asc(menuCategories.sortOrder));
    return c.json(rows, 200);
  }
);

app.openapi(
  createRoute({
    tags: ["menu"],
    method: "post",
    path: "/categories",
    request: {
      body: {
        content: { "application/json": { schema: categoryInsertSchema } },
      },
    },
    responses: {
      201: {
        content: { "application/json": { schema: categorySelectSchema } },
        description: "Created category",
      },
      400: {
        content: { "application/json": { schema: errorSchema } },
        description: "Validation error",
      },
    },
  }),
  async (c) => {
    const db = createDb(c.env.DATABASE_URL);
    const body = c.req.valid("json");
    const [row] = await db.insert(menuCategories).values(body).returning();
    return c.json(row!, 201);
  }
);

app.openapi(
  createRoute({
    tags: ["menu"],
    method: "get",
    path: "/categories/{id}",
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
      200: {
        content: { "application/json": { schema: categorySelectSchema } },
        description: "Category",
      },
      404: {
        content: { "application/json": { schema: errorSchema } },
        description: "Not found",
      },
    },
  }),
  async (c) => {
    const db = createDb(c.env.DATABASE_URL);
    const { id } = c.req.valid("param");
    const [row] = await db
      .select()
      .from(menuCategories)
      .where(eq(menuCategories.id, id));
    if (!row) throw new HTTPException(404, { message: "Category not found" });
    return c.json(row, 200);
  }
);

app.openapi(
  createRoute({
    tags: ["menu"],
    method: "put",
    path: "/categories/{id}",
    request: {
      params: z.object({ id: z.string().uuid() }),
      body: {
        content: { "application/json": { schema: categoryUpdateSchema } },
      },
    },
    responses: {
      200: {
        content: { "application/json": { schema: categorySelectSchema } },
        description: "Updated",
      },
      404: {
        content: { "application/json": { schema: errorSchema } },
        description: "Not found",
      },
    },
  }),
  async (c) => {
    const db = createDb(c.env.DATABASE_URL);
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const [row] = await db
      .update(menuCategories)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(menuCategories.id, id))
      .returning();
    if (!row) throw new HTTPException(404, { message: "Category not found" });
    return c.json(row, 200);
  }
);

app.openapi(
  createRoute({
    tags: ["menu"],
    method: "delete",
    path: "/categories/{id}",
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
      200: {
        content: {
          "application/json": { schema: z.object({ success: z.boolean() }) },
        },
        description: "Deleted",
      },
      404: {
        content: { "application/json": { schema: errorSchema } },
        description: "Not found",
      },
    },
  }),
  async (c) => {
    const db = createDb(c.env.DATABASE_URL);
    const { id } = c.req.valid("param");
    const [row] = await db
      .delete(menuCategories)
      .where(eq(menuCategories.id, id))
      .returning();
    if (!row) throw new HTTPException(404, { message: "Category not found" });
    return c.json({ success: true }, 200);
  }
);

// ─── Menu Item Routes ─────────────────────────────────────────────────────────

app.openapi(
  createRoute({
    tags: ["menu"],
    method: "get",
    path: "/items",
    request: {
      query: z.object({
        categoryId: z.string().uuid().optional(),
        available: z.enum(["true", "false"]).optional(),
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": { schema: z.array(menuItemSelectSchema) },
        },
        description: "List items",
      },
    },
  }),
  async (c) => {
    const db = createDb(c.env.DATABASE_URL);
    const { categoryId, available } = c.req.valid("query");
    const conditions = [];
    if (categoryId) conditions.push(eq(menuItems.categoryId, categoryId));
    if (available === "true") conditions.push(eq(menuItems.isAvailable, true));
    if (available === "false")
      conditions.push(eq(menuItems.isAvailable, false));
    const rows = await db
      .select()
      .from(menuItems)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(menuItems.name));
    return c.json(rows);
  }
);

app.openapi(
  createRoute({
    tags: ["menu"],
    method: "post",
    path: "/items",
    request: {
      body: {
        content: { "application/json": { schema: menuItemInsertSchema } },
      },
    },
    responses: {
      201: {
        content: { "application/json": { schema: menuItemSelectSchema } },
        description: "Created",
      },
      400: {
        content: { "application/json": { schema: errorSchema } },
        description: "Validation error",
      },
    },
  }),
  async (c) => {
    const db = createDb(c.env.DATABASE_URL);
    const body = c.req.valid("json");
    const [row] = await db.insert(menuItems).values(body).returning();
    return c.json(row!, 201);
  }
);

app.openapi(
  createRoute({
    tags: ["menu"],
    method: "get",
    path: "/items/{id}",
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
      200: {
        content: { "application/json": { schema: menuItemSelectSchema } },
        description: "Item",
      },
      404: {
        content: { "application/json": { schema: errorSchema } },
        description: "Not found",
      },
    },
  }),
  async (c) => {
    const db = createDb(c.env.DATABASE_URL);
    const { id } = c.req.valid("param");
    const [row] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    if (!row) throw new HTTPException(404, { message: "Menu item not found" });
    return c.json(row, 200);
  }
);

app.openapi(
  createRoute({
    tags: ["menu"],
    method: "put",
    path: "/items/{id}",
    request: {
      params: z.object({ id: z.string().uuid() }),
      body: {
        content: { "application/json": { schema: menuItemUpdateSchema } },
      },
    },
    responses: {
      200: {
        content: { "application/json": { schema: menuItemSelectSchema } },
        description: "Updated",
      },
      404: {
        content: { "application/json": { schema: errorSchema } },
        description: "Not found",
      },
    },
  }),
  async (c) => {
    const db = createDb(c.env.DATABASE_URL);
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const [row] = await db
      .update(menuItems)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(menuItems.id, id))
      .returning();
    if (!row) throw new HTTPException(404, { message: "Menu item not found" });
    return c.json(row, 200);
  }
);

app.openapi(
  createRoute({
    tags: ["menu"],
    method: "patch",
    path: "/items/{id}/availability",
    request: {
      params: z.object({ id: z.string().uuid() }),
      body: {
        content: {
          "application/json": {
            schema: z.object({ isAvailable: z.boolean() }),
          },
        },
      },
    },
    responses: {
      200: {
        content: { "application/json": { schema: menuItemSelectSchema } },
        description: "Updated availability",
      },
      404: {
        content: { "application/json": { schema: errorSchema } },
        description: "Not found",
      },
    },
  }),
  async (c) => {
    const db = createDb(c.env.DATABASE_URL);
    const { id } = c.req.valid("param");
    const { isAvailable } = c.req.valid("json");
    const [row] = await db
      .update(menuItems)
      .set({ isAvailable, updatedAt: new Date() })
      .where(eq(menuItems.id, id))
      .returning();
    if (!row) throw new HTTPException(404, { message: "Menu item not found" });
    return c.json(row, 200);
  }
);

app.openapi(
  createRoute({
    tags: ["menu"],
    method: "delete",
    path: "/items/{id}",
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
      200: {
        content: {
          "application/json": { schema: z.object({ success: z.boolean() }) },
        },
        description: "Deleted",
      },
      404: {
        content: { "application/json": { schema: errorSchema } },
        description: "Not found",
      },
    },
  }),
  async (c) => {
    const db = createDb(c.env.DATABASE_URL);
    const { id } = c.req.valid("param");
    const [row] = await db
      .delete(menuItems)
      .where(eq(menuItems.id, id))
      .returning();
    if (!row) throw new HTTPException(404, { message: "Menu item not found" });
    return c.json({ success: true }, 200);
  }
);

export { app as menuRouter };
