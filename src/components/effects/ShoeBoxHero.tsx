import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { getLenis, gsap, prefersReducedMotion, registerGsap, ScrollTrigger } from "../../lib/motion";
import type { Product } from "../../types";
import { formatVND } from "../../lib/format";

/**
 * ShoeBoxHero — hero "giày trong hộp" kiểu Moco, bằng ẢNH THẬT + CSS 3D.
 * KHÔNG Three.js / model GLB / embed Spline (đã đánh giá: scene Spline phải
 * vẽ tay trong editor, không có sẵn scene hộp giày đẹp đã verify bằng mắt
 * nên không nhét embed bừa — giữ CSS 3D + ảnh thật).
 *
 * Cách làm:
 * - Hộp vẽ bằng div + perspective: mặt trước in chữ AMAZING SNEAKER,
 *   nắp là 1 mặt phẳng bản lề ở mép trên (transform-origin: top).
 *   Giày dùng ảnh cắt nền trong suốt (product.cutoutImage, flood-fill từ
 *   viền ảnh thật) nên trồi lên nền tối không lộ khung ảnh trắng;
 *   lòng hộp giữ màu #F5F5F5 cho giống ruột hộp giấy thật.
 * - Cuộn chuột: section bị pin (GSAP ScrollTrigger scrub), nắp xoay mở
 *   dần tới -108°, giày trồi lên khỏi hộp, chữ trái đổi theo 2 nấc.
 * - Mobile (<768px) + prefers-reduced-motion: không pin/scrub, hiện hộp
 *   đã mở sẵn tĩnh, không hijack scroll.
 *
 * Props: `product` — giày nổi bật (Jordan 1 Retro High, ảnh thật).
 * Giữ lại từ hero cũ: giá + nút "Mua ngay" + "Xem tất cả giày" + caption
 * tên giày/màu (caption nằm ngoài khối xoay, có padding — không bị cắt
 * như lỗi hero cũ).
 */
interface ShoeBoxHeroProps {
  product: Product;
}

const LID_OPEN_DEG = -108;
// Trồi 170px: cổ giày vượt hẳn mép trên của hộp (trước đây chỉ 110px,
// cổ giày chỉ nhú khỏi hộp nên trông như giày dán trước tấm nền trắng).
const SHOE_RISE_PX = -170;

