import { Router, type IRouter } from "express";
import { db, cartItemsTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
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
  const existing = await db
    .select()
    .from(cartItemsTable)
    .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, productId)));
  if (existing.length > 0) {
    const [updated] = await db
      .update(cartItemsTable)
      .set({ quantity: existing[0].quantity + quantity })
      .where(eq(cartItemsTable.id, existing[0].id))
      .returning();
    res.json(updated);
    return;
  }
  const [item] = await db.insert(cartItemsTable).values({ userId, productId, quantity }).returning();
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
