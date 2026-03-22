import { useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { useAppStore } from "@/store/use-store";
import { useGetCurrentUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { Loader2 } from "lucide-react";
import { CartDrawer } from "@/components/CartDrawer";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { token, setUser, user, cartOpen, setCartOpen } = useAppStore();

  const { data: userData, isLoading, isError } = useGetCurrentUser({
    query: {
      enabled: !!token,
      retry: false,
      queryKey: getGetCurrentUserQueryKey()
    },
    request: {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    }
  });

  const PUBLIC_ROUTES = ["/login", "/register", "/about", "/delivery", "/payment/success", "/payment/cancel"];
  const isPublic = PUBLIC_ROUTES.includes(location);

  useEffect(() => {
    if (!token && !isPublic) {
      setLocation("/login");
    }
  }, [token, location, setLocation, isPublic]);

  useEffect(() => {
    if (userData) {
      setUser(userData);
    } else if (isError) {
      useAppStore.getState().logout();
      if (!isPublic) {
        setLocation("/login");
      }
    }
  }, [userData, isError, setUser, location, setLocation, isPublic]);

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

  if (!token && !isPublic) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pt-[128px] md:pt-[152px]">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
