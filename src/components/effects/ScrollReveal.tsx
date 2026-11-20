import { useEffect, useRef, type ReactNode } from "react";
import { gsap, registerGsap, prefersReducedMotion } from "../../lib/motion";

/**
 * ScrollReveal — hiện dần section khi cuộn tới, bằng GSAP ScrollTrigger.
 * - Chỉ animate `transform` (translateY / scale) + `opacity` — không đụng layout.
 * - Duration ngắn (0.5s), trigger một lần (once) để không chạy lại gây khó chịu.
 * - Không hijack scroll: chỉ là hiệu ứng khi phần tử vào viewport.
 * - prefers-reduced-motion: hiện tĩnh ngay, không tạo ScrollTrigger.
 *
 * Props:
 * - `variant`: "up" (trượt lên 24px, mặc định) | "fade" (chỉ mờ dần) | "zoom" (scale 0.96 → 1).
 * - `delay`: giây chờ thêm (mặc định 0).
 * - `className`: class Tailwind cho wrapper.
 * - `as`: thẻ bao ngoài, mặc định "div".
 *
 * Đặt ở: bọc từng section trên Home / Shop / ProductDetail
 * (vd: <ScrollReveal><ProductGrid ... /></ScrollReveal>).
 * Với danh sách dài, bọc từng card với delay = index * 0.05 (tối đa ~0.3s).
 */
interface ScrollRevealProps {
  children: ReactNode;
  variant?: "up" | "fade" | "zoom";
  delay?: number;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}

export default function ScrollReveal({
  children,
  variant = "up",
  delay = 0,
  className,
  as = "div",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return; // hiện tĩnh, không animation

    registerGsap();
    const fromVars =
      variant === "fade"
        ? { opacity: 0 }
        : variant === "zoom"
          ? { opacity: 0, scale: 0.96 }
          : { opacity: 0, y: 24 };

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        fromVars,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          delay,
          ease: "power2.out",
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [variant, delay]);

  const Tag = as as "div";
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
