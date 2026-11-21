import { useEffect, useMemo, useRef } from "react";
import { gsap, registerGsap, prefersReducedMotion } from "../../lib/motion";
import type { Product } from "../../types";

/**
 * ExplodedShoe — section "bung giày" bằng ẢNH THẬT, không ảnh chế.
 *
 * Cách làm: lấy ĐÚNG 1 ảnh sản phẩm thật, cắt thành 4 lát ngang bằng CSS
 * `clip-path` rồi xếp chồng khít nhau. Khi cuộn tới, GSAP ScrollTrigger
 * (scrub) tách 4 lát ra theo chiều dọc, mỗi lát hiện nhãn tên bộ phận.
 *
 * Vấn đề đã sửa (11/2026): ảnh mỗi hãng chụp khác nhau — giày không nằm
 * giữa khung hình mà lệch lên/xuống (vd Samba OG: giày nằm ở 59–100%
 * chiều cao ảnh, 2 lát trên trước đây toàn nền trống). Nên mỗi sản phẩm
 * có 1 "dải giày" (SHOE_BAND) đo thật bằng pixel từ ảnh gốc: sân khấu
 * chỉ hiển thị đúng dải đó, 4 lát cắt chia đều trong dải, nhãn đi theo
 * đúng lát của nó (trước đây nhãn đứng yên trong khi lát tách ra).
 *
 * 4 lát (từ trên xuống, trong dải giày): dây giày · thân trên · đế giữa · đế ngoài.
 *
 * prefers-reduced-motion / mobile hẹp: hiện ảnh tĩnh nguyên vẹn (đã cắt
 * đúng dải giày) + danh sách nhãn bên dưới, không scrub, không tách lớp.
 */
interface ExplodedShoeProps {
  product: Product;
  title?: string;
}

interface Layer {
  label: string;
  note: string;
  /** px tách ra khi scrub hết cỡ (âm = lên trên). */
  shift: number;
  /** Nhãn đặt bên nào trên desktop. */
  side: "left" | "right";
}

const LAYERS: Layer[] = [
  { label: "Dây giày", note: "Cố định form, thắt vừa chân", shift: -84, side: "left" },
  { label: "Thân trên", note: "Da trơn, thoáng và bền", shift: -28, side: "right" },
  { label: "Đế giữa", note: "Đệm êm, giảm chấn khi bước", shift: 28, side: "left" },
  { label: "Đế ngoài", note: "Cao su bám đường, chống trượt", shift: 84, side: "right" },
];

/**
 * Dải giày (top/bottom, tỉ lệ 0–1 theo chiều cao ảnh gốc) — đo thật bằng
 * pixel từ ảnh màu đầu tiên của từng sản phẩm trong src/data/products.ts:
 * vùng khác màu nền (góc ảnh) hoặc tối, nới thêm 1% mỗi đầu. Đo lại
 * ngày 2026-11-21 sau khi bản đầu (nới 6%) vẫn để lát "dây giày" trống
 * quá nửa vì phần đệm trên giày trắng không bắt được. Ảnh GOAT khổ ngang
 * (Jordan 1, Blazer, P-6000, Vans Old Skool): giày lấp đầy khung → 0–1.
 */
