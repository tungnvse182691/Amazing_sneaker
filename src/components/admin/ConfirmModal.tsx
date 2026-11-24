import { useEffect, useRef } from "react";

export function ConfirmModal({
  title,
  message,
  confirmLabel = "Xóa",
  cancelLabel = "Hủy",
  loading = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  // Component chỉ render khi cần xác nhận nên mở dialog ngay khi mount.
  // <dialog> native tự xử: bấm Escape, trả focus về chỗ cũ khi đóng.
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onCancel={onCancel}
      onClick={(e) => {
        if (e.target === ref.current) onCancel();
      }}
      className="admin-fade-up w-full max-w-md rounded-2xl bg-white p-6 shadow-xl backdrop:bg-black/50"
    >
      <h2 className="font-display text-2xl uppercase tracking-wide">{title}</h2>
      <p className="mt-3 text-ink-soft">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-full border border-line px-5 py-3 text-sm font-semibold transition hover:border-ink/40 hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.98] disabled:opacity-50 md:py-2"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.98] disabled:opacity-50 md:py-2"
        >
          {loading ? "Đang xóa…" : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
