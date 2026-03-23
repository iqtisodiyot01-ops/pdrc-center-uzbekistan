import { Router, type IRouter } from "express";
import { db, contactMessagesTable, usersTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { requireAdminPermission, requireAuth } from "../middlewares/auth";
import { broadcast } from "../lib/ws";

const router: IRouter = Router();

router.post("/contact-messages", async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !message) {
    res.status(400).json({ error: "name and message required" });
    return;
  }
  const [msg] = await db
    .insert(contactMessagesTable)
    .values({ name, email, phone, subject, message })
    .returning();
  broadcast({ type: "new_message", payload: { id: msg.id, name, subject: subject ?? "", createdAt: msg.createdAt } });
  res.status(201).json(msg);
});

router.post("/my-messages", requireAuth, async (req, res) => {
  const { subject, message } = req.body;
  const userId = req.user!.userId;
  if (!message) {
    res.status(400).json({ error: "message required" });
    return;
  }
  const [user] = await db.select({ name: usersTable.name, email: usersTable.email, phone: usersTable.phone })
    .from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  const [msg] = await db
    .insert(contactMessagesTable)
    .values({ userId, name: user.name, email: user.email, phone: user.phone, subject, message })
    .returning();
  res.status(201).json(msg);
});

router.get("/my-messages", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const messages = await db
    .select()
    .from(contactMessagesTable)
    .where(eq(contactMessagesTable.userId, userId))
    .orderBy(desc(contactMessagesTable.createdAt));
  res.json(messages);
});

router.get("/admin/messages", requireAdminPermission("messages"), async (_req, res) => {
  const messages = await db
    .select()
    .from(contactMessagesTable)
    .orderBy(desc(contactMessagesTable.createdAt));
  res.json(messages);
});

router.get("/admin/messages/unread-count", requireAdminPermission("messages"), async (_req, res) => {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(contactMessagesTable)
    .where(eq(contactMessagesTable.isRead, false));
  res.json({ count: Number(result?.count ?? 0) });
});

router.patch("/admin/messages/:id", requireAdminPermission("messages"), async (req, res) => {
  const id = parseInt(req.params.id);
  const { reply, isRead } = req.body;
  const updates: Record<string, unknown> = {};
  if (reply !== undefined) updates.reply = reply;
  if (isRead !== undefined) updates.isRead = isRead;

  const [updated] = await db
    .update(contactMessagesTable)
    .set(updates)
    .where(eq(contactMessagesTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

router.delete("/admin/messages/:id", requireAdminPermission("messages"), async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(contactMessagesTable).where(eq(contactMessagesTable.id, id));
  res.json({ ok: true });
});

export default router;
