import { Router, type IRouter } from "express";
import { db, usersTable, productOrdersTable, bookingsTable, productsTable, servicesTable, coursesTable } from "@workspace/db";
import { sql, eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/admin/stats", requireAdmin, async (_req, res) => {
  const [
    totalOrders,
    revenue,
    pendingOrders,
    newBookings,
    totalProducts,
    totalServices,
    totalCourses,
    totalUsers,
    recentOrders,
    recentBookings,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(productOrdersTable),
    db.select({ sum: sql<number>`coalesce(sum(total), 0)` }).from(productOrdersTable).where(eq(productOrdersTable.status, "delivered")),
    db.select({ count: sql<number>`count(*)` }).from(productOrdersTable).where(eq(productOrdersTable.status, "pending")),
    db.select({ count: sql<number>`count(*)` }).from(bookingsTable).where(eq(bookingsTable.status, "new")),
    db.select({ count: sql<number>`count(*)` }).from(productsTable),
    db.select({ count: sql<number>`count(*)` }).from(servicesTable),
    db.select({ count: sql<number>`count(*)` }).from(coursesTable),
    db.select({ count: sql<number>`count(*)` }).from(usersTable),
    db.select().from(productOrdersTable).orderBy(sql`created_at desc`).limit(5),
    db.select().from(bookingsTable).orderBy(sql`created_at desc`).limit(5),
  ]);

  res.json({
    totalOrders: Number(totalOrders[0]?.count ?? 0),
    revenue: Number(revenue[0]?.sum ?? 0),
    pendingOrders: Number(pendingOrders[0]?.count ?? 0),
    newBookings: Number(newBookings[0]?.count ?? 0),
    totalProducts: Number(totalProducts[0]?.count ?? 0),
    totalServices: Number(totalServices[0]?.count ?? 0),
    totalCourses: Number(totalCourses[0]?.count ?? 0),
    totalUsers: Number(totalUsers[0]?.count ?? 0),
    recentOrders,
    recentBookings,
  });
});

export default router;
