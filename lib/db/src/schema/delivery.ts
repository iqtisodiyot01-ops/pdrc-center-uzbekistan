import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const deliveryZonesTable = pgTable("delivery_zones", {
  id: serial("id").primaryKey(),
  nameUz: text("name_uz").notNull(),
  nameEn: text("name_en").notNull(),
  nameRu: text("name_ru").notNull(),
  icon: text("icon").notNull().default("Truck"),
  color: text("color").notNull().default("blue"),
  price: integer("price").notNull().default(0),
  estimatedTime: text("estimated_time").notNull().default("1-3 kun"),
  priceTextUz: text("price_text_uz").notNull().default(""),
  priceTextEn: text("price_text_en").notNull().default(""),
  priceTextRu: text("price_text_ru").notNull().default(""),
  priceSubtextUz: text("price_subtext_uz").notNull().default(""),
  priceSubtextEn: text("price_subtext_en").notNull().default(""),
  priceSubtextRu: text("price_subtext_ru").notNull().default(""),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const deliveryPagePaymentsTable = pgTable("delivery_page_payments", {
  id: serial("id").primaryKey(),
  icon: text("icon").notNull().default("CreditCard"),
  titleUz: text("title_uz").notNull(),
  titleEn: text("title_en").notNull(),
  titleRu: text("title_ru").notNull(),
  descUz: text("desc_uz").notNull().default(""),
  descEn: text("desc_en").notNull().default(""),
  descRu: text("desc_ru").notNull().default(""),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type DeliveryZone = typeof deliveryZonesTable.$inferSelect;
export type DeliveryPagePayment = typeof deliveryPagePaymentsTable.$inferSelect;
