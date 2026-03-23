import { Router, type IRouter } from "express";
import { db, cartItemsTable, productsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/cart", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const rows = await db
    .select({
      id: cartItemsTable.id,
      quantity: cartItemsTable.quantity,
      createdAt: cartItemsTable.createdAt,
      product: productsTable,
    })
    .from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.userId, userId));
  res.json(rows);
});

router.post("/cart", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const { productId, quantity = 1 } = req.body;
  if (!productId || typeof productId !== "number") {
    res.status(400).json({ error: "Bad request", message: "productId required" });
    return;
  }

  const [item] = await db
    .insert(cartItemsTable)
    .values({ userId, productId, quantity })
    .onConflictDoUpdate({
      target: [cartItemsTable.userId, cartItemsTable.productId],
      set: { quantity: sql`cart_items.quantity + ${quantity}` },
    })
    .returning();

  res.status(201).json(item);
});

router.put("/cart/:id", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const id = parseInt(req.params["id"] as string);
  const { quantity } = req.body;
  if (isNaN(id) || typeof quantity !== "number" || quantity < 1) {
    res.status(400).json({ error: "Bad request", message: "Invalid id or quantity" });
    return;
  }
  const [item] = await db
    .update(cartItemsTable)
    .set({ quantity })
    .where(and(eq(cartItemsTable.id, id), eq(cartItemsTable.userId, userId)))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Not found", message: "Cart item not found" });
    return;
  }
  res.json(item);
});

router.delete("/cart/:id", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Bad request", message: "Invalid ID" });
    return;
  }
  await db.delete(cartItemsTable).where(and(eq(cartItemsTable.id, id), eq(cartItemsTable.userId, userId)));
  res.json({ success: true });
});

router.delete("/cart", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));
  res.json({ success: true });
});

export default router;
