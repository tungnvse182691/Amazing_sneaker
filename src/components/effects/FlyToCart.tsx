import { prefersReducedMotion } from "../../lib/motion";

/**
 * Fly-to-cart 2D — khi bấm "Thêm vào giỏ", ảnh thu nhỏ bay vào icon giỏ.
 * Chỉ dùng Web Animations API (`element.animate`) với `transform` + `opacity`:
 * rẻ, không cần thư viện, tự dọn sau khi bay xong.
 *
 * Cách gắn (agent B — trang Shop / ProductDetail / card sản phẩm):
 * 1. Đặt `data-cart-target` lên nút/biểu tượng giỏ trong header
 *    (vd: <button data-cart-target aria-label="Giỏ hàng">…</button>).
 * 2. Trong handler thêm giỏ:
 *      const { flyToCart } = useFlyToCart();
 *      addItem(item); // cập nhật store TRƯỚC hay SAU đều được
 *      flyToCart(e.currentTarget, product.colors[0].image);
 *    `e.currentTarget` là nút "Thêm vào giỏ" — ảnh bay từ nút đó.
 *    Có thể truyền thẳng phần tử ảnh trong card thay cho nút.
 * 3. Nếu không tìm thấy `[data-cart-target]` (vd header chưa render):
 *    hàm trả `false` và không làm gì — giỏ vẫn được thêm bình thường.
 *
 * prefers-reduced-motion: KHÔNG bay, chỉ rung nhẹ badge giỏ (hoặc không gì cả).
 * Mobile: bay nhanh hơn (450ms) và thu nhỏ mạnh hơn để không lag.
 */
export interface FlyToCartOptions {
  /** Selector đích, mặc định "[data-cart-target]". */
  targetSelector?: string;
  /** Thời gian bay (ms). Mặc định 650 desktop / 450 mobile. */
  duration?: number;
}

/** Hàm thuần — dùng được cả ngoài React (vd trong store callback). */
export function flyToCart(
  source: HTMLElement,
  imageSrc: string,
  options: FlyToCartOptions = {},
): boolean {
  if (typeof document === "undefined" || prefersReducedMotion()) return false;
  const target = document.querySelector<HTMLElement>(options.targetSelector ?? "[data-cart-target]");
  if (!target) return false;

  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  if (from.width === 0 || to.width === 0) return false;

  const isMobile = window.matchMedia("(max-width: 639px)").matches;
  const duration = options.duration ?? (isMobile ? 450 : 650);

  // Clone ảnh: bay từ giữa nút nguồn tới giữa icon giỏ.
  const ghost = document.createElement("img");
  ghost.src = imageSrc;
  ghost.alt = "";
  ghost.setAttribute("aria-hidden", "true");
  ghost.style.cssText = [
    "position:fixed",
    "z-index:9999",
    "pointer-events:none",
    `left:${from.left + from.width / 2 - 40}px`,
    `top:${from.top + from.height / 2 - 40}px`,
    "width:80px",
    "height:80px",
    "object-fit:cover",
    "border-radius:12px",
    "box-shadow:0 12px 24px rgba(17,17,17,0.35)",
    "will-change:transform,opacity",
  ].join(";");
  document.body.appendChild(ghost);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);

  const anim = ghost.animate(
    [
      { transform: "translate(0, 0) scale(1) rotate(0deg)", opacity: 1 },
      {
        transform: `translate(${dx * 0.5}px, ${dy - 80}px) scale(0.55) rotate(-8deg)`,
        opacity: 0.95,
        offset: 0.55,
      },
      { transform: `translate(${dx}px, ${dy}px) scale(0.12) rotate(6deg)`, opacity: 0.4 },
    ],
    { duration, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" },
  );

  anim.onfinish = () => {
    ghost.remove();
    // Nảy nhẹ icon giỏ để báo "đã vào giỏ".
    target.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.25)" },
        { transform: "scale(1)" },
      ],
      { duration: 300, easing: "ease-out" },
    );
  };
  anim.oncancel = () => ghost.remove();
  return true;
}

/** Hook React — trả về hàm `fly(sourceElement, imageSrc)` đã bind sẵn options. */
export function useFlyToCart(options: FlyToCartOptions = {}) {
  const fly = (source: HTMLElement, imageSrc: string) => flyToCart(source, imageSrc, options);
  return { flyToCart: fly, fly };
}

export default useFlyToCart;
