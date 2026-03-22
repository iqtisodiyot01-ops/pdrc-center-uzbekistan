import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { bookingsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdminPermission } from "../middlewares/auth";
import { CreateBookingBody, UpdateBookingStatusBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/bookings", requireAdminPermission("bookings"), async (_req, res) => {
  const bookings = await db
    .select()
    .from(bookingsTable)
    .orderBy(desc(bookingsTable.createdAt));
  res.json(bookings);
});

router.post("/bookings", async (req, res) => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }
  const [booking] = await db.insert(bookingsTable).values(parsed.data).returning();
  res.status(201).json(booking);
});

router.get("/bookings/:id", requireAdminPermission("bookings"), async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id));
  if (!booking) {
    res.status(404).json({ error: "Not found", message: "Booking not found" });
    return;
  }
  res.json(booking);
});

router.delete("/bookings/:id", requireAdminPermission("bookings"), async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id));
  if (!booking) {
    res.status(404).json({ error: "Not found", message: "Booking not found" });
    return;
  }
  await db.delete(bookingsTable).where(eq(bookingsTable.id, id));
  res.json({ success: true, message: "Booking deleted" });
});

router.put("/bookings/:id/status", requireAdminPermission("bookings"), async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  const parsed = UpdateBookingStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }
  const [booking] = await db
    .update(bookingsTable)
    .set({ status: parsed.data.status })
    .where(eq(bookingsTable.id, id))
    .returning();
  if (!booking) {
    res.status(404).json({ error: "Not found", message: "Booking not found" });
    return;
  }
  res.json(booking);
});

export default router;
