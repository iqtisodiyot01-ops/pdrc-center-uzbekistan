import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { useAppStore, type AppUser } from "@/store/use-store";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { CartDrawer } from "@/components/CartDrawer";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { token, setUser, user, cartOpen, setCartOpen } = useAppStore();

  const { data: userData, isLoading, isError } = useQuery<AppUser>({
    queryKey: ["current-user"],
    queryFn: () => api.get<AppUser>("/auth/me"),
    enabled: !!token,
    retry: false,
  });

  const AUTH_REQUIRED_ROUTES = ["/profile"];
  const requiresAuth = AUTH_REQUIRED_ROUTES.some((r) => location === r || location.startsWith(r + "/"));

  useEffect(() => {
    if (!token && requiresAuth) {
      setLocation("/login");
    }
  }, [token, location, setLocation, requiresAuth]);

  useEffect(() => {
    if (userData) {
      setUser(userData);
    } else if (isError) {
      useAppStore.getState().logout();
      if (requiresAuth) {
        setLocation("/login");
      }
    }
  }, [userData, isError, setUser, location, setLocation, requiresAuth]);

  if (isLoading && token && !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (location === "/login" || location === "/register") {
    return <>{children}</>;
  }

  if (!token && requiresAuth) return null;

  if (location === "/admin") {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 pt-16">
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a1628] h-16 flex items-center px-4 shadow-lg">
          <a href="/" className="text-white font-bold text-sm uppercase tracking-wider hover:text-blue-300 transition-colors">
            PDR Center Uzbekistan
          </a>
        </div>
        <main className="flex-1">
          {children}
        </main>
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      </div>
    );
  }

  const isShopPage = location.startsWith("/shop");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pt-[128px] md:pt-[152px]">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      {!isShopPage && <Footer />}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
