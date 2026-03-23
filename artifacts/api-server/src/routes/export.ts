import { Router, type IRouter } from "express";
import * as XLSX from "xlsx";
import { db, productOrdersTable, productsTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { requireAdminPermission } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/admin/export/orders", requireAdminPermission("orders"), async (_req, res) => {
  const orders = await db.select().from(productOrdersTable).orderBy(desc(productOrdersTable.createdAt));

  const rows = orders.map((o) => ({
    ID: o.id,
    "Ism Familya": o.fullName,
    "Telefon": o.phone,
    "Manzil": o.deliveryAddress ?? "",
    "Jami (UZS)": o.total,
    "To'lov usuli": o.paymentMethod,
    "Status": o.status,
    "To'lov holati": o.paymentStatus,
    "Sana": o.createdAt ? new Date(o.createdAt).toLocaleString("uz-UZ") : "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Buyurtmalar");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  res.setHeader("Content-Disposition", `attachment; filename="orders_${Date.now()}.xlsx"`);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.send(buf);
});

router.get("/admin/export/products", requireAdminPermission("products"), async (_req, res) => {
  const products = await db.select().from(productsTable).orderBy(productsTable.sortOrder);

  const rows = products.map((p) => ({
    ID: p.id,
    "Nomi (UZ)": p.nameUz,
    "Nomi (RU)": p.nameRu,
    "Nomi (EN)": p.nameEn,
    "Kategoriya": p.category,
    "Narx (UZS)": p.price,
    "Chegirma narxi": p.discountPrice ?? "",
    "Ombordagi miqdor": p.stock,
    "Mavjud": p.inStock ? "Ha" : "Yo'q",
    "Saralash tartibi": p.sortOrder,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Mahsulotlar");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  res.setHeader("Content-Disposition", `attachment; filename="products_${Date.now()}.xlsx"`);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.send(buf);
});

export default router;
