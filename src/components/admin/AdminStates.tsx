import { useEffect, useRef } from "react";

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white" aria-label="Đang tải">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-paper">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="sticky top-0 bg-paper px-4 py-3">
                <span className="block h-4 w-20 animate-pulse rounded bg-line" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="border-b border-line last:border-0">
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} className="px-4 py-3">
                  <span className="block h-4 w-full animate-pulse rounded bg-line/70" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-12 text-center">
      <p className="font-display text-2xl uppercase tracking-wide">{title}</p>
      {hint ? <p className="mt-2 text-ink-mute">{hint}</p> : null}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center">
      <p className="font-semibold text-red-700">Không tải được dữ liệu</p>
      <p className="mt-1 text-sm text-red-600">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:py-2"
      >
        Thử lại
      </button>
    </div>
  );
}

export function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  // Component chỉ render khi modal mở nên mở dialog ngay khi mount.
  // <dialog> native tự xử: bấm Escape, trả focus về chỗ cũ khi đóng.
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="w-full max-w-2xl rounded-2xl bg-white p-0 shadow-xl backdrop:bg-black/50"
    >
      <div className="flex max-h-[90vh] w-full flex-col rounded-2xl bg-white">
        <div className="flex shrink-0 items-start justify-between gap-4 px-6 pt-6">
          <h2 className="font-display text-2xl uppercase tracking-wide">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-sm font-semibold hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:h-auto md:w-auto md:px-3 md:py-1"
          >
            ✕
          </button>
        </div>
        <div className="mt-4 min-h-0 flex-1 overflow-y-auto px-6 pb-4">{children}</div>
      </div>
    </dialog>
  );
}
