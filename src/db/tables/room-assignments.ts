import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { rooms } from './rooms';
import { employees } from './employees';

export const roomAssignments = pgTable('room_assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  roomId: uuid('room_id').notNull().references(() => rooms.id),
  employeeId: uuid('employee_id').notNull().references(() => employees.id),
  preferences: text('preferences'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});