import { Router, type IRouter } from "express";
import { db, wishlistItemsTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/wishlist", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const rows = await db
    .select({
      id: wishlistItemsTable.id,
      createdAt: wishlistItemsTable.createdAt,
      product: productsTable,
    })
    .from(wishlistItemsTable)
    .leftJoin(productsTable, eq(wishlistItemsTable.productId, productsTable.id))
    .where(eq(wishlistItemsTable.userId, userId));
  res.json(rows);
});

router.post("/wishlist", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const { productId } = req.body;
  if (!productId || typeof productId !== "number") {
    res.status(400).json({ error: "Bad request", message: "productId required" });
    return;
  }
  const existing = await db
    .select()
    .from(wishlistItemsTable)
    .where(and(eq(wishlistItemsTable.userId, userId), eq(wishlistItemsTable.productId, productId)));
  if (existing.length > 0) {
    res.json(existing[0]);
    return;
  }
  const [item] = await db.insert(wishlistItemsTable).values({ userId, productId }).returning();
  res.status(201).json(item);
});

router.delete("/wishlist/:productId", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const productId = parseInt(req.params["productId"] as string);
  if (isNaN(productId)) {
    res.status(400).json({ error: "Bad request", message: "Invalid productId" });
    return;
  }
  await db
    .delete(wishlistItemsTable)
    .where(and(eq(wishlistItemsTable.userId, userId), eq(wishlistItemsTable.productId, productId)));
  res.json({ success: true });
});

export default router;
