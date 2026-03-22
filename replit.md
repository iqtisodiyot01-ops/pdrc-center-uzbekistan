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
- **Do'kon (Shop)** — Mahsulotlar, savatcha (cart), buyurtmalar, wishlist
- **Kurslar** — PDR kurslari ro'yxati va batafsil ma'lumot
- **Xizmatlar** — PDR xizmatlari
- **Galereya** — Ishlar galereya
- **Sharhlar** — Mijozlar sharhlari
- **Blog/Maqolalar** — Yangiliklar
- **Aloqa** — Kontakt ma'lumotlar
- **Yetkazib berish** — Delivery sahifasi
- **Login/Register** — Foydalanuvchi autentifikatsiyasi
- **Profil** — Foydalanuvchi profili, buyurtmalar tarixi
- **Admin panel** — Buyurtmalar, foydalanuvchilar, statistika boshqaruvi
- **To'lov** — To'lov integratsiyasi (Stripe)

## Texnik stack

- **Frontend:** React 19, Vite 7, Tailwind CSS 4, Radix UI, Tanstack Query, Framer Motion, Wouter (routing), Zustand (state)
- **Backend:** Express.js 5, TypeScript, tsx
- **DB:** Drizzle ORM (PostgreSQL)
- **Auth:** JWT + bcryptjs
- **Til:** Uzbek/Rus interfeysi

## Workflowlar

- `PDR Center Website` — Frontend (port 5000, webview)
- `Backend API` — Backend (port 8080, console)

## Muhim buyruqlar

```bash
# Frontend ishga tushurish
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/pdrc-website run dev

# Backend ishga tushurish
PORT=8080 pnpm --filter @workspace/api-server run dev

# Barcha paketlarni o'rnatish
pnpm install
```

## Muhit o'zgaruvchilari

- `JWT_SECRET` — JWT token uchun maxfiy kalit (shared, .replit da sozlangan)
- `DATABASE_URL` — PostgreSQL ulanish URL (kerak bo'lsa qo'shiladi)
- `PORT` — Server porti (workflow tomonidan beriladi)
- `BASE_PATH` — Vite base path (frontend uchun)
