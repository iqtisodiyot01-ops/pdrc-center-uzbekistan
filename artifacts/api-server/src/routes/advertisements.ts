import { Router, type IRouter } from "express";
import { db, advertisementsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAdminPermission } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/advertisements", async (_req, res) => {
  const ads = await db
    .select()
    .from(advertisementsTable)
    .where(eq(advertisementsTable.isActive, true))
    .orderBy(asc(advertisementsTable.sortOrder));
  res.json(ads);
});

router.get("/admin/advertisements", requireAdminPermission("advertisements"), async (_req, res) => {
  const ads = await db
    .select()
    .from(advertisementsTable)
    .orderBy(asc(advertisementsTable.sortOrder));
  res.json(ads);
});

router.post("/admin/advertisements", requireAdminPermission("advertisements"), async (req, res) => {
  const { titleUz, titleEn, titleRu, imageUrl, linkUrl, position, sortOrder } = req.body;
  if (!titleUz || !titleEn || !titleRu) {
    res.status(400).json({ error: "Title in all languages required" });
    return;
  }
  const [ad] = await db
    .insert(advertisementsTable)
    .values({ titleUz, titleEn, titleRu, imageUrl, linkUrl, position: position || "homepage", sortOrder: sortOrder || 0 })
    .returning();
  res.status(201).json(ad);
});

router.put("/admin/advertisements/:id", requireAdminPermission("advertisements"), async (req, res) => {
  const id = parseInt(req.params.id);
  const { titleUz, titleEn, titleRu, imageUrl, linkUrl, position, isActive, sortOrder } = req.body;
  const [updated] = await db
    .update(advertisementsTable)
    .set({
      ...(titleUz !== undefined && { titleUz }),
      ...(titleEn !== undefined && { titleEn }),
      ...(titleRu !== undefined && { titleRu }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(linkUrl !== undefined && { linkUrl }),
      ...(position !== undefined && { position }),
      ...(isActive !== undefined && { isActive }),
      ...(sortOrder !== undefined && { sortOrder }),
    })
    .where(eq(advertisementsTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

router.delete("/admin/advertisements/:id", requireAdminPermission("advertisements"), async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(advertisementsTable).where(eq(advertisementsTable.id, id));
  res.json({ ok: true });
});

export default router;
