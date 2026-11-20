/**
 * Marquee — dải chữ thương hiệu chạy vô hạn bằng CSS animation thuần.
 * KHÔNG dùng JS để chạy chữ (rẻ, mượt, không lag mobile).
 * Khi prefers-reduced-motion: đứng yên (xử lý trong index.css).
 *
 * Props:
 * - `items`: mặc định ["Nike", "Adidas", "Puma"] + slogan.
 * - `speed`: giây cho 1 vòng (mặc định 22s). Số càng lớn chạy càng chậm.
 * - `className`: ghi đè nền/chữ, vd nền đen chữ volt.
 *
 * Đặt ở: giữa Hero và lưới sản phẩm trên Home, hoặc trên footer.
 * A11y: bản sao lặp lại có aria-hidden, screen reader chỉ đọc 1 lần.
 */
interface MarqueeProps {
  items?: string[];
  speed?: number;
  className?: string;
}

const DEFAULT_ITEMS = [
  "Nike",
  "Just Do It",
  "Adidas",
  "Impossible Is Nothing",
  "Puma",
  "Forever Faster",
];

export default function Marquee({ items = DEFAULT_ITEMS, speed = 22, className = "" }: MarqueeProps) {
  // Nhân 4 lần để dải đủ dài che mọi màn hình, animation translateX(-50%)
  // vẫn liền mạch (2 nửa giống hệt nhau).
  const row = [...items, ...items, ...items, ...items];

  return (
    <div
      role="presentation"
      aria-label="Các thương hiệu: Nike, Adidas, Puma"
      className={`overflow-hidden bg-ink py-3 select-none ${className}`}
    >
      <div
        className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap"
        style={{ animationDuration: `${speed}s` }}
      >
        {[0, 1].map((half) => (
          <div key={half} aria-hidden={half === 1} className="flex items-center gap-8">
            {row.map((item, i) => (
              <span key={`${half}-${i}`} className="flex items-center gap-8">
                <span className="font-display text-xl tracking-wide text-paper uppercase md:text-2xl">{item}</span>
                <span aria-hidden="true" className="text-volt">
                  ✦
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
