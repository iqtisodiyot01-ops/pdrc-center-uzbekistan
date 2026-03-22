import { useState, useEffect } from "react";
import { useAppStore } from "@/store/use-store";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ShieldAlert, Settings } from "lucide-react";
import { AdminLayout, type AdminSection, hasPermission } from "@/components/admin/AdminLayout";
import { DashboardSection } from "@/components/admin/DashboardSection";
import { OrdersSection } from "@/components/admin/OrdersSection";
import { MessagesSection } from "@/components/admin/MessagesSection";
import { BookingsSection } from "@/components/admin/BookingsSection";
import { AdvertisementsSection } from "@/components/admin/AdvertisementsSection";
import { FinancesSection } from "@/components/admin/FinancesSection";
import { AdminsSection } from "@/components/admin/AdminsSection";
import { SettingsSection } from "@/components/admin/SettingsSection";
import { ContentSection } from "@/components/admin/ContentSection";
import { CategoriesSection } from "@/components/admin/CategoriesSection";
import { ContactInfoSection } from "@/components/admin/ContactInfoSection";
import { SiteTextsSection } from "@/components/admin/SiteTextsSection";

function PermissionDenied() {
  const { lang } = useAppStore();
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center px-4">
      <ShieldAlert className="w-16 h-16 text-yellow-400 mb-4" />
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        {lang === "uz" ? "Ruxsat berilmagan" : lang === "ru" ? "\u0414\u043e\u0441\u0442\u0443\u043f \u0437\u0430\u043f\u0440\u0435\u0449\u0451\u043d" : "Access Denied"}
      </h2>
      <p className="text-gray-500 max-w-md">
        {lang === "uz"
          ? "Superadmin sizga bu huquqni bermagan. Iltimos, superadmin bilan bog'laning."
          : lang === "ru"
            ? "\u0421\u0443\u043f\u0435\u0440\u0430\u0434\u043c\u0438\u043d \u043d\u0435 \u043f\u0440\u0435\u0434\u043e\u0441\u0442\u0430\u0432\u0438\u043b \u0432\u0430\u043c \u044d\u0442\u043e \u043f\u0440\u0430\u0432\u043e. \u041f\u043e\u0436\u0430\u043b\u0443\u0439\u0441\u0442\u0430, \u0441\u0432\u044f\u0436\u0438\u0442\u0435\u0441\u044c \u0441 \u0441\u0443\u043f\u0435\u0440\u0430\u0434\u043c\u0438\u043d\u043e\u043c."
            : "The superadmin has not granted you this permission. Please contact the superadmin."}
      </p>
    </div>
  );
}

