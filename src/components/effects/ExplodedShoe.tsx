import { useEffect, useRef } from "react";
import { gsap, registerGsap, prefersReducedMotion } from "../../lib/motion";
import type { Product } from "../../types";

/**
 * ExplodedShoe — section "bung giày" bằng ẢNH THẬT, không ảnh chế.
 *
 * Cách làm: lấy ĐÚNG 1 ảnh sản phẩm thật (vd Nike Dunk Low Panda),
 * cắt thành 4 lát ngang bằng CSS `clip-path` rồi xếp chồng khít nhau.
 * Khi cuộn tới, GSAP ScrollTrigger (scrub) tách 4 lát ra theo chiều dọc,
 * mỗi lát hiện nhãn tên bộ phận. Ảnh vẫn là ảnh thật duy nhất — không
 * có ảnh chi tiết (đế/thân/dây) riêng nào được verify khớp mẫu nên KHÔNG
 * dùng ảnh ngoài, KHÔNG chế ảnh giả. Nhãn là tên vùng trên cùng 1 tấm ảnh.
 *
 * 4 lát (từ trên xuống): dây giày · thân trên · đế giữa · đế ngoài.
 *
 * prefers-reduced-motion / mobile hẹp: hiện ảnh tĩnh nguyên vẹn +
 * danh sách nhãn bên dưới, không scrub, không tách lớp (nhẹ, không lag).
 *
 * Props:
 * - `product`: giày cần "bung" (mặc định dùng ảnh Dunk Low Panda khi gắn).
 * - `title`: tiêu đề section.
 *
 * Đặt ở: trang ProductDetail (`/product/:slug`), dưới phần mô tả / trước
 * phần đánh giá — hoặc 1 section giữa trang Home.
 */
interface ExplodedShoeProps {
  product: Product;
  title?: string;
}

interface Layer {
  label: string;
  note: string;
  /** % từ trên xuống của lát cắt (top, bottom). */
  top: number;
  bottom: number;
  /** px tách ra khi scrub hết cỡ (âm = lên trên). */
  shift: number;
  /** Nhãn đặt bên nào trên desktop. */
  side: "left" | "right";
}

const LAYERS: Layer[] = [
  { label: "Dây giày", note: "Cố định form, thắt vừa chân", top: 0, bottom: 68, shift: -84, side: "left" },
  { label: "Thân trên", note: "Da trơn, thoáng và bền", top: 32, bottom: 44, shift: -28, side: "right" },
  { label: "Đế giữa", note: "Đệm êm, giảm chấn khi bước", top: 56, bottom: 20, shift: 28, side: "left" },
  { label: "Đế ngoài", note: "Cao su bám đường, chống trượt", top: 80, bottom: 0, shift: 84, side: "right" },
];

export default function ExplodedShoe({ product, title = "Bung đôi giày ra xem" }: ExplodedShoeProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const labelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const reduced = prefersReducedMotion();

  const image = product.colors[0]?.image ?? "";
  const colorName = product.colors[0]?.name ?? "";

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || prefersReducedMotion()) return;
    // Mobile hẹp (<640px): giữ ảnh tĩnh, không scrub để tránh lag.
    if (window.matchMedia("(max-width: 639px)").matches) return;

    registerGsap();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 78%",
          end: "bottom 55%",
          scrub: 0.5,
        },
      });
      LAYERS.forEach((layer, i) => {
        const el = layerRefs.current[i];
        const label = labelRefs.current[i];
        if (el) tl.to(el, { y: layer.shift, duration: 1, ease: "none" }, 0);
        if (label) tl.fromTo(label, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "none" }, 0.35);
      });
    }, stage);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} aria-label={title} className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <h2 className="font-display text-4xl uppercase md:text-5xl">{title}</h2>
      <p className="mt-2 max-w-xl text-ink-soft">
        {product.name} — {colorName}. Cuộn xuống để tách từng lớp của đôi giày (ảnh thật của sản phẩm, cắt
        lát bằng CSS — không phải ảnh minh họa).
      </p>

      {/* Sân khấu: 4 lát ảnh chồng khít nhau, tách ra khi cuộn (desktop). */}
      <div ref={stageRef} className="relative mx-auto mt-8 max-w-3xl">
        <div className="relative aspect-[4/3] w-full overflow-visible">
          {LAYERS.map((layer, i) => (
            <div
              key={layer.label}
              ref={(el) => {
                layerRefs.current[i] = el;
              }}
              aria-hidden="true"
              className="absolute inset-0 will-change-transform"
            >
              <img
                src={image}
                alt=""
                loading="lazy"
                className="h-full w-full rounded-2xl object-cover"
                style={{ clipPath: `inset(${layer.top}% 0 ${layer.bottom}% 0)` }}
              />
            </div>
          ))}

          {/* Nhãn từng lát — desktop: nằm 2 bên sân khấu, hiện dần theo scrub. */}
          {LAYERS.map((layer, i) => (
            <div
              key={`label-${layer.label}`}
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
              style={{ top: `${layer.top + (100 - layer.top - layer.bottom) / 2}%` }}
              className={`absolute hidden w-44 -translate-y-1/2 md:block ${
                layer.side === "left" ? "right-full mr-4 text-right" : "left-full ml-4"
              } ${reduced ? "opacity-100" : "opacity-0"}`}
            >
              <p className="text-sm font-extrabold text-ink uppercase">{layer.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-mute">{layer.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Nhãn dạng danh sách: luôn hiện trên mobile + khi giảm chuyển động. */}
      <ul className="mx-auto mt-6 grid max-w-3xl gap-2 sm:grid-cols-2 md:hidden">
        {LAYERS.map((layer) => (
          <li key={layer.label} className="rounded-xl border border-line bg-white px-4 py-3">
            <p className="text-sm font-extrabold text-ink uppercase">{layer.label}</p>
            <p className="mt-0.5 text-xs text-ink-mute">{layer.note}</p>
          </li>
        ))}
      </ul>

      {/* Ảnh gốc nguyên vẹn cho screen reader / khi ảnh lát cắt không tải được. */}
      <p className="sr-only">
        Ảnh {product.name} màu {colorName} được tách thành 4 lớp: dây giày, thân trên, đế giữa, đế ngoài.
      </p>
    </section>
  );
}
