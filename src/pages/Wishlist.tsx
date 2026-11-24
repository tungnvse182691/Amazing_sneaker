import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { useProducts } from "../lib/api";
import { ProductGridEmpty, ProductGridSkeleton } from "../components/product/ProductGrid";
import { useWishlistStore } from "../stores/wishlist";
import { useCartStore } from "../stores/cart";
import { formatVND } from "../lib/format";
import { BRAND_LABELS } from "../data/products";

export function Wishlist() {
  const productIds = useWishlistStore((s) => s.productIds);
  const toggle = useWishlistStore((s) => s.toggle);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);
  const addItem = useCartStore((s) => s.addItem);

  const { data: products, isPending, isError, refetch } = useProducts();
  const wished = (products ?? []).filter((p) => productIds.includes(p.id));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="font-display text-4xl uppercase tracking-wide">Giày yêu thích</h1>
      <p className="mt-1 text-ink-mute">
        {productIds.length === 0
          ? "Bạn chưa lưu đôi giày nào."
          : `Bạn đã lưu ${productIds.length} đôi giày.`}
      </p>

      {isPending ? (
        <div className="mt-8">
          <ProductGridSkeleton count={4} />
        </div>
      ) : isError ? (
        <div className="mt-8 rounded-2xl border border-line bg-white p-8 text-center">
          <p className="text-lg font-bold">Không tải được danh sách yêu thích.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-full bg-ink px-6 py-3 text-sm font-bold text-white hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:py-2"
          >
            Thử lại
          </button>
        </div>
      ) : wished.length === 0 ? (
        <div className="mt-8">
          <ProductGridEmpty
            title="Chưa có giày yêu thích"
            hint="Chạm vào trái tim trên bất kỳ đôi giày nào để lưu lại đây, rồi quay lại mua sau."
          />
          <div className="mt-6 text-center">
            <Link
              to="/shop"
              className="inline-block rounded-full bg-ink px-6 py-3 text-sm font-bold text-white hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Khám phá giày ngay
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {wished.map((p) => {
              const color = p.colors[0];
              const size = p.sizes.find((s) => s.size === 42 && s.stock > 0)
                ?? p.sizes.find((s) => s.stock > 0);
              return (
                <article
                  key={p.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-1 hover:border-ink hover:shadow-[6px_6px_0_#111111]"
                >
                  <Link to={`/product/${p.slug}`} className="relative block">
                    <div className="flex aspect-square items-center justify-center bg-[#EFEDE8] p-4">
                      <img
                        src={color.image}
                        alt={p.name}
                        loading="lazy"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </Link>
                  <div className="flex flex-1 flex-col gap-1 p-4">
                    <span className="text-xs font-bold uppercase tracking-wide text-ink-mute">
                      {BRAND_LABELS[p.brand]}
                    </span>
                    <Link to={`/product/${p.slug}`} className="font-bold leading-snug hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
                      {p.name}
                    </Link>
                    <p className="text-lg font-extrabold">{formatVND(p.price)}</p>
                    <div className="mt-auto flex gap-2 pt-2">
                      <button
                        type="button"
                        disabled={!size}
                        onClick={() =>
                          size &&
                          addItem(
                            {
                              productId: p.id,
                              slug: p.slug,
                              name: p.name,
                              brand: p.brand,
                              image: color.image,
                              colorName: color.name,
                              size: size.size,
                              price: p.price,
                            },
                            1,
                          )
                        }
                        className="flex flex-1 items-center justify-center gap-1 rounded-full bg-ink px-3 py-3 text-sm font-bold text-white hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-mute md:py-2"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        {size ? `Thêm size ${size.size}` : "Hết hàng"}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggle(p.id)}
                        aria-label={`Bỏ ${p.name} khỏi yêu thích`}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ember bg-ember text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:h-9 md:w-9"
                      >
                        <Heart className="h-4 w-4" fill="currentColor" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <button
            type="button"
            onClick={clearWishlist}
            className="mt-6 text-sm font-bold text-ember underline"
          >
            Xóa toàn bộ danh sách yêu thích
          </button>
        </>
      )}
    </main>
  );
}
