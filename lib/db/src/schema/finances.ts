import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const financialTransactionsTable = pgTable("financial_transactions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("other"),
  referenceId: text("reference_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type FinancialTransaction = typeof financialTransactionsTable.$inferSelect;
