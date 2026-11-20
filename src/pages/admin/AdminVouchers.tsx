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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl uppercase tracking-wide">
          Mã giảm giá {vouchers ? `(${vouchers.length})` : ""}
        </h1>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setCreating(true);
          }}
          className="rounded-full bg-volt px-5 py-2 text-sm font-bold text-ink hover:bg-volt-deep"
        >
          + Thêm mã giảm giá
        </button>
      </div>

      {notice ? (
        <p role="status" className="rounded-xl bg-volt/40 px-3 py-2 text-sm font-medium">
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
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-paper">
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
                  <tr key={v.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-bold">{v.code}</td>
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
                        <span className="rounded-full bg-line px-2 py-1 text-xs font-semibold">Đã tắt</span>
                      ) : expired ? (
                        <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                          Hết hạn
                        </span>
                      ) : (
                        <span className="rounded-full bg-volt px-2 py-1 text-xs font-semibold">Đang áp dụng</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditing(v)}
                          className="rounded-full border border-line px-3 py-1 text-xs font-semibold hover:bg-paper"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleActive(v)}
                          disabled={updateMutation.isPending}
                          className="rounded-full border border-line px-3 py-1 text-xs font-semibold hover:bg-paper disabled:opacity-50"
                        >
                          {v.active ? "Tắt" : "Bật"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(v)}
                          className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
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
