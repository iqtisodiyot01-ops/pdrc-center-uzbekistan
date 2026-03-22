import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { servicesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";
import { CreateServiceBody, UpdateServiceBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/services", async (_req, res) => {
  const services = await db
    .select()
    .from(servicesTable)
    .orderBy(asc(servicesTable.sortOrder), asc(servicesTable.id));
  res.json(services);
});

router.get("/services/:id", async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Bad request", message: "Invalid ID" });
    return;
  }
  const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, id));
  if (!service) {
    res.status(404).json({ error: "Not found", message: "Service not found" });
    return;
  }
  res.json(service);
});

router.post("/services", requireAdmin, async (req, res) => {
  const parsed = CreateServiceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }
  const [service] = await db.insert(servicesTable).values(parsed.data).returning();
  res.status(201).json(service);
});

router.put("/services/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Bad request", message: "Invalid ID" });
    return;
  }
  const parsed = UpdateServiceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }
  const [service] = await db
    .update(servicesTable)
    .set(parsed.data)
    .where(eq(servicesTable.id, id))
    .returning();
  if (!service) {
    res.status(404).json({ error: "Not found", message: "Service not found" });
    return;
  }
  res.json(service);
});

router.delete("/services/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Bad request", message: "Invalid ID" });
    return;
  }
  await db.delete(servicesTable).where(eq(servicesTable.id, id));
  res.json({ success: true, message: "Service deleted" });
});

export default router;
