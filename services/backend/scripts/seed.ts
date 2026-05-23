import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { config } from 'dotenv'
import * as schema from '../src/db/schema'

config({ path: '.dev.vars' })

const sqlClient = neon(process.env.DATABASE_URL!)
const db = drizzle(sqlClient, { schema })

console.log('Seeding database...')

// Categories
const [appetizers] = await db
  .insert(schema.menuCategories)
  .values({ name: 'Appetizers', description: 'Start your meal right', sortOrder: 1 })
  .returning()

const [mains] = await db
  .insert(schema.menuCategories)
  .values({ name: 'Main Courses', description: 'Hearty and satisfying', sortOrder: 2 })
  .returning()

const [desserts] = await db
  .insert(schema.menuCategories)
  .values({ name: 'Desserts', description: 'Sweet endings', sortOrder: 3 })
  .returning()

const [drinks] = await db
  .insert(schema.menuCategories)
  .values({ name: 'Drinks', description: 'Refreshing beverages', sortOrder: 4 })
  .returning()

console.log('✓ Categories seeded')

// Menu Items
const menuItemsData = [
  { categoryId: appetizers!.id, name: 'Bruschetta', description: 'Toasted bread with tomatoes, basil, and garlic', priceCents: 895, prepTimeMins: 8 },
  { categoryId: appetizers!.id, name: 'Calamari', description: 'Crispy fried squid with marinara sauce', priceCents: 1295, prepTimeMins: 12 },
  { categoryId: appetizers!.id, name: 'Caesar Salad', description: 'Romaine, parmesan, croutons, house dressing', priceCents: 1095, prepTimeMins: 8 },
  { categoryId: mains!.id, name: 'Ribeye Steak', description: '12oz prime ribeye, truffle butter, seasonal vegetables', priceCents: 4500, prepTimeMins: 25 },
  { categoryId: mains!.id, name: 'Grilled Salmon', description: 'Atlantic salmon, lemon caper sauce, rice pilaf', priceCents: 3200, prepTimeMins: 20 },
  { categoryId: mains!.id, name: 'Mushroom Risotto', description: 'Arborio rice, wild mushrooms, parmesan, truffle oil', priceCents: 2400, prepTimeMins: 22 },
  { categoryId: mains!.id, name: 'Chicken Parmesan', description: 'Breaded chicken, marinara, mozzarella, spaghetti', priceCents: 2200, prepTimeMins: 18 },
  { categoryId: mains!.id, name: 'Margherita Pizza', description: 'San Marzano tomatoes, fresh mozzarella, basil', priceCents: 1895, prepTimeMins: 15 },
  { categoryId: desserts!.id, name: 'Tiramisu', description: 'Classic Italian dessert with espresso and mascarpone', priceCents: 895, prepTimeMins: 5 },
  { categoryId: desserts!.id, name: 'Creme Brulee', description: 'Vanilla custard with caramelized sugar crust', priceCents: 795, prepTimeMins: 5, isAvailable: false },
  { categoryId: drinks!.id, name: 'Sparkling Water', description: '750ml San Pellegrino', priceCents: 495, prepTimeMins: 2 },
  { categoryId: drinks!.id, name: 'House Wine (Glass)', description: 'Red or white, ask your server', priceCents: 1200, prepTimeMins: 3 },
  { categoryId: drinks!.id, name: 'Espresso', description: 'Double shot', priceCents: 395, prepTimeMins: 3 },
  { categoryId: drinks!.id, name: 'Craft Lemonade', description: 'Fresh squeezed with mint', priceCents: 595, prepTimeMins: 4 },
]

const insertedItems = await db.insert(schema.menuItems).values(menuItemsData).returning()
console.log(`✓ ${insertedItems.length} menu items seeded`)

// Customers
const customersData = [
  { name: 'Alice Johnson', email: 'alice@example.com', phone: '+1-555-0101' },
  { name: 'Bob Martinez', email: 'bob@example.com', phone: '+1-555-0102' },
  { name: 'Carol White', email: 'carol@example.com', phone: '+1-555-0103' },
  { name: 'David Chen', email: 'david@example.com', phone: '+1-555-0104' },
  { name: 'Emma Wilson', email: 'emma@example.com', phone: '+1-555-0105' },
  { name: 'Frank Thompson', email: 'frank@example.com', phone: '+1-555-0106' },
]

const insertedCustomers = await db.insert(schema.customers).values(customersData).returning()
console.log(`✓ ${insertedCustomers.length} customers seeded`)

