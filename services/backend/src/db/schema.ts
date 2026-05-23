import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core'

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'accepted',
  'rejected',
  'preparing',
  'ready',
  'completed',
  'cancelled',
])

export const menuCategories = pgTable('menu_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const menuItems = pgTable('menu_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  categoryId: uuid('category_id').references(() => menuCategories.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  description: text('description'),
  priceCents: integer('price_cents').notNull(),
  isAvailable: boolean('is_available').default(true).notNull(),
  prepTimeMins: integer('prep_time_mins').default(15).notNull(),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique(),
  phone: text('phone'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  status: orderStatusEnum('status').default('pending').notNull(),
  subtotalCents: integer('subtotal_cents').notNull(),
  totalCents: integer('total_cents').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
})

export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .references(() => orders.id, { onDelete: 'cascade' })
    .notNull(),
  menuItemId: uuid('menu_item_id').references(() => menuItems.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  quantity: integer('quantity').notNull(),
  unitPriceCents: integer('unit_price_cents').notNull(),
  subtotalCents: integer('subtotal_cents').notNull(),
})

export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type OrderStatus = (typeof orderStatusEnum.enumValues)[number]
export type MenuCategory = typeof menuCategories.$inferSelect
export type NewMenuCategory = typeof menuCategories.$inferInsert
export type MenuItem = typeof menuItems.$inferSelect
export type NewMenuItem = typeof menuItems.$inferInsert
export type Customer = typeof customers.$inferSelect
export type NewCustomer = typeof customers.$inferInsert
export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
export type OrderItem = typeof orderItems.$inferSelect
export type NewOrderItem = typeof orderItems.$inferInsert
