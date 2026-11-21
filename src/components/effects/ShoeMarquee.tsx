import { useRef, useState } from "react";
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
 * - Kéo được bằng chuột / chạm: giữ và kéo thì dải dừng tự chạy và
 *   lướt theo tay; thả ra thì tự chạy tiếp từ đúng chỗ vừa kéo tới.
 *   Kéo đổi vị trí bằng animation-delay: đã kiểm bằng mắt trên Chrome,
 *   đổi delay thì khung hình nhảy thêm đúng số giây đó SO VỚI LÚC PAUSE
 *   (không phải đặt tuyệt đối) nên tính delay từ độ lệch kéo, lấy modulo
 *   1 vòng 40s — dải luôn phủ kín khung, không hở mép, không nhảy lát.
 *   Khi tắt chuyển động (reduced motion) thì kéo lớp bọc ngoài có kẹp.
 *   Chỉ bắt pointer khi đã kéo quá 4px để cú bấm thường vẫn mở trang
 *   chi tiết; kéo quá 6px thì chặn cú bấm đi kèm sau khi thả.
 * - Ảnh hơi nghiêng xen kẽ, bóng đổ bám theo giày; mobile chạy mượt
 *   bằng transform, không JS nặng, không tràn ngang.
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

const MARQUEE_DURATION = 40; // giây — khớp .animate-marquee-slow trong index.css

function ShoeRow({ slugs, reverse }: { slugs: string[]; reverse?: boolean }) {
  const items = rowProducts(slugs);
  const doubled = [...items, ...items];
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  // Trạng thái kéo: chỉ giữ trong ref để pointermove không re-render.
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    moved: number;
    animated: boolean;
    base: number;
    captured: boolean;
  } | null>(null);
  // Độ lệch lớp bọc — chỉ dùng khi tắt chuyển động (reduced motion).
  const offsetRef = useRef(0);
  const suppressClickRef = useRef(false);
  const [dragging, setDragging] = useState(false);

  const trackWidth = () => {
    const track = trackRef.current;
    return track ? track.getBoundingClientRect().width / 2 : 0;
  };

  // Đổi vị trí dải theo độ lệch kéo (px): đổi delay thì khung hình nhảy
  // thêm đúng số giây đó so với lúc pause — hàng xuôi đi ngược thời gian,
  // hàng ngược đi xuôi, lấy modulo 1 vòng 40s cho đủ mọi độ lệch.
  const setTrackShift = (dx: number) => {
    const track = trackRef.current;
    const w = trackWidth();
    if (!track || w <= 0) return;
    const raw = ((reverse ? dx : -dx) / w) * MARQUEE_DURATION;
    const delay =
      (((raw % MARQUEE_DURATION) + MARQUEE_DURATION) % MARQUEE_DURATION);
    track.style.animationDelay = `-${delay.toFixed(3)}s`;
  };

  const applyOffset = (px: number) => {
    if (wrapRef.current) wrapRef.current.style.transform = `translateX(${px}px)`;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const track = trackRef.current;
    const cs = track ? getComputedStyle(track) : null;
    const animated =
      !!cs && cs.animationName !== "none" && parseFloat(cs.animationDuration) > 0;
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      moved: 0,
      animated,
      base: offsetRef.current,
      captured: false,
    };
    setDragging(true);
    if (track) track.style.animationPlayState = "paused";
    // Chưa bắt pointer ở đây: bắt ngay thì cú click sau đó bị chuyển
    // mục tiêu sang lớp bọc, thẻ <a> không nhận click nên không mở trang.
    // Chỉ bắt khi đã kéo thật (xem onPointerMove).
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || d.pointerId !== e.pointerId) return;
    const dx = e.clientX - d.startX;
    d.moved = Math.max(d.moved, Math.abs(dx));
    if (!d.captured && d.moved > 4) {
      d.captured = true;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Pointer đã rời khỏi trang thì thôi, thả ra vẫn kết thúc kéo.
      }
    }
    if (d.animated) {
      setTrackShift(dx);
    } else {
      // Không có animation (giảm chuyển động): kéo lớp bọc, kẹp trong dải.
      const w = trackWidth();
      const vw = wrapRef.current?.getBoundingClientRect().width ?? 0;
      let next = d.base + dx;
      next = Math.max(-(2 * w - vw), Math.min(0, next));
      offsetRef.current = next;
      applyOffset(next);
    }
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || d.pointerId !== e.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    const track = trackRef.current;
    if (track) track.style.animationPlayState = "";
    if (d.moved > 6) {
      suppressClickRef.current = true;
      // Cú click đi kèm sau khi kéo sẽ bị chặn; hết 350ms thì hết hiệu lực
      // để cú bấm thật tiếp theo không bị ăn oan.
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 350);
    }
  };

  // Kéo rồi thả thì cú click đi kèm không được mở trang chi tiết.
  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Chưa bắt pointer mà chuột rời khỏi dải giữa chừng thì kết thúc kéo.
  const onPointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (d && !d.captured) endDrag(e);
  };

  return (
    <div
      ref={wrapRef}
      className={`overflow-hidden select-none [touch-action:pan-y] ${
        dragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={onPointerLeave}
      onClickCapture={onClickCapture}
      onDragStart={(e) => e.preventDefault()}
    >
      <div
        ref={trackRef}
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
                  draggable={false}
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
          Nike · Adidas · Puma · Vans — 12 đôi nổi bật. Kéo chuột để tự lướt, không kéo thì giày cứ tự
          chạy. Bấm vào đôi nào thích để xem chi tiết.
        </p>
      </div>

      <div className="mt-10 space-y-6">
        <ShoeRow slugs={ROW_1_SLUGS} />
        <ShoeRow slugs={ROW_2_SLUGS} reverse />
      </div>
    </section>
  );
}
