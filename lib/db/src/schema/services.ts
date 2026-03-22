import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const servicesTable = pgTable("services", {
  id: serial("id").primaryKey(),
  nameUz: text("name_uz").notNull(),
  nameEn: text("name_en").notNull(),
  nameRu: text("name_ru").notNull(),
  descriptionUz: text("description_uz").notNull(),
  descriptionEn: text("description_en").notNull(),
  descriptionRu: text("description_ru").notNull(),
  price: integer("price"),
  imageUrl: text("image_url"),
  category: text("category"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertServiceSchema = createInsertSchema(servicesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof servicesTable.$inferSelect;
