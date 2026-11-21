import { useState } from "react";
import {
  useCreateVoucher,
  useDeleteVoucher,
  useUpdateVoucher,
  useVouchers,
} from "../../lib/adminApi";
import { formatDateTime, formatVND } from "../../lib/format";
import { ConfirmModal } from "../../components/admin/ConfirmModal";
import { EmptyState, ErrorState, TableSkeleton } from "../../components/admin/AdminStates";
import { VoucherForm } from "../../components/admin/VoucherForm";
import type { Voucher } from "../../types";

function AdminVouchersInner() {
  const { data: vouchers, isPending, isError, error, refetch } = useVouchers();
  const createMutation = useCreateVoucher();
  const updateMutation = useUpdateVoucher();
  const deleteMutation = useDeleteVoucher();

  const [editing, setEditing] = useState<Voucher | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Voucher | null>(null);
  const [notice, setNotice] = useState("");

  const saving = createMutation.isPending || updateMutation.isPending;

  const handleSave = (voucher: Voucher) => {
    const done = () => {
      setCreating(false);
      setEditing(null);
      setNotice(editing ? "Đã lưu thay đổi mã giảm giá." : "Đã thêm mã giảm giá mới.");
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, body: voucher }, { onSuccess: done });
    } else {
      createMutation.mutate(voucher, { onSuccess: done });
    }
  };

  const toggleActive = (voucher: Voucher) => {
    updateMutation.mutate(
      { id: voucher.id, body: { active: !voucher.active } },
      { onSuccess: () => setNotice(voucher.active ? `Đã tắt mã ${voucher.code}.` : `Đã bật mã ${voucher.code}.`) },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-wide">
            Mã giảm giá {vouchers ? `(${vouchers.length})` : ""}
          </h1>
          <p className="mt-1 text-sm text-ink-mute">Mã đang áp dụng, đã tắt và đã hết hạn.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setCreating(true);
          }}
          className="rounded-full bg-volt px-5 py-2 text-sm font-bold text-ink shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-px hover:bg-volt-deep hover:shadow-[0_6px_16px_rgba(0,0,0,0.10)] active:translate-y-0 active:scale-[0.98]"
        >
          + Thêm mã giảm giá
        </button>
      </div>

      {notice ? (
        <p role="status" className="rounded-xl border border-volt-deep/50 bg-volt/40 px-3 py-2 text-sm font-medium">
          {notice}
        </p>
      ) : null}
      {(createMutation.isError || updateMutation.isError || deleteMutation.isError) ? (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {(createMutation.error as Error | null)?.message ??
            (updateMutation.error as Error | null)?.message ??
            (deleteMutation.error as Error | null)?.message ??
            "Đã có lỗi xảy ra, thử lại sau."}
        </p>
      ) : null}

      {isPending ? (
        <TableSkeleton rows={4} cols={6} />
      ) : isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : "Đã có lỗi xảy ra."}
          onRetry={() => void refetch()}
        />
      ) : (vouchers ?? []).length === 0 ? (
        <EmptyState
          title="Chưa có mã giảm giá nào"
          hint="Bấm “Thêm mã giảm giá” để tạo mã đầu tiên."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-paper text-xs font-semibold uppercase tracking-wide text-ink-mute">
                <th className="px-4 py-3">Mã</th>
                <th className="px-4 py-3">Giảm</th>
                <th className="px-4 py-3">Đơn tối thiểu</th>
                <th className="px-4 py-3">Hạn dùng</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {(vouchers ?? []).map((v) => {
                const expired = new Date(v.expiresAt).getTime() < Date.now();
                return (
                  <tr key={v.id} className="border-b border-line transition-colors last:border-0 hover:bg-paper/70">
                    <td className="px-4 py-3">
                      <span className="rounded-lg bg-paper px-2 py-1 font-bold tracking-wide">{v.code}</span>
                    </td>
                    <td className="px-4 py-3">
                      {v.type === "percent" ? `${v.value}%` : formatVND(v.value)}
                      {v.type === "percent" && v.maxDiscount ? (
                        <span className="block text-xs text-ink-mute">
                          Tối đa {formatVND(v.maxDiscount)}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">{formatVND(v.minOrder)}</td>
                    <td className="px-4 py-3">{formatDateTime(v.expiresAt)}</td>
                    <td className="px-4 py-3">
                      {!v.active ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-line px-2.5 py-1 text-xs font-semibold">
                          <span className="h-1.5 w-1.5 rounded-full bg-ink-mute" aria-hidden="true" />
                          Đã tắt
                        </span>
                      ) : expired ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-600" aria-hidden="true" />
                          Hết hạn
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-volt px-2.5 py-1 text-xs font-semibold">
                          <span className="h-1.5 w-1.5 rounded-full bg-ink" aria-hidden="true" />
                          Đang áp dụng
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditing(v)}
                          className="rounded-full border border-line px-3 py-1 text-xs font-semibold transition hover:border-ink/40 hover:bg-paper active:scale-95"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleActive(v)}
                          disabled={updateMutation.isPending}
                          className="rounded-full border border-line px-3 py-1 text-xs font-semibold transition hover:border-ink/40 hover:bg-paper active:scale-95 disabled:opacity-50"
                        >
                          {v.active ? "Tắt" : "Bật"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(v)}
                          className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-100 active:scale-95"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {creating ? (
        <VoucherForm saving={saving} onSave={handleSave} onClose={() => setCreating(false)} />
      ) : null}
      {editing ? (
        <VoucherForm
          initial={editing}
          saving={saving}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      ) : null}
      {deleting ? (
        <ConfirmModal
          title="Xóa mã giảm giá"
          message={`Xóa mã “${deleting.code}”? Khách sẽ không dùng được mã này nữa.`}
          loading={deleteMutation.isPending}
          onCancel={() => setDeleting(null)}
          onConfirm={() =>
            deleteMutation.mutate(deleting.id, {
              onSuccess: () => {
                setDeleting(null);
                setNotice("Đã xóa mã giảm giá.");
              },
            })
          }
        />
      ) : null}
    </div>
  );
}

export default function AdminVouchers() {
  return <AdminVouchersInner />;
}
