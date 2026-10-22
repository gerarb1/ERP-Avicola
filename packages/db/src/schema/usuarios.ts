import { pgTable, uuid, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
import { rolUsuarioEnum } from './enums';

export const usuarios = pgTable('usuarios', {
  id: uuid('id').defaultRandom().primaryKey(),
  authId: uuid('auth_id').unique().notNull(),
  nombre: varchar('nombre', { length: 150 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  rol: rolUsuarioEnum('rol').notNull(),
  activo: boolean('activo').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
