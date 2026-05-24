import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { eq, ilike, desc, asc, sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { HTTPException } from "hono/http-exception";
import type { Env } from "../db";
import { createDb, customers, orders } from "../db";
import { paginationSchema } from "../lib/validators";

// Creates a mini-router just for customer stuff
const app = new OpenAPIHono<{ Bindings: Env }>();

const customerSelectSchema = createSelectSchema(customers);
const customerInsertSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
const customerUpdateSchema = customerInsertSchema.partial();
const errorSchema = z.object({ message: z.string() });

const customerWithStatsSchema = customerSelectSchema.extend({
  orderCount: z.number(),
  totalSpentCents: z.number(),
  lastOrderAt: z.string().nullable(),
});

app.openapi(
  createRoute({
    tags: ["customers"],
    method: "get",
    path: "/",
    request: {
      query: paginationSchema.extend({
        search: z.string().optional(),
        sortBy: z
          .enum(["name", "totalSpent", "orderCount", "lastOrder"])
          .optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({
              data: z.array(customerWithStatsSchema),
              total: z.number(),
              page: z.number(),
              limit: z.number(),
            }),
          },
        },
        description: "Paginated customer list",
      },
    },
  }),
  async (c) => {
    const db = createDb(c.env.DATABASE_URL);
    const { page, limit, search, sortBy, sortOrder } = c.req.valid("query");
    const offset = (page - 1) * limit;

    const sortCol =
      sortBy === "totalSpent"
        ? sql`coalesce(sum(${orders.totalCents}), 0)`
        : sortBy === "orderCount"
        ? sql`count(${orders.id})`
        : sortBy === "lastOrder"
        ? sql`max(${orders.createdAt})`
        : sortBy === "name"
        ? customers.name
        : customers.createdAt;

    const orderExpr = sortOrder === "asc" ? asc(sortCol) : desc(sortCol);
    const whereExpr = search ? ilike(customers.name, `%${search}%`) : undefined;

    const fields = {
      id: customers.id,
      name: customers.name,
      email: customers.email,
      phone: customers.phone,
      notes: customers.notes,
      createdAt: customers.createdAt,
      updatedAt: customers.updatedAt,
      orderCount: sql<number>`count(${orders.id})::int`,
      totalSpentCents: sql<number>`coalesce(sum(${orders.totalCents}), 0)::int`,
      lastOrderAt: sql<string | null>`max(${orders.createdAt})::text`,
    };

    const rows = await db
      .select(fields)
      .from(customers)
      .leftJoin(orders, eq(orders.customerId, customers.id))
      .where(whereExpr)
      .groupBy(customers.id)
      .orderBy(orderExpr)
      .limit(limit)
      .offset(offset);

    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(customers)
      .where(whereExpr);

    return c.json(
      { data: rows, total: countRow?.count ?? 0, page, limit },
      200
    );
  }
);

app.openapi(
  createRoute({
    tags: ["customers"],
    method: "post",
    path: "/",
    request: {
      body: {
        content: { "application/json": { schema: customerInsertSchema } },
      },
    },
    responses: {
      201: {
        content: { "application/json": { schema: customerSelectSchema } },
        description: "Created customer",
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
    const [row] = await db.insert(customers).values(body).returning();
    return c.json(row!, 201);
  }
);

app.openapi(
  createRoute({
    tags: ["customers"],
    method: "get",
    path: "/{id}",
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: customerSelectSchema.extend({
              orderCount: z.number(),
              totalSpentCents: z.number(),
              lastOrderAt: z.string().nullable(),
              recentOrders: z.array(z.any()),
            }),
          },
        },
        description: "Customer detail",
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
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, id));
    if (!customer)
      throw new HTTPException(404, { message: "Customer not found" });

    const [stats] = await db
      .select({
        orderCount: sql<number>`count(${orders.id})::int`,
        totalSpentCents: sql<number>`coalesce(sum(${orders.totalCents}), 0)::int`,
        lastOrderAt: sql<string | null>`max(${orders.createdAt})::text`,
      })
      .from(orders)
      .where(eq(orders.customerId, id));

    const recentOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, id))
      .orderBy(desc(orders.createdAt))
      .limit(10);

    return c.json(
      {
        ...customer,
        orderCount: stats?.orderCount ?? 0,
        totalSpentCents: stats?.totalSpentCents ?? 0,
        lastOrderAt: stats?.lastOrderAt ?? null,
        recentOrders,
      },
      200
    );
  }
);

app.openapi(
  createRoute({
    tags: ["customers"],
    method: "put",
    path: "/{id}",
    request: {
      params: z.object({ id: z.string().uuid() }),
      body: {
        content: { "application/json": { schema: customerUpdateSchema } },
      },
    },
    responses: {
      200: {
        content: { "application/json": { schema: customerSelectSchema } },
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
      .update(customers)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    if (!row) throw new HTTPException(404, { message: "Customer not found" });
    return c.json(row, 200);
  }
);

export { app as customersRouter };
