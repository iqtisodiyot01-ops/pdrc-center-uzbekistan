import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin, requireSuperAdmin } from "../middlewares/auth";
import bcrypt from "bcryptjs";

const router: IRouter = Router();

router.get("/admin/users", requireAdmin, async (_req, res) => {
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

router.patch("/admin/users/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const { role, permissions, isActive, name, phone } = req.body as {
    role?: string;
    permissions?: Record<string, boolean>;
    isActive?: boolean;
    name?: string;
    phone?: string;
  };

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

router.delete("/admin/users/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
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
