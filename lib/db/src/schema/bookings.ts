import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  type: text("type").notNull().default("booking"),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  age: text("age"),
  address: text("address"),
  serviceId: integer("service_id"),
  courseName: text("course_name"),
  message: text("message"),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({
  id: true,
  createdAt: true,
  status: true,
});

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
