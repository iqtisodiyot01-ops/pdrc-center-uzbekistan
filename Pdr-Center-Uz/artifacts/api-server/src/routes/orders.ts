import { Router, type IRouter } from "express";
import { db, productOrdersTable, cartItemsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

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

  if (!fullName || !phone || !deliveryAddress || !paymentMethod) {
    res.status(400).json({ error: "Bad request", message: "fullName, phone, deliveryAddress, paymentMethod required" });
    return;
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "Bad request", message: "items must be a non-empty array" });
    return;
  }

  const [order] = await db
    .insert(productOrdersTable)
    .values({
      userId,
      items,
      total: total || 0,
      fullName,
      phone,
      deliveryAddress,
      paymentMethod,
      status: "pending",
    })
    .returning();

  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));

  res.status(201).json(order);
});

export default router;
