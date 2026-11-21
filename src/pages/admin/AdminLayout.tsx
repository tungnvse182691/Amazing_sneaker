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
      <style>{`
        @keyframes admin-fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .admin-fade-up {
          animation: admin-fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .admin-fade-up { animation: none; }
        }
      `}</style>
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur">
        <div className="h-1 bg-volt" aria-hidden="true" />
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <Link to="/admin" className="group">
            <span className="font-display text-2xl uppercase tracking-wide">
              Amazing<span className="text-ember">.</span> Admin
            </span>
            <span
              className="mt-1 block h-1 w-12 rounded-full bg-volt transition-all duration-200 group-hover:w-20"
              aria-hidden="true"
            />
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-ink-mute">
              Xin chào, <strong className="text-ink">{user.name}</strong> ({user.email})
            </span>
            <Link
              to="/"
              className="rounded-full border border-line px-4 py-2 font-semibold transition hover:border-ink/40 hover:bg-paper active:scale-[0.98]"
            >
              Xem cửa hàng
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full bg-ink px-4 py-2 font-semibold text-paper transition hover:bg-ink-soft active:scale-[0.98]"
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
                `flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
                  isActive
                    ? "border-ink bg-ink text-volt shadow-[0_4px_12px_rgba(0,0,0,0.18)]"
                    : "border-line bg-white text-ink hover:-translate-y-px hover:border-ink/40"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${isActive ? "bg-volt" : "bg-transparent"}`}
                    aria-hidden="true"
                  />
                  {item.label}
                </>
              )}
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
