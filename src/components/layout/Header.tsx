import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useCartStore } from "../../stores/cart";
import { useWishlistStore } from "../../stores/wishlist";
import { useCartDrawerOpen } from "../cart/CartDrawer";

const NAV = [
  { to: "/", label: "Trang chủ" },
  { to: "/shop", label: "Cửa hàng" },
  { to: "/brand/nike", label: "Nike" },
  { to: "/brand/adidas", label: "Adidas" },
  { to: "/brand/puma", label: "Puma" },
  { to: "/brand/vans", label: "Vans" },
  { to: "/track", label: "Tra cứu đơn" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const cartCount = useCartStore((s) => s.totalItems());
  const wishCount = useWishlistStore((s) => s.productIds.length);
  const openDrawer = useCartDrawerOpen((s) => s.open);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/shop?search=${encodeURIComponent(q)}` : "/shop");
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 md:gap-4 md:px-6">
        <button
          type="button"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:hidden"
          aria-label="Mở menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link to="/" className="flex shrink-0 items-baseline gap-1 font-display text-lg uppercase leading-none tracking-wide md:text-2xl">
          Amazing<span className="bg-volt px-1">Sneaker</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-5 text-sm font-bold md:flex">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                isActive
                  ? "text-ember underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  : "hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="ml-auto hidden min-w-0 flex-1 max-w-xs items-center lg:flex">
          <label className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm giày, hãng, dòng giày…"
              aria-label="Tìm kiếm giày"
              className="w-full rounded-full border border-line bg-white py-2 pl-9 pr-3 text-sm focus:border-ink"
            />
          </label>
        </form>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Link
            to="/wishlist"
            aria-label={`Yêu thích (${wishCount})`}
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-white hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:h-10 md:w-10"
          >
            <Heart className="h-5 w-5" />
            {wishCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ember px-1 text-xs font-bold text-white">
                {wishCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={openDrawer}
            data-cart-target
            aria-label={`Giỏ hàng (${cartCount} sản phẩm)`}
            className="relative flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-line bg-white px-2 text-sm font-bold text-ink hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:h-10 md:gap-2 md:px-4"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="hidden sm:inline">Giỏ hàng</span>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-volt px-1 text-xs font-extrabold text-ink">
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-line bg-paper px-4 py-4 md:hidden">
          <form onSubmit={submitSearch} className="mb-4 flex items-center">
            <label className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm giày, hãng, dòng giày…"
                aria-label="Tìm kiếm giày"
                className="w-full rounded-full border border-line bg-white py-3 pl-9 pr-3 text-sm focus:border-ink"
              />
            </label>
          </form>
          <div className="flex flex-col gap-3 text-sm font-bold">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? "text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                    : "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                }
              >
                {n.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
