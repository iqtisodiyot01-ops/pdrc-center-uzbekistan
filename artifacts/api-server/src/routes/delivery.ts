import { Router, type IRouter } from "express";
import { db, deliveryZonesTable, deliveryPagePaymentsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAdminPermission } from "../middlewares/auth";

const router: IRouter = Router();

/* ─── Public ─── */
router.get("/delivery-zones", async (_req, res) => {
  const zones = await db
    .select()
    .from(deliveryZonesTable)
    .where(eq(deliveryZonesTable.isActive, true))
    .orderBy(asc(deliveryZonesTable.sortOrder), asc(deliveryZonesTable.id));
  res.json(zones);
});

router.get("/delivery-page-payments", async (_req, res) => {
  const payments = await db
    .select()
    .from(deliveryPagePaymentsTable)
    .where(eq(deliveryPagePaymentsTable.isActive, true))
    .orderBy(asc(deliveryPagePaymentsTable.sortOrder), asc(deliveryPagePaymentsTable.id));
  res.json(payments);
});

/* ─── Admin – Delivery Zones ─── */
router.get("/admin/delivery-zones", requireAdminPermission("settings"), async (_req, res) => {
  const zones = await db
    .select()
    .from(deliveryZonesTable)
    .orderBy(asc(deliveryZonesTable.sortOrder), asc(deliveryZonesTable.id));
  res.json(zones);
});

router.post("/admin/delivery-zones", requireAdminPermission("settings"), async (req, res) => {
  const { nameUz, nameEn, nameRu, icon, color, price, estimatedTime,
    priceTextUz, priceTextEn, priceTextRu, priceSubtextUz, priceSubtextEn, priceSubtextRu,
    isActive, sortOrder } = req.body;
  if (!nameUz || !nameEn || !nameRu || !estimatedTime) {
    res.status(400).json({ error: "Missing required fields" }); return;
  }
  const [zone] = await db.insert(deliveryZonesTable).values({
    nameUz, nameEn, nameRu,
    icon: icon || "Truck",
    color: color || "blue",
    price: Number(price ?? 0),
    estimatedTime,
    priceTextUz: priceTextUz || "",
    priceTextEn: priceTextEn || "",
    priceTextRu: priceTextRu || "",
    priceSubtextUz: priceSubtextUz || "",
    priceSubtextEn: priceSubtextEn || "",
    priceSubtextRu: priceSubtextRu || "",
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    sortOrder: Number(sortOrder ?? 0),
  }).returning();
  res.status(201).json(zone);
});

router.put("/admin/delivery-zones/:id", requireAdminPermission("settings"), async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const allowed = ["nameUz","nameEn","nameRu","icon","color","price","estimatedTime",
    "priceTextUz","priceTextEn","priceTextRu","priceSubtextUz","priceSubtextEn","priceSubtextRu",
    "isActive","sortOrder"];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      updates[key] = key === "price" || key === "sortOrder" ? Number(req.body[key])
        : key === "isActive" ? Boolean(req.body[key])
        : req.body[key];
    }
  }
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

/* ─── Admin – Delivery Page Payments ─── */
router.get("/admin/delivery-page-payments", requireAdminPermission("settings"), async (_req, res) => {
  const payments = await db
    .select()
    .from(deliveryPagePaymentsTable)
    .orderBy(asc(deliveryPagePaymentsTable.sortOrder), asc(deliveryPagePaymentsTable.id));
  res.json(payments);
});

router.post("/admin/delivery-page-payments", requireAdminPermission("settings"), async (req, res) => {
  const { icon, titleUz, titleEn, titleRu, descUz, descEn, descRu, isActive, sortOrder } = req.body;
  if (!titleUz || !titleEn || !titleRu) {
    res.status(400).json({ error: "Missing required fields" }); return;
  }
  const [payment] = await db.insert(deliveryPagePaymentsTable).values({
    icon: icon || "CreditCard",
    titleUz, titleEn, titleRu,
    descUz: descUz || "", descEn: descEn || "", descRu: descRu || "",
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    sortOrder: Number(sortOrder ?? 0),
  }).returning();
  res.status(201).json(payment);
});

router.put("/admin/delivery-page-payments/:id", requireAdminPermission("settings"), async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const allowed = ["icon","titleUz","titleEn","titleRu","descUz","descEn","descRu","isActive","sortOrder"];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      updates[key] = key === "sortOrder" ? Number(req.body[key])
        : key === "isActive" ? Boolean(req.body[key])
        : req.body[key];
    }
  }
  const [payment] = await db.update(deliveryPagePaymentsTable).set(updates).where(eq(deliveryPagePaymentsTable.id, id)).returning();
  if (!payment) { res.status(404).json({ error: "Not found" }); return; }
  res.json(payment);
});

router.delete("/admin/delivery-page-payments/:id", requireAdminPermission("settings"), async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(deliveryPagePaymentsTable).where(eq(deliveryPagePaymentsTable.id, id));
  res.json({ success: true });
});

export default router;
