import { Router, type IRouter } from "express";
import { db, productOrdersTable, siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import crypto from "crypto";

const router: IRouter = Router();

function md5(s: string) {
  return crypto.createHash("md5").update(s).digest("hex");
}

function getAppUrl() {
  return process.env.APP_URL || "https://pdrcenteruzbekistan.com";
}

async function getPaymentMethodsCfg(): Promise<Record<string, Record<string, unknown>>> {
  const [row] = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.key, "paymentMethods")).limit(1);
  return (row?.value as Record<string, Record<string, unknown>>) ?? {};
}

router.get("/payments/checkout-url/:orderId", requireAuth, async (req, res) => {
  const orderId = parseInt(req.params["orderId"] as string);
  if (isNaN(orderId)) {
    res.status(400).json({ error: "Bad request", message: "Invalid order ID" });
    return;
  }

  const [order] = await db
    .select()
    .from(productOrdersTable)
    .where(eq(productOrdersTable.id, orderId));

  if (!order || order.userId !== req.user!.userId) {
    res.status(404).json({ error: "Not found", message: "Order not found" });
    return;
  }

  const returnUrl = `${getAppUrl()}/payment/success?order_id=${orderId}`;
  const amountInTiyn = order.total * 100;

  if (order.paymentMethod === "payme") {
    const cfg = await getPaymentMethodsCfg();
    const merchantId = cfg.payme?.merchantId as string | undefined || process.env.PAYME_MERCHANT_ID;
    if (!merchantId) {
      res.status(503).json({ error: "Service unavailable", message: "Payme not configured" });
      return;
    }
    const params = Buffer.from(
      JSON.stringify({ m: merchantId, ac: { order_id: orderId.toString() }, a: amountInTiyn, l: "uz" })
    ).toString("base64url");
    res.json({ url: `https://checkout.paycom.uz/${params}` });
    return;
  }

  if (order.paymentMethod === "click") {
    const cfg = await getPaymentMethodsCfg();
    const serviceId = cfg.click?.serviceId as string | undefined || process.env.CLICK_SERVICE_ID;
    const merchantId = cfg.click?.merchantId as string | undefined || process.env.CLICK_MERCHANT_ID;
    if (!serviceId || !merchantId) {
      res.status(503).json({ error: "Service unavailable", message: "Click not configured" });
      return;
    }
    const params = new URLSearchParams({
      service_id: serviceId,
      merchant_id: merchantId,
      amount: order.total.toString(),
      transaction_param: orderId.toString(),
      return_url: returnUrl,
      currency: "UZS",
    });
    res.json({ url: `https://my.click.uz/services/pay?${params}` });
    return;
  }

  if (order.paymentMethod === "uzumbank" || order.paymentMethod === "paynet") {
    const cfg = await getPaymentMethodsCfg();
    const methodCfg = cfg[order.paymentMethod];
    const baseUrl = methodCfg?.url as string | undefined;
    if (!baseUrl) {
      res.status(503).json({ error: "Service unavailable", message: `${order.paymentMethod} not configured` });
      return;
    }
    const params = new URLSearchParams({
      amount: order.total.toString(),
      order_id: orderId.toString(),
      return_url: returnUrl,
    });
    const separator = baseUrl.includes("?") ? "&" : "?";
    res.json({ url: `${baseUrl}${separator}${params}` });
    return;
  }

  res.status(400).json({ error: "Bad request", message: "Payment method does not require redirect" });
});

