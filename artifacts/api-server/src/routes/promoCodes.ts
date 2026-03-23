import { Router, type IRouter } from "express";
import { db, promoCodesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdminPermission, requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/admin/promo-codes", requireAdminPermission("products"), async (_req, res) => {
  const codes = await db.select().from(promoCodesTable).orderBy(promoCodesTable.createdAt);
  res.json(codes);
});

router.post("/admin/promo-codes", requireAdminPermission("products"), async (req, res) => {
  const { code, discountType, discountValue, minOrderAmount, maxUses, isActive, expiresAt } = req.body;
  if (!code || !discountValue) {
    res.status(400).json({ error: "code and discountValue required" });
    return;
  }
  const [promo] = await db.insert(promoCodesTable).values({
    code: String(code).toUpperCase().trim(),
    discountType: discountType ?? "percent",
    discountValue: Number(discountValue),
    minOrderAmount: Number(minOrderAmount ?? 0),
    maxUses: maxUses ? Number(maxUses) : null,
    isActive: isActive !== false,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  }).returning();
  res.status(201).json(promo);
});

router.patch("/admin/promo-codes/:id", requireAdminPermission("products"), async (req, res) => {
  const id = Number(req.params.id);
  const { isActive, code, discountValue, discountType, minOrderAmount, maxUses, expiresAt } = req.body;
  const [updated] = await db.update(promoCodesTable)
    .set({
      ...(isActive !== undefined && { isActive }),
      ...(code && { code: String(code).toUpperCase().trim() }),
      ...(discountValue !== undefined && { discountValue: Number(discountValue) }),
      ...(discountType && { discountType }),
      ...(minOrderAmount !== undefined && { minOrderAmount: Number(minOrderAmount) }),
      ...(maxUses !== undefined && { maxUses: maxUses ? Number(maxUses) : null }),
      ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
    })
    .where(eq(promoCodesTable.id, id))
    .returning();
  res.json(updated);
});

router.delete("/admin/promo-codes/:id", requireAdminPermission("products"), async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(promoCodesTable).where(eq(promoCodesTable.id, id));
  res.json({ ok: true });
});

router.post("/promo/apply", requireAuth, async (req, res) => {
  const { code, orderTotal } = req.body;
  if (!code) {
    res.status(400).json({ error: "code required" });
    return;
  }
  const [promo] = await db.select().from(promoCodesTable).where(eq(promoCodesTable.code, String(code).toUpperCase().trim()));
  if (!promo) {
    res.status(404).json({ error: "Promo kod topilmadi" });
    return;
  }
  if (!promo.isActive) {
    res.status(400).json({ error: "Promo kod faol emas" });
    return;
  }
  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
    res.status(400).json({ error: "Promo kod muddati tugagan" });
    return;
  }
  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
    res.status(400).json({ error: "Promo kod foydalanish limiti tugagan" });
    return;
  }
  const total = Number(orderTotal ?? 0);
  if (total < promo.minOrderAmount) {
    res.status(400).json({ error: `Minimal buyurtma summasi: ${promo.minOrderAmount.toLocaleString()} UZS` });
    return;
  }
  const discount = promo.discountType === "percent"
    ? Math.round(total * promo.discountValue / 100)
    : promo.discountValue;
  res.json({ valid: true, discount, discountType: promo.discountType, discountValue: promo.discountValue, code: promo.code });
});

export default router;
