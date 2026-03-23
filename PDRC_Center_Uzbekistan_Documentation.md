# PDRC Center Uzbekistan — To'liq Texnik Hujjat
## Full Technical Blueprint

> **Sana:** 2026-03-22  
> **GitHub:** https://github.com/iqtisodiyot01-ops/pdrc-center-uzbekistan  
> **Sayt:** https://pdrcenteruzbekistan.com  
> **Tavsif:** Paintless Dent Repair (PDR) asboblari va xizmatlarini sotuvchi e-commerce sayt. O'zbekiston uchun to'liq mahsulot katalogi, buyurtma tizimi, kurs ro'yxatdan o'tish, xizmat bronlash, Telegram bildirishnomalar va to'liq admin panel.

---

## 1. ARXITEKTURA VA TEXNOLOGIYALAR

### Monorepo Tuzilmasi (pnpm workspaces)
```
/home/runner/workspace/           ← Loyiha ildizi (pnpm workspace)
  artifacts/
    api-server/                   ← Backend (Express.js + TypeScript)
    pdrc-website/                 ← Frontend (React + Vite + TypeScript)
    mockup-sandbox/               ← UI prototiplash muhiti (faqat dev)
  lib/
    db/                           ← Ma'lumotlar bazasi (Drizzle ORM + PostgreSQL)
    api-zod/                      ← API validation schemas (Zod)
    api-client-react/             ← API type definitions (generated)
  pnpm-workspace.yaml             ← Workspace konfiguratsiyasi
```

### Texnologiyalar Steki

| Qatlam | Texnologiya | Versiya |
|--------|-------------|---------|
| Frontend framework | React | 19.1.0 |
| Frontend build tool | Vite | ^7.3.0 |
| Frontend routing | Wouter | ^3.3.5 |
| Frontend state | Zustand | ^5.0.12 |
| Frontend data fetching | TanStack React Query | ^5.90.21 |
| UI komponentlar | Radix UI + shadcn/ui | latest |
| CSS | Tailwind CSS | ^4.1.14 |
| Animatsiyalar | Framer Motion | 12.35.1 |
| Backend framework | Express.js | ^5 |
| Backend runtime | Node.js + tsx | latest |
| Ma'lumotlar bazasi | PostgreSQL | Replit managed |
| ORM | Drizzle ORM | ^0.45.1 |
| Autentifikatsiya | JWT (jsonwebtoken) | ^9.0.3 |
| Parol hashing | bcryptjs | ^3.0.3 |
| API validation | Zod | ^3.25.76 |
| Fayl yuklash | Multer | ^2.1.1 |
| Logging | Pino + pino-http | ^9, ^10 |
| To'lov tizimlari | Payme + Click | custom integration |
| Bildirishnomalar | Telegram Bot API | custom |
| Package manager | pnpm | workspace |
| TypeScript | TypeScript | latest |

---

## 2. TO'LIQ FAYL TUZILMASI

```
/workspace/
├── pnpm-workspace.yaml
├── package.json
│
├── artifacts/
│   ├── api-server/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── build.ts
│   │   ├── uploads/                          ← Yuklangan rasmlar papkasi
│   │   │   └── [timestamp]-[random].[ext]
│   │   └── src/
│   │       ├── index.ts                      ← Server entry point
│   │       ├── app.ts                        ← Express app setup
│   │       ├── lib/
│   │       │   ├── logger.ts                 ← Pino logger
│   │       │   └── telegram.ts               ← Telegram bildirishnomalar
│   │       ├── middlewares/
│   │       │   └── auth.ts                   ← JWT auth middleware
│   │       └── routes/
│   │           ├── index.ts                  ← Barcha routerlarni birlashtiradi
│   │           ├── health.ts                 ← GET /healthz
│   │           ├── auth.ts                   ← Register/Login/Me/Logout
│   │           ├── products.ts               ← Mahsulotlar CRUD
│   │           ├── categories.ts             ← Kategoriyalar CRUD
│   │           ├── services.ts               ← Xizmatlar CRUD
│   │           ├── courses.ts                ← Kurslar CRUD
│   │           ├── gallery.ts                ← Galereya CRUD
│   │           ├── reviews.ts                ← Sharhlar CRUD
│   │           ├── articles.ts               ← Maqolalar CRUD
│   │           ├── advertisements.ts         ← Reklamalar CRUD
│   │           ├── bookings.ts               ← Bronlar (kurs va xizmat)
│   │           ├── cart.ts                   ← Savat boshqaruvi
│   │           ├── wishlist.ts               ← Istaklar ro'yxati
│   │           ├── orders.ts                 ← Buyurtmalar (foydalanuvchi)
│   │           ├── adminOrders.ts            ← Buyurtmalar (admin)
│   │           ├── adminUsers.ts             ← Foydalanuvchilar boshqaruvi
│   │           ├── adminStats.ts             ← Dashboard statistikasi
│   │           ├── finances.ts               ← Moliyaviy operatsiyalar
│   │           ├── contactMessages.ts        ← Murojaat xabarlari
│   │           ├── siteSettings.ts           ← Sayt sozlamalari
│   │           ├── payments.ts               ← Payme va Click integratsiya
│   │           └── upload.ts                 ← Rasm yuklash endpoint
│   │
│   └── pdrc-website/
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── index.html
│       ├── public/
│       │   └── opengraph.jpg
│       └── src/
│           ├── main.tsx                      ← React entry point
│           ├── App.tsx                       ← Root component + Router
│           ├── index.css                     ← Global styles
│           ├── lib/
│           │   └── api.ts                    ← API client (fetch wrapper)
│           ├── store/
│           │   └── use-store.ts              ← Zustand global state
│           ├── hooks/
│           │   └── use-translation.ts        ← Ko'p tillilik hook
│           ├── pages/
│           │   ├── Home.tsx                  ← Bosh sahifa
│           │   ├── Shop.tsx                  ← Do'kon sahifasi
│           │   ├── ProductDetail.tsx         ← Mahsulot tafsilotlari
│           │   ├── Services.tsx              ← Xizmatlar sahifasi
│           │   ├── Courses.tsx               ← Kurslar sahifasi
│           │   ├── Gallery.tsx               ← Galereya sahifasi
│           │   ├── Reviews.tsx               ← Sharhlar sahifasi
│           │   ├── Contact.tsx               ← Aloqa sahifasi
│           │   ├── About.tsx                 ← Biz haqimizda
│           │   ├── Delivery.tsx              ← Yetkazib berish
│           │   ├── Login.tsx                 ← Kirish sahifasi
│           │   ├── Register.tsx              ← Ro'yxatdan o'tish
│           │   ├── Profile.tsx               ← Profil sahifasi
│           │   ├── Admin.tsx                 ← Admin panel entry
│           │   ├── PaymentResult.tsx         ← To'lov natijasi
│           │   └── not-found.tsx             ← 404 sahifasi
│           └── components/
│               ├── layout/
│               │   ├── AppLayout.tsx         ← Asosiy layout (Navbar + Footer)
│               │   ├── Navbar.tsx            ← Yuqori menyu
│               │   └── Footer.tsx            ← Pastki menyu
│               ├── admin/
│               │   ├── AdminLayout.tsx       ← Admin sidebar layout
│               │   ├── AdminsSection.tsx     ← Foydalanuvchilar boshqaruvi
│               │   ├── DashboardSection.tsx  ← Statistika paneli
│               │   ├── OrdersSection.tsx     ← Buyurtmalar boshqaruvi
│               │   ├── BookingsSection.tsx   ← Bronlar boshqaruvi
│               │   ├── ContentSection.tsx    ← Mahsulot/Xizmat/Kurs tahrirlash
│               │   ├── CategoriesSection.tsx ← Kategoriyalar boshqaruvi
│               │   ├── AdvertisementsSection.tsx ← Reklamalar boshqaruvi
│               │   ├── MessagesSection.tsx   ← Murojaat xabarlari
│               │   ├── FinancesSection.tsx   ← Moliya hisobi
│               │   ├── ContactInfoSection.tsx ← Telefon/ijtimoiy tarmoqlar
│               │   ├── SiteTextsSection.tsx  ← Sayt matnlarini tahrirlash
│               │   └── SettingsSection.tsx   ← Parol o'zgartirish
│               ├── CartDrawer.tsx            ← Savat drawer
│               ├── CourseEnrollModal.tsx     ← Kursga yozilish modal
│               ├── ServiceBookingModal.tsx   ← Xizmat bronlash modal
│               ├── FloatingAds.tsx           ← Suzuvchi reklamalar
│               ├── ImageUpload.tsx           ← Rasm yuklash komponenti
│               └── ui/                       ← shadcn/ui komponentlar (50+)
│                   ├── button.tsx, card.tsx, dialog.tsx
│                   ├── input.tsx, select.tsx, table.tsx
│                   └── ... (50+ komponent)
│
└── lib/
    ├── db/
    │   ├── package.json
    │   ├── drizzle.config.ts
    │   └── src/
    │       ├── index.ts                      ← DB connection export
    │       └── schema/
    │           ├── index.ts                  ← Barcha schemalarni export qiladi
    │           ├── users.ts
    │           ├── products.ts
    │           ├── categories.ts
    │           ├── services.ts
    │           ├── courses.ts
    │           ├── gallery.ts
    │           ├── reviews.ts
    │           ├── articles.ts
    │           ├── advertisements.ts
    │           ├── bookings.ts
    │           ├── cart.ts
    │           ├── wishlist.ts
    │           ├── orders.ts
    │           ├── finances.ts
    │           ├── contactMessages.ts
    │           └── siteSettings.ts
    ├── api-zod/
    │   └── src/
    │       └── generated/
    │           └── api.ts                    ← Zod validation schemas
    └── api-client-react/
        └── src/
            └── generated/
                └── api.schemas.ts            ← TypeScript types
```

