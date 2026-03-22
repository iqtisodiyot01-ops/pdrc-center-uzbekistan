import { Router, type IRouter } from "express";
import { db, productOrdersTable, usersTable } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { requireAdminPermission } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/admin/orders", requireAdminPermission("orders"), async (req, res) => {
  const { status, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const pageSize = Math.min(100, parseInt(limit));
  const offset = (pageNum - 1) * pageSize;

  const where = status ? eq(productOrdersTable.status, status) : undefined;

  const [orders, countResult] = await Promise.all([
    db
      .select({
        id: productOrdersTable.id,
        userId: productOrdersTable.userId,
        userName: usersTable.name,
        userEmail: usersTable.email,
        items: productOrdersTable.items,
        total: productOrdersTable.total,
        fullName: productOrdersTable.fullName,
        phone: productOrdersTable.phone,
        deliveryAddress: productOrdersTable.deliveryAddress,
        paymentMethod: productOrdersTable.paymentMethod,
        status: productOrdersTable.status,
        paymentStatus: productOrdersTable.paymentStatus,
        paymentId: productOrdersTable.paymentId,
        createdAt: productOrdersTable.createdAt,
      })
      .from(productOrdersTable)
      .leftJoin(usersTable, eq(productOrdersTable.userId, usersTable.id))
      .where(where)
      .orderBy(desc(productOrdersTable.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(productOrdersTable)
      .where(where),
  ]);

  res.json({
    orders,
    total: Number(countResult[0]?.count ?? 0),
    page: pageNum,
    pageSize,
  });
});

router.get("/admin/orders/:id", requireAdminPermission("orders"), async (req, res) => {
  const id = parseInt(req.params.id);
  const [order] = await db
    .select({
      id: productOrdersTable.id,
      userId: productOrdersTable.userId,
      userName: usersTable.name,
      userEmail: usersTable.email,
      items: productOrdersTable.items,
      total: productOrdersTable.total,
      fullName: productOrdersTable.fullName,
      phone: productOrdersTable.phone,
      deliveryAddress: productOrdersTable.deliveryAddress,
      paymentMethod: productOrdersTable.paymentMethod,
      status: productOrdersTable.status,
      paymentStatus: productOrdersTable.paymentStatus,
      paymentId: productOrdersTable.paymentId,
      createdAt: productOrdersTable.createdAt,
    })
    .from(productOrdersTable)
    .leftJoin(usersTable, eq(productOrdersTable.userId, usersTable.id))
    .where(eq(productOrdersTable.id, id))
    .limit(1);

  if (!order) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(order);
});

router.patch("/admin/orders/:id/status", requireAdminPermission("orders"), async (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body as { status: string };
  const validStatuses = ["pending", "confirmed", "preparing", "shipped", "delivered"];
  if (!status || !validStatuses.includes(status)) {
    res.status(400).json({ error: "Invalid status", validStatuses });
    return;
  }
  const [updated] = await db
    .update(productOrdersTable)
    .set({ status })
    .where(eq(productOrdersTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(updated);
});

export default router;
