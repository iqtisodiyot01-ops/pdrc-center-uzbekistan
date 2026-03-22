import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const galleryTable = pgTable("gallery", {
  id: serial("id").primaryKey(),
  titleUz: text("title_uz").notNull(),
  titleEn: text("title_en").notNull(),
  titleRu: text("title_ru").notNull(),
  beforeImage: text("before_image").notNull(),
  afterImage: text("after_image").notNull(),
  category: text("category").notNull().default("dent"),
  carBrand: text("car_brand"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertGallerySchema = createInsertSchema(galleryTable).omit({
  id: true,
  createdAt: true,
});

export type InsertGallery = z.infer<typeof insertGallerySchema>;
export type Gallery = typeof galleryTable.$inferSelect;
