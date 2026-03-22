import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { coursesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAdminPermission } from "../middlewares/auth";
import { CreateCourseBody, UpdateCourseBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/courses", async (_req, res) => {
  const courses = await db
    .select()
    .from(coursesTable)
    .orderBy(asc(coursesTable.sortOrder), asc(coursesTable.id));
  res.json(courses);
});

router.get("/courses/:id", async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Bad request", message: "Invalid ID" });
    return;
  }
  const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, id));
  if (!course) {
    res.status(404).json({ error: "Not found", message: "Course not found" });
    return;
  }
  res.json(course);
});

router.post("/courses", requireAdminPermission("courses"), async (req, res) => {
  const parsed = CreateCourseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }
  const [course] = await db.insert(coursesTable).values(parsed.data).returning();
  res.status(201).json(course);
});

router.put("/courses/:id", requireAdminPermission("courses"), async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Bad request", message: "Invalid ID" });
    return;
  }
  const parsed = UpdateCourseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }
  const [course] = await db
    .update(coursesTable)
    .set(parsed.data)
    .where(eq(coursesTable.id, id))
    .returning();
  if (!course) {
    res.status(404).json({ error: "Not found", message: "Course not found" });
    return;
  }
  res.json(course);
});

router.delete("/courses/:id", requireAdminPermission("courses"), async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Bad request", message: "Invalid ID" });
    return;
  }
  await db.delete(coursesTable).where(eq(coursesTable.id, id));
  res.json({ success: true, message: "Course deleted" });
});

export default router;
