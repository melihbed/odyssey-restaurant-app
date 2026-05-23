import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { eq, and, desc, inArray, sql } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'
import { HTTPException } from 'hono/http-exception'
import type { Env } from '../db'
import { createDb, orders, orderItems, menuItems, customers, orderStatusEnum } from '../db'
import { paginationSchema, createOrderSchema, orderActionSchema } from '../lib/validators'
import { applyAction, getValidActions } from '../lib/order-state-machine'

const app = new OpenAPIHono<{ Bindings: Env }>()

const orderSelectSchema = createSelectSchema(orders)
const orderItemSelectSchema = createSelectSchema(orderItems)
const errorSchema = z.object({ message: z.string() })

const orderWithDetailsSchema = orderSelectSchema.extend({
  items: z.array(orderItemSelectSchema),
  customer: createSelectSchema(customers).nullable(),
  validActions: z.array(z.string()),
})

app.openapi(
  createRoute({
    tags: ['orders'],
    method: 'get',
    path: '/',
    request: {
      query: paginationSchema.extend({
        status: z.enum(orderStatusEnum.enumValues).optional(),
        customerId: z.string().uuid().optional(),
        from: z.string().datetime().optional(),
        to: z.string().datetime().optional(),
      }),
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: z.object({
              data: z.array(orderSelectSchema.extend({
                itemCount: z.number(),
                customerName: z.string().nullable(),
              })),
              total: z.number(),
              page: z.number(),
              limit: z.number(),
            }),
          },
        },
        description: 'Paginated orders',
      },
    },
  }),
  async (c) => {
    const db = createDb(c.env)
    const { page, limit, status, customerId, from, to } = c.req.valid('query')
    const offset = (page - 1) * limit

    const conditions = []
    if (status) conditions.push(eq(orders.status, status))
    if (customerId) conditions.push(eq(orders.customerId, customerId))
    if (from) conditions.push(sql`${orders.createdAt} >= ${new Date(from)}`)
    if (to) conditions.push(sql`${orders.createdAt} <= ${new Date(to)}`)

    const where = conditions.length ? and(...conditions) : undefined

    const rows = await db
      .select({
        id: orders.id,
        customerId: orders.customerId,
        status: orders.status,
        subtotalCents: orders.subtotalCents,
        totalCents: orders.totalCents,
        notes: orders.notes,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        completedAt: orders.completedAt,
        itemCount: sql<number>`count(${orderItems.id})::int`,
        customerName: customers.name,
      })
      .from(orders)
      .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
      .leftJoin(customers, eq(customers.id, orders.customerId))
      .where(where)
      .groupBy(orders.id, customers.name)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset)

    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(where)

    return c.json({ data: rows, total: countRow?.count ?? 0, page, limit }, 200)
  }
)

