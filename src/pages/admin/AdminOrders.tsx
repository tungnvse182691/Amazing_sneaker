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
  "rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink";

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
    <div className="space-y-4">
      <h1 className="font-display text-3xl uppercase tracking-wide">
        Đơn hàng {orders ? `(${orders.length})` : ""}
      </h1>

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
        <p role="status" className="rounded-xl bg-volt/40 px-3 py-2 text-sm font-medium">
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
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-paper">
                <th className="px-4 py-3">Mã đơn</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Ngày đặt</th>
                <th className="px-4 py-3">Tổng tiền</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-semibold">{o.code}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.customerName}</p>
                    <p className="text-xs text-ink-mute">{o.phone}</p>
                  </td>
                  <td className="px-4 py-3">{formatDateTime(o.createdAt)}</td>
                  <td className="px-4 py-3 font-semibold">{formatVND(o.total)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      disabled={updateMutation.isPending}
                      onChange={(e) => changeStatus(o, e.target.value as OrderStatus)}
                      aria-label={`Đổi trạng thái đơn ${o.code}`}
                      className={inputCls}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {ORDER_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setDetail(o)}
                        className="rounded-full border border-line px-3 py-1 text-xs font-semibold hover:bg-paper"
                      >
                        Xem chi tiết
                      </button>
                      {nextStatuses(o.status).map((s) => (
                        <button
                          key={s}
                          type="button"
                          disabled={updateMutation.isPending}
                          onClick={() => changeStatus(o, s)}
                          className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-paper hover:opacity-90 disabled:opacity-50"
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
