import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db";
import { eq, asc, and, or, ilike, sql, inArray } from "drizzle-orm";
import { requireAdminPermission } from "../middlewares/auth";
import { CreateProductBody, UpdateProductBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/products", async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
  const offset = (page - 1) * limit;
  const category = req.query.category as string | undefined;
  const q = req.query.q as string | undefined;

  const conditions = [];
  if (category) conditions.push(eq(productsTable.category, category));
  if (q) {
    conditions.push(
      or(
        ilike(productsTable.nameUz, `%${q}%`),
        ilike(productsTable.nameEn, `%${q}%`),
        ilike(productsTable.nameRu, `%${q}%`),
      ),
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, countResult] = await Promise.all([
    db
      .select()
      .from(productsTable)
      .where(where)
      .orderBy(asc(productsTable.sortOrder), asc(productsTable.id))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(productsTable).where(where),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  res.json({
    items,
    total,
    page,
    pageSize: limit,
    totalPages: Math.ceil(total / limit),
  });
});

router.get("/products/:id", async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Bad request", message: "Invalid ID" });
    return;
  }
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
  if (!product) {
    res.status(404).json({ error: "Not found", message: "Product not found" });
    return;
  }
  res.json(product);
});

router.post("/products", requireAdminPermission("products"), async (req, res) => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }
  const [product] = await db.insert(productsTable).values(parsed.data).returning();
  res.status(201).json(product);
});

router.put("/products/:id", requireAdminPermission("products"), async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Bad request", message: "Invalid ID" });
    return;
  }
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }
  const [product] = await db
    .update(productsTable)
    .set(parsed.data)
    .where(eq(productsTable.id, id))
    .returning();
  if (!product) {
    res.status(404).json({ error: "Not found", message: "Product not found" });
    return;
  }
  res.json(product);
});

router.delete("/products/:id", requireAdminPermission("products"), async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Bad request", message: "Invalid ID" });
    return;
  }
  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.json({ success: true, message: "Product deleted" });
});

router.post("/products/bulk", requireAdminPermission("products"), async (req, res) => {
  const { ids, action, value } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ error: "ids array required" });
    return;
  }
  const numIds = ids.map(Number).filter((n) => !isNaN(n));
  if (numIds.length === 0) {
    res.status(400).json({ error: "Invalid IDs" });
    return;
  }
  switch (action) {
    case "activate":
      await db.update(productsTable).set({ inStock: true }).where(inArray(productsTable.id, numIds));
      break;
    case "deactivate":
      await db.update(productsTable).set({ inStock: false }).where(inArray(productsTable.id, numIds));
      break;
    case "delete":
      await db.delete(productsTable).where(inArray(productsTable.id, numIds));
      break;
    case "set_price":
      if (!value || isNaN(Number(value))) {
        res.status(400).json({ error: "value required for set_price" });
        return;
      }
      await db.update(productsTable).set({ price: Number(value) }).where(inArray(productsTable.id, numIds));
      break;
    case "set_discount":
      await db.update(productsTable).set({ discountPrice: value ? Number(value) : null }).where(inArray(productsTable.id, numIds));
      break;
    default:
      res.status(400).json({ error: "Unknown action" });
      return;
  }
  res.json({ ok: true, affected: numIds.length });
});

export default router;
