import { useState } from "react";
import {
  useGetBookings, useUpdateBookingStatus,
  useGetServices, useCreateService, useDeleteService,
  useGetProducts, useCreateProduct, useDeleteProduct,
  useGetCourses, useCreateCourse, useDeleteCourse,
  useGetArticles, useCreateArticle, useUpdateArticle, useDeleteArticle,
  useGetAdminUsers, useUpdateAdminUser, useDeleteAdminUser,
  getGetBookingsQueryKey, getGetServicesQueryKey, getGetProductsQueryKey, getGetCoursesQueryKey,
  getGetArticlesQueryKey, getGetAdminUsersQueryKey,
} from "@workspace/api-client-react";
import type { ServiceInput, ProductInput, CourseInput, ArticleInput, Booking, Service, Product, Course, Article, AdminUser } from "@workspace/api-client-react";
import { useAppStore } from "@/store/use-store";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Settings, Calendar, Wrench, ShoppingCart, GraduationCap, Plus, Trash2, FileText, Users, Edit } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type AdminTab = "bookings" | "services" | "products" | "courses" | "articles" | "users";
type BookingStatus = "new" | "in_progress" | "completed" | "cancelled";

const serviceSchema = z.object({
  nameUz: z.string().min(1),
  nameEn: z.string().min(1),
  nameRu: z.string().min(1),
  descriptionUz: z.string().min(1),
  descriptionEn: z.string().min(1),
  descriptionRu: z.string().min(1),
  price: z.coerce.number().optional(),
  category: z.string().optional(),
});

const productSchema = z.object({
  nameUz: z.string().min(1),
  nameEn: z.string().min(1),
  nameRu: z.string().min(1),
  descriptionUz: z.string().min(1),
  descriptionEn: z.string().min(1),
  descriptionRu: z.string().min(1),
  price: z.coerce.number().min(0),
  category: z.string().min(1),
  inStock: z.boolean().optional(),
});

const courseSchema = z.object({
  nameUz: z.string().min(1),
  nameEn: z.string().min(1),
  nameRu: z.string().min(1),
  descriptionUz: z.string().min(1),
  descriptionEn: z.string().min(1),
  descriptionRu: z.string().min(1),
  price: z.coerce.number().min(0),
  durationDays: z.coerce.number().min(1),
  level: z.string().optional(),
});

type ServiceForm = z.infer<typeof serviceSchema>;
type ProductForm = z.infer<typeof productSchema>;
type CourseForm = z.infer<typeof courseSchema>;

const articleSchema = z.object({
  titleUz: z.string().min(1),
  titleEn: z.string().min(1),
  titleRu: z.string().min(1),
  contentUz: z.string().min(1),
  contentEn: z.string().min(1),
  contentRu: z.string().min(1),
  imageUrl: z.string().optional(),
});
type ArticleForm = z.infer<typeof articleSchema>;

