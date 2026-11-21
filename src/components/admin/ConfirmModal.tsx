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
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="admin-fade-up w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="font-display text-2xl uppercase tracking-wide">{title}</h2>
        <p className="mt-3 text-ink-soft">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-full border border-line px-5 py-2 text-sm font-semibold transition hover:border-ink/40 hover:bg-paper active:scale-[0.98] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Đang xóa…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
