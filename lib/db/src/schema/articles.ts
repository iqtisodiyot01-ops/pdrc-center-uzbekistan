import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const articlesTable = pgTable("articles", {
  id: serial("id").primaryKey(),
  titleUz: text("title_uz").notNull(),
  titleEn: text("title_en").notNull(),
  titleRu: text("title_ru").notNull(),
  contentUz: text("content_uz").notNull(),
  contentEn: text("content_en").notNull(),
  contentRu: text("content_ru").notNull(),
  imageUrl: text("image_url"),
  authorId: text("author_id"),
  publishedAt: timestamp("published_at").defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertArticleSchema = createInsertSchema(articlesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articlesTable.$inferSelect;
