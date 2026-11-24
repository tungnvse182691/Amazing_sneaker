import { Link, useParams } from "react-router-dom";
import { useProducts } from "../lib/api";
import { ProductGrid, ProductGridEmpty, ProductGridSkeleton } from "../components/product/ProductGrid";
import { BRAND_LABELS } from "../data/products";
import type { Brand } from "../types";

const VALID_BRANDS: Brand[] = ["nike", "adidas", "puma", "vans"];

const BRAND_TAGLINE: Record<Brand, string> = {
  nike: "Just Do It — từ sân bóng rổ tới đường chạy, Nike luôn dẫn đầu.",
  adidas: "Impossible Is Nothing — 3 sọc huyền thoại, êm chân mọi hành trình.",
  puma: "Forever Faster — tốc độ, phong cách và chất đường phố đậm đà.",
  vans: "Off The Wall — sọc Sidestripe huyền thoại từ 1977, chất trượt ván nguyên bản.",
};

const BRAND_HERO: Record<Brand, string> = {
  nike: "https://image.goat.com/transform/v1/attachments/product_template_additional_pictures/images/083/401/929/original/14741_01.jpg.jpeg?action=crop&width=1500",
  adidas: "https://images.novelship.com/product/adidas_ultraboost_light__triple_white__gy9350_0_91845.jpeg?fit=fill&bg=FFFFFF&trim=color&q=75&w=1200&h=1200&pad=80&fm=webp&auto=compress",
  puma: "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/399781/01/fnd/IDN/fmt/png",
  vans: "https://image.goat.com/transform/v1/attachments/product_template_additional_pictures/images/078/453/995/original/192218_01.jpg.jpeg?action=crop&width=1500",
};

export function Brand() {
  const { brand } = useParams();
  const valid = VALID_BRANDS.includes(brand as Brand);
  const { data: products, isPending, isError, refetch } = useProducts({
    brand: valid ? brand : undefined,
  });

  if (!valid) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 text-center md:px-6">
        <p className="font-display text-3xl uppercase">Không tìm thấy hãng giày</p>
        <p className="mt-2 text-ink-mute">
          Hiện cửa hàng chỉ có 4 hãng: Nike, Adidas, Puma và Vans.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {VALID_BRANDS.map((b) => (
            <Link
              key={b}
              to={`/brand/${b}`}
              className="rounded-full bg-ink px-6 py-3 text-sm font-bold text-white hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              {BRAND_LABELS[b]}
            </Link>
          ))}
        </div>
      </main>
    );
  }

  const b = brand as Brand;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <section className="flex flex-col items-center gap-6 rounded-3xl border-4 border-ink bg-volt p-8 md:flex-row md:justify-between">
        <div>
          <h1 className="font-display text-5xl uppercase tracking-wide md:text-6xl">
            {BRAND_LABELS[b]}
          </h1>
          <p className="mt-2 max-w-md text-lg font-medium text-ink-soft">{BRAND_TAGLINE[b]}</p>
          <p className="mt-2 text-sm font-bold">
            {isPending ? "Đang tải…" : `${products?.length ?? 0} mẫu giày ${BRAND_LABELS[b]}`}
          </p>
        </div>
        <div className="flex w-full max-w-xs items-center justify-center rounded-2xl bg-white/70 p-4">
          <img
            src={BRAND_HERO[b]}
            alt={`Giày ${BRAND_LABELS[b]} nổi bật`}
            className="max-h-48 w-full object-contain"
          />
        </div>
      </section>

      <div className="mt-8">
        {isPending ? (
          <ProductGridSkeleton count={8} />
        ) : isError ? (
          <div className="rounded-2xl border border-line bg-white p-8 text-center">
            <p className="text-lg font-bold">Không tải được danh sách giày.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 rounded-full bg-ink px-6 py-3 text-sm font-bold text-white hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:py-2"
            >
              Thử lại
            </button>
          </div>
        ) : !products || products.length === 0 ? (
          <ProductGridEmpty title={`Chưa có giày ${BRAND_LABELS[b]}`} />
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </main>
  );
}