---

## 3. MUHIT O'ZGARUVCHILARI (Environment Variables)

### Backend (api-server) uchun kerakli:

| O'zgaruvchi | Maqsad | Eslatma |
|-------------|--------|---------|
| `DATABASE_URL` | PostgreSQL ulanish manzili | Replit tomonidan avtomatik beriladi |
| `PORT` | Backend server porti | Replit tomonidan avtomatik beriladi (8080) |
| `JWT_SECRET` | JWT tokenlarni imzolash | Ishlab chiqarishda majburiy. Dev da fallback bor |
| `TELEGRAM_BOT_TOKEN` | Telegram bot tokeni | Yangi buyurtma/bron bildirishnomalari uchun |
| `TELEGRAM_CHAT_ID` | Telegram kanal/chat ID | Bildirishnomalar qayerga yuborilishini belgilaydi |
| `PAYME_MERCHANT_ID` | Payme merchant ID | Payme to'lov tizimi uchun |
| `PAYME_SECRET_KEY` | Payme maxfiy kalit | Payme webhook autentifikatsiyasi uchun |
| `CLICK_SERVICE_ID` | Click xizmat ID | Click to'lov tizimi uchun |
| `CLICK_MERCHANT_ID` | Click merchant ID | Click to'lov tizimi uchun |
| `CLICK_SECRET_KEY` | Click maxfiy kalit | Click webhook imzo tekshirish uchun |
| `APP_URL` | Sayt asosiy URL | To'lov qaytish URL uchun. Default: `https://pdrcenteruzbekistan.com` |

### Frontend (pdrc-website) uchun:
Frontend `.env` ishlatmaydi — barcha konfiguratsiya backend API orqali `GET /api/site-settings` dan olinadi.

### Replit Secrets (hozir sozlangan):
- `GITHUB_TOKEN` — GitHub push uchun
- `TELEGRAM_BOT_TOKEN` — Telegram bildirishnomalar
- `TELEGRAM_CHAT_ID` — Telegram chat

---

## 4. MA'LUMOTLAR BAZASI (PostgreSQL + Drizzle ORM)

### Ulanish
- **Tur:** PostgreSQL (Replit managed)
- **ORM:** Drizzle ORM v0.45.1
- **Schema push:** `pnpm --filter @workspace/db exec drizzle-kit push`
- **Connection:** `DATABASE_URL` env orqali avtomatik

### Jadvallar (15 ta)

#### 4.1 `users` — Foydalanuvchilar
```sql
id           SERIAL PRIMARY KEY
name         TEXT NOT NULL
email        TEXT NOT NULL UNIQUE
password_hash TEXT NOT NULL
phone        TEXT
role         TEXT NOT NULL DEFAULT 'user'    -- 'user' | 'admin' | 'superadmin'
is_active    BOOLEAN NOT NULL DEFAULT true
permissions  JSONB                            -- { dashboard: true, orders: true, ... }
created_at   TIMESTAMP NOT NULL DEFAULT NOW()
updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
```

#### 4.2 `products` — Mahsulotlar
```sql
id             SERIAL PRIMARY KEY
name_uz        TEXT NOT NULL
name_en        TEXT NOT NULL
name_ru        TEXT NOT NULL
description_uz TEXT NOT NULL
description_en TEXT NOT NULL
description_ru TEXT NOT NULL
price          INTEGER NOT NULL               -- so'mda
discount_price INTEGER                        -- chegirmali narx
stock          INTEGER NOT NULL DEFAULT 0
image_url      TEXT
category       TEXT NOT NULL DEFAULT 'tools'
in_stock       BOOLEAN NOT NULL DEFAULT true
sort_order     INTEGER NOT NULL DEFAULT 0
created_at     TIMESTAMP NOT NULL DEFAULT NOW()
```

#### 4.3 `product_categories` — Mahsulot kategoriyalari
```sql
id         SERIAL PRIMARY KEY
name_uz    TEXT NOT NULL
name_en    TEXT NOT NULL
name_ru    TEXT NOT NULL
icon       TEXT DEFAULT '📦'
sort_order INTEGER NOT NULL DEFAULT 0
is_active  BOOLEAN NOT NULL DEFAULT true
created_at TIMESTAMP NOT NULL DEFAULT NOW()
```

#### 4.4 `services` — Xizmatlar
```sql
id             SERIAL PRIMARY KEY
name_uz        TEXT NOT NULL
name_en        TEXT NOT NULL
name_ru        TEXT NOT NULL
description_uz TEXT NOT NULL
description_en TEXT NOT NULL
description_ru TEXT NOT NULL
price          INTEGER
image_url      TEXT
category       TEXT
sort_order     INTEGER NOT NULL DEFAULT 0
created_at     TIMESTAMP NOT NULL DEFAULT NOW()
```

