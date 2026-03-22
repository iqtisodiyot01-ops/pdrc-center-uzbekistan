import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { reviewsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";
import { CreateReviewBody, UpdateReviewBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/reviews", async (_req, res) => {
  const reviews = await db
    .select()
    .from(reviewsTable)
    .orderBy(desc(reviewsTable.createdAt));
  res.json(reviews);
});

router.post("/reviews", requireAdmin, async (req, res) => {
  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }
  const [review] = await db.insert(reviewsTable).values(parsed.data).returning();
  res.status(201).json(review);
});

router.get("/reviews/:id", async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Bad request", message: "Invalid ID" });
    return;
  }
  const [review] = await db.select().from(reviewsTable).where(eq(reviewsTable.id, id));
  if (!review) {
    res.status(404).json({ error: "Not found", message: "Review not found" });
    return;
  }
  res.json(review);
});

router.put("/reviews/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Bad request", message: "Invalid ID" });
    return;
  }
  const parsed = UpdateReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }
  const [review] = await db
    .update(reviewsTable)
    .set(parsed.data)
    .where(eq(reviewsTable.id, id))
    .returning();
  if (!review) {
    res.status(404).json({ error: "Not found", message: "Review not found" });
    return;
  }
  res.json(review);
});

router.delete("/reviews/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Bad request", message: "Invalid ID" });
    return;
  }
  await db.delete(reviewsTable).where(eq(reviewsTable.id, id));
  res.json({ success: true, message: "Review deleted" });
});

export default router;
