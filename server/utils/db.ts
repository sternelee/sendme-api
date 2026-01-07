import type { EventHandlerRequest, H3Event } from 'h3'

import { drizzle } from 'drizzle-orm/d1'

import * as schema from '../database/schema'
import { runtimeConfig } from './runtimeConfig'

const createDB = (dbSchema?: typeof schema) => {
  // Get D1 binding from Cloudflare Workers context
  // @ts-expect-error globalThis.__env__ is Cloudflare Workers binding
  const d1Database =
    process.env.D1_DATABASE ||
    globalThis.__env__?.D1_DATABASE ||
    globalThis.D1_DATABASE
  if (!d1Database) {
    throw new Error(
      'D1_DATABASE binding not found. Make sure D1 is configured in wrangler.toml'
    )
  }
  return drizzle(d1Database, { schema: dbSchema })
}

let db: ReturnType<typeof createDB>

export const getDB = () => {
  if (runtimeConfig.preset == 'node-server') {
    if (!db) {
      db = createDB()
    }
    return db
  } else {
    return createDB()
  }
}

// use db with schema
export const useDB = async (event?: H3Event<EventHandlerRequest>) => {
  // If the event has a context with a db property, return it
  if (event && event.context.db) {
    return event.context.db
  }
  // Otherwise, create a new connection to the database
  const dbInstance = createDB(schema)
  if (event) {
    event.context.db = dbInstance
  }
  return dbInstance
}

export type TableNames = keyof typeof schema

export function isValidTable(table: string): table is TableNames {
  return table in schema
}