#### 4.5 `courses` — Kurslar
```sql
id            SERIAL PRIMARY KEY
name_uz       TEXT NOT NULL
name_en       TEXT NOT NULL
name_ru       TEXT NOT NULL
price         INTEGER NOT NULL
duration_days INTEGER NOT NULL
image_url     TEXT
level         TEXT NOT NULL DEFAULT 'beginner'   -- 'beginner'|'intermediate'|'advanced'
created_at    TIMESTAMP NOT NULL DEFAULT NOW()
```

#### 4.6 `bookings` — Bronlar (kurs + xizmat)
```sql
id          SERIAL PRIMARY KEY
type        TEXT NOT NULL DEFAULT 'booking'   -- 'booking' | 'course_enrollment'
name        TEXT NOT NULL
phone       TEXT NOT NULL
email       TEXT
age         TEXT
address     TEXT
service_id  INTEGER                           -- qaysi xizmat
course_name TEXT                             -- qaysi kurs
message     TEXT
status      TEXT NOT NULL DEFAULT 'new'      -- 'new'|'confirmed'|'completed'|'cancelled'
created_at  TIMESTAMP NOT NULL DEFAULT NOW()
```

#### 4.7 `product_orders` — Mahsulot buyurtmalari
```sql
id               SERIAL PRIMARY KEY
user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
total            INTEGER NOT NULL
full_name        TEXT NOT NULL
phone            TEXT NOT NULL
delivery_address TEXT NOT NULL
payment_method   TEXT NOT NULL DEFAULT 'cash'  -- 'cash'|'payme'|'click'|'card'
status           TEXT NOT NULL DEFAULT 'pending' -- 'pending'|'confirmed'|'preparing'|'shipped'|'delivered'
payment_status   TEXT NOT NULL DEFAULT 'unpaid'  -- 'unpaid'|'paid'|'cancelled'
payment_id       TEXT
items            JSONB                          -- [{ productId, productName, price, quantity }]
created_at       TIMESTAMP NOT NULL DEFAULT NOW()
```

#### 4.8 `cart_items` — Savat elementlari
```sql
id          SERIAL PRIMARY KEY
user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE
quantity    INTEGER NOT NULL DEFAULT 1
created_at  TIMESTAMP NOT NULL DEFAULT NOW()
```

#### 4.9 `wishlist_items` — Istaklar ro'yxati
```sql
id          SERIAL PRIMARY KEY
user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE
created_at  TIMESTAMP NOT NULL DEFAULT NOW()
```

#### 4.10 `gallery` — Galereya
```sql
id          SERIAL PRIMARY KEY
image_url   TEXT NOT NULL
title_uz    TEXT
title_en    TEXT
title_ru    TEXT
category    TEXT
created_at  TIMESTAMP NOT NULL DEFAULT NOW()
```

#### 4.11 `reviews` — Sharhlar (mijozlar fikri)
```sql
id          SERIAL PRIMARY KEY
name        TEXT NOT NULL
text_uz     TEXT NOT NULL
text_en     TEXT NOT NULL
text_ru     TEXT NOT NULL
car_brand   TEXT
avatar_url  TEXT
created_at  TIMESTAMP NOT NULL DEFAULT NOW()
```

#### 4.12 `articles` — Maqolalar/Blog
```sql
id           SERIAL PRIMARY KEY
title_uz     TEXT NOT NULL
title_en     TEXT NOT NULL
title_ru     TEXT NOT NULL
content_uz   TEXT NOT NULL
content_en   TEXT NOT NULL
content_ru   TEXT NOT NULL
image_url    TEXT
author_id    TEXT
published_at TIMESTAMP DEFAULT NOW()
created_at   TIMESTAMP NOT NULL DEFAULT NOW()
updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
```

#### 4.13 `advertisements` — Reklamalar
```sql
id         SERIAL PRIMARY KEY
title_uz   TEXT NOT NULL
title_en   TEXT NOT NULL
title_ru   TEXT NOT NULL
image_url  TEXT
link_url   TEXT
position   TEXT NOT NULL DEFAULT 'homepage'
is_active  BOOLEAN NOT NULL DEFAULT true
sort_order INTEGER NOT NULL DEFAULT 0
created_at TIMESTAMP NOT NULL DEFAULT NOW()
```

#### 4.14 `financial_transactions` — Moliyaviy operatsiyalar
```sql
id           SERIAL PRIMARY KEY
type         TEXT NOT NULL           -- 'income' | 'expense'
amount       INTEGER NOT NULL
description  TEXT NOT NULL
category     TEXT NOT NULL DEFAULT 'other'
reference_id TEXT
created_at   TIMESTAMP NOT NULL DEFAULT NOW()
```

#### 4.15 `contact_messages` — Murojaat xabarlari
```sql
id         SERIAL PRIMARY KEY
user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL
name       TEXT NOT NULL
email      TEXT
phone      TEXT
subject    TEXT
message    TEXT NOT NULL
reply      TEXT
is_read    BOOLEAN NOT NULL DEFAULT false
created_at TIMESTAMP NOT NULL DEFAULT NOW()
```

#### 4.16 `site_settings` — Sayt sozlamalari (key-value)
```sql
key        TEXT PRIMARY KEY
value      JSONB NOT NULL
updated_at TIMESTAMP NOT NULL DEFAULT NOW()
```

**Standart sayt sozlamalari kalitlari:**
| Key | Qiymat |
|-----|--------|
| `contacts` | phone1, phone2, telegram, instagram, youtube, whatsapp |
| `branding` | siteNameUz/En/Ru, taglineUz/En/Ru |
| `theme` | primaryColor, ctaColor, headingFont |
| `hero` | titleUz/En/Ru, subtitleUz/En/Ru |
| `footer` | descUz/En/Ru |
| `buttons` | bookNowUz/En/Ru, buyNowUz/En/Ru, contactUz/En/Ru |
| `social` | telegramUrl, instagramUrl, youtubeUrl, whatsappUrl |
| `siteTexts` | Ko'p tillilik matnlarni override qilish (JSONB) |

---

## 5. BACKEND API — TO'LIQ ENDPOINTLAR

> **Base URL:** `/api`  
> **Auth:** `Authorization: Bearer <JWT_TOKEN>` header orqali  
> **Server porti:** 8080 (production), Replit dev da boshqa port

### 5.1 AUTENTIFIKATSIYA (`/api/auth/...`)

