import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

/**
 * motion.ts — điểm tập trung duy nhất cho chuyển động của Amazing Sneaker.
 *
 * Quy tắc chung (theo yêu cầu của anh Tùng — KHÔNG 3D, chỉ 2D):
 * - Chỉ animate `transform` + `opacity` (không đụng layout, không giật).
 * - Không hijack scroll: Lenis chỉ làm mượt quán tính native, không khóa scroll.
 * - Tôn trọng `prefers-reduced-motion`: giảm chuyển động thì tắt hết
 *   parallax / marquee / fly-to-cart / scrub, chỉ hiện nội dung tĩnh.
 * - Không có dependency 3D nào ở đây (không three / R3F / drei).
 */

let gsapRegistered = false;

/** Đăng ký GSAP ScrollTrigger một lần duy nhất. Gọi trước khi dùng ScrollTrigger. */
export function registerGsap(): void {
  if (!gsapRegistered) {
    gsap.registerPlugin(ScrollTrigger);
    gsapRegistered = true;
  }
}

export { gsap, ScrollTrigger };

/** true khi hệ thống / trình duyệt yêu cầu giảm chuyển động. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Theo dõi thay đổi prefers-reduced-motion.
 * Trả về hàm hủy đăng ký.
 */
export function onReducedMotionChange(cb: (reduced: boolean) => void): () => void {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const handler = (e: MediaQueryListEvent) => cb(e.matches);
  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
}

export interface LenisHandle {
  lenis: Lenis;
  destroy: () => void;
}

/**
 * Khởi tạo Lenis smooth scroll — NHẸ, không khóa scroll.
 * - `lerp` 0.1: mượt vừa, không trễ tay; `smoothWheel: true` chỉ cho chuột.
 * - Khi prefers-reduced-motion: KHÔNG tạo Lenis, scroll giữ native 100%.
 * - Gọi 1 lần ở App (useEffect), destroy khi unmount.
 * - Lenis tự nối với GSAP ScrollTrigger qua `lenis.on("scroll", ScrollTrigger.update)`.
 *
 * Lưu ý: không gọi trong StrictMode effect 2 lần mà không destroy —
 * hàm này tự destroy instance cũ nếu đã tồn tại.
 */
let activeLenis: Lenis | null = null;

export function initSmoothScroll(): LenisHandle | null {
  if (prefersReducedMotion()) return null;
  if (typeof window === "undefined") return null;

  activeLenis?.destroy();
  const lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    touchMultiplier: 1,
  });
  activeLenis = lenis;

  registerGsap();
  lenis.on("scroll", ScrollTrigger.update);

  // Thanh cuộn native: Lenis 1.3 bỏ qua scroll native (kể cả kéo thanh cuộn)
  // trong lúc nó đang easing (isScrolling === "smooth") rồi mỗi frame kéo
  // trang về targetScroll của nó — nên chộp thanh cuộn đúng lúc đó thì
  // trang không ăn theo tay, cứ đứng yên rồi giật (lỗi anh Tùng gặp, chỉ
  // "đôi lúc" vì chỉ xảy ra khi Lenis còn đang chạy đà sau lần lăn trước).
  // Nghe scroll native: nếu vị trí thật lệch khỏi chỗ Lenis đang animate
  // quá ngưỡng (ngưỡng theo vận tốc để không nhận nhầm scroll do chính
  // Lenis tạo ra), hoặc vị trí thật đã vượt qua đích Lenis đang hướng tới,
  // thì nhường tay người dùng: dừng animation, nhận vị trí hiện tại.
  const onNativeScroll = () => {
    if (!lenis.isScrolling) return;
    const actual = window.scrollY;
    const animated = lenis.animatedScroll;
    const target = lenis.targetScroll;
    const lag =
      Math.abs(actual - animated) > Math.abs(lenis.velocity) * 2 + 8;
    const away =
      Math.abs(actual - target) > Math.abs(animated - target) + 8;
    const crossed =
      Math.sign(actual - target) !== Math.sign(animated - target) &&
      Math.abs(actual - target) > 8;
    if (lag || away || crossed) {
      lenis.scrollTo(actual, { immediate: true });
    }
  };
  window.addEventListener("scroll", onNativeScroll, { passive: true });

  let rafId = 0;
  const raf = (time: number) => {
    lenis.raf(time);
    rafId = requestAnimationFrame(raf);
  };
  rafId = requestAnimationFrame(raf);

  return {
    lenis,
    destroy: () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onNativeScroll);
      lenis.destroy();
      if (activeLenis === lenis) activeLenis = null;
    },
  };
}

/** Lấy Lenis đang chạy (nếu có) để scroll tới anchor, vd: lenis.scrollTo("#shop"). */
export function getLenis(): Lenis | null {
  return activeLenis;
}

/**
 * Chạy cập nhật (vd: đổi route) trong View Transition của trình duyệt.
 * - Trình duyệt có hỗ trợ: chuyển cảnh mượt (fade/slide theo CSS ::view-transition-*).
 * - Không hỗ trợ: chạy thẳng `update()` như bình thường — không lỗi.
 */
export function startViewTransition(update: () => void): void {
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => { ready: Promise<void> };
  };
  if (typeof doc.startViewTransition === "function") {
    doc.startViewTransition(update);
  } else {
    update();
  }
}

/** Kiểu rút gọn cho callback điều hướng của react-router. */
export type NavigateFn = (to: string, options?: { replace?: boolean }) => void;

/**
 * Bọc `navigate` của react-router để chuyển trang qua View Transition.
 * Dùng trong App: `const navigate = useNavigate(); const go = withViewTransition(navigate);`
 * Nếu reduce-motion hoặc trình duyệt không hỗ trợ: navigate thường.
 */
export function withViewTransition(navigate: NavigateFn): NavigateFn {
  return (to, options) => {
    if (prefersReducedMotion()) {
      navigate(to, options);
      return;
    }
    startViewTransition(() => navigate(to, options));
  };
}