app.openapi(
  createRoute({
    tags: ['orders'],
    method: 'post',
    path: '/',
    request: { body: { content: { 'application/json': { schema: createOrderSchema } } } },
    responses: {
      201: { content: { 'application/json': { schema: orderWithDetailsSchema } }, description: 'Created order' },
      400: { content: { 'application/json': { schema: errorSchema } }, description: 'Validation error' },
      422: { content: { 'application/json': { schema: errorSchema } }, description: 'Business rule violation' },
    },
  }),
  async (c) => {
    const db = createDb(c.env)
    const body = c.req.valid('json')

    // Validate customer exists if provided
    if (body.customerId) {
      const [customer] = await db.select().from(customers).where(eq(customers.id, body.customerId))
      if (!customer) throw new HTTPException(422, { message: 'Customer not found' })
    }

    // Fetch and validate all menu items
    const itemIds = body.items.map((i) => i.menuItemId)
    const dbItems = await db.select().from(menuItems).where(inArray(menuItems.id, itemIds))

    const itemMap = new Map(dbItems.map((i) => [i.id, i]))

    for (const reqItem of body.items) {
      const dbItem = itemMap.get(reqItem.menuItemId)
      if (!dbItem) throw new HTTPException(422, { message: `Menu item ${reqItem.menuItemId} not found` })
      if (!dbItem.isAvailable) throw new HTTPException(422, { message: `Menu item '${dbItem.name}' is not available` })
    }

    // Compute totals server-side
    let subtotalCents = 0
    const lineItems = body.items.map((reqItem) => {
      const dbItem = itemMap.get(reqItem.menuItemId)!
      const lineSubtotal = dbItem.priceCents * reqItem.quantity
      subtotalCents += lineSubtotal
      return {
        menuItemId: reqItem.menuItemId,
        name: dbItem.name,
        quantity: reqItem.quantity,
        unitPriceCents: dbItem.priceCents,
        subtotalCents: lineSubtotal,
      }
    })

    const totalCents = subtotalCents // no tax/fees for now

    // Insert order + items in sequence (Workers don't support transactions well with Neon HTTP)
    const [order] = await db
      .insert(orders)
      .values({
        customerId: body.customerId ?? null,
        subtotalCents,
        totalCents,
        notes: body.notes ?? null,
        status: 'pending',
      })
      .returning()

    const insertedItems = await db
      .insert(orderItems)
      .values(lineItems.map((item) => ({ ...item, orderId: order!.id })))
      .returning()

    let customer = null
    if (body.customerId) {
      const [c] = await db.select().from(customers).where(eq(customers.id, body.customerId))
      customer = c ?? null
    }

    return c.json(
      {
        ...order!,
        items: insertedItems,
        customer,
        validActions: getValidActions(order!.status),
      },
      201
    )
  }
)

app.openapi(
  createRoute({
    tags: ['orders'],
    method: 'get',
    path: '/{id}',
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
      200: { content: { 'application/json': { schema: orderWithDetailsSchema } }, description: 'Order detail' },
      404: { content: { 'application/json': { schema: errorSchema } }, description: 'Not found' },
    },
  }),
  async (c) => {
    const db = createDb(c.env)
    const { id } = c.req.valid('param')

    const [order] = await db.select().from(orders).where(eq(orders.id, id))
    if (!order) throw new HTTPException(404, { message: 'Order not found' })

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id))

    let customer = null
    if (order.customerId) {
      const [c] = await db.select().from(customers).where(eq(customers.id, order.customerId))
      customer = c ?? null
    }

    return c.json({ ...order, items, customer, validActions: getValidActions(order.status) }, 200)
  }
)

app.openapi(
  createRoute({
    tags: ['orders'],
    method: 'post',
    path: '/{id}/actions',
    request: {
      params: z.object({ id: z.string().uuid() }),
      body: { content: { 'application/json': { schema: orderActionSchema } } },
    },
    responses: {
      200: { content: { 'application/json': { schema: orderWithDetailsSchema } }, description: 'Updated order' },
      404: { content: { 'application/json': { schema: errorSchema } }, description: 'Not found' },
      422: { content: { 'application/json': { schema: errorSchema } }, description: 'Invalid transition' },
    },
  }),
  async (c) => {
    const db = createDb(c.env)
    const { id } = c.req.valid('param')
    const { action } = c.req.valid('json')

    const [order] = await db.select().from(orders).where(eq(orders.id, id))
    if (!order) throw new HTTPException(404, { message: 'Order not found' })

    const nextStatus = applyAction(order.status, action)

    const [updated] = await db
      .update(orders)
      .set({
        status: nextStatus,
        updatedAt: new Date(),
        completedAt: nextStatus === 'completed' ? new Date() : order.completedAt,
      })
      .where(eq(orders.id, id))
      .returning()

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id))

    let customer = null
    if (updated!.customerId) {
      const [cu] = await db.select().from(customers).where(eq(customers.id, updated!.customerId))
      customer = cu ?? null
    }

    return c.json({ ...updated!, items, customer, validActions: getValidActions(updated!.status) }, 200)
  }
)

export { app as ordersRouter }
