import { Router, type IRouter } from "express";
import { db, siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireSuperAdmin } from "../middlewares/auth";

const router: IRouter = Router();

const DEFAULT_SETTINGS: Record<string, unknown> = {
  contacts: {
    phone1: "+998905783272",
    phone2: "+998974026565",
    telegram: "@pdrtoolls",
    instagram: "pdrcenteruzbekistan",
    youtube: "pdrcenteruzbekistan",
    whatsapp: "+998905783272",
  },
  branding: {
    siteNameUz: "PDR Center Uzbekistan",
    siteNameEn: "PDR Center Uzbekistan",
    siteNameRu: "PDR Center Узбекистан",
    taglineUz: "O'zbekistonda №1 PDR markazi",
    taglineEn: "Uzbekistan's #1 PDR Center",
    taglineRu: "PDR Центр №1 в Узбекистане",
  },
  theme: {
    primaryColor: "#0f3460",
    ctaColor: "#1d4ed8",
    headingFont: "Plus Jakarta Sans",
  },
  hero: {
    titleUz: "PAINTLESS DENT REPAIR",
    titleEn: "PAINTLESS DENT REPAIR",
    titleRu: "PAINTLESS DENT REPAIR",
    subtitleUz: "Professional avtomobil ta'mirlash",
    subtitleEn: "Professional car dent removal",
    subtitleRu: "Профессиональный ремонт вмятин",
  },
  footer: {
    descUz: "O'zbekistondagi eng yaxshi PDR markazi",
    descEn: "The best PDR center in Uzbekistan",
    descRu: "Лучший PDR центр в Узбекистане",
  },
  buttons: {
    bookNowUz: "Qo'ng'iroq buyurtma",
    bookNowEn: "Book Now",
    bookNowRu: "Записаться",
    buyNowUz: "Sotib olish",
    buyNowEn: "Buy Now",
    buyNowRu: "Купить",
    contactUz: "Bog'lanish",
    contactEn: "Contact",
    contactRu: "Связаться",
  },
  social: {
    telegramUrl: "https://t.me/pdrtoolls",
    instagramUrl: "https://instagram.com/pdrcenteruzbekistan",
    youtubeUrl: "https://youtube.com/@pdrcenteruzbekistan",
    whatsappUrl: "https://wa.me/998905783272",
  },
};

async function ensureDefaults() {
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    const existing = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.key, key)).limit(1);
    if (existing.length === 0) {
      await db.insert(siteSettingsTable).values({ key, value });
    }
  }
}

router.get("/site-settings", async (_req, res) => {
  await ensureDefaults();
  const rows = await db.select().from(siteSettingsTable);
  const result: Record<string, unknown> = {};
  for (const row of rows) {
    result[row.key] = row.value;
  }
  res.json(result);
});

router.put("/site-settings", requireSuperAdmin, async (req, res) => {
  const body = req.body as Record<string, unknown>;
  if (!body || typeof body !== "object") {
    res.status(400).json({ error: "Body must be an object of { key: value }" });
    return;
  }

  const results: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    const [row] = await db
      .insert(siteSettingsTable)
      .values({ key, value, updatedAt: new Date() })
      .onConflictDoUpdate({ target: siteSettingsTable.key, set: { value, updatedAt: new Date() } })
      .returning();
    results[row.key] = row.value;
  }
  res.json(results);
});

export default router;
