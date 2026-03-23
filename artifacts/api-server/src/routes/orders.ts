import { Router, type IRouter } from "express";
import { db, productOrdersTable, cartItemsTable, productsTable, financialTransactionsTable } from "@workspace/db";
import { eq, desc, inArray, and, gte, sql } from "drizzle-orm";
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
  const { fullName, phone, deliveryAddress, paymentMethod, items, deliveryZoneName, deliveryPrice } = req.body;

  if (!fullName || !phone || !deliveryAddress) {
    res.status(400).json({ error: "Bad request", message: "fullName, phone, deliveryAddress required" });
    return;
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "Bad request", message: "items must be a non-empty array" });
    return;
  }

  try {
    const productIds = (items as Array<{ productId: number; quantity: number }>).map((i) => i.productId);
    const dbProducts = await db.select().from(productsTable).where(inArray(productsTable.id, productIds));
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    let serverTotal = 0;
    const validatedItems: Array<{ productId: number; productName: string; price: number; quantity: number }> = [];

    for (const item of items as Array<{ productId: number; quantity: number }>) {
      const product = productMap.get(item.productId);
      if (!product) {
        res.status(400).json({ error: "Bad request", message: `Mahsulot topilmadi: ID ${item.productId}` });
        return;
      }
      if (!product.inStock || product.stock < item.quantity) {
        res.status(409).json({ error: "Conflict", message: `${product.nameUz}: omborda yetarli emas` });
        return;
      }
      const price = product.discountPrice ?? product.price;
      serverTotal += price * item.quantity;
      validatedItems.push({ productId: item.productId, productName: product.nameUz, price, quantity: item.quantity });
    }

    const deliveryFee = typeof deliveryPrice === "number" ? deliveryPrice : 0;
    serverTotal += deliveryFee;

    const effectivePaymentMethod = paymentMethod || "pending";

    const order = await db.transaction(async (tx) => {
      const [newOrder] = await tx
        .insert(productOrdersTable)
        .values({
          userId,
          items: validatedItems,
          total: serverTotal,
          fullName,
          phone,
          deliveryAddress,
          paymentMethod: effectivePaymentMethod,
          status: "pending",
          deliveryZoneName: deliveryZoneName ?? null,
          deliveryPrice: deliveryFee,
        })
        .returning();

      await tx.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));

      for (const item of validatedItems) {
        const result = await tx
          .update(productsTable)
          .set({
            stock: sql`stock - ${item.quantity}`,
            inStock: sql`CASE WHEN stock - ${item.quantity} > 0 THEN true ELSE false END`,
          })
          .where(
            and(
              eq(productsTable.id, item.productId),
              gte(productsTable.stock, item.quantity),
            ),
          )
          .returning({ id: productsTable.id });

        if (result.length === 0) {
          throw new Error(`${item.productName}: omborda ${item.quantity} ta yo'q`);
        }
      }

      if (effectivePaymentMethod === "cash") {
        await tx.insert(financialTransactionsTable).values({
          type: "income",
          amount: serverTotal,
          description: `Naqd buyurtma #${newOrder.id}`,
          category: "sales",
          referenceId: String(newOrder.id),
        });
      }

      return newOrder;
    });

    sendOrderNotification({
      orderId: order.id,
      fullName,
      phone,
      deliveryAddress,
      paymentMethod: effectivePaymentMethod,
      total: serverTotal,
      items: validatedItems,
    }).catch((err) => console.error("Telegram notification failed:", err));

    res.status(201).json(order);
  } catch (err: any) {
    const isStockError = err.message?.includes("omborda");
    res.status(isStockError ? 409 : 500).json({ error: "Order failed", message: err.message });
  }
});

const ALLOWED_PAYMENT_METHODS = ["payme", "click", "uzumbank", "paynet", "visaCard", "uzcardCard", "pending"] as const;

router.patch("/orders/:id/payment-method", requireAuth, async (req, res) => {
  const orderId = parseInt(req.params.id);
  if (isNaN(orderId)) {
    res.status(400).json({ error: "Bad request", message: "Invalid order ID" });
    return;
  }
  const userId = req.user!.userId;
  const { paymentMethod } = req.body as { paymentMethod: string };

  if (!paymentMethod || !ALLOWED_PAYMENT_METHODS.includes(paymentMethod as (typeof ALLOWED_PAYMENT_METHODS)[number])) {
    res.status(400).json({ error: "Bad request", message: `paymentMethod must be one of: ${ALLOWED_PAYMENT_METHODS.join(", ")}` });
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
