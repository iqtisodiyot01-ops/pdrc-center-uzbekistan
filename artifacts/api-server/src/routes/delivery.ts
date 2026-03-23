import { Router, type IRouter } from "express";
import { db, deliveryZonesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAdminPermission } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/delivery-zones", async (_req, res) => {
  const zones = await db
    .select()
    .from(deliveryZonesTable)
    .where(eq(deliveryZonesTable.isActive, true))
    .orderBy(asc(deliveryZonesTable.sortOrder), asc(deliveryZonesTable.id));
  res.json(zones);
});

router.get("/admin/delivery-zones", requireAdminPermission("settings"), async (_req, res) => {
  const zones = await db
    .select()
    .from(deliveryZonesTable)
    .orderBy(asc(deliveryZonesTable.sortOrder), asc(deliveryZonesTable.id));
  res.json(zones);
});

router.post("/admin/delivery-zones", requireAdminPermission("settings"), async (req, res) => {
  const { nameUz, nameEn, nameRu, price, estimatedTime, isActive, sortOrder } = req.body;
  if (!nameUz || !nameEn || !nameRu || price === undefined || !estimatedTime) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  const [zone] = await db.insert(deliveryZonesTable).values({
    nameUz, nameEn, nameRu,
    price: Number(price),
    estimatedTime,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
  }).returning();
  res.status(201).json(zone);
});

router.put("/admin/delivery-zones/:id", requireAdminPermission("settings"), async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const { nameUz, nameEn, nameRu, price, estimatedTime, isActive, sortOrder } = req.body;
  const updates: Record<string, unknown> = {};
  if (nameUz !== undefined) updates["nameUz"] = nameUz;
  if (nameEn !== undefined) updates["nameEn"] = nameEn;
  if (nameRu !== undefined) updates["nameRu"] = nameRu;
  if (price !== undefined) updates["price"] = Number(price);
  if (estimatedTime !== undefined) updates["estimatedTime"] = estimatedTime;
  if (isActive !== undefined) updates["isActive"] = Boolean(isActive);
  if (sortOrder !== undefined) updates["sortOrder"] = Number(sortOrder);
  const [zone] = await db.update(deliveryZonesTable).set(updates).where(eq(deliveryZonesTable.id, id)).returning();
  if (!zone) { res.status(404).json({ error: "Not found" }); return; }
  res.json(zone);
});

router.delete("/admin/delivery-zones/:id", requireAdminPermission("settings"), async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(deliveryZonesTable).where(eq(deliveryZonesTable.id, id));
  res.json({ success: true });
});

export default router;
