import { Router, type IRouter } from "express";
import { db, productOrdersTable, cartItemsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { sendOrderNotification } from "../lib/telegram";

const router: IRouter = Router();

router.get("/orders", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const orders = await db
    .select()
    .from(productOrdersTable)
    .where(eq(productOrdersTable.userId, userId))
    .orderBy(desc(productOrdersTable.createdAt));
  res.json(orders);
});

router.post("/orders", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const { fullName, phone, deliveryAddress, paymentMethod, items, total } = req.body;

  if (!fullName || !phone || !deliveryAddress) {
    res.status(400).json({ error: "Bad request", message: "fullName, phone, deliveryAddress required" });
    return;
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "Bad request", message: "items must be a non-empty array" });
    return;
  }

  const effectivePaymentMethod = paymentMethod || "pending";

  const [order] = await db
    .insert(productOrdersTable)
    .values({
      userId,
      items,
      total: total || 0,
      fullName,
      phone,
      deliveryAddress,
      paymentMethod: effectivePaymentMethod,
      status: "pending",
    })
    .returning();

  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));

  sendOrderNotification({
    orderId: order.id,
    fullName,
    phone,
    deliveryAddress,
    paymentMethod: effectivePaymentMethod,
    total: total || 0,
    items,
  }).catch((err) => console.error("Telegram notification failed:", err));

  res.status(201).json(order);
});

router.patch("/orders/:id/payment-method", requireAuth, async (req, res) => {
  const orderId = parseInt(req.params.id);
  const userId = req.user!.userId;
  const { paymentMethod } = req.body as { paymentMethod: string };

  if (!paymentMethod) {
    res.status(400).json({ error: "Bad request", message: "paymentMethod required" });
    return;
  }

  const [order] = await db
    .select()
    .from(productOrdersTable)
    .where(eq(productOrdersTable.id, orderId))
    .limit(1);

  if (!order || order.userId !== userId) {
    res.status(404).json({ error: "Not found", message: "Order not found" });
    return;
  }

  const [updated] = await db
    .update(productOrdersTable)
    .set({ paymentMethod })
    .where(eq(productOrdersTable.id, orderId))
    .returning();

  res.json(updated);
});

export default router;
