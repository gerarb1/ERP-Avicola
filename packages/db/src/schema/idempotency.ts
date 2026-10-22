import { pgTable, varchar, integer, jsonb, timestamp, index } from 'drizzle-orm/pg-core';

export const idempotencyKeys = pgTable('idempotency_keys', {
  key: varchar('key', { length: 36 }).primaryKey(),
  endpoint: varchar('endpoint', { length: 255 }).notNull(),
  method: varchar('method', { length: 10 }).notNull(),
  statusCode: integer('status_code').notNull(),
  responseBody: jsonb('response_body'),
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
}, (table) => [
  index('idempotency_expires_at_idx').on(table.expiresAt)
]);