#### `POST /api/auth/register` — Ro'yxatdan o'tish
**Kirish (Request Body):**
```json
{
  "name": "Jasur Toshmatov",
  "email": "jasur@example.com",
  "password": "password123",
  "phone": "+998901234567"
}
```
**Chiqish (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Jasur Toshmatov",
    "email": "jasur@example.com",
    "phone": "+998901234567",
    "role": "user",
    "createdAt": "2026-03-22T10:00:00.000Z"
  }
}
```

#### `POST /api/auth/login` — Kirish
**Kirish:**
```json
{ "email": "admin@pdrcenteruzbekistan.com", "password": "admin123" }
```
**Chiqish (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "name": "Admin",
    "email": "admin@pdrcenteruzbekistan.com",
    "phone": null,
    "role": "superadmin",
    "permissions": null,
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

#### `GET /api/auth/me` — Joriy foydalanuvchi `[AUTH]`
**Chiqish:**
```json
{
  "id": 1,
  "name": "Jasur",
  "email": "jasur@example.com",
  "phone": "+998901234567",
  "role": "user",
  "permissions": null,
  "createdAt": "2026-03-22T10:00:00.000Z"
}
```

#### `PUT /api/auth/change-password` — Parol o'zgartirish `[AUTH]`
**Kirish:**
```json
{ "currentPassword": "oldpass123", "newPassword": "newpass456" }
```

#### `POST /api/auth/logout` — Chiqish `[AUTH]`
**Chiqish:** `{ "success": true, "message": "Logged out successfully" }`

---

### 5.2 MAHSULOTLAR (`/api/products/...`)

#### `GET /api/products` — Barcha mahsulotlar (ochiq)
**Query parametrlar:** `?category=tools`
**Chiqish:**
```json
[
  {
    "id": 1,
    "nameUz": "PDR Shtanga to'plami",
    "nameEn": "PDR Rod Set",
    "nameRu": "Набор штанг PDR",
    "descriptionUz": "...",
    "price": 850000,
    "discountPrice": 750000,
    "stock": 15,
    "imageUrl": "/api/uploads/1774194496498-t0uxx6l9wu.png",
    "category": "tools",
    "inStock": true,
    "sortOrder": 0,
    "createdAt": "2026-01-15T00:00:00.000Z"
  }
]
```

#### `GET /api/products/:id` — Bitta mahsulot (ochiq)
#### `POST /api/products` — Mahsulot yaratish `[ADMIN: products]`
#### `PUT /api/products/:id` — Mahsulot yangilash `[ADMIN: products]`
#### `DELETE /api/products/:id` — Mahsulot o'chirish `[ADMIN: products]`

---

### 5.3 KATEGORIYALAR (`/api/categories/...`)

#### `GET /api/categories` — Barcha kategoriyalar (ochiq)
#### `GET /api/admin/categories` — Admin: kategoriyalar `[ADMIN: products]`
#### `POST /api/admin/categories` — Kategoriya yaratish `[ADMIN: products]`
#### `PUT /api/admin/categories/:id` — Kategoriya yangilash `[ADMIN: products]`
#### `DELETE /api/admin/categories/:id` — Kategoriya o'chirish `[ADMIN: products]`

---

### 5.4 XIZMATLAR (`/api/services/...`)

#### `GET /api/services` — Barcha xizmatlar (ochiq)
#### `GET /api/services/:id` — Bitta xizmat (ochiq)
#### `POST /api/services` — Xizmat yaratish `[ADMIN: services]`
#### `PUT /api/services/:id` — Xizmat yangilash `[ADMIN: services]`
#### `DELETE /api/services/:id` — Xizmat o'chirish `[ADMIN: services]`

---

### 5.5 KURSLAR (`/api/courses/...`)

#### `GET /api/courses` — Barcha kurslar (ochiq)
#### `GET /api/courses/:id` — Bitta kurs (ochiq)
#### `POST /api/courses` — Kurs yaratish `[ADMIN: courses]`
#### `PUT /api/courses/:id` — Kurs yangilash `[ADMIN: courses]`
#### `DELETE /api/courses/:id` — Kurs o'chirish `[ADMIN: courses]`

---

### 5.6 GALEREYA (`/api/gallery/...`)

#### `GET /api/gallery` — Barcha galereya rasmlari (ochiq)
**Query:** `?category=before-after`
#### `GET /api/gallery/:id` — Bitta rasm (ochiq)
#### `POST /api/gallery` — Rasm qo'shish `[ADMIN: gallery]`
#### `PUT /api/gallery/:id` — Rasm yangilash `[ADMIN: gallery]`
#### `DELETE /api/gallery/:id` — Rasm o'chirish `[ADMIN: gallery]`

---

### 5.7 SHARHLAR (`/api/reviews/...`)

#### `GET /api/reviews` — Barcha sharhlar (ochiq)
#### `GET /api/reviews/:id` — Bitta sharh (ochiq)
#### `POST /api/reviews` — Sharh qo'shish `[ADMIN: reviews]`
#### `PUT /api/reviews/:id` — Sharh yangilash `[ADMIN: reviews]`
#### `DELETE /api/reviews/:id` — Sharh o'chirish `[ADMIN: reviews]`

---

### 5.8 MAQOLALAR (`/api/articles/...`)

#### `GET /api/articles` — Barcha maqolalar (ochiq)
#### `GET /api/articles/:id` — Bitta maqola (ochiq)
#### `POST /api/articles` — Maqola yaratish `[ADMIN: articles]`
#### `PUT /api/articles/:id` — Maqola yangilash `[ADMIN: articles]`
#### `DELETE /api/articles/:id` — Maqola o'chirish `[ADMIN: articles]`

---

### 5.9 REKLAMALAR (`/api/advertisements/...`)

#### `GET /api/advertisements` — Faol reklamalar (ochiq)
#### `GET /api/admin/advertisements` — Barcha reklamalar `[ADMIN: advertisements]`
#### `POST /api/admin/advertisements` — Reklama yaratish `[ADMIN: advertisements]`
#### `PUT /api/admin/advertisements/:id` — Reklama yangilash `[ADMIN: advertisements]`
#### `DELETE /api/admin/advertisements/:id` — Reklama o'chirish `[ADMIN: advertisements]`

---

### 5.10 BRONLAR (`/api/bookings/...`)

#### `POST /api/bookings` — Bron/kursga yozilish yaratish (ochiq)
**Kirish:**
```json
{
  "type": "booking",
  "name": "Aziz Karimov",
  "phone": "+998901234567",
  "email": "aziz@example.com",
  "age": "28",
  "address": "Toshkent, Chilonzor",
  "serviceId": 1,
  "message": "Qo'shimcha savol bor"
}
```
Kursga yozilish uchun: `"type": "course_enrollment"`, `"courseName": "PDR Boshlang'ich kurs"`

**Telegram bildirishnoma:** Bron yaratilganda avtomatik yuboriladi.

#### `GET /api/bookings` — Barcha bronlar `[ADMIN: bookings]`
#### `GET /api/bookings/:id` — Bitta bron `[ADMIN: bookings]`
#### `PUT /api/bookings/:id/status` — Bron statusini yangilash `[ADMIN: bookings]`
**Status qiymatlari:** `new`, `confirmed`, `completed`, `cancelled`
#### `DELETE /api/bookings/:id` — Bron o'chirish `[ADMIN: bookings]`

---

### 5.11 SAVAT (`/api/cart/...`) `[AUTH kerak]`

#### `GET /api/cart` — Savatni olish
**Chiqish:**
```json
[
  {
    "id": 1,
    "quantity": 2,
    "createdAt": "2026-03-22T10:00:00.000Z",
    "product": {
      "id": 1,
      "nameUz": "PDR Shtanga",
      "price": 850000,
      "imageUrl": "/api/uploads/..."
    }
  }
]
```

#### `POST /api/cart` — Savatga qo'shish
**Kirish:** `{ "productId": 1, "quantity": 2 }`
#### `PUT /api/cart/:id` — Miqdorni yangilash
**Kirish:** `{ "quantity": 3 }`
#### `DELETE /api/cart/:id` — Elementni o'chirish
#### `DELETE /api/cart` — Savatni tozalash

---

### 5.12 ISTAKLAR RO'YXATI (`/api/wishlist/...`) `[AUTH kerak]`

#### `GET /api/wishlist` — Istaklar ro'yxatini olish
#### `POST /api/wishlist` — Qo'shish: `{ "productId": 1 }`
#### `DELETE /api/wishlist/:productId` — O'chirish

---

### 5.13 BUYURTMALAR (`/api/orders/...`)

#### `GET /api/orders` — Mening buyurtmalarim `[AUTH]`
#### `POST /api/orders` — Buyurtma berish `[AUTH]`
**Kirish:**
```json
{
  "fullName": "Jasur Toshmatov",
  "phone": "+998901234567",
  "deliveryAddress": "Toshkent, Yunusobod 19-kvartal",
  "paymentMethod": "payme",
  "total": 1700000,
  "items": [
    { "productId": 1, "productName": "PDR Shtanga", "price": 850000, "quantity": 2 }
  ]
}
```
**Telegram bildirishnoma:** Buyurtma yaratilganda avtomatik yuboriladi.

#### `GET /api/admin/orders` — Barcha buyurtmalar `[ADMIN: orders]`
**Query:** `?status=pending&page=1&limit=20`
#### `GET /api/admin/orders/:id` — Bitta buyurtma (foydalanuvchi ma'lumoti bilan) `[ADMIN: orders]`
#### `PATCH /api/admin/orders/:id/status` — Status yangilash `[ADMIN: orders]`
**Status qiymatlari:** `pending`, `confirmed`, `preparing`, `shipped`, `delivered`

---

### 5.14 TO'LOV TIZIMLARI (`/api/payments/...`)

#### `GET /api/payments/checkout-url/:orderId` — To'lov URL olish `[AUTH]`
**Chiqish:**
```json
{ "url": "https://checkout.paycom.uz/base64encoded..." }
```
yoki
```json
{ "url": "https://my.click.uz/services/pay?..." }
```

#### `POST /api/payments/payme` — Payme webhook (Payme serveri chaqiradi)
Qo'llab-quvvatlanadigan metodlar:
- `CheckPerformTransaction` — buyurtma mavjudligini tekshirish
- `CreateTransaction` — to'lov jarayonini boshlash
- `PerformTransaction` — to'lovni yakunlash va status `paid` ga o'zgartirish
- `CancelTransaction` — to'lovni bekor qilish

#### `POST /api/payments/click/prepare` — Click Prepare webhook
#### `POST /api/payments/click/complete` — Click Complete webhook

---

### 5.15 MUROJAAT XABARLARI (`/api/contact-messages/...`)

#### `POST /api/contact-messages` — Xabar yuborish (ochiq, login kerak emas)
**Kirish:** `{ "name": "...", "email": "...", "phone": "...", "subject": "...", "message": "..." }`

#### `POST /api/my-messages` — Kirgan foydalanuvchidan xabar `[AUTH]`
#### `GET /api/my-messages` — Mening xabarlarim `[AUTH]`
#### `GET /api/admin/messages` — Barcha xabarlar `[ADMIN: messages]`
#### `GET /api/admin/messages/unread-count` — O'qilmagan xabarlar soni `[ADMIN: messages]`
#### `PATCH /api/admin/messages/:id` — O'qildi belgilash / javob berish `[ADMIN: messages]`
#### `DELETE /api/admin/messages/:id` — Xabarni o'chirish `[ADMIN: messages]`

---

### 5.16 MOLIYA (`/api/admin/finances/...`) `[ADMIN: finances]`

#### `GET /api/admin/finances` — Moliyaviy hisobot
**Query:** `?type=income&category=sales&from=2026-01-01&to=2026-03-31&page=1&limit=50`
**Chiqish:**
```json
{
  "transactions": [...],
  "total": 150,
  "totalIncome": 50000000,
  "totalExpense": 10000000,
  "page": 1,
  "pageSize": 50
}
```

#### `POST /api/admin/finances` — Tranzaksiya qo'shish
**Kirish:** `{ "type": "income", "amount": 500000, "description": "PDR shtanga sotuvi", "category": "sales" }`
#### `DELETE /api/admin/finances/:id` — Tranzaksiya o'chirish

---

### 5.17 FOYDALANUVCHILAR BOSHQARUVI (Faqat Superadmin)

#### `GET /api/admin/users` — Barcha foydalanuvchilar `[ADMIN: admins]`
#### `POST /api/admin/users` — Yangi foydalanuvchi yaratish `[SUPERADMIN]`
**Kirish:**
```json
{
  "name": "Omonjon",
  "email": "omonjon@example.com",
  "password": "pass123",
  "phone": "+998901234567",
  "role": "admin",
  "permissions": {
    "dashboard": true,
    "orders": true,
    "products": true,
    "bookings": false
  }
}
```

#### `PATCH /api/admin/users/:id` — Foydalanuvchini yangilash `[SUPERADMIN]`
**Yangilanishi mumkin:** `role`, `permissions`, `isActive`, `name`, `phone`
**Cheklovlar:**
- O'zini o'zgartira olmaydi
- Superadminni o'zgartira olmaydi
- `superadmin` roli bera olmaydi

#### `DELETE /api/admin/users/:id` — Foydalanuvchini o'chirib qo'yish `[SUPERADMIN]`
> Aslida `isActive: false` ga o'rnatadi (soft delete)

---

### 5.18 ADMIN STATISTIKA

#### `GET /api/admin/stats` — Dashboard statistikasi `[ADMIN: dashboard]`
**Chiqish:**
```json
{
  "totalOrders": 150,
  "revenue": 75000000,
  "pendingOrders": 12,
  "confirmedOrders": 8,
  "preparingOrders": 5,
  "shippedOrders": 3,
  "deliveredOrders": 122,
  "newBookings": 7,
  "totalProducts": 45,
  "inStockProducts": 40,
  "outOfStockProducts": 5,
  "totalServices": 8,
  "totalCourses": 4,
  "totalUsers": 320,
  "totalAdmins": 3,
  "totalArticles": 12,
  "totalGallery": 87,
  "totalReviews": 56,
  "unreadMessages": 4,
  "activeAds": 3,
  "totalIncome": 80000000,
  "totalExpense": 15000000,
  "todayOrders": 5,
  "thisMonthRevenue": 12000000,
  "recentOrders": [...],
  "recentBookings": [...],
  "recentMessages": [...]
}
```

---

### 5.19 SAYT SOZLAMALARI

#### `GET /api/site-settings` — Barcha sozlamalar (ochiq)
#### `PUT /api/site-settings` — Sozlamalarni yangilash `[SUPERADMIN]`
**Kirish:** `{ "contacts": { "phone1": "+998905783272", ... }, "siteTexts": { ... } }`

---

### 5.20 FAYL YUKLASH

#### `POST /api/upload` — Rasm yuklash `[AUTH]`
**Content-Type:** `multipart/form-data`
**Field nomi:** `file`
**Ruxsat etilgan formatlar:** JPEG, JPG, PNG, GIF, WebP, SVG
**Maksimal hajm:** 10 MB
**Chiqish:** `{ "url": "/api/uploads/1774194496498-t0uxx6l9wu.png", "filename": "..." }`

#### `GET /api/uploads/:filename` — Yuklangan faylni olish (ochiq, static)

---

### 5.21 HEALTH CHECK

#### `GET /api/healthz` — Server ishlayaptimi?
**Chiqish:** `{ "status": "ok" }`

---

## 6. FRONTEND SAHIFALARI

### URL Manzillar Ro'yxati

| URL | Sahifa | Tavsif |
|-----|--------|--------|
| `/` | Home.tsx | Bosh sahifa: hero, xizmatlar, mahsulotlar, sharhlar, kurslar |
| `/shop` | Shop.tsx | Do'kon: mahsulotlar katalogi, filtr, qidiruv |
| `/shop/:id` | ProductDetail.tsx | Mahsulot tafsilotlari, savat, o'xshash mahsulotlar |
| `/services` | Services.tsx | Xizmatlar ro'yxati, bronlash modal |
| `/courses` | Courses.tsx | Kurslar ro'yxati, yozilish modal |
| `/gallery` | Gallery.tsx | Galereya rasmlari |
| `/reviews` | Reviews.tsx | Mijozlar sharhlari |
| `/contact` | Contact.tsx | Aloqa formasi, xarita |
| `/about` | About.tsx | Kompaniya haqida |
| `/delivery` | Delivery.tsx | Yetkazib berish shartlari |
| `/login` | Login.tsx | Kirish sahifasi |
| `/register` | Register.tsx | Ro'yxatdan o'tish |
| `/profile` | Profile.tsx | Profil, buyurtmalar tarixi |
| `/admin` | Admin.tsx | Admin panel (faqat admin/superadmin) |
| `/payment/success` | PaymentResult.tsx | To'lov muvaffaqiyatli |
| `/payment/cancel` | PaymentResult.tsx | To'lov bekor qilindi |
| `*` | not-found.tsx | 404 sahifasi |

### Frontend Porti
- **Development:** 18940 (Replit)
- **Production:** 80/443 (nginx/hosting)

---

## 7. ADMIN PANEL TUZILMASI

### Kirish: `/admin`
- **Superadmin:** admin@pdrcenteruzbekistan.com / admin123
- **Admin (DB):** Anvarov1170@gmail.com (id=3, role=admin)

### Rol Tizimi

| Rol | Tavsif | Nima qila oladi |
|-----|--------|-----------------|
| `user` | Oddiy foydalanuvchi | Savat, wishlist, buyurtma berish, profil |
| `admin` | Admin | Berilgan `permissions`ga qarab admin panelga kirish |
| `superadmin` | To'liq huquq | Hamma narsaga kirish, foydalanuvchilarni boshqarish |

### Admin Huquqlar (Permissions)

Admin foydalanuvchiga `permissions` JSONB ob'ekt orqali quyidagi huquqlar beriladi:

```json
{
  "dashboard":      true,   // Boshqaruv paneli ko'rish
  "orders":         true,   // Buyurtmalar boshqarish
  "messages":       true,   // Xabarlar ko'rish
  "bookings":       true,   // Bronlar boshqarish
  "products":       true,   // Mahsulotlar/Kategoriyalar CRUD
  "services":       true,   // Xizmatlar CRUD
  "courses":        true,   // Kurslar CRUD
  "articles":       true,   // Maqolalar CRUD
  "gallery":        true,   // Galereya CRUD
  "reviews":        true,   // Sharhlar CRUD
  "advertisements": true,   // Reklamalar CRUD
  "finances":       true,   // Moliya hisobi
  "admins":         true    // Foydalanuvchilar boshqarish (faqat superadmin ko'radi)
}
```

### Admin Panel Bo'limlari (15 ta)

#### Asosiy guruh:
1. **Boshqaruv paneli** (`dashboard`) — Statistika kartalar, so'nggi buyurtmalar/bronlar/xabarlar
2. **Buyurtmalar** (`orders`) — Buyurtmalar ro'yxati, status boshqarish (badge: kutayotgan buyurtmalar soni)
3. **Xabarlar** (`messages`) — Murojaat xabarlari, o'qilmagan belgisi (badge: o'qilmaganlar soni)
4. **Bronlar** (`bookings`) — Xizmat va kurs bronlari, status o'zgartirish

#### Kontent guruhi:
5. **Mahsulotlar** (`products`) — Mahsulotlar CRUD, rasm yuklash, narx, kategoriya
6. **Kategoriyalar** (`categories`) — Mahsulot kategoriyalari
7. **Xizmatlar** (`services`) — Xizmatlar CRUD, narx
8. **Kurslar** (`courses`) — Kurslar CRUD, narx, davomiylik, daraja
9. **Maqolalar** (`articles`) — Blog maqolalari CRUD (3 tilda)
10. **Galereya** (`gallery`) — Rasm galereyasi CRUD
11. **Sharhlar** (`reviews`) — Mijozlar sharhlari CRUD

#### Marketing guruhi:
12. **Reklamalar** (`advertisements`) — Banner/floating reklamalar, position, tartib

#### Moliya guruhi:
13. **Kirim-chiqim** (`finances`) — Moliyaviy tranzaksiyalar, hisobot, filtr

#### Tizim guruhi:
14. **Adminlar** (`admins`) — Foydalanuvchilar boshqaruvi, rol berish/olish, bloklash (faqat superadmin)
15. **Raqamlar & Havolalar** (`contactInfo`) — Telefon, Telegram, Instagram, YouTube, WhatsApp
16. **Sayt matnlari** (`siteTexts`) — Sayt matnlarini UI orqali o'zgartirish **(faqat superadmin)**
17. **Sozlamalar** (`settings`) — Parol o'zgartirish

---

## 8. GLOBAL STATE (Zustand)

`localStorage`da `pdrc-storage` kaliti ostida saqlanadi.

```typescript
interface AppState {
  lang: "uz" | "en" | "ru"              // Sayt tili (default: "uz")
  token: string | null                   // JWT token (persisted)
  user: AppUser | null                   // Kirgan foydalanuvchi
  cartOpen: boolean                      // Savat drawer ochiq/yopiq
  siteTexts: Record<string, ...> | null  // DB dan olingan matn override'lar
}
```

**Persist (localStorage'da saqlanadiganlari):** faqat `lang` va `token`

---

## 9. KO'P TILLILIK TIZIMI

### Qo'llab-quvvatlanadigan tillar
- **uz** — O'zbek (default)
- **en** — Inglizcha
- **ru** — Ruscha

### Qanday ishlaydi?
1. Barcha DB jadvallarida `name_uz`, `name_en`, `name_ru` (yoki `title_uz/en/ru`, `content_uz/en/ru`) maydonlar bor
2. Frontend `useTranslation()` hook orqali joriy tilga mos matnni qaytaradi
3. `SiteTextsLoader` komponenti app yuklanganda `GET /api/site-settings` dan `siteTexts` JSONB ob'ektini Zustand'ga yuklaydi
4. Superadmin `siteTexts` kalitini DB'da o'zgartirsa, saytdagi har qanday matn dinamik ravishda o'zgaradi (override tizimi)

---

## 10. TELEGRAM BILDIRISHNOMALAR

### Sozlash
```
TELEGRAM_BOT_TOKEN = <BotFather dan olingan token>
TELEGRAM_CHAT_ID   = <chat yoki kanal ID>
```

### Qachon yuboriladi?

#### Yangi buyurtma (`POST /api/orders`):
```
🛒 *Yangi buyurtma #42*

