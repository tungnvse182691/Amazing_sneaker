import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { getLenis, gsap, prefersReducedMotion, registerGsap, ScrollTrigger } from "../../lib/motion";
import type { Product } from "../../types";
import { BRAND_LABELS } from "../../data/products";
import { formatVND } from "../../lib/format";

/**
 * ShoeBoxHero — chuỗi 4 hộp giày kiểu Moco, bằng ẢNH THẬT + CSS 3D.
 * KHÔNG Three.js / model GLB / embed Spline (giữ CSS 3D + ảnh thật như bản 1 hộp).
 *
 * Cách làm:
 * - Mỗi hộp vẽ bằng div + perspective: mặt trước in chữ AMAZING SNEAKER,
 *   nắp là 1 mặt phẳng bản lề ở mép trên (transform-origin: top).
 *   Giày dùng ảnh cắt nền trong suốt (product.cutoutImage, rembg u2net)
 *   nên trồi lên nền tối không lộ khung ảnh trắng; lòng hộp giữ màu
 *   #F5F5F5 cho giống ruột hộp giấy thật.
 * - Desktop (≥768px, có chuyển động): section bị pin (GSAP ScrollTrigger
 *   scrub), 4 hộp mở lần lượt — hộp mở xong thì nắp đóng lại, hộp trượt
 *   sang trái, hộp tiếp theo trượt từ phải vào rồi mở. Chữ trái đổi theo
 *   từng đôi (tên, màu, giá lấy đúng từ products.ts).
 * - Mobile (<768px) + prefers-reduced-motion: carousel vuốt tay (ngưỡng
 *   50px) + nút trước/sau + chấm tròn, hộp mở sẵn tĩnh, không pin/scrub.
 * - Chấm tròn bấm được: desktop cuộn tới đúng đoạn của hộp đó.
 *
 * Props: `products` — 4 giày theo thứ tự Jordan 1 → Air Force 1 →
 * Air Max 90 → Vans Old Skool.
 */
interface ShoeBoxHeroProps {
  products: Product[];
}

const LID_OPEN_DEG = -108;
// Trồi 170px: cổ giày vượt hẳn mép trên của hộp (trước đây chỉ 110px,
// cổ giày chỉ nhú khỏi hộp nên trông như giày dán trước tấm nền trắng).
const SHOE_RISE_PX = -170;
const SWIPE_THRESHOLD_PX = 50;

