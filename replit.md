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
- **To'lov** — To'lov integratsiyasi (Payme, Click, naqd, bank o'tkazmasi)

## Admin Panel (Kengaytirilgan)

To'liq admin boshqaruv paneli sidebar navigatsiya bilan:

### Bo'limlar:
1. **Dashboard** — Umumiy statistika, daromad, buyurtmalar oqimi, so'nggi buyurtmalar/xabarlar
2. **Buyurtmalar** — Barcha buyurtmalarni boshqarish, status filter, status o'zgartirish (5 bosqich)
3. **Xabarlar** — Kontakt xabarlarini o'qish, javob berish, o'chirish
4. **Bronlar** — Xizmat bron qilish so'rovlarini boshqarish
5. **Mahsulotlar** — CRUD operatsiyalar, inventar holati
6. **Xizmatlar** — CRUD operatsiyalar
7. **Kurslar** — CRUD operatsiyalar
8. **Maqolalar** — CRUD operatsiyalar
9. **Galereya** — Before/After rasmlar boshqaruvi
10. **Sharhlar** — Mijoz sharhlari boshqaruvi
11. **Reklamalar** — Bosh sahifaga dumaloq reklamalar qo'shish/boshqarish
12. **Moliya (Kirim-chiqim)** — Daromad/xarajat qayd qilish, balans, mahsulot inventari
13. **Admin boshqaruvi** — Admin qo'shish/o'chirish, granular huquqlar berish
14. **Sozlamalar** — Sayt sozlamalari (telefon, email, ijtimoiy tarmoqlar, footer matni)

### Huquqlar tizimi:
- **superadmin** — barcha bo'limlarga to'liq kirish
- **admin** — faqat berilgan huquqlar bo'yicha kirish
- Huquq berilmagan bo'limga kirganda: "Superadmin sizga bu huquqni bermagan" xabari chiqadi
- 14 ta alohida huquq: dashboard, orders, messages, bookings, products, services, courses, articles, gallery, reviews, advertisements, finances, admins, settings

### Admin panel fayllari:
- `artifacts/pdrc-website/src/pages/Admin.tsx` — Asosiy admin sahifa
- `artifacts/pdrc-website/src/components/admin/AdminLayout.tsx` — Sidebar layout va huquqlar
- `artifacts/pdrc-website/src/components/admin/DashboardSection.tsx` — Dashboard
- `artifacts/pdrc-website/src/components/admin/OrdersSection.tsx` — Buyurtmalar
- `artifacts/pdrc-website/src/components/admin/MessagesSection.tsx` — Xabarlar
- `artifacts/pdrc-website/src/components/admin/BookingsSection.tsx` — Bronlar
- `artifacts/pdrc-website/src/components/admin/AdvertisementsSection.tsx` — Reklamalar
- `artifacts/pdrc-website/src/components/admin/FinancesSection.tsx` — Moliya
- `artifacts/pdrc-website/src/components/admin/AdminsSection.tsx` — Admin boshqaruvi
- `artifacts/pdrc-website/src/components/admin/SettingsSection.tsx` — Sozlamalar
- `artifacts/pdrc-website/src/components/admin/ContentSection.tsx` — Umumiy kontent CRUD komponenti

## Ma'lumotlar bazasi jadvallari

- `users` — Foydalanuvchilar (role: user/admin/superadmin, permissions: jsonb)
- `products` — Mahsulotlar
- `product_orders` — Buyurtmalar
- `cart_items` — Savatcha
- `wishlist_items` — Istaklar ro'yxati
- `services` — Xizmatlar
- `courses` — Kurslar
- `articles` — Maqolalar
- `gallery` — Galereya
- `reviews` — Sharhlar
- `bookings` — Bronlar
- `site_settings` — Sayt sozlamalari
- `advertisements` — Reklamalar (yangi)
- `financial_transactions` — Moliyaviy operatsiyalar (yangi)
- `contact_messages` — Kontakt xabarlar (yangi)

## Buyurtma holatlari (Order Status Flow)

pending → confirmed → preparing → shipped → delivered

## Telegram bildirishnomalar

Yangi buyurtma berilganda admin Telegram kanalga xabar yuboriladi.
- `TELEGRAM_BOT_TOKEN` — Bot token
- `TELEGRAM_CHAT_ID` — Chat/kanal ID
- Utility: `artifacts/api-server/src/lib/telegram.ts`

## API yo'nalishlari

### Ochiq (Public):
- `GET /api/products`, `GET /api/services`, `GET /api/courses`, `GET /api/articles`
- `GET /api/gallery`, `GET /api/reviews`
- `GET /api/advertisements` — Faol reklamalar
- `POST /api/contact-messages` — Xabar yuborish
- `POST /api/bookings` — Bron qilish
- `GET /api/site-settings`

### Auth:
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`

### Admin:
- `GET/PATCH /api/admin/orders` — Buyurtmalar boshqaruvi
- `GET/POST/PATCH/DELETE /api/admin/users` — Foydalanuvchilar
- `GET /api/admin/stats` — Dashboard statistikasi
- `GET/POST/PUT/DELETE /api/admin/advertisements` — Reklamalar
- `GET/POST/DELETE /api/admin/finances` — Moliya
- `GET/PATCH/DELETE /api/admin/messages` — Xabarlar

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
- Role: superadmin