router.post("/payments/payme", async (req, res) => {
  const secretKey = process.env.PAYME_SECRET_KEY;
  const authHeader = req.headers["authorization"];

  if (secretKey) {
    const expected = `Basic ${Buffer.from(`Paycom:${secretKey}`).toString("base64")}`;
    if (authHeader !== expected) {
      res.json({ error: { code: -32504, message: { uz: "Autentifikatsiya xatosi", ru: "Ошибка аутентификации", en: "Authentication failed" } }, id: req.body?.id ?? null });
      return;
    }
  }

  const { method, params, id } = req.body ?? {};

  if (!method) {
    res.json({ error: { code: -32600, message: "Invalid request" }, id: null });
    return;
  }

  try {
    switch (method) {
      case "CheckPerformTransaction": {
        const orderId = parseInt(params?.account?.order_id);
        if (isNaN(orderId)) {
          res.json({ error: { code: -31050, message: { uz: "Buyurtma topilmadi", ru: "Заказ не найден", en: "Order not found" } }, id });
          return;
        }
        const [order] = await db.select().from(productOrdersTable).where(eq(productOrdersTable.id, orderId));
        if (!order) {
          res.json({ error: { code: -31050, message: { uz: "Buyurtma topilmadi", ru: "Заказ не найден", en: "Order not found" } }, id });
          return;
        }
        if (order.total * 100 !== params.amount) {
          res.json({ error: { code: -31001, message: { uz: "Summa mos kelmaydi", ru: "Сумма не совпадает", en: "Amount mismatch" } }, id });
          return;
        }
        res.json({ result: { allow: true }, id });
        return;
      }

      case "CreateTransaction": {
        const orderId = parseInt(params?.account?.order_id);
        const [order] = await db.select().from(productOrdersTable).where(eq(productOrdersTable.id, orderId));
        if (!order) {
          res.json({ error: { code: -31050, message: { uz: "Buyurtma topilmadi", ru: "Заказ не найден", en: "Order not found" } }, id });
          return;
        }
        if (order.total * 100 !== params.amount) {
          res.json({ error: { code: -31001, message: { uz: "Summa mos kelmaydi", ru: "Сумма не совпадает", en: "Amount mismatch" } }, id });
          return;
        }
        await db.update(productOrdersTable)
          .set({ paymentId: params.id })
          .where(eq(productOrdersTable.id, orderId));
        res.json({ result: { create_time: Date.now(), transaction: params.id, state: 1 }, id });
        return;
      }

      case "PerformTransaction": {
        const rows = await db.select().from(productOrdersTable).where(eq(productOrdersTable.paymentId, params.id));
        if (!rows.length) {
          res.json({ error: { code: -31003, message: { uz: "Tranzaksiya topilmadi", ru: "Транзакция не найдена", en: "Transaction not found" } }, id });
          return;
        }
        await db.update(productOrdersTable)
          .set({ paymentStatus: "paid", status: "confirmed" })
          .where(eq(productOrdersTable.paymentId, params.id));
        res.json({ result: { transaction: params.id, perform_time: Date.now(), state: 2 }, id });
        return;
      }

      case "CancelTransaction": {
        const rows = await db.select().from(productOrdersTable).where(eq(productOrdersTable.paymentId, params.id));
        if (!rows.length) {
          res.json({ result: { transaction: params.id, cancel_time: Date.now(), state: -2 }, id });
          return;
        }
        await db.update(productOrdersTable)
          .set({ paymentStatus: "cancelled", status: "cancelled" })
          .where(eq(productOrdersTable.paymentId, params.id));
        res.json({ result: { transaction: params.id, cancel_time: Date.now(), state: -1 }, id });
        return;
      }

      case "CheckTransaction": {
        const rows = await db.select().from(productOrdersTable).where(eq(productOrdersTable.paymentId, params.id));
        if (!rows.length) {
          res.json({ error: { code: -31003, message: { uz: "Tranzaksiya topilmadi", ru: "Транзакция не найдена", en: "Transaction not found" } }, id });
          return;
        }
        const order = rows[0];
        const state = order.paymentStatus === "paid" ? 2 : order.paymentStatus === "cancelled" ? -1 : 1;
        res.json({ result: { create_time: new Date(order.createdAt).getTime(), perform_time: 0, cancel_time: 0, transaction: params.id, state, reason: null }, id });
        return;
      }

      case "GetStatement": {
        const orders = await db.select().from(productOrdersTable);
        const transactions = orders
          .filter((o) => o.paymentId && o.paymentMethod === "payme")
          .map((o) => ({
            id: o.paymentId,
            time: new Date(o.createdAt).getTime(),
            amount: o.total * 100,
            account: { order_id: o.id.toString() },
            create_time: new Date(o.createdAt).getTime(),
            perform_time: o.paymentStatus === "paid" ? new Date(o.createdAt).getTime() : 0,
            cancel_time: 0,
            transaction: o.paymentId,
            state: o.paymentStatus === "paid" ? 2 : -1,
            reason: null,
          }));
        res.json({ result: { transactions }, id });
        return;
      }

      default:
        res.json({ error: { code: -32601, message: "Method not found" }, id });
    }
  } catch (err) {
    res.json({ error: { code: -32400, message: "Internal error" }, id });
  }
});

router.post("/payments/click/prepare", async (req, res) => {
  const { click_trans_id, service_id, merchant_trans_id, amount, action, sign_time, sign_string } = req.body;

  const secretKey = process.env.CLICK_SECRET_KEY;
  if (secretKey && service_id) {
    const expected = md5(`${click_trans_id}${service_id}${secretKey}${merchant_trans_id}${amount}${sign_time}`);
    if (sign_string !== expected) {
      res.json({ error: -1, error_note: "SIGN CHECK FAILED!" });
      return;
    }
  }

  if (action !== 0) {
    res.json({ error: -3, error_note: "Action not found" });
    return;
  }

  const orderId = parseInt(merchant_trans_id);
  const [order] = await db.select().from(productOrdersTable).where(eq(productOrdersTable.id, orderId));
  if (!order) {
    res.json({ error: -5, error_note: "Order not found" });
    return;
  }

  await db.update(productOrdersTable)
    .set({ paymentId: click_trans_id?.toString() })
    .where(eq(productOrdersTable.id, orderId));

  res.json({
    click_trans_id,
    merchant_trans_id,
    merchant_prepare_id: orderId,
    error: 0,
    error_note: "Success",
  });
});

router.post("/payments/click/complete", async (req, res) => {
  const { click_trans_id, service_id, merchant_trans_id, merchant_prepare_id, amount, action, sign_time, sign_string, error: clickError } = req.body;

  const secretKey = process.env.CLICK_SECRET_KEY;
  if (secretKey && service_id) {
    const expected = md5(`${click_trans_id}${service_id}${secretKey}${merchant_trans_id}${merchant_prepare_id}${amount}${sign_time}`);
    if (sign_string !== expected) {
      res.json({ error: -1, error_note: "SIGN CHECK FAILED!" });
      return;
    }
  }

  if (action !== 1) {
    res.json({ error: -3, error_note: "Action not found" });
    return;
  }

  const orderId = parseInt(merchant_trans_id);
  if (clickError === 0) {
    await db.update(productOrdersTable)
      .set({ paymentStatus: "paid", status: "confirmed" })
      .where(eq(productOrdersTable.id, orderId));
  } else {
    await db.update(productOrdersTable)
      .set({ paymentStatus: "cancelled" })
      .where(eq(productOrdersTable.id, orderId));
  }

  res.json({
    click_trans_id,
    merchant_trans_id,
    merchant_confirm_id: orderId,
    error: 0,
    error_note: "Success",
  });
});

export default router;
