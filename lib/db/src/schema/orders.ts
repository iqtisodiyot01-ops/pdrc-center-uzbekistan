import { pgTable, serial, integer, text, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const productOrdersTable = pgTable(
  "product_orders",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    items: jsonb("items").notNull(),
    total: integer("total").notNull(),
    fullName: text("full_name").notNull(),
    phone: text("phone").notNull(),
    deliveryAddress: text("delivery_address").notNull(),
    paymentMethod: text("payment_method").notNull().default("cash"),
    status: text("status").notNull().default("pending"),
    paymentStatus: text("payment_status").notNull().default("unpaid"),
    paymentId: text("payment_id"),
    deliveryZoneName: text("delivery_zone_name"),
    deliveryPrice: integer("delivery_price").default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("idx_orders_user_id").on(table.userId),
    statusIdx: index("idx_orders_status").on(table.status),
    createdIdx: index("idx_orders_created").on(table.createdAt),
  }),
);

export type ProductOrder = typeof productOrdersTable.$inferSelect;
