import { useEffect, useRef, useState, type ReactNode } from "react";

/** Đếm số lên từ 0 tới đích trong ~900ms, ease-out. Tôn trọng Reduce Motion. */
function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return value;
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  countTo,
  formatValue,
  delay = 0,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: ReactNode;
  /** Số thô để đếm lên; kèm formatValue để hiển thị từng khung hình. */
  countTo?: number;
  formatValue?: (n: number) => string;
  /** Độ trễ vào (ms) để 4 thẻ hiện nối tiếp nhau. */
  delay?: number;
}) {
  const counted = useCountUp(countTo ?? 0);
  const display = countTo !== undefined && formatValue ? formatValue(counted) : value;

  return (
    <div
      className="admin-fade-up rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-ink-mute">
          <span className="h-2 w-2 rounded-[3px] bg-volt" aria-hidden="true" />
          {label}
        </p>
        {icon ? <span className="text-ink-mute">{icon}</span> : null}
      </div>
      <p className="mt-2 font-display text-3xl uppercase tracking-wide">{display}</p>
      {sub ? <p className="mt-1 text-sm text-ink-mute">{sub}</p> : null}
    </div>
  );
}
