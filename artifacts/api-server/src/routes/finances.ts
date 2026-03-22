import { Router, type IRouter } from "express";
import { db, financialTransactionsTable } from "@workspace/db";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";
import { requireAdminPermission } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/admin/finances", requireAdminPermission("finances"), async (req, res) => {
  const { type, category, from, to, page = "1", limit = "50" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const pageSize = Math.min(100, parseInt(limit));
  const offset = (pageNum - 1) * pageSize;

  const conditions = [];
  if (type) conditions.push(eq(financialTransactionsTable.type, type));
  if (category) conditions.push(eq(financialTransactionsTable.category, category));
  if (from) conditions.push(gte(financialTransactionsTable.createdAt, new Date(from)));
  if (to) conditions.push(lte(financialTransactionsTable.createdAt, new Date(to)));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [transactions, countResult, incomeResult, expenseResult] = await Promise.all([
    db
      .select()
      .from(financialTransactionsTable)
      .where(where)
      .orderBy(desc(financialTransactionsTable.createdAt))
      .limit(pageSize)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(financialTransactionsTable).where(where),
    db.select({ sum: sql<number>`coalesce(sum(amount), 0)` }).from(financialTransactionsTable)
      .where(where ? and(eq(financialTransactionsTable.type, "income"), ...conditions) : eq(financialTransactionsTable.type, "income")),
    db.select({ sum: sql<number>`coalesce(sum(amount), 0)` }).from(financialTransactionsTable)
      .where(where ? and(eq(financialTransactionsTable.type, "expense"), ...conditions) : eq(financialTransactionsTable.type, "expense")),
  ]);

  res.json({
    transactions,
    total: Number(countResult[0]?.count ?? 0),
    totalIncome: Number(incomeResult[0]?.sum ?? 0),
    totalExpense: Number(expenseResult[0]?.sum ?? 0),
    page: pageNum,
    pageSize,
  });
});

router.post("/admin/finances", requireAdminPermission("finances"), async (req, res) => {
  const { type, amount, description, category, referenceId } = req.body;
  if (!type || !amount || !description) {
    res.status(400).json({ error: "type, amount, description required" });
    return;
  }
  if (!["income", "expense"].includes(type)) {
    res.status(400).json({ error: "type must be income or expense" });
    return;
  }
  const [tx] = await db
    .insert(financialTransactionsTable)
    .values({ type, amount: Math.abs(amount), description, category: category || "other", referenceId })
    .returning();
  res.status(201).json(tx);
});

router.delete("/admin/finances/:id", requireAdminPermission("finances"), async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(financialTransactionsTable).where(eq(financialTransactionsTable.id, id));
  res.json({ ok: true });
});

export default router;
