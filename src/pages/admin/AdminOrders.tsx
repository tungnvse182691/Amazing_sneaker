import { useMemo, useState } from "react";
import {
  nextStatuses,
  ORDER_STATUS_LABELS,
  ORDER_STATUSES,
  useOrders,
  useUpdateOrderStatus,
} from "../../lib/adminApi";
import { formatDateTime, formatVND } from "../../lib/format";
import { EmptyState, ErrorState, TableSkeleton } from "../../components/admin/AdminStates";
import { OrderDetailModal } from "../../components/admin/OrderDetailModal";
import type { Order, OrderStatus } from "../../types";

const inputCls =
  "rounded-xl border border-line bg-white px-3 py-2 text-sm transition focus:border-ink focus:ring-2 focus:ring-volt/60";

/** Màu của ô trạng thái đơn, theo từng trạng thái (chấm màu + nền nhạt cùng tông). */
const ORDER_STATUS_PILL: Record<OrderStatus, string> = {
  cho_xac_nhan: "border-amber-200 bg-amber-100 text-amber-900",
  dang_chuan_bi: "border-sky-200 bg-sky-100 text-sky-900",
  dang_giao: "border-volt-deep/60 bg-volt text-ink",
  da_giao: "border-emerald-200 bg-emerald-100 text-emerald-900",
  da_huy: "border-red-200 bg-red-100 text-red-800",
};

const ORDER_STATUS_DOT: Record<OrderStatus, string> = {
  cho_xac_nhan: "bg-amber-600",
  dang_chuan_bi: "bg-sky-600",
  dang_giao: "bg-ink",
  da_giao: "bg-emerald-600",
  da_huy: "bg-red-600",
};

function AdminOrdersInner() {
  const { data: orders, isPending, isError, error, refetch } = useOrders();
  const updateMutation = useUpdateOrderStatus();
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<Order | null>(null);
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (orders ?? []).filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (!q) return true;
      return (
        o.code.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phone.includes(q)
      );
    });
  }, [orders, statusFilter, search]);

  const changeStatus = (order: Order, status: OrderStatus) => {
    updateMutation.mutate(
      { id: order.id, status },
      { onSuccess: () => setNotice(`Đơn ${order.code} đã chuyển sang “${ORDER_STATUS_LABELS[status]}”.`) },
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl uppercase tracking-wide">
          Đơn hàng {orders ? `(${orders.length})` : ""}
        </h1>
        <p className="mt-1 text-sm text-ink-mute">Theo dõi và chuyển trạng thái từng đơn hàng.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm mã đơn, tên khách, số điện thoại…"
          aria-label="Tìm đơn hàng"
          className={`${inputCls} min-w-56 flex-1`}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | OrderStatus)}
          aria-label="Lọc theo trạng thái"
          className={inputCls}
        >
          <option value="all">Tất cả trạng thái</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {notice ? (
        <p role="status" className="rounded-xl border border-volt-deep/50 bg-volt/40 px-3 py-2 text-sm font-medium">
          {notice}
        </p>
      ) : null}
      {updateMutation.isError ? (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {(updateMutation.error as Error).message}
        </p>
      ) : null}

      {isPending ? (
        <TableSkeleton rows={5} cols={6} />
      ) : isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : "Đã có lỗi xảy ra."}
          onRetry={() => void refetch()}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Không tìm thấy đơn hàng"
          hint="Thử đổi từ khóa hoặc bỏ lọc trạng thái."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-paper text-xs font-semibold uppercase tracking-wide text-ink-mute">
                <th className="sticky top-0 bg-paper px-4 py-3">Mã đơn</th>
                <th className="sticky top-0 bg-paper px-4 py-3">Khách hàng</th>
                <th className="sticky top-0 bg-paper px-4 py-3">Ngày đặt</th>
                <th className="sticky top-0 bg-paper px-4 py-3">Tổng tiền</th>
                <th className="sticky top-0 bg-paper px-4 py-3">Trạng thái</th>
                <th className="sticky top-0 bg-paper px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-line transition-colors last:border-0 hover:bg-paper/70">
                  <td className="px-4 py-3 font-semibold">{o.code}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.customerName}</p>
                    <p className="text-xs text-ink-mute">{o.phone}</p>
                  </td>
                  <td className="px-4 py-3">{formatDateTime(o.createdAt)}</td>
                  <td className="px-4 py-3 font-semibold">{formatVND(o.total)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-2 rounded-xl border px-2 py-1 ${ORDER_STATUS_PILL[o.status]}`}
                    >
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${ORDER_STATUS_DOT[o.status]}`}
                        aria-hidden="true"
                      />
                      <select
                        value={o.status}
                        disabled={updateMutation.isPending}
                        onChange={(e) => changeStatus(o, e.target.value as OrderStatus)}
                        aria-label={`Đổi trạng thái đơn ${o.code}`}
                        className="cursor-pointer bg-transparent py-1 pr-1 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-50"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {ORDER_STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setDetail(o)}
                        className="rounded-full border border-line px-3 py-1 text-xs font-semibold transition hover:border-ink/40 hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-95"
                      >
                        Xem chi tiết
                      </button>
                      {nextStatuses(o.status).map((s) => (
                        <button
                          key={s}
                          type="button"
                          disabled={updateMutation.isPending}
                          onClick={() => changeStatus(o, s)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold text-paper transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-95 disabled:opacity-50 ${
                            s === "da_huy" ? "bg-red-600 hover:bg-red-700" : "bg-ink hover:bg-ink-soft"
                          }`}
                        >
                          {s === "da_huy" ? "Hủy đơn" : `→ ${ORDER_STATUS_LABELS[s]}`}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail ? <OrderDetailModal order={detail} onClose={() => setDetail(null)} /> : null}
    </div>
  );
}

export default function AdminOrders() {
  return <AdminOrdersInner />;
}
