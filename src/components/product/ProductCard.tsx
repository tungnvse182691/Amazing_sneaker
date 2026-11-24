import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Star } from "lucide-react";
import type { Product } from "../../types";
import { discountPercent, formatCount, formatVND } from "../../lib/format";
import { useCartStore } from "../../stores/cart";
import { useWishlistStore } from "../../stores/wishlist";
import { useFlyToCart } from "../../hooks/useFlyToCart";
import { BRAND_LABELS } from "../../data/products";

function defaultSize(p: Product): number | null {
  const inStock = p.sizes.filter((s) => s.stock > 0);
  if (inStock.length === 0) return null;
  return inStock.find((s) => s.size === 42)?.size ?? inStock[0].size;
}

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const { flyToCart } = useFlyToCart();
  const wished = useWishlistStore((s) => s.productIds.includes(product.id));
  const [added, setAdded] = useState(false);

  const color = product.colors[0];
  const percent = discountPercent(product.price, product.originalPrice);
  const size = defaultSize(product);

  function handleQuickAdd(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (size === null) return;
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
      1,
    );
    setAdded(true);
    flyToCart(e.currentTarget, color.image);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-1 hover:border-ink hover:shadow-[6px_6px_0_#111111]">
      <Link to={`/product/${product.slug}`} className="relative block">
        {/* Nền card cố định — ảnh PNG nền trong suốt vẫn hiển thị đẹp */}
        <div className="flex aspect-square items-center justify-center bg-[#EFEDE8] p-4">
          <img
            src={color.image}
            alt={product.name}
            loading="lazy"
            className="max-h-full max-w-full object-contain transition duration-300 group-hover:scale-105"
          />
        </div>
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.isHot && (
            <span className="bg-ember px-2 py-1 text-xs font-extrabold uppercase text-white">
              Bán chạy
            </span>
          )}
          {product.isNew && (
            <span className="bg-volt px-2 py-1 text-xs font-extrabold uppercase text-ink">
              Mới
            </span>
          )}
          {percent > 0 && (
            <span className="bg-ink px-2 py-1 text-xs font-extrabold text-white">
              -{percent}%
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          aria-label={wished ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
          className={`absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:h-10 md:w-10 ${
            wished
              ? "border-ember bg-ember text-white"
              : "border-line bg-white text-ink hover:border-ember hover:text-ember"
          }`}
        >
          <Heart className="h-5 w-5" fill={wished ? "currentColor" : "none"} />
        </button>
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-ink-mute">
          <span>{BRAND_LABELS[product.brand] ?? product.brand}</span>
          <span className="flex items-center gap-1 normal-case text-ink">
            <Star className="h-3.5 w-3.5 fill-volt-deep text-ink" />
            {product.rating} · {formatCount(product.sold)} đã bán
          </span>
        </div>
        <Link
          to={`/product/${product.slug}`}
          className="font-bold leading-snug hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          {product.name}
        </Link>
        <p className="text-sm text-ink-mute">{product.category}</p>
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-2">
          <span className="text-lg font-extrabold">{formatVND(product.price)}</span>
          {product.originalPrice && (
            <span className="text-sm text-ink-mute line-through">
              {formatVND(product.originalPrice)}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={size === null}
          className={`mt-2 flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:py-2 ${
            size === null
              ? "cursor-not-allowed bg-line text-ink-mute"
              : added
                ? "bg-volt text-ink"
                : "bg-ink text-white hover:bg-ink-soft"
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          {size === null ? "Hết hàng" : added ? "Đã thêm vào giỏ" : "Thêm vào giỏ"}
        </button>
      </div>
    </article>
  );
}
