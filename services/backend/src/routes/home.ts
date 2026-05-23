import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { eq, sql, gte, and } from 'drizzle-orm'
import type { Env } from '../db'
import { createDb, orders, orderItems, menuItems } from '../db'

const app = new OpenAPIHono<{ Bindings: Env }>()

const statsSchema = z.object({
  totalOrdersToday: z.number(),
  revenueTodayCents: z.number(),
  pendingOrders: z.number(),
  avgPrepTimeMins: z.number(),
  totalOrdersAllTime: z.number(),
  revenueAllTimeCents: z.number(),
  popularItems: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      orderCount: z.number(),
      priceCents: z.number(),
    })
  ),
  recentOrders: z.array(z.any()),
  ordersByStatus: z.record(z.number()),
})

app.openapi(
  createRoute({
    tags: ['home'],
    method: 'get',
    path: '/stats',
    responses: {
      200: { content: { 'application/json': { schema: statsSchema } }, description: 'Dashboard KPIs' },
    },
  }),
  async (c) => {
    const db = createDb(c.env)

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const [todayStats] = await db
      .select({
        totalOrders: sql<number>`count(*)::int`,
        revenue: sql<number>`coalesce(sum(${orders.totalCents}), 0)::int`,
      })
      .from(orders)
      .where(gte(orders.createdAt, todayStart))

    const [pendingCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(eq(orders.status, 'pending'))

    const [allTimeStats] = await db
      .select({
        totalOrders: sql<number>`count(*)::int`,
        revenue: sql<number>`coalesce(sum(${orders.totalCents}), 0)::int`,
      })
      .from(orders)

    const popularItems = await db
      .select({
        id: menuItems.id,
        name: menuItems.name,
        priceCents: menuItems.priceCents,
        orderCount: sql<number>`count(${orderItems.id})::int`,
      })
      .from(orderItems)
      .innerJoin(menuItems, eq(menuItems.id, orderItems.menuItemId))
      .groupBy(menuItems.id)
      .orderBy(sql`count(${orderItems.id}) desc`)
      .limit(5)

    const recentOrders = await db
      .select()
      .from(orders)
      .orderBy(sql`${orders.createdAt} desc`)
      .limit(10)

    const statusCounts = await db
      .select({
        status: orders.status,
        count: sql<number>`count(*)::int`,
      })
      .from(orders)
      .groupBy(orders.status)

    const ordersByStatus: Record<string, number> = {}
    for (const row of statusCounts) {
      ordersByStatus[row.status] = row.count
    }

    return c.json({
      totalOrdersToday: todayStats?.totalOrders ?? 0,
      revenueTodayCents: todayStats?.revenue ?? 0,
      pendingOrders: pendingCount?.count ?? 0,
      avgPrepTimeMins: 18,
      totalOrdersAllTime: allTimeStats?.totalOrders ?? 0,
      revenueAllTimeCents: allTimeStats?.revenue ?? 0,
      popularItems,
      recentOrders,
      ordersByStatus,
    })
  }
)

export { app as homeRouter }