function authHeaders(token: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

function inputClass() {
  return "w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all";
}

function labelClass() {
  return "text-xs font-bold text-gray-600 uppercase tracking-wider";
}

export default function Admin() {
  const { token, user } = useAppStore();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<AdminTab>("bookings");
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  const requestOpts = { headers: authHeaders(token) };

  if (user?.role !== "admin") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-gray-50">
        <Settings className="w-20 h-20 text-red-400 mb-6" />
        <h1 className="text-3xl font-display text-[#0f3460] mb-2 uppercase">{t.admin.access_denied}</h1>
        <p className="text-gray-500">{t.admin.access_denied_desc}</p>
      </div>
    );
  }

  // -- Bookings --
  const { data: bookings, isLoading: bookingsLoading } = useGetBookings({
    query: { enabled: !!token, queryKey: getGetBookingsQueryKey() },
    request: requestOpts
  });
  const updateBooking = useUpdateBookingStatus({
    request: requestOpts,
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetBookingsQueryKey() }) }
  });

  // -- Services --
  const { data: services } = useGetServices({
    query: { enabled: !!token, queryKey: getGetServicesQueryKey() },
    request: requestOpts
  });
  const serviceForm = useForm<ServiceForm>({ resolver: zodResolver(serviceSchema) });
  const createService = useCreateService({
    request: requestOpts,
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetServicesQueryKey() });
        serviceForm.reset();
        setShowServiceForm(false);
        toast({ title: t.admin.created });
      },
      onError: () => toast({ variant: "destructive", title: t.admin.error }),
    }
  });
  const deleteService = useDeleteService({
    request: requestOpts,
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetServicesQueryKey() });
        toast({ title: t.admin.deleted });
      }
    }
  });

  // -- Products --
  const { data: products } = useGetProducts(undefined, {
    query: { enabled: !!token, queryKey: getGetProductsQueryKey() },
    request: requestOpts
  });
  const productForm = useForm<ProductForm>({ resolver: zodResolver(productSchema), defaultValues: { inStock: true } });
  const createProduct = useCreateProduct({
    request: requestOpts,
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProductsQueryKey() });
        productForm.reset();
        setShowProductForm(false);
        toast({ title: t.admin.created });
      },
      onError: () => toast({ variant: "destructive", title: t.admin.error }),
    }
  });
  const deleteProduct = useDeleteProduct({
    request: requestOpts,
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProductsQueryKey() });
        toast({ title: t.admin.deleted });
      }
    }
  });

  // -- Courses --
  const { data: courses } = useGetCourses({
    query: { enabled: !!token, queryKey: getGetCoursesQueryKey() },
    request: requestOpts
  });
  const courseForm = useForm<CourseForm>({ resolver: zodResolver(courseSchema) });
  const createCourse = useCreateCourse({
    request: requestOpts,
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCoursesQueryKey() });
        courseForm.reset();
        setShowCourseForm(false);
        toast({ title: t.admin.created });
      },
      onError: () => toast({ variant: "destructive", title: t.admin.error }),
    }
  });
  const deleteCourse = useDeleteCourse({
    request: requestOpts,
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCoursesQueryKey() });
        toast({ title: t.admin.deleted });
      }
    }
  });

  // -- Articles --
  const { data: articles } = useGetArticles({
    query: { enabled: !!token, queryKey: getGetArticlesQueryKey() },
    request: requestOpts
  });
  const articleForm = useForm<ArticleForm>({ resolver: zodResolver(articleSchema) });
  const createArticle = useCreateArticle({
    request: requestOpts,
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetArticlesQueryKey() });
        articleForm.reset();
        setShowArticleForm(false);
        toast({ title: t.admin.created });
      },
      onError: () => toast({ variant: "destructive", title: t.admin.error }),
    }
  });
  const updateArticle = useUpdateArticle({
    request: requestOpts,
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetArticlesQueryKey() });
        articleForm.reset();
        setShowArticleForm(false);
        setEditingArticle(null);
        toast({ title: t.admin.updated });
      },
      onError: () => toast({ variant: "destructive", title: t.admin.error }),
    }
  });
  const deleteArticle = useDeleteArticle({
    request: requestOpts,
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetArticlesQueryKey() });
        toast({ title: t.admin.deleted });
      }
    }
  });

  const handleEditArticle = (v: Article) => {
    setEditingArticle(v);
    articleForm.reset({
      titleUz: v.titleUz, titleEn: v.titleEn, titleRu: v.titleRu,
      contentUz: v.contentUz, contentEn: v.contentEn, contentRu: v.contentRu,
      imageUrl: v.imageUrl || undefined
    });
    setShowArticleForm(true);
  };

  // -- Users --
  const { data: adminUsers } = useGetAdminUsers({
    query: { enabled: !!token, queryKey: getGetAdminUsersQueryKey() },
    request: requestOpts
  });
  const updateAdminUser = useUpdateAdminUser({
    request: requestOpts,
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminUsersQueryKey() });
        toast({ title: t.admin.updated });
      },
      onError: () => toast({ variant: "destructive", title: t.admin.error }),
    }
  });
  const deleteAdminUser = useDeleteAdminUser({
    request: requestOpts,
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminUsersQueryKey() });
        toast({ title: t.admin.deleted });
      }
    }
  });

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: "bookings", label: t.admin.tab_bookings, icon: <Calendar size={16} /> },
    { id: "services", label: t.admin.tab_services, icon: <Wrench size={16} /> },
    { id: "products", label: t.admin.tab_products, icon: <ShoppingCart size={16} /> },
    { id: "courses", label: t.admin.tab_courses, icon: <GraduationCap size={16} /> },
    { id: "articles", label: t.admin.tab_articles, icon: <FileText size={16} /> },
    { id: "users", label: t.admin.tab_users, icon: <Users size={16} /> },
  ];

  return (
    <div className="w-full pb-24 bg-gray-50">
      {/* Header */}
      <div className="bg-[#0f3460] py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-2">
            <Settings className="text-blue-300 w-8 h-8" />
            <h1 className="text-4xl font-display text-white uppercase tracking-wider">
              {t.admin.title} <span className="text-blue-300">{t.admin.highlight}</span>
            </h1>
          </div>
          <p className="text-blue-100">{t.admin.desc}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex gap-2 border-b border-gray-200 pb-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold uppercase tracking-wider rounded-t-lg transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id
                ? "border-blue-700 text-blue-700 bg-blue-50"
                : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {/* BOOKINGS TAB */}
          {activeTab === "bookings" && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                <Calendar className="text-blue-700" />
                <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wider">{t.admin.bookings_title}</h2>
              </div>
              {bookingsLoading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-widest text-gray-500">
                        <th className="p-4 font-bold">{t.admin.col_date}</th>
                        <th className="p-4 font-bold">{t.admin.col_client}</th>
                        <th className="p-4 font-bold">{t.admin.col_phone}</th>
                        <th className="p-4 font-bold">{t.admin.col_message}</th>
                        <th className="p-4 font-bold">{t.admin.col_status}</th>
                        <th className="p-4 font-bold">{t.admin.col_actions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bookings?.map((booking: Booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 text-sm text-gray-500">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-sm text-gray-900 font-medium">{booking.name}</td>
                          <td className="p-4 text-sm text-blue-700 font-mono">{booking.phone}</td>
                          <td className="p-4 text-sm text-gray-500 max-w-xs truncate" title={booking.message ?? ""}>
                            {booking.message ?? "-"}
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${booking.status === "new" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                              booking.status === "completed" ? "bg-green-50 text-green-700 border border-green-200" :
                                booking.status === "cancelled" ? "bg-red-50 text-red-700 border border-red-200" :
                                  "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <select
                              className="bg-white border border-gray-200 text-sm text-gray-800 rounded-lg p-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                              value={booking.status}
                              onChange={(e) => {
                                const val = e.target.value as BookingStatus;
                                updateBooking.mutate({ id: booking.id, data: { status: val } });
                              }}
                              disabled={updateBooking.isPending}
                            >
                              <option value="new">New</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                      {(!bookings || bookings.length === 0) && (
                        <tr>
                          <td colSpan={6} className="p-12 text-center text-zinc-500 uppercase tracking-widest text-sm">
                            {t.admin.no_bookings}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SERVICES TAB */}
          {activeTab === "services" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 uppercase">{t.admin.tab_services}</h2>
                <button
                  onClick={() => setShowServiceForm(!showServiceForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white font-bold text-sm rounded-lg hover:bg-blue-800 transition-colors"
                >
                  <Plus size={16} /> {t.admin.add_new}
                </button>
              </div>

              {showServiceForm && (
                <form
                  onSubmit={serviceForm.handleSubmit((data) =>
                    createService.mutate({ data: data as ServiceInput })
                  )}
                  className="bg-white rounded-2xl border border-blue-100 p-6 grid grid-cols-1 md:grid-cols-2 gap-4 shadow-sm"
                >
                  {(["nameUz", "nameEn", "nameRu", "descriptionUz", "descriptionEn", "descriptionRu"] as const).map((field) => (
                    <div key={field} className="space-y-1">
                      <label className={labelClass()}>{t.admin[field.startsWith("name") ? ("name_" + field.slice(4).toLowerCase()) as "name_uz" | "name_en" | "name_ru" : ("desc_" + field.slice(11).toLowerCase()) as "desc_uz" | "desc_en" | "desc_ru"]}</label>
                      <input {...serviceForm.register(field)} className={inputClass()} />
                    </div>
                  ))}
                  <div className="space-y-1">
                    <label className={labelClass()}>{t.admin.price}</label>
                    <input {...serviceForm.register("price")} type="number" className={inputClass()} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass()}>{t.admin.category}</label>
                    <input {...serviceForm.register("category")} className={inputClass()} />
                  </div>
                  <div className="col-span-full flex gap-3 pt-2">
                    <button type="submit" disabled={createService.isPending} className="px-6 py-2 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 flex items-center gap-2">
                      {createService.isPending && <Loader2 size={14} className="animate-spin" />} {t.admin.save}
                    </button>
                    <button type="button" onClick={() => setShowServiceForm(false)} className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors">
                      {t.admin.cancel}
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services?.map((svc: Service) => (
                  <div key={svc.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between gap-4 hover:border-blue-200 transition-colors">
                    <div>
                      <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">{svc.category ?? "—"}</div>
                      <div className="font-bold text-gray-900">{svc.nameEn}</div>
                      <div className="text-gray-500 text-sm">{svc.nameUz} / {svc.nameRu}</div>
                      <div className="text-blue-700 text-sm font-mono mt-1">{svc.price ? `${svc.price.toLocaleString()} UZS` : "—"}</div>
                    </div>
                    <button
                      onClick={() => deleteService.mutate({ id: svc.id })}
                      className="text-gray-400 hover:text-red-600 transition-colors shrink-0"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 uppercase">{t.admin.tab_products}</h2>
                <button
                  onClick={() => setShowProductForm(!showProductForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white font-bold text-sm rounded-lg hover:bg-blue-800 transition-colors"
                >
                  <Plus size={16} /> {t.admin.add_new}
                </button>
              </div>

              {showProductForm && (
                <form
                  onSubmit={productForm.handleSubmit((data) =>
                    createProduct.mutate({ data: { ...data, inStock: data.inStock ?? true } as ProductInput })
                  )}
                  className="bg-white rounded-2xl border border-blue-100 p-6 grid grid-cols-1 md:grid-cols-2 gap-4 shadow-sm"
                >
                  {(["nameUz", "nameEn", "nameRu", "descriptionUz", "descriptionEn", "descriptionRu"] as const).map((field) => (
                    <div key={field} className="space-y-1">
                      <label className={labelClass()}>{t.admin[field.startsWith("name") ? ("name_" + field.slice(4).toLowerCase()) as "name_uz" | "name_en" | "name_ru" : ("desc_" + field.slice(11).toLowerCase()) as "desc_uz" | "desc_en" | "desc_ru"]}</label>
                      <input {...productForm.register(field)} className={inputClass()} />
                    </div>
                  ))}
                  <div className="space-y-1">
                    <label className={labelClass()}>{t.admin.price}</label>
                    <input {...productForm.register("price")} type="number" className={inputClass()} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass()}>{t.admin.category}</label>
                    <input {...productForm.register("category")} className={inputClass()} />
                  </div>
                  <div className="col-span-full flex items-center gap-3">
                    <input {...productForm.register("inStock")} type="checkbox" id="inStock" className="w-4 h-4 accent-blue-700" defaultChecked />
                    <label htmlFor="inStock" className={labelClass()}>{t.admin.in_stock}</label>
                  </div>
                  <div className="col-span-full flex gap-3 pt-2">
                    <button type="submit" disabled={createProduct.isPending} className="px-6 py-2 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 flex items-center gap-2">
                      {createProduct.isPending && <Loader2 size={14} className="animate-spin" />} {t.admin.save}
                    </button>
                    <button type="button" onClick={() => setShowProductForm(false)} className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors">
                      {t.admin.cancel}
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products?.map((prod: Product) => (
                  <div key={prod.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between gap-4 hover:border-blue-200 transition-colors">
                    <div>
                      <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">{prod.category}</div>
                      <div className="font-bold text-gray-900">{prod.nameEn}</div>
                      <div className="text-gray-500 text-sm">{prod.nameUz} / {prod.nameRu}</div>
                      <div className="text-blue-700 text-sm font-mono mt-1">{prod.price.toLocaleString()} UZS</div>
                      {!prod.inStock && <span className="text-xs text-red-500 font-bold">OUT OF STOCK</span>}
                    </div>
                    <button
                      onClick={() => deleteProduct.mutate({ id: prod.id })}
                      className="text-gray-400 hover:text-red-600 transition-colors shrink-0"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COURSES TAB */}
          {activeTab === "courses" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 uppercase">{t.admin.tab_courses}</h2>
                <button
                  onClick={() => setShowCourseForm(!showCourseForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white font-bold text-sm rounded-lg hover:bg-blue-800 transition-colors"
                >
                  <Plus size={16} /> {t.admin.add_new}
                </button>
              </div>

              {showCourseForm && (
                <form
                  onSubmit={courseForm.handleSubmit((data) =>
                    createCourse.mutate({ data: data as CourseInput })
                  )}
                  className="bg-white rounded-2xl border border-blue-100 p-6 grid grid-cols-1 md:grid-cols-2 gap-4 shadow-sm"
                >
                  {(["nameUz", "nameEn", "nameRu", "descriptionUz", "descriptionEn", "descriptionRu"] as const).map((field) => (
                    <div key={field} className="space-y-1">
                      <label className={labelClass()}>{t.admin[field.startsWith("name") ? ("name_" + field.slice(4).toLowerCase()) as "name_uz" | "name_en" | "name_ru" : ("desc_" + field.slice(11).toLowerCase()) as "desc_uz" | "desc_en" | "desc_ru"]}</label>
                      <input {...courseForm.register(field)} className={inputClass()} />
                    </div>
                  ))}
                  <div className="space-y-1">
                    <label className={labelClass()}>{t.admin.price}</label>
                    <input {...courseForm.register("price")} type="number" className={inputClass()} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass()}>{t.admin.duration_days}</label>
                    <input {...courseForm.register("durationDays")} type="number" className={inputClass()} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass()}>{t.admin.level}</label>
                    <input {...courseForm.register("level")} className={inputClass()} placeholder="beginner / intermediate / advanced" />
                  </div>
                  <div className="col-span-full flex gap-3 pt-2">
                    <button type="submit" disabled={createCourse.isPending} className="px-6 py-2 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 flex items-center gap-2">
                      {createCourse.isPending && <Loader2 size={14} className="animate-spin" />} {t.admin.save}
                    </button>
                    <button type="button" onClick={() => setShowCourseForm(false)} className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors">
                      {t.admin.cancel}
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses?.map((course: Course) => (
                  <div key={course.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between gap-4 hover:border-blue-200 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-blue-700 font-bold uppercase tracking-wider border border-blue-200 bg-blue-50 px-2 py-0.5 rounded">{course.level}</span>
                        <span className="text-gray-400 text-xs">{course.durationDays}d</span>
                      </div>
                      <div className="font-bold text-gray-900">{course.nameEn}</div>
                      <div className="text-gray-500 text-sm">{course.nameUz} / {course.nameRu}</div>
                      <div className="text-blue-700 text-sm font-mono mt-1">{course.price.toLocaleString()} UZS</div>
                    </div>
                    <button
                      onClick={() => deleteCourse.mutate({ id: course.id })}
                      className="text-gray-400 hover:text-red-600 transition-colors shrink-0"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ARTICLES TAB */}
          {activeTab === "articles" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 uppercase">{t.admin.tab_articles}</h2>
                <button
                  onClick={() => {
                    setEditingArticle(null);
                    articleForm.reset();
                    setShowArticleForm(!showArticleForm);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white font-bold text-sm rounded-lg hover:bg-blue-800 transition-colors"
                >
                  <Plus size={16} /> {t.admin.add_new}
                </button>
              </div>

              {showArticleForm && (
                <form
                  onSubmit={articleForm.handleSubmit((data) => {
                    const payload: ArticleInput = {
                      titleUz: data.titleUz,
                      titleEn: data.titleEn,
                      titleRu: data.titleRu,
                      contentUz: data.contentUz,
                      contentEn: data.contentEn,
                      contentRu: data.contentRu,
                      imageUrl: data.imageUrl || null,
                    };
                    if (editingArticle) {
                      updateArticle.mutate({ id: editingArticle.id, data: payload });
                    } else {
                      createArticle.mutate({ data: payload });
                    }
                  })}
                  className="bg-white rounded-2xl border border-blue-100 p-6 grid grid-cols-1 md:grid-cols-2 gap-4 shadow-sm"
                >
                  <div className="col-span-full">
                    <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-3">
                      {editingArticle ? t.admin.edit_article ?? "Edit Article" : t.admin.new_article ?? "New Article"}
                    </h3>
                  </div>
                  {(["titleUz", "titleEn", "titleRu"] as const).map((field) => (
                    <div key={field} className="space-y-1">
                      <label className={labelClass()}>{field === "titleUz" ? "Title (UZ)" : field === "titleEn" ? "Title (EN)" : "Title (RU)"}</label>
                      <input {...articleForm.register(field)} className={inputClass()} />
                    </div>
                  ))}
                  <div className="space-y-1">
                    <label className={labelClass()}>Image URL</label>
                    <input {...articleForm.register("imageUrl")} className={inputClass()} placeholder="https://..." />
                  </div>
                  {(["contentUz", "contentEn", "contentRu"] as const).map((field) => (
                    <div key={field} className="col-span-full space-y-1">
                      <label className={labelClass()}>{field === "contentUz" ? "Content (UZ)" : field === "contentEn" ? "Content (EN)" : "Content (RU)"}</label>
                      <textarea {...articleForm.register(field)} rows={4} className={inputClass() + " resize-none"} />
                    </div>
                  ))}
                  <div className="col-span-full flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={createArticle.isPending || updateArticle.isPending}
                      className="px-6 py-2 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {(createArticle.isPending || updateArticle.isPending) && <Loader2 size={14} className="animate-spin" />}
                      {t.admin.save}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowArticleForm(false); setEditingArticle(null); articleForm.reset(); }}
                      className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {t.admin.cancel}
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {articles?.map((article: Article) => (
                  <div key={article.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between gap-4 hover:border-blue-200 transition-colors">
                    <div className="min-w-0 flex-1">
                      {article.imageUrl && (
                        <img src={article.imageUrl} alt="" className="w-16 h-12 object-cover rounded mb-2 border border-gray-100" />
                      )}
                      <div className="font-bold text-gray-900 truncate">{article.titleEn}</div>
                      <div className="text-gray-500 text-sm truncate">{article.titleUz} / {article.titleRu}</div>
                      <div className="text-gray-400 text-xs mt-1">{new Date(article.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleEditArticle(article)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => deleteArticle.mutate({ id: article.id })}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                {(!articles || articles.length === 0) && (
                  <div className="p-12 text-center text-zinc-500 uppercase tracking-widest text-sm bg-white rounded-2xl border border-gray-200">
                    {t.admin.no_articles ?? "No articles yet"}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 uppercase">{t.admin.tab_users}</h2>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-widest text-gray-500">
                        <th className="p-4 font-bold">{t.admin.col_client}</th>
                        <th className="p-4 font-bold">Email</th>
                        <th className="p-4 font-bold">Role</th>
                        <th className="p-4 font-bold">Status</th>
                        <th className="p-4 font-bold">{t.admin.col_actions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {adminUsers?.map((u: AdminUser) => (
                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <div className="font-medium text-gray-900 text-sm">{u.name}</div>
                            {u.phone && <div className="text-gray-400 text-xs font-mono">{u.phone}</div>}
                          </td>
                          <td className="p-4 text-sm text-gray-600">{u.email}</td>
                          <td className="p-4">
                            <select
                              className="bg-white border border-gray-200 text-sm text-gray-800 rounded-lg p-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                              value={u.role}
                              onChange={(e) => updateAdminUser.mutate({ id: u.id, data: { role: e.target.value } })}
                              disabled={updateAdminUser.isPending}
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                              <option value="superadmin">Super Admin</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${u.isActive
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                              }`}>
                              {u.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => deleteAdminUser.mutate({ id: u.id })}
                              disabled={deleteAdminUser.isPending}
                              className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                              title="Deactivate user"
                            >
                              <Trash2 size={14} />
                              {t.admin.deactivate ?? "Deactivate"}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {(!adminUsers || adminUsers.length === 0) && (
                        <tr>
                          <td colSpan={5} className="p-12 text-center text-zinc-500 uppercase tracking-widest text-sm">
                            {t.admin.no_users ?? "No users found"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
