import { pgTable, text, integer, timestamp, uuid } from 'drizzle-orm/pg-core';

export const rooms = pgTable('rooms', {
  id: uuid('id').defaultRandom().primaryKey(),
  roomNumber: text('room_number').notNull().unique(),
  name: text('name').notNull(),
  capacity: integer('capacity').notNull().default(2),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
