import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { CartDrawer } from "./components/cart/CartDrawer";
import { Home } from "./pages/Home";
import { Shop } from "./pages/Shop";
import { ProductDetail } from "./pages/ProductDetail";
import { CartPage } from "./pages/CartPage";
import { Checkout } from "./pages/Checkout";
import { Wishlist } from "./pages/Wishlist";
import { Brand } from "./pages/Brand";
import { TrackOrder } from "./pages/TrackOrder";
import Login from "./pages/Login";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminVouchers from "./pages/admin/AdminVouchers";
import { initSmoothScroll } from "./lib/motion";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function NotFound() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12 text-center">
      <h1 className="font-display text-4xl uppercase tracking-wide">Không tìm thấy trang</h1>
      <p className="mt-4 text-ink-mute">Trang bạn tìm không tồn tại hoặc đã bị dời đi.</p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-bold text-white"
      >
        Về trang chủ
      </Link>
    </main>
  );
}

function AppShell() {
  // Trang /admin* có header admin riêng trong AdminLayout — ẩn header shop,
  // footer shop và giỏ hàng để không bị 2 header chồng nhau.
  const { pathname } = useLocation();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  return (
    <div className="flex min-h-screen flex-col">
      {!isAdmin && <Header />}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/brand/:brand" element={<Brand />} />
          <Route path="/login" element={<Login />} />
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/vouchers" element={<AdminVouchers />} />
          </Route>
          <Route path="/track" element={<TrackOrder />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {!isAdmin && <Footer />}
      {!isAdmin && <CartDrawer />}
    </div>
  );
}

export default function App() {
  // Lenis smooth scroll (C) — gọi 1 lần, tự destroy khi unmount.
  useEffect(() => {
    const handle = initSmoothScroll();
    return () => handle?.destroy();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
