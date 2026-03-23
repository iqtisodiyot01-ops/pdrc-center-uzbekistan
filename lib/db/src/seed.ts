import { db, siteSettingsTable } from "./index.js";

const defaults = [
  {
    key: "contacts",
    value: {
      phone1: "+998905783272",
      phone2: "+998974026565",
      telegram: "@pdr_toolls",
      instagram: "pdrcenteruzbekistan",
      youtube: "pdrcenteruzbekistan",
      whatsapp: "+998905783272",
    },
  },
  {
    key: "branding",
    value: {
      siteNameUz: "PDRC Center Uzbekistan",
      siteNameEn: "PDRC Center Uzbekistan",
      siteNameRu: "PDRC Center Uzbekistan",
      taglineUz: "O'zbekistonda PDR sohasining yetakchisi",
      taglineEn: "Leading PDR Center in Uzbekistan",
      taglineRu: "Ведущий PDR центр в Узбекистане",
    },
  },
  {
    key: "social",
    value: {
      telegramUrl: "https://t.me/pdr_toolls",
      instagramUrl: "https://instagram.com/pdrcenteruzbekistan",
      youtubeUrl: "https://youtube.com/@pdrcenteruzbekistan",
      whatsappUrl: "https://wa.me/998905783272",
    },
  },
  {
    key: "hero",
    value: {
      titleUz: "Professional PDR Asboblar",
      titleEn: "Professional PDR Tools",
      titleRu: "Профессиональные PDR инструменты",
      subtitleUz: "O'zbekistondagi PDR ustalari uchun eng sifatli asboblar",
      subtitleEn: "Highest quality tools for PDR masters in Uzbekistan",
      subtitleRu: "Лучшие инструменты для мастеров PDR в Узбекистане",
    },
  },
];

async function seed() {
  for (const item of defaults) {
    await db
      .insert(siteSettingsTable)
      .values(item)
      .onConflictDoNothing();
  }
  console.log("✅ Seed muvaffaqiyatli bajarildi");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed xatosi:", err);
  process.exit(1);
});
