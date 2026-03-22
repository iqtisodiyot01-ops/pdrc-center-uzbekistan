import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { galleryTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";
import { CreateGalleryItemBody, UpdateGalleryItemBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/gallery", async (req, res) => {
  const { category } = req.query;
  const items = await db
    .select()
    .from(galleryTable)
    .orderBy(desc(galleryTable.createdAt));
  const filtered = category
    ? items.filter((i) => i.category === category)
    : items;
  res.json(filtered);
});

router.post("/gallery", requireAdmin, async (req, res) => {
  const parsed = CreateGalleryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }
  const [item] = await db.insert(galleryTable).values(parsed.data).returning();
  res.status(201).json(item);
});

router.get("/gallery/:id", async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Bad request", message: "Invalid ID" });
    return;
  }
  const [item] = await db.select().from(galleryTable).where(eq(galleryTable.id, id));
  if (!item) {
    res.status(404).json({ error: "Not found", message: "Gallery item not found" });
    return;
  }
  res.json(item);
});

router.put("/gallery/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Bad request", message: "Invalid ID" });
    return;
  }
  const parsed = UpdateGalleryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }
  const [item] = await db
    .update(galleryTable)
    .set(parsed.data)
    .where(eq(galleryTable.id, id))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Not found", message: "Gallery item not found" });
    return;
  }
  res.json(item);
});

router.delete("/gallery/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Bad request", message: "Invalid ID" });
    return;
  }
  await db.delete(galleryTable).where(eq(galleryTable.id, id));
  res.json({ success: true, message: "Gallery item deleted" });
});

export default router;
