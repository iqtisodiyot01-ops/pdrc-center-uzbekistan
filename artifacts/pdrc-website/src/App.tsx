import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "./components/layout/AppLayout";
import { useAppStore } from "@/store/use-store";
import { api } from "@/lib/api";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Courses from "./pages/Courses";
import Gallery from "./pages/Gallery";
import Reviews from "./pages/Reviews";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import About from "./pages/About";
import Delivery from "./pages/Delivery";
import Profile from "./pages/Profile";
import PaymentResult from "./pages/PaymentResult";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    }
  }
});

function SiteTextsLoader() {
  const setSiteTexts = useAppStore((s) => s.setSiteTexts);
  const { data } = useQuery<Record<string, unknown>>({
    queryKey: ["site-settings"],
    queryFn: () => api.get<Record<string, unknown>>("/site-settings"),
    staleTime: 5 * 60_000,
  });
  const siteTextsJson = data?.siteTexts ? JSON.stringify(data.siteTexts) : null;
  useEffect(() => {
    if (siteTextsJson) {
      try {
        setSiteTexts(JSON.parse(siteTextsJson));
      } catch { /* ignore */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteTextsJson]);
  return null;
}

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/" component={Home} />
        <Route path="/services" component={Services} />
        <Route path="/shop" component={Shop} />
        <Route path="/shop/:id" component={ProductDetail} />
        <Route path="/courses" component={Courses} />
        <Route path="/gallery" component={Gallery} />
        <Route path="/reviews" component={Reviews} />
        <Route path="/contact" component={Contact} />
        <Route path="/admin" component={Admin} />
        <Route path="/about" component={About} />
        <Route path="/delivery" component={Delivery} />
        <Route path="/profile" component={Profile} />
        <Route path="/payment/success" component={PaymentResult} />
        <Route path="/payment/cancel" component={PaymentResult} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <SiteTextsLoader />
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
