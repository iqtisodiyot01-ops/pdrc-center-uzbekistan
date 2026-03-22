import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";

export const advertisementsTable = pgTable("advertisements", {
  id: serial("id").primaryKey(),
  titleUz: text("title_uz").notNull(),
  titleEn: text("title_en").notNull(),
  titleRu: text("title_ru").notNull(),
  imageUrl: text("image_url"),
  linkUrl: text("link_url"),
  position: text("position").notNull().default("homepage"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Advertisement = typeof advertisementsTable.$inferSelect;
