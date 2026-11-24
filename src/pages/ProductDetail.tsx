import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, Heart, Minus, Plus, ShoppingBag, Star } from "lucide-react";
import { useProduct, useProducts } from "../lib/api";
import { discountPercent, formatCount, formatVND } from "../lib/format";
import { ProductGrid, ProductGridEmpty, ProductGridSkeleton } from "../components/product/ProductGrid";
import { useCartStore } from "../stores/cart";
import { useWishlistStore } from "../stores/wishlist";
import { useCartDrawerOpen } from "../components/cart/CartDrawer";
import { useFlyToCart } from "../hooks/useFlyToCart";
import ExplodedShoe from "../components/effects/ExplodedShoe";
import { BRAND_LABELS } from "../data/products";

export function ProductDetail() {
  const { slug } = useParams();
  const { data: product, isPending, isError, refetch } = useProduct(slug);
  const { data: allProducts } = useProducts();

  const [colorIndex, setColorIndex] = useState(0);
  const [size, setSize] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const { flyToCart } = useFlyToCart();
  const wished = useWishlistStore((s) => (product ? s.productIds.includes(product.id) : false));
  const openDrawer = useCartDrawerOpen((s) => s.open);

  const related = useMemo(() => {
    if (!product || !allProducts) return [];
    return allProducts
      .filter((p) => p.brand === product.brand && p.id !== product.id)
      .slice(0, 4);
  }, [product, allProducts]);

  if (isPending) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-2xl bg-line" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-line" />
            <div className="h-6 w-1/3 animate-pulse rounded bg-line" />
            <div className="h-4 w-full animate-pulse rounded bg-line" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-line" />
            <div className="h-12 w-full animate-pulse rounded-full bg-line" />
          </div>
        </div>
        <div className="mt-12">
          <ProductGridSkeleton count={4} />
        </div>
      </main>
    );
  }

  if (isError || !product) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 text-center md:px-6">
        <p className="font-display text-3xl uppercase">Không tìm thấy sản phẩm</p>
        <p className="mt-2 text-ink-mute">
          Sản phẩm này không tồn tại hoặc đã bị gỡ khỏi cửa hàng.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-full bg-ink px-6 py-3 text-sm font-bold text-white hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Thử lại
          </button>
          <Link
            to="/shop"
            className="rounded-full border border-ink px-6 py-3 text-sm font-bold hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Về cửa hàng
          </Link>
        </div>
      </main>
    );
  }

  const color = product.colors[Math.min(colorIndex, product.colors.length - 1)];
  const selectedSize = product.sizes.find((s) => s.size === size);
  const maxQty = selectedSize ? selectedSize.stock : 1;
  const percent = discountPercent(product.price, product.originalPrice);
  const inStock = product.sizes.some((s) => s.stock > 0);

  function handleAddToCart(e?: React.MouseEvent<HTMLButtonElement>) {
    if (!product) return;
    if (size === null) {
      setSizeError("Vui lòng chọn size trước khi thêm vào giỏ.");
      return;
    }
    if (!selectedSize || selectedSize.stock <= 0) {
      setSizeError("Size này đã hết hàng, vui lòng chọn size khác.");
      return;
    }
    setSizeError(null);
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        image: color.image,
        colorName: color.name,
        size,
        price: product.price,
      },
      quantity,
    );
    setAdded(true);
    if (e) flyToCart(e.currentTarget, color.image);
    window.setTimeout(() => setAdded(false), 2000);
    openDrawer();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <nav className="mb-6 text-sm text-ink-mute" aria-label="Đường dẫn">
        <Link to="/" className="hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Trang chủ</Link>
        {" / "}
        <Link to="/shop" className="hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Cửa hàng</Link>
        {" / "}
        <Link to={`/brand/${product.brand}`} className="hover:text-ink">
          {BRAND_LABELS[product.brand]}
        </Link>
        {" / "}
        <span className="font-bold text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="flex aspect-square items-center justify-center rounded-2xl border border-line bg-[#EFEDE8] p-8">
            <img
              src={color.image}
              alt={`${product.name} — màu ${color.name}`}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <p className="mt-2 text-center text-sm text-ink-mute">
            Màu đang xem: <span className="font-bold text-ink">{color.name}</span>
          </p>
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            {product.isHot && (
              <span className="bg-ember px-2 py-1 text-xs font-extrabold uppercase text-white">Bán chạy</span>
            )}
            {product.isNew && (
              <span className="bg-volt px-2 py-1 text-xs font-extrabold uppercase">Mới</span>
            )}
            {percent > 0 && (
              <span className="bg-ink px-2 py-1 text-xs font-extrabold text-white">Giảm {percent}%</span>
            )}
          </div>
          <h1 className="mt-3 font-display text-4xl uppercase leading-tight tracking-wide">
            {product.name}
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <span className="flex items-center gap-1 font-bold">
              <Star className="h-4 w-4 fill-volt-deep" /> {product.rating}
            </span>
            <span className="text-ink-mute">{formatCount(product.sold)} đã bán</span>
            <span className="text-ink-mute">·</span>
            <span className="text-ink-mute">{product.category}</span>
            <span className="text-ink-mute">·</span>
            <span className="font-bold">{BRAND_LABELS[product.brand]}</span>
          </p>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold">{formatVND(product.price)}</span>
            {product.originalPrice && (
              <span className="text-lg text-ink-mute line-through">
                {formatVND(product.originalPrice)}
              </span>
            )}
          </div>

          <p className="mt-4 leading-relaxed text-ink-soft">{product.description}</p>

          <div className="mt-6">
            <p className="text-sm font-extrabold uppercase">
              Màu sắc: <span className="font-normal normal-case">{color.name}</span>
            </p>
            <div className="mt-2 flex gap-2">
              {product.colors.map((c, i) => (
                <button
                  key={c.hex + c.name}
                  type="button"
                  title={c.name}
                  aria-label={`Chọn màu ${c.name}`}
                  aria-pressed={i === colorIndex}
                  onClick={() => setColorIndex(i)}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                    i === colorIndex ? "border-ink ring-2 ring-ink/20" : "border-line"
                  }`}
                  style={{ backgroundColor: c.hex }}
                >
                  {i === colorIndex && (
                    <Check className={`h-5 w-5 ${c.hex.toUpperCase() === "#FFFFFF" ? "text-ink" : "text-white"}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-extrabold uppercase">Chọn size (EU)</p>
              {selectedSize && (
                <p className="text-sm text-ink-mute">
                  Còn <span className="font-bold text-ink">{selectedSize.stock}</span> đôi size {size}
                </p>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const out = s.stock <= 0;
                const active = size === s.size;
                return (
                  <button
                    key={s.size}
                    type="button"
                    disabled={out}
                    aria-pressed={active}
                    onClick={() => {
                      setSize(s.size);
                      setQuantity(1);
                      setSizeError(null);
                    }}
                    className={`h-12 w-12 rounded-xl border text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                      out
                        ? "cursor-not-allowed border-line bg-line/60 text-ink-mute line-through"
                        : active
                          ? "border-ink bg-ink text-white"
                          : "border-line bg-white hover:border-ink"
                    }`}
                  >
                    {s.size}
                  </button>
                );
              })}
            </div>
            {sizeError && <p className="mt-2 text-sm font-bold text-ember">{sizeError}</p>}
            {!inStock && (
              <p className="mt-2 text-sm font-bold text-ember">
                Sản phẩm này hiện đã hết hàng ở mọi size.
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border border-line bg-white">
              <button
                type="button"
                aria-label="Giảm số lượng"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-12 w-12 items-center justify-center hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-bold">{quantity}</span>
              <button
                type="button"
                aria-label="Tăng số lượng"
                disabled={quantity >= maxQty}
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                className="flex h-12 w-12 items-center justify-center hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-30"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!inStock}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                added ? "bg-volt-deep text-ink" : "bg-ink hover:bg-ink-soft"
              } disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-mute`}
            >
              <ShoppingBag className="h-5 w-5" />
              {added ? "Đã thêm vào giỏ" : "Thêm vào giỏ"}
            </button>
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              aria-label={wished ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
              className={`flex h-12 w-12 items-center justify-center rounded-full border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                wished ? "border-ember bg-ember text-white" : "border-line bg-white hover:border-ember hover:text-ember"
              }`}
            >
              <Heart className="h-5 w-5" fill={wished ? "currentColor" : "none"} />
            </button>
          </div>

          <ul className="mt-6 space-y-1 text-sm text-ink-mute">
            <li>· Miễn phí giao hàng cho đơn từ 1.000.000 ₫</li>
            <li>· Đổi size miễn phí trong 7 ngày</li>
            <li>· Chính hãng 100%, có hóa đơn</li>
          </ul>
        </div>
      </div>

      <ExplodedShoe product={product} />

      <section className="mt-12">
        <h2 className="mb-6 font-display text-3xl uppercase tracking-wide">
          Sản phẩm liên quan
        </h2>
        {related.length === 0 ? (
          <ProductGridEmpty title="Chưa có sản phẩm liên quan" hint="Xem thêm giày cùng hãng ở cửa hàng nhé." />
        ) : (
          <ProductGrid products={related} />
        )}
      </section>
    </main>
  );
}