👤 *Mijoz:* Jasur Toshmatov
📞 *Telefon:* +998901234567
📍 *Manzil:* Toshkent, Yunusobod
💳 *To'lov:* Payme

📦 *Mahsulotlar:*
  • PDR Shtanga × 2 = 1,700,000 so'm

💰 *Jami:* 1,700,000 so'm
```

#### Yangi bron/kursga yozilish (`POST /api/bookings`):
```
📅 *Yangi bron #15*

👤 *Ism:* Aziz Karimov
📞 *Telefon:* +998901234567
🎂 *Yoshi:* 28
📍 *Manzil:* Toshkent
💬 *Xabar:* Qo'shimcha savol bor
```

```
🎓 *Yangi kurs ro'yxatdan o'tish #8*

👤 *Ism:* Bobur Rahimov
📞 *Telefon:* +998901234567
📚 *Kurs:* PDR Boshlang'ich kurs
```

---

## 11. TO'LOV TIZIMLARI OQIMI

### Payme Integratsiya

```
1. Foydalanuvchi "Payme bilan to'lash" tugmasini bosadi
2. Frontend → GET /api/payments/checkout-url/:orderId
3. Backend → Payme URL yaratadi (base64url encoded params)
   URL: https://checkout.paycom.uz/{base64({"m":"merchantId","ac":{"order_id":"42"},"a":170000000})}