export default function Admin() {
  const { user, lang } = useAppStore();
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["admin-unread-messages"],
    queryFn: () => api.get<{ count: number }>("/admin/messages/unread-count"),
    enabled: !!user && (user.role === "admin" || user.role === "superadmin"),
    refetchInterval: 30000,
  });

  const { data: adminCategories = [] } = useQuery<{ id: number; nameUz: string; nameEn: string; nameRu: string }[]>({
    queryKey: ["categories"],
    queryFn: () => api.get("/categories"),
    enabled: !!user && (user.role === "admin" || user.role === "superadmin"),
  });

  const { data: statsData } = useQuery<{ pendingOrders: number }>({
    queryKey: ["admin-stats-mini"],
    queryFn: () => api.get<{ pendingOrders: number }>("/admin/stats"),
    enabled: !!user && (user.role === "admin" || user.role === "superadmin"),
    refetchInterval: 30000,
  });

  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-gray-50">
        <Settings className="w-20 h-20 text-red-400 mb-6" />
        <h1 className="text-3xl font-display text-[#0f3460] mb-2 uppercase">
          {lang === "uz" ? "Kirish taqiqlangan" : lang === "ru" ? "\u0414\u043e\u0441\u0442\u0443\u043f \u0437\u0430\u043f\u0440\u0435\u0449\u0451\u043d" : "Access Denied"}
        </h1>
        <p className="text-gray-500">
          {lang === "uz" ? "Sizda admin huquqi yo'q" : lang === "ru" ? "\u0423 \u0432\u0430\u0441 \u043d\u0435\u0442 \u043f\u0440\u0430\u0432 \u0430\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440\u0430" : "You don't have admin access"}
        </p>
      </div>
    );
  }

  const permitted = hasPermission(user, activeSection);

  function renderSection() {
    if (!permitted) return <PermissionDenied />;

    switch (activeSection) {
      case "dashboard":
        return <DashboardSection onNavigate={setActiveSection} />;
      case "orders":
        return <OrdersSection />;
      case "messages":
        return <MessagesSection />;
      case "bookings":
        return <BookingsSection />;
      case "categories":
        return <CategoriesSection />;
      case "products":
        return (
          <ContentSection
            title={lang === "uz" ? "Mahsulotlar" : "Products"}
            apiPath="products"
            queryKey="products"
            defaultValues={{ inStock: true, stock: 0 }}
            fields={[
              { key: "nameUz", label: "Nomi (UZ)", type: "text", required: true },
              { key: "nameEn", label: "Name (EN)", type: "text", required: true },
              { key: "nameRu", label: "Название (RU)", type: "text", required: true },
              { key: "descriptionUz", label: "Tavsif (UZ)", type: "textarea", required: true },
              { key: "descriptionEn", label: "Description (EN)", type: "textarea", required: true },
              { key: "descriptionRu", label: "Описание (RU)", type: "textarea", required: true },
              { key: "price", label: lang === "uz" ? "Narxi (UZS)" : "Price (UZS)", type: "number", required: true },
              { key: "discountPrice", label: lang === "uz" ? "Chegirma narxi (UZS)" : "Discount Price (UZS)", type: "number" },
              { key: "stock", label: lang === "uz" ? "Ombordagi miqdor" : "Stock Quantity", type: "number" },
              {
                key: "category",
                label: lang === "uz" ? "Kategoriya" : "Category",
                type: adminCategories.length > 0 ? "select" : "text",
                required: true,
                options: adminCategories.map((c) => c.nameUz),
                placeholder: lang === "uz" ? "Kategoriyani tanlang" : "Select category",
              },
              { key: "imageUrl", label: lang === "uz" ? "Rasm" : "Image", type: "image" },
              { key: "inStock", label: lang === "uz" ? "Mavjud" : "In Stock", type: "checkbox" },
            ]}
            displayFn={(item, l) => ({
              title: String(l === "uz" ? item.nameUz : l === "ru" ? item.nameRu : item.nameEn),
              subtitle: String(l === "uz" ? item.nameEn : item.nameUz) + " / " + String(item.nameRu),
              meta: item.discountPrice
                ? `${Number(item.discountPrice).toLocaleString()} UZS (${Number(item.price).toLocaleString()})`
                : `${Number(item.price).toLocaleString()} UZS`,
              badge: String(item.category),
              image: item.imageUrl ? String(item.imageUrl) : undefined,
            })}
          />
        );
      case "services":
        return (
          <ContentSection
            title={lang === "uz" ? "Xizmatlar" : "Services"}
            apiPath="services"
            queryKey="services"
            fields={[
              { key: "nameUz", label: "Nomi (UZ)", type: "text", required: true },
              { key: "nameEn", label: "Name (EN)", type: "text", required: true },
              { key: "nameRu", label: "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 (RU)", type: "text", required: true },
              { key: "descriptionUz", label: "Tavsif (UZ)", type: "textarea", required: true },
              { key: "descriptionEn", label: "Description (EN)", type: "textarea", required: true },
              { key: "descriptionRu", label: "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435 (RU)", type: "textarea", required: true },
              { key: "price", label: lang === "uz" ? "Narxi" : "Price", type: "number" },
              { key: "category", label: lang === "uz" ? "Kategoriya" : "Category", type: "text" },
              { key: "imageUrl", label: lang === "uz" ? "Rasm" : "Image", type: "image" },
            ]}
            displayFn={(item, l) => ({
              title: String(l === "uz" ? item.nameUz : l === "ru" ? item.nameRu : item.nameEn),
              subtitle: String(item.nameUz) + " / " + String(item.nameRu),
              meta: item.price ? `${Number(item.price).toLocaleString()} UZS` : undefined,
              badge: item.category ? String(item.category) : undefined,
            })}
          />
        );
      case "courses":
        return (
          <ContentSection
            title={lang === "uz" ? "Kurslar" : "Courses"}
            apiPath="courses"
            queryKey="courses"
            fields={[
              { key: "nameUz", label: "Nomi (UZ)", type: "text", required: true },
              { key: "nameEn", label: "Name (EN)", type: "text", required: true },
              { key: "nameRu", label: "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 (RU)", type: "text", required: true },
              { key: "descriptionUz", label: "Tavsif (UZ)", type: "textarea", required: true },
              { key: "descriptionEn", label: "Description (EN)", type: "textarea", required: true },
              { key: "descriptionRu", label: "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435 (RU)", type: "textarea", required: true },
              { key: "price", label: lang === "uz" ? "Narxi" : "Price", type: "number", required: true },
              { key: "durationDays", label: lang === "uz" ? "Davomiyligi (kun)" : "Duration (days)", type: "number", required: true },
              { key: "level", label: lang === "uz" ? "Daraja" : "Level", type: "select", options: ["beginner", "intermediate", "advanced"] },
              { key: "imageUrl", label: lang === "uz" ? "Rasm" : "Image", type: "image" },
            ]}
            displayFn={(item, l) => ({
              title: String(l === "uz" ? item.nameUz : l === "ru" ? item.nameRu : item.nameEn),
              subtitle: `${item.durationDays} ${l === "uz" ? "kun" : "days"}`,
              meta: `${Number(item.price).toLocaleString()} UZS`,
              badge: String(item.level || "beginner"),
              image: item.imageUrl ? String(item.imageUrl) : undefined,
            })}
          />
        );
      case "articles":
        return (
          <ContentSection
            title={lang === "uz" ? "Maqolalar" : "Articles"}
            apiPath="articles"
            queryKey="articles"
            fields={[
              { key: "titleUz", label: "Sarlavha (UZ)", type: "text", required: true },
              { key: "titleEn", label: "Title (EN)", type: "text", required: true },
              { key: "titleRu", label: "\u0417\u0430\u0433\u043e\u043b\u043e\u0432\u043e\u043a (RU)", type: "text", required: true },
              { key: "contentUz", label: "Matn (UZ)", type: "textarea", required: true },
              { key: "contentEn", label: "Content (EN)", type: "textarea", required: true },
              { key: "contentRu", label: "\u0421\u043e\u0434\u0435\u0440\u0436\u0430\u043d\u0438\u0435 (RU)", type: "textarea", required: true },
              { key: "imageUrl", label: lang === "uz" ? "Rasm" : "Image", type: "image" },
            ]}
            displayFn={(item, l) => ({
              title: String(l === "uz" ? item.titleUz : l === "ru" ? item.titleRu : item.titleEn),
              subtitle: String(l === "uz" ? item.titleEn : item.titleUz),
              image: item.imageUrl ? String(item.imageUrl) : undefined,
            })}
          />
        );
      case "gallery":
        return (
          <ContentSection
            title={lang === "uz" ? "Galereya" : "Gallery"}
            apiPath="gallery"
            queryKey="gallery"
            fields={[
              { key: "titleUz", label: "Sarlavha (UZ)", type: "text", required: true },
              { key: "titleEn", label: "Title (EN)", type: "text", required: true },
              { key: "titleRu", label: "\u0417\u0430\u0433\u043e\u043b\u043e\u0432\u043e\u043a (RU)", type: "text", required: true },
              { key: "beforeImage", label: lang === "uz" ? "Oldin rasm" : "Before Image", type: "image" },
              { key: "afterImage", label: lang === "uz" ? "Keyin rasm" : "After Image", type: "image" },
              { key: "category", label: lang === "uz" ? "Kategoriya" : "Category", type: "text" },
              { key: "carBrand", label: lang === "uz" ? "Mashina markasi" : "Car Brand", type: "text" },
            ]}
            displayFn={(item, l) => ({
              title: String(l === "uz" ? item.titleUz : l === "ru" ? item.titleRu : item.titleEn),
              badge: item.carBrand ? String(item.carBrand) : undefined,
              image: item.beforeImage ? String(item.beforeImage) : undefined,
            })}
          />
        );
      case "reviews":
        return (
          <ContentSection
            title={lang === "uz" ? "Sharhlar" : "Reviews"}
            apiPath="reviews"
            queryKey="reviews"
            fields={[
              { key: "author", label: lang === "uz" ? "Muallif" : "Author", type: "text", required: true },
              { key: "rating", label: lang === "uz" ? "Baho (1-5)" : "Rating (1-5)", type: "number", required: true },
              { key: "textUz", label: "Sharh (UZ)", type: "textarea", required: true },
              { key: "textEn", label: "Review (EN)", type: "textarea", required: true },
              { key: "textRu", label: "\u041e\u0442\u0437\u044b\u0432 (RU)", type: "textarea", required: true },
              { key: "carBrand", label: lang === "uz" ? "Mashina markasi" : "Car Brand", type: "text" },
              { key: "avatarUrl", label: lang === "uz" ? "Avatar rasm" : "Avatar Image", type: "image" },
            ]}
            displayFn={(item, l) => ({
              title: `${item.author} ${"★".repeat(Number(item.rating) || 5)}`,
              subtitle: String(l === "uz" ? item.textUz : l === "ru" ? item.textRu : item.textEn).substring(0, 100),
              badge: item.carBrand ? String(item.carBrand) : undefined,
              image: item.avatarUrl ? String(item.avatarUrl) : undefined,
            })}
          />
        );
      case "advertisements":
        return <AdvertisementsSection />;
      case "finances":
        return <FinancesSection />;
      case "admins":
        return <AdminsSection />;
      case "contactInfo":
        return <ContactInfoSection />;
      case "siteTexts":
        if (user?.role !== "superadmin") return <PermissionDenied />;
        return <SiteTextsSection />;
      case "settings":
        return <SettingsSection />;
      default:
        return <DashboardSection onNavigate={setActiveSection} />;
    }
  }

  return (
    <AdminLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      unreadMessages={unreadData?.count}
      pendingOrders={statsData?.pendingOrders}
    >
      {renderSection()}
    </AdminLayout>
  );
}
