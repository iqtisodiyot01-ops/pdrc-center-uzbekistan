import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireSuperAdmin, requireAdminPermission } from "../middlewares/auth";
import bcrypt from "bcryptjs";

const router: IRouter = Router();

router.get("/admin/users", requireAdminPermission("admins"), async (_req, res) => {
  const users = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      phone: usersTable.phone,
      role: usersTable.role,
      isActive: usersTable.isActive,
      permissions: usersTable.permissions,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt));
  res.json(users);
});

router.post("/admin/users", requireSuperAdmin, async (req, res) => {
  const { name, email, password, phone, role = "user", permissions } = req.body as {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
    permissions?: Record<string, boolean>;
  };

  if (!name || !email || !password) {
    res.status(400).json({ error: "name, email, password required" });
    return;
  }

  if (role === "superadmin") {
    res.status(403).json({ error: "Cannot create superadmin users" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db
    .insert(usersTable)
    .values({ name, email, passwordHash, phone, role, permissions: permissions ?? null })
    .returning({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      phone: usersTable.phone,
      role: usersTable.role,
      isActive: usersTable.isActive,
      permissions: usersTable.permissions,
      createdAt: usersTable.createdAt,
    });
  res.status(201).json(user);
});

router.patch("/admin/users/:id", requireSuperAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const { role, permissions, isActive, name, phone } = req.body as {
    role?: string;
    permissions?: Record<string, boolean>;
    isActive?: boolean;
    name?: string;
    phone?: string;
  };

  if (id === req.user!.userId) {
    res.status(403).json({ error: "Cannot modify your own account" });
    return;
  }

  const [target] = await db.select({ role: usersTable.role }).from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!target) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  if (target.role === "superadmin") {
    res.status(403).json({ error: "Cannot modify another superadmin" });
    return;
  }

  if (role === "superadmin") {
    res.status(403).json({ error: "Cannot promote to superadmin" });
    return;
  }

  const updateData: Partial<typeof usersTable.$inferInsert> = {};
  if (role !== undefined) updateData.role = role;
  if (permissions !== undefined) updateData.permissions = permissions;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (name !== undefined) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;
  updateData.updatedAt = new Date();

  const [updated] = await db
    .update(usersTable)
    .set(updateData)
    .where(eq(usersTable.id, id))
    .returning({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      phone: usersTable.phone,
      role: usersTable.role,
      isActive: usersTable.isActive,
      permissions: usersTable.permissions,
      createdAt: usersTable.createdAt,
    });

  if (!updated) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(updated);
});

router.delete("/admin/users/:id", requireSuperAdmin, async (req, res) => {
  const id = parseInt(req.params.id);

  if (id === req.user!.userId) {
    res.status(403).json({ error: "Cannot deactivate your own account" });
    return;
  }

  const [target] = await db.select({ role: usersTable.role }).from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!target) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  if (target.role === "superadmin") {
    res.status(403).json({ error: "Cannot deactivate a superadmin" });
    return;
  }

  const [updated] = await db
    .update(usersTable)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(usersTable.id, id))
    .returning({ id: usersTable.id });
  if (!updated) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ success: true });
});

export default router;