4. Foydalanuvchi Payme saytiga yo'naltiriladi
5. To'lov amalga oshgandan so'ng Payme → POST /api/payments/payme (webhook)
   Method: PerformTransaction
6. Backend → DB'da paymentStatus='paid', status='confirmed' o'rnatadi
7. Foydalanuvchi → /payment/success?order_id=42
```

### Click Integratsiya

```
1. Foydalanuvchi "Click bilan to'lash" tugmasini bosadi
2. Frontend → GET /api/payments/checkout-url/:orderId
3. Backend → Click URL yaratadi
   URL: https://my.click.uz/services/pay?service_id=...&amount=...
4. Foydalanuvchi Click ilovasiga yo'naltiriladi
5. Click → POST /api/payments/click/prepare (imzo tekshirish + orderId saqlash)
6. Click → POST /api/payments/click/complete (to'lov yakunlash)
7. Backend → DB yangilaydi
```

### MUHIM ENV SOZLAMALAR:
```
PAYME_MERCHANT_ID=your_merchant_id
PAYME_SECRET_KEY=your_secret_key
CLICK_SERVICE_ID=your_service_id
CLICK_MERCHANT_ID=your_merchant_id
CLICK_SECRET_KEY=your_secret_key
APP_URL=https://pdrcenteruzbekistan.com
```

---

## 12. AUTENTIFIKATSIYA OQIMI

```
1. Login: POST /api/auth/login {email, password}
2. Server: bcrypt.compare(password, passwordHash)
3. Server: jwt.sign({userId, email, role}, JWT_SECRET, {expiresIn: '7d'})
4. Frontend: token localStorage'da saqlanadi (Zustand persist)
5. API so'rovlar: Authorization: Bearer <token> header
6. Server: jwt.verify(token, JWT_SECRET) → payload.userId
7. Admin endpointlar: loadAndValidateAdmin() → user.role va permissions tekshiradi
```

**JWT Token muddati:** 7 kun

---

## 13. SAYT DEFAULT KONTAKT MA'LUMOTLARI

```
Telefon 1:    +998905783272
Telefon 2:    +998974026565
Telegram:     @pdr_toolls
Instagram:    pdrcenteruzbekistan
YouTube:      pdrcenteruzbekistan
WhatsApp:     +998905783272
Telegram URL: https://t.me/pdr_toolls
Instagram URL: https://instagram.com/pdrcenteruzbekistan
YouTube URL:  https://youtube.com/@pdrcenteruzbekistan
WhatsApp URL: https://wa.me/998905783272
```

---

## 14. DEPLOYMENT VA ISHGA TUSHIRISH

### Replit Dev Muhitida

**Backend ishga tushirish:**
```bash
pnpm --filter @workspace/api-server run dev
# Buyruq: NODE_ENV=development tsx ./src/index.ts
# Port: 8080
```

**Frontend ishga tushirish:**
```bash
pnpm --filter @workspace/pdrc-website run dev
# Buyruq: vite --config vite.config.ts --host 0.0.0.0
# Port: 18940
```

**DB schema yangilash:**
```bash
pnpm --filter @workspace/db exec drizzle-kit push
```

### Production Build

**Backend build:**
```bash
pnpm --filter @workspace/api-server run build
# build.ts → esbuild bilan bundle qiladi
```

**Frontend build:**
```bash
pnpm --filter @workspace/pdrc-website run build
# Natija: artifacts/pdrc-website/dist/public/
```

### Replit Workflows (avtomatik ishga tushadi)
| Workflow | Buyruq | Maqsad |
|----------|--------|--------|
| `artifacts/api-server: API Server` | `pnpm --filter @workspace/api-server run dev` | Backend server |
| `artifacts/pdrc-website: web` | `pnpm --filter @workspace/pdrc-website run dev` | Frontend server |
| `artifacts/mockup-sandbox: Component Preview Server` | `pnpm --filter @workspace/mockup-sandbox run dev` | UI prototiplay (dev only) |

---

## 15. FRONTEND-BACKEND ULANISHI

### Proxy konfiguratsiyasi (Vite)
```typescript
// vite.config.ts ichida server.proxy sozlamasi bor
// /api → http://localhost:8080/api
```

### API Client (`src/lib/api.ts`)
```typescript
const API_BASE = "/api"; // relative URL — Vite proxy orqali backendga uzatiladi

// Token Zustand'dan olinadi (localStorage'dan)
const token = useAppStore.getState().token;

// Headers
Authorization: `Bearer ${token}`
Content-Type: "application/json"
```

### Rasm URL'lari
```
/api/uploads/1774194496498-t0uxx6l9wu.png
→ Backend statik fayl serveri: artifacts/api-server/uploads/ papkasidan
```

---

## 16. ASOSIY KOMPONENTLAR TAVSIFI

### `AppLayout.tsx`
- Barcha sahifalarni o'raydi
- `Navbar` + sahifa kontenti + `Footer` + `FloatingAds`
- Admin sahifasida Navbar/Footer ko'rsatilmaydi

### `Navbar.tsx`
- Logo + navigatsiya linklari
- Til almashtirish (uz/en/ru)
- Login/Profile tugmasi
- Savat ikonasi (miqdor badge)
- Mobil hamburger menyu

### `CartDrawer.tsx`
- Savat elementlari ro'yxati
- Miqdorni o'zgartirish
- Elementni o'chirish
- Jami narx va "Buyurtma berish" tugmasi
- Checkout formasi (ism, telefon, manzil, to'lov usuli)

### `CourseEnrollModal.tsx`
- Kursga yozilish formasi
- Maydonlar: ism, telefon, yosh, manzil
- `POST /api/bookings` ga `type: "course_enrollment"` bilan yuboradi

### `ServiceBookingModal.tsx`
- Xizmat bronlash formasi
- Maydonlar: ism, telefon, xabar
- `POST /api/bookings` ga `type: "booking"` bilan yuboradi

### `FloatingAds.tsx`
- `GET /api/advertisements` dan faol reklamalarni oladi
- Sahifada suzuvchi banner sifatida ko'rsatadi
- 10 soniyada bir almashinadi

### `AdminLayout.tsx`
- Chap sidebar + asosiy kontent
- Foydalanuvchi roli va permissions asosida menyuni filtrlab ko'rsatadi
- `hasPermission(user, section)` funksiyasi

---

## 17. FAYL YUKLASH TIZIMI

```
1. ImageUpload komponenti → <input type="file">
2. POST /api/upload (multipart/form-data, field: "file")
3. Multer: artifacts/api-server/uploads/ papkasiga saqlaydi
   Fayl nomi: {timestamp}-{randomString}.{ext}
4. Server qaytaradi: { "url": "/api/uploads/filename.jpg" }
5. Bu URL DB'da image_url sifatida saqlanadi
6. GET /api/uploads/filename.jpg → statik fayl serveri
```

**Muhim:** Yuklangan fayllar `artifacts/api-server/uploads/` papkasida saqlanadi. Server ko'chganda bu papka tozalanishi mumkin — production'da ob'ekt saqlash (S3 yoki Cloudflare R2) ishlatish tavsiya etiladi.

---

## 18. PACKAGE.JSON ASOSIY PAKETLAR TAVSIFI

### Backend (`@workspace/api-server`)
| Paket | Maqsad |
|-------|--------|
| `express ^5` | Web server framework |
| `jsonwebtoken ^9` | JWT token yaratish/tekshirish |
| `bcryptjs ^3` | Parol hash qilish |
| `drizzle-orm ^0.45` | PostgreSQL ORM |
| `multer ^2` | Fayl yuklash middleware |
| `cors ^2` | CORS yoqish |
| `pino + pino-http` | Tezkor JSON logging |
| `@workspace/db` | DB schema va connection |
| `@workspace/api-zod` | Request validation schemalar |

### Frontend (`@workspace/pdrc-website`)
| Paket | Maqsad |
|-------|--------|
| `react 19.1.0` | UI framework |
| `vite ^7` | Build va dev server |
| `wouter ^3.3.5` | Yengil React router |
| `zustand ^5` | Global state management |
| `@tanstack/react-query ^5` | Server state + caching |
| `tailwindcss ^4` | Utility-first CSS |
| `@radix-ui/*` | Accessible UI primitives |
| `framer-motion` | Animatsiyalar |
| `lucide-react` | Icon to'plam |
| `react-hook-form ^7` | Form boshqarish |
| `zod ^3` | Form validation |
| `recharts ^2` | Grafiklar (admin panel) |
| `embla-carousel-react ^8` | Karusel |
| `sonner ^2` | Toast bildirishnomalar |

---

## 19. MUHIM QOIDALAR VA CHEKLOVLAR

### Xavfsizlik
- `superadmin` roli faqat bevosita DB'da berilishi mumkin (API orqali emas)
- Admin o'zini bloklashi yoki o'zi ustida o'zgarish qila olmaydi
- Payme webhook `Basic Auth` bilan autentifikatsiya qilinadi
- Click webhook MD5 imzo bilan tekshiriladi
- JWT `7d` muddatli, refresh token yo'q — muddati tugasa qayta login

### Ma'lumotlar
- O'chirish (`DELETE`) asosan `hard delete` (faqat `users` da `soft delete` — `isActive: false`)
- Barcha matnlar 3 tilda majburiy (uz/en/ru)
- Narxlar so'm (UZS) da integer sifatida saqlanadi

### Upload
- Faqat rasm formatlari: JPEG, JPG, PNG, GIF, WebP, SVG
- Maksimal fayl hajmi: 10 MB
- Fayl nomi: `{Date.now()}-{Math.random().toString(36).slice(2)}.{ext}`

---

## 20. DB'DAGi MAVJUD ADMINLAR

```
ID: 2
Email:    [SUPERADMIN EMAIL - DB'dan ko'ring]
Parol:    [MAXFIY - server muhitida o'rnating]
Rol:      superadmin
Huquqlar: hammasi (superadmin)

ID: 3
Ism:      Omonjon
Email:    [ADMIN EMAIL - DB'dan ko'ring]
Rol:      admin
Huquqlar: DB'dagi permissions maydoniga qarab
```

> **MUHIM XAVFSIZLIK ESLATMASI:** Admin kiritish ma'lumotlarini hech qachon ommaviy repozitoriyda saqlamang. Parollarni `.env` fayli yoki muhit o'zgaruvchilari orqali boshqaring.

---

## 21. LOYIHANI QAYTA QURISH UCHUN TO'LIQ YO'RIQNOMA

Agar yangi muhitda loyihani qayta qurish kerak bo'lsa:

```bash
# 1. Repository klonlash
git clone https://github.com/iqtisodiyot01-ops/pdrc-center-uzbekistan

# 2. Paketlarni o'rnatish
pnpm install

# 3. PostgreSQL ma'lumotlar bazasini yaratish
# DATABASE_URL env o'zgaruvchisini sozlash

# 4. Zaruriy env o'zgaruvchilarini sozlash:
export JWT_SECRET="your-super-secret-key"
export DATABASE_URL="postgresql://user:pass@host:5432/dbname"
export TELEGRAM_BOT_TOKEN="your-bot-token"
export TELEGRAM_CHAT_ID="your-chat-id"
export PAYME_MERCHANT_ID="your-merchant-id"
export PAYME_SECRET_KEY="your-secret-key"
export CLICK_SERVICE_ID="your-service-id"
export CLICK_MERCHANT_ID="your-merchant-id"
export CLICK_SECRET_KEY="your-secret-key"
export APP_URL="https://yourdomain.com"
export PORT=8080

# 5. DB schemalarni yaratish
pnpm --filter @workspace/db exec drizzle-kit push

# 6. Birinchi superadmin yaratish (bevosita DB'ga)
# INSERT INTO users (name, email, password_hash, role)
# VALUES ('Admin', 'admin@yourdomain.com', bcrypt_hash, 'superadmin');

# 7. Ishga tushirish
pnpm --filter @workspace/api-server run dev    # Backend: port 8080
pnpm --filter @workspace/pdrc-website run dev  # Frontend: port 18940
```

---

*Hujjat muallifi: Loyiha arxitektori | Sana: 2026-03-22*
*GitHub: https://github.com/iqtisodiyot01-ops/pdrc-center-uzbekistan*
