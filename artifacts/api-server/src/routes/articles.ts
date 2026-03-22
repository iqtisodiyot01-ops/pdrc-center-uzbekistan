import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { articlesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdminPermission } from "../middlewares/auth";
import { CreateArticleBody, UpdateArticleBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/articles", async (_req, res) => {
    const articles = await db
        .select()
        .from(articlesTable)
        .orderBy(desc(articlesTable.createdAt));
    res.json(articles);
});

router.get("/articles/:id", async (req, res) => {
    const id = parseInt(req.params["id"] as string);
    if (isNaN(id)) {
        res.status(400).json({ error: "Bad request", message: "Invalid ID" });
        return;
    }
    const [article] = await db.select().from(articlesTable).where(eq(articlesTable.id, id));
    if (!article) {
        res.status(404).json({ error: "Not found", message: "Article not found" });
        return;
    }
    res.json(article);
});

router.post("/articles", requireAdminPermission("articles"), async (req, res) => {
    const parsed = CreateArticleBody.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Validation error", message: parsed.error.message });
        return;
    }
    const [article] = await db.insert(articlesTable).values(parsed.data).returning();
    res.status(201).json(article);
});

router.put("/articles/:id", requireAdminPermission("articles"), async (req, res) => {
    const id = parseInt(req.params["id"] as string);
    if (isNaN(id)) {
        res.status(400).json({ error: "Bad request", message: "Invalid ID" });
        return;
    }
    const parsed = UpdateArticleBody.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Validation error", message: parsed.error.message });
        return;
    }
    const [article] = await db
        .update(articlesTable)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(articlesTable.id, id))
        .returning();
    if (!article) {
        res.status(404).json({ error: "Not found", message: "Article not found" });
        return;
    }
    res.json(article);
});

router.delete("/articles/:id", requireAdminPermission("articles"), async (req, res) => {
    const id = parseInt(req.params["id"] as string);
    if (isNaN(id)) {
        res.status(400).json({ error: "Bad request", message: "Invalid ID" });
        return;
    }
    await db.delete(articlesTable).where(eq(articlesTable.id, id));
    res.json({ success: true, message: "Article deleted" });
});

export default router;
