import { Link } from "react-router-dom";
import { ArrowRight, Copy, Check, TicketPercent, Truck, RefreshCw, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useProducts } from "../lib/api";
import { ProductGrid, ProductGridEmpty, ProductGridSkeleton } from "../components/product/ProductGrid";
import { BRAND_LABELS, products as seedProducts } from "../data/products";
import ShoeBoxHero from "../components/effects/ShoeBoxHero";
import Marquee from "../components/effects/Marquee";
import ShoeMarquee from "../components/effects/ShoeMarquee";
import ScrollReveal from "../components/effects/ScrollReveal";

function VoucherCard({ code, desc }: { code: string; desc: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      /* clipboard không khả dụng thì vẫn báo đã sao chép mã để người dùng gõ tay */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border-2 border-dashed border-ink bg-white p-4">
      <div className="flex items-start gap-3">
        <TicketPercent className="mt-1 h-6 w-6 shrink-0 text-ember" />
        <div>
          <p className="font-display text-2xl tracking-wide">{code}</p>
          <p className="text-sm text-ink-mute">{desc}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={copy}
        className="flex shrink-0 items-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-bold text-white hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:py-2"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Đã sao chép" : "Sao chép"}
      </button>
    </div>
  );
}

function SectionHead({ title, sub, to }: { title: string; sub: string; to?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-3xl uppercase tracking-wide md:text-4xl">{title}</h2>
        <p className="mt-1 text-ink-mute">{sub}</p>
      </div>
      {to && (
        <Link
          to={to}
          className="flex shrink-0 items-center gap-1 text-sm font-bold hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          Xem tất cả <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export function Home() {
  const { data: products, isPending, isError, refetch } = useProducts();
  const hot = (products ?? []).filter((p) => p.isHot);
  const newest = (products ?? []).filter((p) => p.isNew);
  const heroSlugs = [
    "nike-air-jordan-1-retro-high",
    "nike-air-force-1-07",
    "nike-air-max-90",
    "vans-old-skool",
  ];
  const heroProducts = heroSlugs
    .map(
      (slug) =>
        (products ?? []).find((p) => p.slug === slug) ??
        seedProducts.find((p) => p.slug === slug),
    )
    .filter((p): p is NonNullable<typeof p> => p !== undefined);
  const brandHero: Record<string, string> = {
    nike: "https://image.goat.com/transform/v1/attachments/product_template_additional_pictures/images/083/401/929/original/14741_01.jpg.jpeg?action=crop&width=1500",
    adidas: "https://images.novelship.com/product/adidas_ultraboost_light__triple_white__gy9350_0_91845.jpeg?fit=fill&bg=FFFFFF&trim=color&q=75&w=1200&h=1200&pad=80&fm=webp&auto=compress",
    puma: "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/399781/01/fnd/IDN/fmt/png",
    vans: "https://image.goat.com/transform/v1/attachments/product_template_additional_pictures/images/078/453/995/original/192218_01.jpg.jpeg?action=crop&width=1500",
  };

  return (
    <main>
      {/* Hero chuỗi 4 hộp giày kiểu Moco: Jordan 1 → Air Force 1 → Air Max 90 → Vans Old Skool */}
      {heroProducts.length === 4 ? <ShoeBoxHero products={heroProducts} /> : null}

      {/* Marquee của C (thay marquee CSS của B) */}
      <Marquee />

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 md:px-6">
        {/* Giày hot */}
        <ScrollReveal as="section">
          <SectionHead title="Giày đang hot" sub="Những đôi được mua nhiều nhất tuần này." to="/shop?sort=sold" />
          {isPending ? (
            <ProductGridSkeleton count={4} />
          ) : isError ? (
            <div className="rounded-2xl border border-line bg-white p-6 text-center">
              <p className="font-bold">Không tải được danh sách giày.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-3 rounded-full bg-ink px-6 py-3 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:py-2"
              >
                Thử lại
              </button>
            </div>
          ) : hot.length === 0 ? (
            <ProductGridEmpty />
          ) : (
            <ProductGrid products={hot.slice(0, 8)} />
          )}
        </ScrollReveal>

        {/* Bộ sưu tập theo brand */}
        <ScrollReveal as="section">
          <SectionHead title="Bộ sưu tập theo hãng" sub="Chọn hãng bạn yêu thích." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(["nike", "adidas", "puma", "vans"] as const).map((brand) => (
              <Link
                key={brand}
                to={`/brand/${brand}`}
                className="group overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-1 hover:border-ink hover:shadow-[6px_6px_0_#111111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                <div className="flex aspect-[4/3] items-center justify-center bg-[#EFEDE8] p-6">
                  <img
                    src={brandHero[brand]}
                    alt={`Giày ${BRAND_LABELS[brand]}`}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-display text-2xl uppercase">{BRAND_LABELS[brand]}</p>
                    <p className="text-sm text-ink-mute">
                      {(products ?? []).filter((p) => p.brand === brand).length} mẫu giày
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </ScrollReveal>

        {/* Giày mới */}
        <ScrollReveal as="section">
          <SectionHead title="Giày mới về" sub="Mẫu mới nhất vừa cập bến." to="/shop?sort=newest" />
          {isPending ? (
            <ProductGridSkeleton count={4} />
          ) : isError ? (
            <div className="rounded-2xl border border-line bg-white p-6 text-center">
              <p className="font-bold">Không tải được danh sách giày.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-3 rounded-full bg-ink px-6 py-3 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:py-2"
              >
                Thử lại
              </button>
            </div>
          ) : newest.length === 0 ? (
            <ProductGridEmpty />
          ) : (
            <ProductGrid products={newest.slice(0, 8)} />
          )}
        </ScrollReveal>

        {/* Voucher */}
        <ScrollReveal as="section">
          <SectionHead title="Ưu đãi cho bạn" sub="Sao chép mã và dùng ngay khi thanh toán." />
          <div className="grid gap-4 md:grid-cols-2">
            <VoucherCard
              code="CHAO10"
              desc="Giảm 10% (tối đa 500.000 ₫) cho đơn từ 1.000.000 ₫."
            />
            <VoucherCard
              code="FREESHIP"
              desc="Giảm 30.000 ₫ phí giao hàng cho đơn từ 500.000 ₫."
            />
          </div>
        </ScrollReveal>

        {/* Cam kết */}
        <ScrollReveal as="section" className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Truck, title: "Giao nhanh toàn quốc", desc: "Miễn phí giao hàng cho đơn từ 1.000.000 ₫." },
            { icon: RefreshCw, title: "Đổi size miễn phí", desc: "Đổi size trong 7 ngày nếu giày chưa qua sử dụng." },
            { icon: ShieldCheck, title: "Chính hãng 100%", desc: "Giày Nike, Adidas, Puma, Vans nhập chính hãng, có hóa đơn." },
          ].map((c) => (
            <div key={c.title} className="flex gap-3 rounded-2xl border border-line bg-white p-4">
              <c.icon className="h-6 w-6 shrink-0 text-ember" />
              <div>
                <p className="font-bold">{c.title}</p>
                <p className="text-sm text-ink-mute">{c.desc}</p>
              </div>
            </div>
          ))}
        </ScrollReveal>
      </div>

      {/* Dải giày chạy cuối trang — 12 đôi thật, 2 hàng ngược chiều */}
      <ShoeMarquee />

      {/* CTA cuối trang — sau dải giày chạy */}
      <div className="mx-auto max-w-7xl px-4 py-10 text-center md:px-6">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 rounded-full bg-volt px-8 py-3 text-sm font-bold text-ink transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          Xem tất cả giày <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}
