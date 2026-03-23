import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/healthz", async (_req, res) => {
  const start = Date.now();
  try {
    await db.execute(sql`SELECT 1`);
    res.json({
      status: "ok",
      db: "connected",
      uptime: Math.floor(process.uptime()),
      responseTime: `${Date.now() - start}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: "error",
      db: "disconnected",
      error: (err as Error).message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
