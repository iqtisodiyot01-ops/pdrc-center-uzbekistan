# PDR Center Uzbekistan — pdrcenteruzbekistan.com

Paintless Dent Repair markazining to'liq veb-sayti. React + TypeScript, pnpm monorepo arxitekturasida qurilgan.

## Arxitektura

**Monorepo tuzilmasi:**
- `artifacts/pdrc-website/` — Asosiy frontend (React + Vite + Tailwind CSS)
- `artifacts/api-server/` — Backend API (Express.js + Drizzle ORM)
- `artifacts/mockup-sandbox/` — UI komponentlarni preview qilish uchun
- `lib/db/` — Ma'lumotlar bazasi sxemasi (Drizzle ORM)
- `lib/api-zod/` — API validatsiya (Zod)
- `lib/api-client-react/` — React API klient
- `scripts/` — Seed va utility skriptlar

## Saytda mavjud bo'limlar

- **Asosiy sahifa** — Hero, xizmatlar, kurslar, galereya, sharhlar
- **Do'kon (Shop)** — Mahsulotlar katalogi, savatcha (cart), buyurtmalar, wishlist
- **Kurslar** — PDR kurslari ro'yxati va batafsil ma'lumot
- **Xizmatlar** — PDR xizmatlari
- **Galereya** — Ishlar galereya
- **Sharhlar** — Mijozlar sharhlari
- **Blog/Maqolalar** — Yangiliklar
- **Aloqa** — Kontakt ma'lumotlar
- **Yetkazib berish** — Delivery sahifasi
- **Login/Register** — Foydalanuvchi autentifikatsiyasi
- **Profil** — Foydalanuvchi profili, buyurtmalar tarixi, 5-bosqichli buyurtma kuzatuvi
- **Admin panel** — Buyurtmalar, mahsulotlar, xizmatlar, kurslar, maqolalar, foydalanuvchilar boshqaruvi
- **To'lov** — To'lov integratsiyasi (Payme, Click, naqd, bank o'tkazmasi)

## Buyurtma holatlari (Order Status Flow)

pending → confirmed → preparing → shipped → delivered

## Telegram bildirishnomalar

Yangi buyurtma berilganda admin Telegram kanalga xabar yuboriladi.
- `TELEGRAM_BOT_TOKEN` — Bot token
- `TELEGRAM_CHAT_ID` — Chat/kanal ID
- Utility: `artifacts/api-server/src/lib/telegram.ts`

## Texnik stack

- **Frontend:** React 19, Vite 7, Tailwind CSS 4, Radix UI, Tanstack Query, Framer Motion, Wouter (routing), Zustand (state)
- **Backend:** Express.js 5, TypeScript, tsx
- **DB:** Drizzle ORM (PostgreSQL)
- **Auth:** JWT + bcryptjs
- **Til:** Uzbek/Rus/English interfeysi

## Workflowlar

- `artifacts/pdrc-website: web` — Frontend (port 18940)
- `artifacts/api-server: API Server` — Backend (port 8080)
- `artifacts/mockup-sandbox: Component Preview Server` — Mockup sandbox (port 8081)

## Muhim buyruqlar

```bash
# Frontend ishga tushurish
pnpm --filter @workspace/pdrc-website run dev

# Backend ishga tushurish
pnpm --filter @workspace/api-server run dev

# Barcha paketlarni o'rnatish
pnpm install

# DB sxemasini push qilish
pnpm --filter @workspace/db exec drizzle-kit push

# Seed ma'lumotlar
scripts/node_modules/.bin/tsx scripts/src/seed.ts
```

## Muhit o'zgaruvchilari

- `JWT_SECRET` — JWT token uchun maxfiy kalit
- `DATABASE_URL` — PostgreSQL ulanish URL
- `TELEGRAM_BOT_TOKEN` — Telegram bot tokeni (buyurtma bildirishnomalari uchun)
- `TELEGRAM_CHAT_ID` — Telegram chat ID (admin xabarlari uchun)
- `PORT` — Server porti (workflow tomonidan beriladi)

## Admin kirish

- Email: admin@pdrcenteruzbekistan.com
- Parol: admin123
