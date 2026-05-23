import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { migrate } from 'drizzle-orm/neon-http/migrator'
import { config } from 'dotenv'

config({ path: '.dev.vars' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

console.log('Running migrations...')
await migrate(db, { migrationsFolder: './src/db/migrations' })
console.log('Migrations complete.')
process.exit(0)
