import { relations } from 'drizzle-orm';
import {roomAssignments, employees, rooms } from './tables'

export const employeesRelations = relations(employees, ({ many }) => ({
  roomAssignments: many(roomAssignments),
}));

export const roomsRelations = relations(rooms, ({ many }) => ({
  roomAssignments: many(roomAssignments),
}));

export const roomAssignmentsRelations = relations(roomAssignments, ({ one }) => ({
  employee: one(employees, {
    fields: [roomAssignments.employeeId],
    references: [employees.id],
  }),
  room: one(rooms, {
    fields: [roomAssignments.roomId],
    references: [rooms.id],
  }),
}));
