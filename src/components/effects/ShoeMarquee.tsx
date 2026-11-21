import { Link } from "react-router-dom";
import { products } from "../../data/products";
import { formatVND } from "../../lib/format";

/**
 * ShoeMarquee — dải giày chạy ở cuối trang chủ, sau khối ưu đãi /
 * cam kết, trước footer đen.
 *
 * - 12 đôi thật đã kiểm chứng trong products.ts (đủ 4 hãng Nike /
 *   Adidas / Puma / Vans), chia 2 hàng chạy ngược chiều nhau.
 * - Chỉ CSS animation (keyframes marquee có sẵn): nhân đôi danh sách
 *   để lặp liền mạch, hover thì tạm dừng + giày phóng to nhẹ.
 * - Ảnh hơi nghiêng xen kẽ, bóng đổ bám theo giày; mobile chạy mượt
 *   bằng transform, không JS, không tràn ngang.
 */
const ROW_1_SLUGS = [
  "nike-air-jordan-1-retro-high",
  "adidas-ultraboost-light",
  "puma-suede-classic",
  "nike-air-max-90",
  "adidas-samba-og",
  "puma-rs-x",
];

const ROW_2_SLUGS = [
  "nike-air-force-1-07",
  "adidas-superstar",
  "puma-palermo",
  "nike-dunk-low",
  "adidas-stan-smith",
  "vans-old-skool",
];

function rowProducts(slugs: string[]) {
  return slugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);
}

function ShoeRow({ slugs, reverse }: { slugs: string[]; reverse?: boolean }) {
  const items = rowProducts(slugs);
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden" aria-hidden={false}>
      <div
        className={`flex w-max gap-5 pr-5 animate-marquee animate-marquee-slow ${
          reverse ? "animate-marquee-reverse" : ""
        }`}
      >
        {doubled.map((product, i) => {
          const image = product.colors[0]?.image ?? "";
          const tilt = i % 2 === 0 ? "-rotate-2" : "rotate-2";
          return (
            <Link
              key={`${product.id}-${i}`}
              to={`/product/${product.slug}`}
              aria-hidden={i >= items.length ? true : undefined}
              tabIndex={i >= items.length ? -1 : undefined}
              aria-label={`${product.name} — ${formatVND(product.price)}`}
              className={`group w-44 shrink-0 rounded-3xl bg-white p-3 shadow-[0_18px_30px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt md:w-56 ${tilt}`}
            >
              <span className="block overflow-hidden rounded-2xl bg-[#f5f5f5]">
                <img
                  src={image}
                  alt=""
                  width={400}
                  height={300}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-110 [filter:drop-shadow(0_12px_12px_rgba(0,0,0,0.25))]"
                />
              </span>
              <span className="mt-3 block truncate text-sm font-bold text-ink">
                {product.name}
              </span>
              <span className="mt-0.5 block text-sm font-extrabold text-ink">
                {formatVND(product.price)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function ShoeMarquee() {
  return (
    <section aria-label="Dải giày đang chạy" className="overflow-hidden bg-ink py-14 text-paper">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <h2 className="font-display text-3xl uppercase md:text-4xl">
          Bộ sưu tập <span className="text-volt">đang chạy</span>
        </h2>
        <p className="mt-3 text-sm text-paper/70 md:text-base">
          Nike · Adidas · Puma · Vans — 12 đôi nổi bật, cứ để giày tự chạy. Bấm vào đôi nào thích để xem
          chi tiết.
        </p>
      </div>

      <div className="mt-10 space-y-6">
        <ShoeRow slugs={ROW_1_SLUGS} />
        <ShoeRow slugs={ROW_2_SLUGS} reverse />
      </div>
    </section>
  );
}
