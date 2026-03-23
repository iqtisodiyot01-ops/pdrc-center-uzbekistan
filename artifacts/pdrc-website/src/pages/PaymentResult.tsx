import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useAppStore } from "@/store/use-store";
import { api } from "@/lib/api";
import { CheckCircle, XCircle, Loader2, ShoppingBag, Home, RefreshCw } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Order {
  id: number;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  fullName: string;
  createdAt: string;
}

export default function PaymentResult() {
  const { lang, token } = useAppStore();
  const [location] = useLocation();
  const [orderId, setOrderId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const isSuccess = location.startsWith("/payment/success");
  const isCancel = location.startsWith("/payment/cancel");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get("order_id") || "");
    if (!isNaN(id)) setOrderId(id);
  }, []);

  useEffect(() => {
    if (isSuccess && token) {
      api.delete("/cart").catch(console.error);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    }
  }, [isSuccess, token]);

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: () => api.get<Order[]>("/orders"),
    enabled: !!token && !!orderId,
    refetchInterval: (q) => {
      const order = (q.state.data as Order[] | undefined)?.find((o) => o.id === orderId);
      return order?.paymentStatus === "paid" ? false : 5000;
    },
  });

  const order = orders.find((o) => o.id === orderId);

  const t = {
    uz: {
      successTitle: "To'lov muvaffaqiyatli!",
      successDesc: "Buyurtmangiz tasdiqlandi va tez orada yetkazib beriladi.",
      cancelTitle: "To'lov bekor qilindi",
      cancelDesc: "To'lov amalga oshmadi yoki siz uni bekor qildingiz.",
      checkingTitle: "To'lov tekshirilmoqda...",
      checkingDesc: "Iltimos, kuting. Natija avtomatik yangilanadi.",
      orderNum: "Buyurtma raqami",
      total: "Jami summa",
      status: "Holati",
      paid: "To'langan",
      unpaid: "To'lanmagan",
      pending: "Kutilmoqda",
      confirmed: "Tasdiqlangan",
      toProfile: "Profilga o'tish",
      toHome: "Bosh sahifaga",
      retry: "Qayta urinish",
      som: "so'm",
    },
    ru: {
      successTitle: "Оплата успешна!",
      successDesc: "Ваш заказ подтверждён и будет доставлен в ближайшее время.",
      cancelTitle: "Оплата отменена",
      cancelDesc: "Платёж не был выполнен или был отменён.",
      checkingTitle: "Проверка платежа...",
      checkingDesc: "Пожалуйста, подождите. Статус обновляется автоматически.",
      orderNum: "Номер заказа",
      total: "Итого",
      status: "Статус",
      paid: "Оплачено",
      unpaid: "Не оплачено",
      pending: "В ожидании",
      confirmed: "Подтверждён",
      toProfile: "Перейти в профиль",
      toHome: "На главную",
      retry: "Повторить",
      som: "сум",
    },
    en: {
      successTitle: "Payment Successful!",
      successDesc: "Your order has been confirmed and will be delivered shortly.",
      cancelTitle: "Payment Cancelled",
      cancelDesc: "The payment was not completed or was cancelled.",
      checkingTitle: "Verifying payment...",
      checkingDesc: "Please wait. Status updates automatically.",
      orderNum: "Order number",
      total: "Total",
      status: "Status",
      paid: "Paid",
      unpaid: "Unpaid",
      pending: "Pending",
      confirmed: "Confirmed",
      toProfile: "Go to profile",
      toHome: "Go home",
      retry: "Try again",
      som: "UZS",
    },
  }[lang] ?? {
    successTitle: "Payment Successful!", successDesc: "Order confirmed.",
    cancelTitle: "Payment Cancelled", cancelDesc: "Payment failed.",
    checkingTitle: "Verifying...", checkingDesc: "Please wait.",
    orderNum: "Order", total: "Total", status: "Status", paid: "Paid",
    unpaid: "Unpaid", pending: "Pending", confirmed: "Confirmed",
    toProfile: "Profile", toHome: "Home", retry: "Retry", som: "UZS",
  };

  const isPaid = order?.paymentStatus === "paid";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {isSuccess && !order ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <Loader2 size={48} className="text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t.checkingTitle}</h2>
            <p className="text-gray-500 text-sm">{t.checkingDesc}</p>
          </div>
        ) : isCancel ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
              <XCircle size={40} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t.cancelTitle}</h2>
            <p className="text-gray-500 text-sm mb-6">{t.cancelDesc}</p>
            {orderId && (
              <p className="text-xs text-gray-400 mb-6">{t.orderNum}: #{orderId}</p>
            )}
            <div className="flex flex-col gap-3">
              {orderId && (
                <a
                  href={`/`}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-blue-700 text-white rounded-xl font-semibold text-sm hover:bg-blue-800 transition-colors"
                >
                  <RefreshCw size={16} />
                  {t.retry}
                </a>
              )}
              <Link href="/profile"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
              >
                <ShoppingBag size={16} />
                {t.toProfile}
              </Link>
            </div>
          </div>
        ) : order && isPaid ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t.successTitle}</h2>
            <p className="text-gray-500 text-sm mb-6">{t.successDesc}</p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t.orderNum}:</span>
                <span className="font-bold text-gray-900">#{order.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t.total}:</span>
                <span className="font-bold text-[#0f3460]">{order.total.toLocaleString()} {t.som}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t.status}:</span>
                <span className="font-semibold text-green-600">{t.paid} ✓</span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/profile"
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#0f3460] text-white rounded-xl font-semibold text-sm hover:bg-blue-800 transition-colors"
              >
                <ShoppingBag size={16} />
                {t.toProfile}
              </Link>
              <Link href="/"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
              >
                <Home size={16} />
                {t.toHome}
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <Loader2 size={48} className="text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t.checkingTitle}</h2>
            <p className="text-gray-500 text-sm">{t.checkingDesc}</p>
          </div>
        )}
      </div>
    </div>
  );
}
