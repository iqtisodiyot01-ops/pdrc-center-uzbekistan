import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const deliveryZonesTable = pgTable("delivery_zones", {
  id: serial("id").primaryKey(),
  nameUz: text("name_uz").notNull(),
  nameEn: text("name_en").notNull(),
  nameRu: text("name_ru").notNull(),
  price: integer("price").notNull().default(0),
  estimatedTime: text("estimated_time").notNull().default("1-3 kun"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type DeliveryZone = typeof deliveryZonesTable.$inferSelect;