const SHOE_BAND: Record<string, { top: number; bottom: number }> = {
  "nike-air-jordan-1-retro-high": { top: 0.003, bottom: 0.996 },
  "nike-air-force-1-07": { top: 0.39, bottom: 0.735 },
  "nike-air-max-90": { top: 0.221, bottom: 0.783 },
  "nike-dunk-low": { top: 0.409, bottom: 0.737 },
  "nike-pegasus-41": { top: 0.42, bottom: 0.736 },
  "nike-blazer-mid-77": { top: 0.004, bottom: 0.996 },
  "nike-cortez": { top: 0.414, bottom: 0.737 },
  "nike-p-6000": { top: 0.013, bottom: 0.987 },
  "adidas-ultraboost-light": { top: 0.296, bottom: 0.703 },
  "adidas-samba-og": { top: 0.639, bottom: 0.973 },
  "adidas-gazelle": { top: 0.318, bottom: 0.682 },
  "adidas-superstar": { top: 0.301, bottom: 0.699 },
  "adidas-stan-smith": { top: 0.257, bottom: 0.766 },
  "adidas-campus-00s": { top: 0.373, bottom: 0.814 },
  "adidas-forum-low": { top: 0.267, bottom: 0.74 },
  "adidas-nmd-r1": { top: 0.351, bottom: 0.854 },
  "puma-suede-classic": { top: 0.322, bottom: 0.694 },
  "puma-rs-x": { top: 0.168, bottom: 0.858 },
  "puma-palermo": { top: 0.302, bottom: 0.717 },
  "puma-cali": { top: 0.139, bottom: 0.87 },
  "puma-future-rider": { top: 0.164, bottom: 0.828 },
  "puma-velocity-nitro-3": { top: 0.285, bottom: 0.729 },
  "puma-mb-03": { top: 0.27, bottom: 0.748 },
  "puma-deviate-nitro-3": { top: 0.293, bottom: 0.724 },
  "vans-old-skool": { top: 0.008, bottom: 0.992 },
};

const DEFAULT_BAND = { top: 0.25, bottom: 0.9 };

export default function ExplodedShoe({ product, title = "Bung đôi giày ra xem" }: ExplodedShoeProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const labelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const reduced = prefersReducedMotion();

  const image = product.colors[0]?.image ?? "";
  const colorName = product.colors[0]?.name ?? "";
  const band = useMemo(
    () => SHOE_BAND[product.slug] ?? DEFAULT_BAND,
    [product.slug],
  );
  const bandH = band.bottom - band.top;
  // Độ tách tỉ lệ với chiều cao dải giày: dải ngắn (vd Samba) thì tách ít
  // lại để khe hở không nuốt mất lát, dải dài (ảnh GOAT) thì tách mạnh hơn.
  const shiftScale = Math.min(1.35, Math.max(0.45, bandH / 0.75));

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
        const shift = layer.shift * shiftScale;
        if (el) tl.to(el, { y: shift, duration: 1, ease: "none" }, 0);
        // Nhãn đi theo đúng lát của nó (cùng độ dịch), đồng thời hiện dần.
        if (label) {
          tl.to(label, { y: shift, duration: 1, ease: "none" }, 0);
          tl.fromTo(label, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "none" }, 0.35);
        }
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

      {/* Sân khấu: đúng dải giày trong ảnh (tỉ lệ 1 / chiều cao dải), 4 lát
          chồng khít nhau, tách ra khi cuộn (desktop). */}
      <div ref={stageRef} className="relative mx-auto mt-16 max-w-3xl">
        <div
          className="relative w-full overflow-visible"
          style={{ aspectRatio: `${1 / bandH}` }}
        >
          {LAYERS.map((layer, i) => {
            // Lát i chiếm 1/4 dải giày, tính theo chiều cao ảnh gốc.
            const sliceTop = band.top + (i * bandH) / 4;
            const sliceBottom = band.top + ((i + 1) * bandH) / 4;
            return (
              <div
                key={layer.label}
                ref={(el) => {
                  layerRefs.current[i] = el;
                }}
                aria-hidden="true"
                className={`absolute inset-0 overflow-hidden will-change-transform ${
                  i === 0 ? "rounded-t-2xl" : i === LAYERS.length - 1 ? "rounded-b-2xl" : ""
                }`}
              >
                <img
                  src={image}
                  alt=""
                  loading="lazy"
                  className="absolute left-0 w-full object-cover"
                  style={{
                    // Ảnh vuông hiển thị đúng dải giày: cao = chiều rộng sân khấu,
                    // đẩy lên trên để đầu dải trùng đầu sân khấu.
                    height: `${100 / bandH}%`,
                    top: `${(-band.top / bandH) * 100}%`,
                    clipPath: `inset(${sliceTop * 100}% 0 ${(1 - sliceBottom) * 100}% 0)`,
                  }}
                />
              </div>
            );
          })}

          {/* Nhãn từng lát — desktop: nằm 2 bên sân khấu, đi theo lát khi tách. */}
          {LAYERS.map((layer, i) => (
            <div
              key={`label-${layer.label}`}
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
              style={{ top: `${(i + 0.5) * 25}%` }}
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