export default function ShoeBoxHero({ product }: ShoeBoxHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const lidRef = useRef<HTMLDivElement>(null);
  const shoeRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const text1Ref = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLButtonElement>(null);

  // Hero dùng ảnh cắt nền (trong suốt) nếu có — giày trồi lên nền tối
  // không lộ khung ảnh trắng. Không có cutout thì dùng ảnh thật gốc.
  const image = product.cutoutImage ?? product.colors[0]?.image ?? "";
  const colorName = product.colors[0]?.name ?? "";
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const staticOpen = prefersReducedMotion() || window.matchMedia("(max-width: 767px)").matches;

    registerGsap();
    const ctx = gsap.context(() => {
      if (staticOpen) {
        // Mobile / giảm chuyển động: hộp mở sẵn, chữ nấc 2, không pin/scrub.
        gsap.set(lidRef.current, { rotationX: LID_OPEN_DEG, transformPerspective: 1400 });
        gsap.set(shoeRef.current, { y: SHOE_RISE_PX, scale: 1.05 });
        gsap.set(shadowRef.current, { scaleX: 0.55, opacity: 0.3 });
        gsap.set(text1Ref.current, { opacity: 0, visibility: "hidden" });
        gsap.set(text2Ref.current, { opacity: 1, visibility: "visible" });
        gsap.set(hintRef.current, { display: "none" });
        if (lidRef.current) lidRef.current.style.zIndex = "15";
        return;
      }

      gsap.set(lidRef.current, { rotationX: 0, transformPerspective: 1400 });
      gsap.set(shoeRef.current, { y: 0, scale: 1 });
      gsap.set(shadowRef.current, { scaleX: 1, opacity: 0.85 });
      gsap.set(text1Ref.current, { opacity: 1, y: 0 });
      gsap.set(text2Ref.current, { opacity: 0, y: 24 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=130%",
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            // Nắp mở quá nửa thì chìm xuống sau giày, khỏi che giày.
            if (lidRef.current) {
              lidRef.current.style.zIndex = self.progress > 0.45 ? "15" : "40";
            }
          },
        },
      });
      tl.to(lidRef.current, { rotationX: LID_OPEN_DEG, duration: 0.7, ease: "none" }, 0);
      tl.to(shoeRef.current, { y: SHOE_RISE_PX, scale: 1.05, duration: 0.7, ease: "none" }, 0);
      tl.to(shadowRef.current, { scaleX: 0.55, opacity: 0.3, duration: 0.7, ease: "none" }, 0);
      tl.to(hintRef.current, { opacity: 0, duration: 0.08, ease: "none" }, 0.05);
      tl.to(text1Ref.current, { opacity: 0, y: -24, duration: 0.15, ease: "none" }, 0.45);
      tl.fromTo(
        text2Ref.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.15, ease: "none" },
        0.55,
      );
    }, section);

    // Ảnh tải xong layout ổn định thì tính lại vị trí pin.
    const img = section.querySelector("img");
    const refresh = () => ScrollTrigger.refresh();
    img?.addEventListener("load", refresh);
    return () => {
      img?.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, []);

  function scrollToOpen() {
    const y = window.scrollY + window.innerHeight * 1.2;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: 1.4 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  }

  return (
    <section
      ref={sectionRef}
      aria-label={`Giày nổi bật: ${product.name}`}
      className="relative overflow-hidden bg-ink text-paper"
    >
      {/* Chữ nền khổng lồ — trang trí, mờ sau hộp */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-8 select-none text-center font-display text-[24vw] leading-none tracking-tight text-paper/[0.05] uppercase md:text-[13rem]"
      >
        Amazing
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 pt-24 pb-20 md:grid-cols-2 md:pt-16 md:pb-16">
        {/* ── Cột chữ: 2 nấc, xếp chồng cùng 1 ô grid, đổi bằng GSAP ── */}
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-paper/25 bg-white/5 px-3 py-1 text-xs font-bold tracking-widest text-paper/80 uppercase">
            <span className="inline-block h-2 w-2 rounded-full bg-volt" aria-hidden="true" />
            Bộ sưu tập nổi bật
          </p>

          <div className="mt-6 grid">
            <div ref={text1Ref} className="[grid-area:1/1]">
              <h1 className="font-display text-5xl leading-[0.95] uppercase md:text-6xl">
                Mua giày
                <span className="block text-volt">chỉ vài chạm</span>
              </h1>
              <p className="mt-4 max-w-md text-base leading-relaxed text-paper/70 md:text-lg">
                {product.description}
              </p>
            </div>
            <div ref={text2Ref} className="[grid-area:1/1] opacity-0">
              <h1 className="font-display text-5xl leading-[0.95] uppercase md:text-6xl">
                Mở hộp là gặp
                <span className="block text-volt">đôi bạn thích</span>
              </h1>
              <p className="mt-4 max-w-md text-base leading-relaxed text-paper/70 md:text-lg">
                {product.name} — {colorName}. Đôi bạn chọn đã nằm ngay trong hộp, mở ra là
                mang được liền.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-extrabold text-paper">{formatVND(product.price)}</span>
            {product.originalPrice ? (
              <span className="text-lg text-paper/50 line-through">
                {formatVND(product.originalPrice)}
              </span>
            ) : null}
            {discount > 0 ? (
              <span className="rounded-full bg-ember px-2 py-1 text-xs font-bold text-white">
                −{discount}%
              </span>
            ) : null}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={`/product/${product.slug}`}
              className="rounded-full bg-volt px-6 py-3 text-sm font-bold text-ink transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt"
            >
              Mua ngay — {product.name}
            </Link>
            <Link
              to="/shop"
              className="rounded-full border-2 border-paper/60 bg-transparent px-6 py-3 text-sm font-bold text-paper transition-transform duration-200 hover:-translate-y-0.5 hover:border-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
            >
              Xem tất cả giày
            </Link>
          </div>

          <p className="mt-6 text-sm text-paper/50">
            {product.brand.toUpperCase()} · {product.category} · Màu {colorName} · Đủ size 36–46
          </p>
        </div>

        {/* ── Cột hộp: CSS 3D, ảnh thật ──
            mt-20 trên mobile: giày trồi lên 110px khỏi hộp, cần khoảng trống
            phía trên để không đè lên dòng meta của cột chữ (layout xếp dọc). */}
        <div className="relative mx-auto mt-28 w-full max-w-[540px] md:mt-0">
          <div className="relative aspect-[54/34] w-full" style={{ perspective: "1400px" }}>
            {/* Lòng hộp — màu đúng nền ảnh thật (#F5F5F5) để ảnh chìm hẳn vào */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 z-10 h-[56%] rounded-t-2xl border-2 border-b-0 border-ink bg-[#f5f5f5] shadow-[inset_0_-28px_28px_rgba(0,0,0,0.10)]"
            />

            {/* Bóng giày trong hộp */}
            <div
              ref={shadowRef}
              aria-hidden="true"
              className="absolute bottom-[104px] left-1/2 z-10 h-4 w-[55%] -translate-x-1/2 rounded-full bg-black/25 blur-md"
            />

            {/* Giày thật trồi lên — ảnh cắt nền trong suốt, crop 4/3 cho gọn;
                drop-shadow bám theo hình giày (không còn khung trắng). */}
            <div
              ref={shoeRef}
              data-testid="shoebox-shoe"
              className="absolute inset-x-0 bottom-[20px] z-20 mx-auto w-[76%] will-change-transform"
            >
              <div className="aspect-[4/3] w-full overflow-hidden">
                <img
                  src={image}
                  alt={`${product.name} — màu ${colorName}`}
                  width={900}
                  height={600}
                  fetchPriority="high"
                  className="h-full w-full object-cover [filter:drop-shadow(0_20px_20px_rgba(0,0,0,0.45))]"
                />
              </div>
            </div>

            {/* Mặt trước hộp — đè lên phần dưới của giày */}
            <div className="absolute inset-x-0 bottom-0 z-30 flex h-[44%] flex-col justify-center overflow-hidden rounded-b-2xl border-2 border-ink bg-paper px-5 text-ink md:px-6">
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-2 bg-volt" />
              <p className="font-display text-2xl tracking-wide uppercase md:text-3xl">
                Amazing Sneaker
              </p>
              <p className="mt-1 text-xs font-bold tracking-widest text-ink-mute uppercase md:text-sm">
                {product.brand} · {product.name} · Size 36–46
              </p>
            </div>

            {/* Nắp hộp — bản lề ở mép trên, xoay mở -108° theo scroll */}
            <div
              ref={lidRef}
              data-testid="shoebox-lid"
              aria-hidden="true"
              className="absolute inset-x-0 top-0 z-40 flex h-[56%] origin-top flex-col items-center justify-center overflow-hidden rounded-t-2xl border-2 border-ink bg-paper text-ink will-change-transform [backface-visibility:hidden]"
            >
              <p className="px-4 text-center font-display text-3xl tracking-wide uppercase md:text-4xl">
                Amazing
                <span className="block text-transparent" style={{ WebkitTextStroke: "2px #111111" }}>
                  Sneaker
                </span>
              </p>
              <span className="mt-3 h-1.5 w-16 rounded-full bg-volt" />
              <p className="mt-3 text-[11px] font-bold tracking-[0.25em] text-ink-mute uppercase">
                Hộp giày · Chính hãng
              </p>
            </div>
          </div>

          {/* Bóng đổ dưới hộp */}
          <div
            aria-hidden="true"
            className="absolute -bottom-5 left-1/2 h-5 w-[70%] -translate-x-1/2 rounded-full bg-black/40 blur-xl"
          />

          {/* Caption — nằm ngoài khối xoay, có padding riêng, không bị cắt */}
          <p
            data-testid="shoebox-caption"
            className="relative z-10 mt-8 pb-1 text-center text-sm leading-6 font-semibold text-paper/70"
          >
            {product.name} — {colorName}
          </p>
        </div>
      </div>

      {/* Nút gợi ý cuộn — desktop, mờ dần khi đã cuộn */}
      <button
        ref={hintRef}
        type="button"
        onClick={scrollToOpen}
        className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1 text-xs font-bold tracking-widest text-paper/70 uppercase transition hover:text-volt md:flex"
      >
        Cuộn để mở hộp
        <ChevronDown className="h-5 w-5 animate-bounce" />
      </button>
    </section>
  );
}
