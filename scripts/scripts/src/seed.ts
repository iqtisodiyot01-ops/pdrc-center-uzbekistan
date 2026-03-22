import { db } from "@workspace/db";
import {
  usersTable,
  servicesTable,
  productsTable,
  coursesTable,
  galleryTable,
  reviewsTable,
} from "@workspace/db";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminHash = await bcrypt.hash("admin123", 10);
  await db
    .insert(usersTable)
    .values({
      name: "Admin",
      email: "admin@pdrcenteruzbekistan.com",
      passwordHash: adminHash,
      phone: "+998905783272",
      role: "admin",
    })
    .onConflictDoNothing();
  console.log("✅ Admin user created (admin@pdrcenteruzbekistan.com / admin123)");

  // Services
  await db.delete(servicesTable);
  await db.insert(servicesTable).values([
    {
      nameUz: "G'ijimlash tuzatish (PDR)",
      nameEn: "Paintless Dent Repair (PDR)",
      nameRu: "Беспокрасочное удаление вмятин (PDR)",
      descriptionUz: "Avtomobil kuzovidan g'ijimlash va botiqliklarni bo'yoqsiz tuzatish texnologiyasi. Tezkor va sifatli natija.",
      descriptionEn: "Paintless dent removal technology for car bodies. Fast and high-quality results without repainting.",
      descriptionRu: "Технология удаления вмятин без покраски. Быстрый и качественный результат без нарушения заводского ЛКП.",
      price: 50000,
      category: "dent",
      sortOrder: 1,
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
    },
    {
      nameUz: "Do'l zarbidan tuzatish",
      nameEn: "Hail Damage Repair",
      nameRu: "Ремонт после градобития",
      descriptionUz: "Do'l yomg'iridan keyin paydo bo'lgan minglab botiqliklarni tezda tuzatamiz. Butun kuzov qayta tiklanadi.",
      descriptionEn: "We quickly fix thousands of dents caused by hailstorm. The entire car body is restored.",
      descriptionRu: "Быстро устраняем тысячи вмятин от градобития. Полное восстановление кузова автомобиля.",
      price: 150000,
      category: "hail",
      sortOrder: 2,
      imageUrl: "https://images.unsplash.com/photo-1609261284706-3a01e4f2bba8?w=600",
    },
    {
      nameUz: "Shisha ta'mirlash",
      nameEn: "Windshield Repair",
      nameRu: "Ремонт стёкол",
      descriptionUz: "Old shisha va boshqa oynalardagi yoriqlar va zarbalarnit tuzatish. Almashtirmasdan ham ta'mirlash mumkin.",
      descriptionEn: "Repair of cracks and chips in windshields and other glass. Repair without replacement is possible.",
      descriptionRu: "Устранение трещин и сколов на лобовом и других стёклах. Ремонт без замены.",
      price: 30000,
      category: "glass",
      sortOrder: 3,
      imageUrl: "https://images.unsplash.com/photo-1541447271487-09612b3f49f7?w=600",
    },
    {
      nameUz: "Kuzov pardozlash",
      nameEn: "Body Polishing",
      nameRu: "Полировка кузова",
      descriptionUz: "Avtomobil kuzovini professional pardozlash. Tirnoq izlari, oksidlanish va mayda tirnalishlarni yo'q qilish.",
      descriptionEn: "Professional car body polishing. Removal of swirl marks, oxidation and fine scratches.",
      descriptionRu: "Профессиональная полировка кузова. Устранение царапин, окисления и голограмм.",
      price: 80000,
      category: "polish",
      sortOrder: 4,
      imageUrl: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=600",
    },
    {
      nameUz: "Keramik qoplama",
      nameEn: "Ceramic Coating",
      nameRu: "Керамическое покрытие",
      descriptionUz: "Kuzovni uzoq muddatli himoya uchun keramik qoplama. 2-5 yil davomida kuzovni saqlaydi.",
      descriptionEn: "Ceramic coating for long-term body protection. Protects the body for 2-5 years.",
      descriptionRu: "Керамическое покрытие для долгосрочной защиты кузова на 2-5 лет.",
      price: 200000,
      category: "ceramic",
      sortOrder: 5,
      imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600",
    },
    {
      nameUz: "Raqamli diagnostika",
      nameEn: "Digital Diagnostics",
      nameRu: "Компьютерная диагностика",
      descriptionUz: "Zamonaviy uskunalar yordamida avtomobil kuzovining to'liq diagnostikasi va hisobot.",
      descriptionEn: "Complete car body diagnostics and reporting using modern equipment.",
      descriptionRu: "Полная диагностика кузова с использованием современного оборудования.",
      price: 25000,
      category: "diagnostics",
      sortOrder: 6,
      imageUrl: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600",
    },
  ]);
  console.log("✅ Services seeded");

  // Products (tools)
  await db.delete(productsTable);
  await db.insert(productsTable).values([
    {
      nameUz: "PDR chiziqli chiroq",
      nameEn: "PDR Line Board LED Lamp",
      nameRu: "Светодиодная лампа PDR",
      descriptionUz: "Professional PDR ishi uchun yuqori sifatli chiziqli LED chiroq. Botiqliklarni aniq ko'rish imkonini beradi.",
      descriptionEn: "High-quality LED line lamp for professional PDR work. Allows precise visibility of dents.",
      descriptionRu: "Светодиодная лампа для профессиональной работы PDR. Обеспечивает точную видимость вмятин.",
      price: 850000,
      category: "lamps",
      inStock: true,
      sortOrder: 1,
      imageUrl: "https://images.unsplash.com/photo-1504222490345-c075b7ded629?w=600",
    },
    {
      nameUz: "PDR tayoqchalar to'plami",
      nameEn: "PDR Rods Set (25 pcs)",
      nameRu: "Набор рычагов PDR (25 шт)",
      descriptionUz: "25 ta turli o'lchamdagi professional PDR tayoqchalari to'plami. Kafolatlangan sifat.",
      descriptionEn: "Professional set of 25 PDR rods in various sizes. Guaranteed quality.",
      descriptionRu: "Профессиональный набор из 25 рычагов PDR различных размеров.",
      price: 1200000,
      category: "tools",
      inStock: true,
      sortOrder: 2,
      imageUrl: "https://images.unsplash.com/photo-1567789884554-0b844b597180?w=600",
    },
    {
      nameUz: "Glue pulling kit",
      nameEn: "Glue Pulling System Kit",
      nameRu: "Набор для клеевой системы",
      descriptionUz: "Botiqliklarni tortib chiqarish uchun klej tizimi. Barcha kerakli jihozlar bilan.",
      descriptionEn: "Glue pulling system for extracting dents. Complete with all necessary equipment.",
      descriptionRu: "Клеевая система для вытягивания вмятин. В комплекте всё необходимое.",
      price: 450000,
      category: "glue",
      inStock: true,
      sortOrder: 3,
      imageUrl: "https://images.unsplash.com/photo-1562016600-ece13e8ba570?w=600",
    },
    {
      nameUz: "PDR metall qoshiqchasi",
      nameEn: "PDR Metal Spoon Tool",
      nameRu: "Металлическая ложка PDR",
      descriptionUz: "Professional kuzov ta'mirlash uchun yuqori sifatli metall qoshiq vosita.",
      descriptionEn: "High-quality metal spoon tool for professional body repair.",
      descriptionRu: "Качественный металлический инструмент-ложка для профессионального ремонта кузова.",
      price: 120000,
      category: "tools",
      inStock: true,
      sortOrder: 4,
      imageUrl: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600",
    },
    {
      nameUz: "Reflector panel",
      nameEn: "Reflector Panel Board",
      nameRu: "Рефлекторная панель",
      descriptionUz: "Kuzov sirtini tekshirish uchun katta reflector panel. Botiqliklarni aniq ko'rsatadi.",
      descriptionEn: "Large reflector panel for inspecting body surfaces. Shows dents precisely.",
      descriptionRu: "Большая рефлекторная панель для осмотра поверхности кузова.",
      price: 650000,
      category: "lamps",
      inStock: false,
      sortOrder: 5,
      imageUrl: "https://images.unsplash.com/photo-1493238792000-8113da705763?w=600",
    },
    {
      nameUz: "Dent remover set",
      nameEn: "Complete Dent Remover Set",
      nameRu: "Полный набор для удаления вмятин",
      descriptionUz: "Boshlangʻich va professional darajalar uchun toʻliq PDR asboblar toʻplami.",
      descriptionEn: "Complete PDR tool set for beginner and professional levels.",
      descriptionRu: "Полный набор PDR инструментов для начинающих и профессионалов.",
      price: 2500000,
      category: "tools",
      inStock: true,
      sortOrder: 6,
      imageUrl: "https://images.unsplash.com/photo-1609261284706-3a01e4f2bba8?w=600",
    },
  ]);
  console.log("✅ Products seeded");

  // Courses
  await db.delete(coursesTable);
  await db.insert(coursesTable).values([
    {
      nameUz: "PDR asoslari kursi",
      nameEn: "PDR Basics Course",
      nameRu: "Базовый курс PDR",
      descriptionUz: "PDR texnologiyasiga kirish kursi. Asosiy vositalar va usullarni o'rgatamiz. Kurs oxirida sertifikat beriladi.",
      descriptionEn: "Introductory course in PDR technology. We teach basic tools and techniques. Certificate awarded at the end.",
      descriptionRu: "Вводный курс по технологии PDR. Обучаем базовым инструментам и техникам. По окончании выдаётся сертификат.",
      price: 2500000,
      durationDays: 7,
      level: "beginner",
      sortOrder: 1,
      imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600",
    },
    {
      nameUz: "O'rta daraja PDR kursi",
      nameEn: "Intermediate PDR Course",
      nameRu: "Средний курс PDR",
      descriptionUz: "Murakkab botiqliklar va do'l zarari bilan ishlash. Real mashina ustida amaliy mashg'ulotlar.",
      descriptionEn: "Working with complex dents and hail damage. Practical exercises on real cars.",
      descriptionRu: "Работа со сложными вмятинами и повреждениями от градобития. Практика на реальных автомобилях.",
      price: 4500000,
      durationDays: 14,
      level: "intermediate",
      sortOrder: 2,
      imageUrl: "https://images.unsplash.com/photo-1434494817513-cc112a976e36?w=600",
    },
    {
      nameUz: "Professional PDR ustasi kursi",
      nameEn: "Professional PDR Master Course",
      nameRu: "Курс мастера PDR",
      descriptionUz: "Eng yuqori darajadagi professional kurs. Har qanday murakkablikdagi ishlarni bajarishni o'rgatamiz.",
      descriptionEn: "Highest level professional course. We teach you to perform work of any complexity.",
      descriptionRu: "Профессиональный курс высшего уровня. Обучаем работе любой сложности.",
      price: 8000000,
      durationDays: 30,
      level: "advanced",
      sortOrder: 3,
      imageUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600",
    },
    {
      nameUz: "Keramik qoplama kursi",
      nameEn: "Ceramic Coating Course",
      nameRu: "Курс керамического покрытия",
      descriptionUz: "Keramik qoplama qo'llash va polishing bo'yicha to'liq kurs. Bozorda talab yuqori mutaxassislik.",
      descriptionEn: "Complete course on ceramic coating application and polishing. High-demand specialty in the market.",
      descriptionRu: "Полный курс по нанесению керамического покрытия и полировке.",
      price: 3000000,
      durationDays: 5,
      level: "beginner",
      sortOrder: 4,
      imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600",
    },
  ]);
  console.log("✅ Courses seeded");

  // Gallery
  await db.delete(galleryTable);
  await db.insert(galleryTable).values([
    {
      titleUz: "Toyota Camry - do'l zarari",
      titleEn: "Toyota Camry - hail damage",
      titleRu: "Toyota Camry - повреждение градом",
      beforeImage: "https://images.unsplash.com/photo-1609261284706-3a01e4f2bba8?w=600",
      afterImage: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600",
      category: "hail",
      carBrand: "Toyota",
    },
    {
      titleUz: "BMW - kaput g'ijimlash",
      titleEn: "BMW - hood dent repair",
      titleRu: "BMW - ремонт вмятины капота",
      beforeImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
      afterImage: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600",
      category: "dent",
      carBrand: "BMW",
    },
    {
      titleUz: "Mercedes - yon qism",
      titleEn: "Mercedes - side panel",
      titleRu: "Mercedes - боковая панель",
      beforeImage: "https://images.unsplash.com/photo-1597404294360-feeeda04612e?w=600",
      afterImage: "https://images.unsplash.com/photo-1617531653332-bd46c16f7d5a?w=600",
      category: "dent",
      carBrand: "Mercedes",
    },
    {
      titleUz: "Chevrolet - eshik ta'miri",
      titleEn: "Chevrolet - door repair",
      titleRu: "Chevrolet - ремонт двери",
      beforeImage: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600",
      afterImage: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600",
      category: "dent",
      carBrand: "Chevrolet",
    },
    {
      titleUz: "Hyundai - old qopqoq",
      titleEn: "Hyundai - trunk lid",
      titleRu: "Hyundai - крышка багажника",
      beforeImage: "https://images.unsplash.com/photo-1541447271487-09612b3f49f7?w=600",
      afterImage: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600",
      category: "dent",
      carBrand: "Hyundai",
    },
    {
      titleUz: "Audi - do'l 200+ botiq",
      titleEn: "Audi - hail 200+ dents",
      titleRu: "Audi - 200+ вмятин от града",
      beforeImage: "https://images.unsplash.com/photo-1609261284706-3a01e4f2bba8?w=600",
      afterImage: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600",
      category: "hail",
      carBrand: "Audi",
    },
  ]);
  console.log("✅ Gallery seeded");

  // Reviews
  await db.delete(reviewsTable);
  await db.insert(reviewsTable).values([
    {
      author: "Jahongir Toshmatov",
      textUz: "Juda professional xizmat! Mashinam kapotigidagi katta g'ijimlash 2 soatda tuzatildi. Bo'yoq tegmadi, kafolat berishdi. Tavsiya qilaman!",
      textEn: "Very professional service! The large dent on my car hood was fixed in 2 hours. No paint, with warranty. Highly recommend!",
      textRu: "Очень профессиональный сервис! Большая вмятина на капоте была исправлена за 2 часа. Без покраски, с гарантией. Рекомендую!",
      carBrand: "Toyota Camry",
      rating: 5,
    },
    {
      author: "Rustam Nazarov",
      textUz: "Do'l yog'inidan keyin mashinam to'liq xarob bo'ldi edi. PDR Center Uzbekistan jamoasi hammasini tikladi. Sifat ajoyib!",
      textEn: "After the hailstorm my car was completely ruined. The PDR Center Uzbekistan team restored everything. Excellent quality!",
      textRu: "После градобития машина была полностью разбита. Команда PDR Center Uzbekistan восстановила всё. Отличное качество!",
      carBrand: "BMW 5 Series",
      rating: 5,
    },
    {
      author: "Nodira Yusupova",
      textUz: "Kurs o'tdim va hozir o'zim PDR ustasi sifatida ishlayapman. Juda yaxshi o'qitishdi, amaliy mashg'ulotlar ko'p edi.",
      textEn: "I took the course and now I work as a PDR master myself. Very good teaching, many practical exercises.",
      textRu: "Прошла курс и теперь сама работаю мастером PDR. Очень хорошее обучение, много практики.",
      carBrand: null,
      rating: 5,
    },
    {
      author: "Bobur Karimov",
      textUz: "Mercedes eshigidagi g'ijimlashni tuzatdilar. Hech kim sezmaydi, perfekt ish! Narxi ham adolatli.",
      textEn: "They fixed the dent on the Mercedes door. Nobody notices it, perfect job! The price is also fair.",
      textRu: "Исправили вмятину на двери Mercedes. Никто не заметит, идеальная работа! Цена тоже справедливая.",
      carBrand: "Mercedes E-Class",
      rating: 5,
    },
    {
      author: "Feruza Abdullayeva",
      textUz: "Yaxshi xizmat, tez va sifatli. Navbat biroz uzoq kutildi, lekin natija a'lo.",
      textEn: "Good service, fast and quality. The queue was a bit long, but the result is excellent.",
      textRu: "Хороший сервис, быстро и качественно. Пришлось немного подождать в очереди, но результат отличный.",
      carBrand: "Chevrolet Malibu",
      rating: 4,
    },
  ]);
  console.log("✅ Reviews seeded");

  console.log("🎉 Database seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
