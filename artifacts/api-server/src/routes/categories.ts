import { Router, type IRouter } from "express";
import { db, productCategoriesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAdminPermission } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/categories", async (_req, res) => {
  const cats = await db
    .select()
    .from(productCategoriesTable)
    .where(eq(productCategoriesTable.isActive, true))
    .orderBy(asc(productCategoriesTable.sortOrder));
  res.json(cats);
});

router.get("/admin/categories", requireAdminPermission("products"), async (_req, res) => {
  const cats = await db
    .select()
    .from(productCategoriesTable)
    .orderBy(asc(productCategoriesTable.sortOrder));
  res.json(cats);
});

router.post("/admin/categories", requireAdminPermission("products"), async (req, res) => {
  const { nameUz, nameEn, nameRu, icon, sortOrder } = req.body;
  if (!nameUz || !nameEn || !nameRu) {
    res.status(400).json({ error: "Name in all languages required" });
    return;
  }
  const [cat] = await db
    .insert(productCategoriesTable)
    .values({ nameUz, nameEn, nameRu, icon: icon || "📦", sortOrder: sortOrder ?? 0 })
    .returning();
  res.status(201).json(cat);
});

router.put("/admin/categories/:id", requireAdminPermission("products"), async (req, res) => {
  const id = parseInt(req.params.id);
  const { nameUz, nameEn, nameRu, icon, sortOrder, isActive } = req.body;
  const [cat] = await db
    .update(productCategoriesTable)
    .set({ nameUz, nameEn, nameRu, icon, sortOrder, isActive })
    .where(eq(productCategoriesTable.id, id))
    .returning();
  if (!cat) { res.status(404).json({ error: "Not found" }); return; }
  res.json(cat);
});

router.delete("/admin/categories/:id", requireAdminPermission("products"), async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(productCategoriesTable).where(eq(productCategoriesTable.id, id));
  res.json({ success: true });
});

export default router;
