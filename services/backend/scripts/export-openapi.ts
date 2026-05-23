import { writeFileSync } from 'fs'
import app from '../src/index'

// Generate the OpenAPI spec by calling the app's doc endpoint
const response = await app.request('/openapi.json')
const spec = await response.json()

writeFileSync('./openapi.json', JSON.stringify(spec, null, 2))
console.log('✓ openapi.json exported')
process.exit(0)
