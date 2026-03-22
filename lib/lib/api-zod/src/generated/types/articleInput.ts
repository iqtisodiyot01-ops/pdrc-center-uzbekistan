import { z } from "zod";

export const ArticleInputBody = z.object({
    titleUz: z.string(),
    titleEn: z.string(),
    titleRu: z.string(),
    contentUz: z.string(),
    contentEn: z.string(),
    contentRu: z.string(),
    imageUrl: z.string().nullable().optional(),
    authorId: z.string().nullable().optional(),
    publishedAt: z.string().nullable().optional(),
});