// Helper to create an order
async function createOrder(
  customerId: string | null,
  items: Array<{ item: (typeof insertedItems)[0]; quantity: number }>,
  status: schema.OrderStatus,
  notes?: string,
  createdAt?: Date
) {
  let subtotalCents = 0
  const lineItems = items.map(({ item, quantity }) => {
    const subtotal = item.priceCents * quantity
    subtotalCents += subtotal
    return { menuItemId: item.id, name: item.name, quantity, unitPriceCents: item.priceCents, subtotalCents: subtotal }
  })

  const [order] = await db
    .insert(schema.orders)
    .values({
      customerId,
      status,
      subtotalCents,
      totalCents: subtotalCents,
      notes: notes ?? null,
      completedAt: status === 'completed' ? new Date() : null,
      ...(createdAt ? { createdAt } : {}),
    })
    .returning()

  await db.insert(schema.orderItems).values(lineItems.map((i) => ({ ...i, orderId: order!.id })))
  return order!
}

// Find specific items by name
const find = (name: string) => insertedItems.find((i) => i.name === name)!
const ribeye = find('Ribeye Steak')
const salmon = find('Grilled Salmon')
const bruschetta = find('Bruschetta')
const tiramisu = find('Tiramisu')
const espresso = find('Espresso')
const pizza = find('Margherita Pizza')
const risotto = find('Mushroom Risotto')
const lemonade = find('Craft Lemonade')
const calamari = find('Calamari')
const chicken = find('Chicken Parmesan')
const [alice, bob, carol, david, emma] = insertedCustomers

const now = new Date()
const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000)

// Historical completed orders
await createOrder(alice!.id, [{ item: ribeye, quantity: 1 }, { item: bruschetta, quantity: 1 }, { item: espresso, quantity: 2 }], 'completed', undefined, daysAgo(5))
await createOrder(alice!.id, [{ item: salmon, quantity: 1 }, { item: lemonade, quantity: 1 }], 'completed', undefined, daysAgo(2))
await createOrder(bob!.id, [{ item: pizza, quantity: 2 }, { item: calamari, quantity: 1 }], 'completed', 'Extra cheese please', daysAgo(3))
await createOrder(bob!.id, [{ item: risotto, quantity: 1 }, { item: tiramisu, quantity: 1 }], 'completed', undefined, daysAgo(1))
await createOrder(carol!.id, [{ item: chicken, quantity: 2 }, { item: espresso, quantity: 1 }], 'completed', undefined, daysAgo(4))
await createOrder(david!.id, [{ item: ribeye, quantity: 2 }, { item: calamari, quantity: 2 }, { item: tiramisu, quantity: 2 }], 'completed', 'Anniversary dinner', daysAgo(6))
await createOrder(emma!.id, [{ item: pizza, quantity: 1 }], 'completed', undefined, daysAgo(2))
await createOrder(null, [{ item: bruschetta, quantity: 2 }, { item: salmon, quantity: 1 }], 'completed', 'Walk-in guest', daysAgo(1))

// Active orders for today
await createOrder(alice!.id, [{ item: ribeye, quantity: 1 }, { item: espresso, quantity: 1 }], 'preparing', 'Medium rare please')
await createOrder(bob!.id, [{ item: pizza, quantity: 1 }, { item: lemonade, quantity: 2 }], 'accepted')
await createOrder(carol!.id, [{ item: calamari, quantity: 1 }, { item: risotto, quantity: 1 }], 'pending')
await createOrder(null, [{ item: chicken, quantity: 2 }], 'pending', 'Takeaway')
await createOrder(david!.id, [{ item: salmon, quantity: 2 }, { item: tiramisu, quantity: 2 }], 'ready', 'Table 7')
await createOrder(emma!.id, [{ item: bruschetta, quantity: 1 }, { item: espresso, quantity: 2 }], 'pending')

console.log('✓ Orders seeded')

// Settings
await db
  .insert(schema.settings)
  .values([
    { key: 'prepTimeMins', value: 18 as unknown as Record<string, unknown> },
    { key: 'autoAccept', value: false as unknown as Record<string, unknown> },
    { key: 'isOpen', value: true as unknown as Record<string, unknown> },
    {
      key: 'openingHours',
      value: {
        monday:    { open: '11:00', close: '22:00', closed: false },
        tuesday:   { open: '11:00', close: '22:00', closed: false },
        wednesday: { open: '11:00', close: '22:00', closed: false },
        thursday:  { open: '11:00', close: '22:00', closed: false },
        friday:    { open: '11:00', close: '23:00', closed: false },
        saturday:  { open: '10:00', close: '23:00', closed: false },
        sunday:    { open: '10:00', close: '21:00', closed: false },
      } as unknown as Record<string, unknown>,
    },
  ])
  .onConflictDoNothing()

console.log('✓ Settings seeded')
console.log('\n🌱 Database seeded successfully!')
process.exit(0)
