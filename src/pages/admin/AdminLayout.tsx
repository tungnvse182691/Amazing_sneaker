import { Link, Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth";

const NAV = [
  { to: "/admin", label: "Tổng quan", end: true },
  { to: "/admin/products", label: "Sản phẩm" },
  { to: "/admin/orders", label: "Đơn hàng" },
  { to: "/admin/vouchers", label: "Mã giảm giá" },
];

function AdminShell() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  // Guard: chưa đăng nhập (hoặc không phải admin) thì về trang đăng nhập.
  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <Link to="/admin" className="font-display text-2xl uppercase tracking-wide">
            Amazing<span className="text-ember">.</span> Admin
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-ink-mute">
              Xin chào, <strong className="text-ink">{user.name}</strong> ({user.email})
            </span>
            <Link to="/" className="rounded-full border border-line px-4 py-2 font-semibold hover:bg-paper">
              Xem cửa hàng
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full bg-ink px-4 py-2 font-semibold text-paper hover:opacity-90"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-6 md:flex-row">
        <nav className="flex shrink-0 gap-2 md:w-48 md:flex-col" aria-label="Điều hướng quản trị">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold ${
                  isActive ? "bg-ink text-paper" : "bg-white text-ink hover:bg-line/60"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/**
 * Layout route cho /admin. Dùng QueryClientProvider duy nhất ở App.tsx
 * (đã gỡ provider lồng của D để tránh 2 client chồng nhau).
 */
export default function AdminLayout() {
  return <AdminShell />;
}
