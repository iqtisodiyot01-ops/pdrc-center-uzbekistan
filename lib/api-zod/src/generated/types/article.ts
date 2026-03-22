import { z } from "zod";

export const ArticleBody = z.object({
    id: z.number(),
    titleUz: z.string(),
    titleEn: z.string(),
    titleRu: z.string(),
    contentUz: z.string(),
    contentEn: z.string(),
    contentRu: z.string(),
    imageUrl: z.string().nullable().optional(),
    authorId: z.string().nullable().optional(),
    publishedAt: z.string().nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
});