export default function ShoeBoxHero({ products }: ShoeBoxHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lidRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shoeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shadowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hintRef = useRef<HTMLButtonElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const activeRef = useRef(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  // Mốc thời gian (tỉ lệ 0–1 trên timeline) của từng hộp, ghi lúc dựng
  // timeline: giữa lúc hộp mở hẳn (để chấm tròn cuộn tới đúng chỗ) và
  // lúc hộp bắt đầu vào (để chấm tròn sáng đúng hộp đang xem).
  const stageHoldProgress = useRef<number[]>([]);
  const stageEnterProgress = useRef<number[]>([]);

  const [carouselMode, setCarouselMode] = useState<boolean>(
    () =>
      typeof window !== "undefined" &&
      (prefersReducedMotion() || window.matchMedia("(max-width: 767px)").matches),
  );
  const [activeIndex, setActiveIndex] = useState(0);

  const n = products.length;
  const activeProduct = products[activeIndex] ?? products[0];

  // Theo dõi đổi cỡ màn hình / đổi chế độ giảm chuyển động.
  useEffect(() => {
    const mqMobile = window.matchMedia("(max-width: 767px)");
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setCarouselMode(prefersReducedMotion() || mqMobile.matches);
    mqMobile.addEventListener("change", update);
    mqMotion.addEventListener("change", update);
    return () => {
      mqMobile.removeEventListener("change", update);
      mqMotion.removeEventListener("change", update);
    };
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Carousel: hộp mở sẵn bằng style tĩnh (không cần GSAP).
    if (carouselMode) {
      tlRef.current = null;
      return;
    }

    registerGsap();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: `+=${n * 100}%`,
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            // Chấm tròn theo hộp đang mở (chỉ setState khi đổi hộp).
            // Mốc vào của từng hộp ghi lúc dựng timeline (không dùng
            // progress*n vì các đoạn mở/giữ/đóng dài không đều nhau).
            const enters = stageEnterProgress.current;
            let idx = 0;
            for (let k = 0; k < enters.length; k++) {
              if (self.progress >= enters[k]) idx = k;
            }
            if (idx !== activeRef.current) {
              activeRef.current = idx;
              setActiveIndex(idx);
            }
          },
        },
      });
      tlRef.current = tl;

      let t = 0;
      products.forEach((_p, i) => {
        const stage = stageRefs.current[i];
        const lid = lidRefs.current[i];
        const shoe = shoeRefs.current[i];
        const shadow = shadowRefs.current[i];
        const text = textRefs.current[i];
        if (!stage || !lid || !shoe || !shadow || !text) return;

        // Trạng thái đầu: hộp đầu hiện sẵn (đóng nắp, chữ hiện) để lúc mới
        // vào trang vẫn thấy hộp; các hộp sau ẩn, chờ trượt vào.
        if (i === 0) {
          gsap.set(stage, { autoAlpha: 1, x: 0, rotation: 0 });
          gsap.set(text, { autoAlpha: 1, y: 0 });
        } else {
          gsap.set(stage, { autoAlpha: 0, x: 90, rotation: 1.5 });
          gsap.set(text, { autoAlpha: 0, y: 24 });
        }
        gsap.set(lid, { rotationX: 0, transformPerspective: 1400 });
        gsap.set(shoe, { y: 0, scale: 1 });
        gsap.set(shadow, { scaleX: 1, opacity: 0.85 });

        // Hộp sau trượt từ phải vào (hộp đầu đã ở sẵn trong khung hình).
        if (i > 0) {
          stageEnterProgress.current[i] = t;
          tl.to(stage, { autoAlpha: 1, x: 0, rotation: 0, duration: 0.5, ease: "none" }, t);
          t += 0.5;
        } else {
          stageEnterProgress.current[i] = 0;
        }

        // Mở nắp: nắp xoay -108°, giày trồi lên, chữ hiện.
        tl.set(lid, { zIndex: 15 }, t); // nắp mở quá nửa thì chìm xuống sau giày.
        tl.to(lid, { rotationX: LID_OPEN_DEG, duration: 0.9, ease: "none" }, t);
        tl.to(shoe, { y: SHOE_RISE_PX, scale: 1.05, duration: 0.9, ease: "none" }, t);
        tl.to(shadow, { scaleX: 0.55, opacity: 0.3, duration: 0.9, ease: "none" }, t);
        if (i > 0) {
          tl.to(text, { autoAlpha: 1, y: 0, duration: 0.5, ease: "none" }, t + 0.2);
        }
        t += 0.9;

        // Giữ hộp mở một nhịp rồi chuyển sang hộp sau.
        // Mốc giữa nhịp giữ: chấm tròn cuộn tới đúng chỗ hộp mở hẳn.
        stageHoldProgress.current[i] = t + 0.25;
        t += 0.5;

        if (i < n - 1) {
          // Đóng nắp + giày chìm xuống.
          tl.set(lid, { zIndex: 40 }, t);
          tl.to(lid, { rotationX: 0, duration: 0.7, ease: "none" }, t);
          tl.to(shoe, { y: 0, scale: 1, duration: 0.7, ease: "none" }, t);
          tl.to(shadow, { scaleX: 1, opacity: 0.85, duration: 0.7, ease: "none" }, t);
          tl.to(text, { autoAlpha: 0, y: -16, duration: 0.4, ease: "none" }, t);
          t += 0.7;
          // Hộp trượt sang trái, nhường chỗ cho hộp sau.
          tl.to(stage, { autoAlpha: 0, x: -90, rotation: -1.5, duration: 0.5, ease: "none" }, t);
          t += 0.5;
        }
      });

      tl.to(hintRef.current, { opacity: 0, duration: 0.08, ease: "none" }, 0.05);

      // Nhịp giữ cuối: hộp cuối cần 1 tween thật để nhịp giữ của nó được
      // tính vào độ dài timeline (chỉ cộng số t thì GSAP không tính —
      // timeline dài bằng tween cuối cùng). Tween này giữ nguyên bóng giày
      // ở trạng thái mở nên không đổi gì trên màn hình.
      const lastShadow = shadowRefs.current[n - 1];
      if (lastShadow) {
        tl.to(lastShadow, { opacity: 0.3, duration: 0.5, ease: "none" }, t);
        t += 0.5;
      }

      // Đổi mốc thời gian thô sang tỉ lệ 0–1 trên timeline thật.
      const total = tl.duration();
      stageHoldProgress.current = stageHoldProgress.current.map((v) => v / total);
      stageEnterProgress.current = stageEnterProgress.current.map((v) => v / total);
    }, section);

    // Ảnh tải xong layout ổn định thì tính lại vị trí pin — gom nhiều ảnh
    // load cùng lúc thành 1 lần refresh (không refresh thì chiều cao trang
    // đổi liên tục, thanh cuộn phải nhảy theo).
    const imgs = [...section.querySelectorAll("img")];
    let refreshTimer: number | undefined;
    const refresh = () => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 200);
    };
    imgs.forEach((img) => img.addEventListener("load", refresh));
    return () => {
      window.clearTimeout(refreshTimer);
      imgs.forEach((img) => img.removeEventListener("load", refresh));
      tlRef.current = null;
      ctx.revert();
    };
  }, [carouselMode, n, products]);

  function scrollToStage(i: number) {
    if (carouselMode) {
      setActiveIndex(i);
      activeRef.current = i;
      return;
    }
    const st = tlRef.current?.scrollTrigger;
    if (!st) return;
    // Cuộn tới giữa nhịp giữ của hộp đó (hộp mở hẳn, chữ hiện đủ).
    const holds = stageHoldProgress.current;
    const frac = holds[i] ?? (i + 0.5) / n;
    const target = st.start + frac * (st.end - st.start);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(target, { duration: 1.2 });
    else window.scrollTo({ top: target, behavior: "smooth" });
  }

  function goPrev() {
    setActiveIndex((v) => (v - 1 + n) % n);
  }

  function goNext() {
    setActiveIndex((v) => (v + 1) % n);
  }

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  }

  function onTouchEnd(e: React.TouchEvent) {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > SWIPE_THRESHOLD_PX && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goNext();
      else goPrev();
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!carouselMode) return;
    if (e.key === "ArrowRight") goNext();
    if (e.key === "ArrowLeft") goPrev();
  }

  const dots = (
    <>
      {products.map((p, i) => (
        <button
          key={p.id}
          type="button"
          onClick={() => scrollToStage(i)}
          aria-label={`Hộp ${i + 1}: ${p.name}`}
          aria-current={i === activeIndex ? "true" : undefined}
          className="flex h-11 w-11 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt"
        >
          <span
            aria-hidden="true"
            className={`block h-2.5 rounded-full transition-[width,background-color] duration-300 ${
              i === activeIndex ? "w-8 bg-volt" : "w-2.5 bg-paper/40 hover:bg-paper/70"
            }`}
          />
        </button>
      ))}
    </>
  );

  return (
    <section
      ref={sectionRef}
      aria-label={`Giày nổi bật: ${n} đôi`}
      onTouchStart={carouselMode ? onTouchStart : undefined}
      onTouchEnd={carouselMode ? onTouchEnd : undefined}
      onKeyDown={onKeyDown}
      tabIndex={carouselMode ? 0 : undefined}
      className="relative overflow-hidden bg-ink text-paper"
    >
      {/* Chữ nền khổng lồ — trang trí, mờ sau hộp */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-8 select-none text-center font-display text-[24vw] leading-none tracking-tight text-paper/[0.05] uppercase md:text-[13rem]"
      >
        Amazing
      </div>

      <div className="relative grid">
        {products.map((product, i) => {
          const image = product.cutoutImage ?? product.colors[0]?.image ?? "";
          const colorName = product.colors[0]?.name ?? "";
          const brandLabel = BRAND_LABELS[product.brand] ?? product.brand;
          const discount =
            product.originalPrice && product.originalPrice > product.price
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
              : 0;
          // Carousel: chỉ hộp đang chọn hiện, hộp mở sẵn bằng style tĩnh.
          const carouselHidden = carouselMode && i !== activeIndex;
          const openStyle: React.CSSProperties | undefined = carouselMode
            ? { transform: `perspective(1400px) rotateX(${LID_OPEN_DEG}deg)` }
            : undefined;
          const shoeStyle: React.CSSProperties | undefined = carouselMode
            ? { transform: `translateY(${SHOE_RISE_PX}px) scale(1.05)` }
            : undefined;
          const shadowStyle: React.CSSProperties | undefined = carouselMode
            ? { transform: "scaleX(0.55)", opacity: 0.3 }
            : undefined;

          return (
            <div
              key={product.id}
              ref={(el) => {
                stageRefs.current[i] = el;
              }}
              aria-hidden={carouselMode && i !== activeIndex ? true : undefined}
              className={`[grid-area:1/1] ${carouselHidden ? "hidden" : ""}`}
            >
              <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 pt-24 pb-20 md:grid-cols-2 md:pt-16 md:pb-16">
                {/* ── Cột chữ theo từng đôi ── */}
                <div
                  ref={(el) => {
                    textRefs.current[i] = el;
                  }}
                >
                  <p className="inline-flex items-center gap-2 rounded-full border border-paper/25 bg-white/5 px-3 py-1 text-xs font-bold tracking-widest text-paper/80 uppercase">
                    <span className="inline-block h-2 w-2 rounded-full bg-volt" aria-hidden="true" />
                    Hộp {i + 1} / {n} · {brandLabel}
                  </p>

                  <h1 className="mt-6 font-display text-4xl leading-[1.02] uppercase md:text-5xl">
                    {product.name}
                  </h1>
                  <p className="mt-4 max-w-md text-base leading-relaxed text-paper/70 md:text-lg">
                    {product.description}
                  </p>

                  <div className="mt-6 flex flex-wrap items-baseline gap-3">
                    <span className="text-3xl font-extrabold text-paper">
                      {formatVND(product.price)}
                    </span>
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
                      Mua ngay: {product.name}
                    </Link>
                    <Link
                      to="/shop"
                      className="rounded-full border-2 border-paper/60 bg-transparent px-6 py-3 text-sm font-bold text-paper transition-transform duration-200 hover:-translate-y-0.5 hover:border-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
                    >
                      Xem tất cả giày
                    </Link>
                  </div>

                  <p className="mt-6 text-sm text-paper/50">
                    {product.brand.toUpperCase()} · {product.category} · Màu {colorName} · Đủ size
                    36–46
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
                      ref={(el) => {
                        shadowRefs.current[i] = el;
                      }}
                      aria-hidden="true"
                      style={shadowStyle}
                      className="absolute bottom-[104px] left-1/2 z-10 h-4 w-[55%] -translate-x-1/2 rounded-full bg-black/25 blur-md"
                    />

                    {/* Giày thật trồi lên — ảnh cắt nền trong suốt, crop 4/3 cho gọn;
                        drop-shadow bám theo hình giày (không còn khung trắng). */}
                    <div
                      ref={(el) => {
                        shoeRefs.current[i] = el;
                      }}
                      data-testid="shoebox-shoe"
                      style={shoeStyle}
                      className="absolute inset-x-0 bottom-[20px] z-20 mx-auto w-[76%] will-change-transform"
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden">
                        <img
                          src={image}
                          alt={`${product.name}, màu ${colorName}`}
                          width={900}
                          height={600}
                          fetchPriority={i === 0 ? "high" : "auto"}
                          loading={i === 0 ? "eager" : "lazy"}
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
                      ref={(el) => {
                        lidRefs.current[i] = el;
                      }}
                      data-testid="shoebox-lid"
                      aria-hidden="true"
                      style={openStyle}
                      className="absolute inset-x-0 top-0 z-40 flex h-[56%] origin-top flex-col items-center justify-center overflow-hidden rounded-t-2xl border-2 border-ink bg-paper text-ink will-change-transform [backface-visibility:hidden]"
                    >
                      <p className="px-4 text-center font-display text-3xl tracking-wide uppercase md:text-4xl">
                        Amazing
                        <span
                          className="block text-transparent"
                          style={{ WebkitTextStroke: "2px #111111" }}
                        >
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
                    {product.name} · {colorName}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chấm tròn chuyển hộp — desktop: nổi dưới cùng; mobile: nằm trong dòng chảy */}
      {!carouselMode ? (
        <div className="absolute bottom-14 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 md:flex">
          {dots}
        </div>
      ) : null}
      {carouselMode ? (
        <div className="relative z-20 flex items-center justify-center gap-4 pb-10 md:hidden">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Hộp trước"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-paper/40 text-paper transition hover:border-volt hover:text-volt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">{dots}</div>
          <button
            type="button"
            onClick={goNext}
            aria-label="Hộp sau"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-paper/40 text-paper transition hover:border-volt hover:text-volt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <span className="sr-only">
            Đang xem hộp {activeIndex + 1} trên {n}: {activeProduct.name}
          </span>
        </div>
      ) : null}

      {/* Nút gợi ý cuộn — desktop, mờ dần khi đã cuộn */}
      {!carouselMode ? (
        <button
          ref={hintRef}
          type="button"
          onClick={() => scrollToStage(0)}
          className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1 text-xs font-bold tracking-widest text-paper/70 uppercase transition hover:text-volt md:flex"
        >
          Cuộn để mở từng hộp
          <ChevronDown className="h-5 w-5 animate-hint-bob" />
        </button>
      ) : null}
    </section>
  );
}
