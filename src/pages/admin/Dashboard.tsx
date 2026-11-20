import { Link } from "react-router-dom";
import { ORDER_STATUS_LABELS, useAdminProducts, useOrders } from "../../lib/adminApi";
import { formatCount, formatVND } from "../../lib/format";
import { StatCard } from "../../components/admin/StatCard";
import { EmptyState, ErrorState, TableSkeleton } from "../../components/admin/AdminStates";

function DashboardInner() {
  const productsQuery = useAdminProducts();
  const ordersQuery = useOrders();

  if (productsQuery.isPending || ordersQuery.isPending) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl uppercase tracking-wide">Tổng quan</h1>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-line/60" />
          ))}
        </div>
        <TableSkeleton rows={4} cols={3} />
      </div>
    );
  }

  if (productsQuery.isError || ordersQuery.isError) {
    const message =
      (productsQuery.error as Error | undefined)?.message ??
      (ordersQuery.error as Error | undefined)?.message ??
      "Đã có lỗi xảy ra.";
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl uppercase tracking-wide">Tổng quan</h1>
        <ErrorState
          message={message}
          onRetry={() => {
            void productsQuery.refetch();
            void ordersQuery.refetch();
          }}
        />
      </div>
    );
  }

  const products = productsQuery.data;
  const orders = ordersQuery.data;
  const validOrders = orders.filter((o) => o.status !== "da_huy");
  const revenue = validOrders.reduce((sum, o) => sum + o.total, 0);
  const totalStock = products.reduce(
    (sum, p) => sum + p.sizes.reduce((s, x) => s + x.stock, 0),
    0,
  );
  const lowStock = products.filter((p) => p.sizes.some((s) => s.stock > 0 && s.stock <= 5));
  const outOfStock = products.filter((p) => p.sizes.every((s) => s.stock === 0));

  const ordersByStatus = (
    Object.keys(ORDER_STATUS_LABELS) as (keyof typeof ORDER_STATUS_LABELS)[]
  ).map((status) => ({
    status,
    count: orders.filter((o) => o.status === status).length,
  }));
  const maxStatusCount = Math.max(1, ...ordersByStatus.map((x) => x.count));

  const topSellers = [...products].sort((a, b) => b.sold - a.sold).slice(0, 5);
  const maxSold = Math.max(1, ...topSellers.map((p) => p.sold));

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl uppercase tracking-wide">Tổng quan</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Tổng doanh thu" value={formatVND(revenue)} sub={`${validOrders.length} đơn đã tính (trừ đơn hủy)`} />
        <StatCard label="Tổng đơn hàng" value={formatCount(orders.length)} sub={`${orders.filter((o) => o.status === "cho_xac_nhan").length} đơn chờ xác nhận`} />
        <StatCard label="Tổng sản phẩm" value={formatCount(products.length)} sub={`${formatCount(totalStock)} đôi đang tồn kho`} />
        <StatCard
          label="Tồn kho thấp"
          value={formatCount(lowStock.length)}
          sub={outOfStock.length > 0 ? `${outOfStock.length} sản phẩm đã hết hàng` : "Chưa có sản phẩm hết hàng"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-white p-4">
          <h2 className="font-display text-xl uppercase tracking-wide">Đơn hàng theo trạng thái</h2>
          {orders.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="Chưa có đơn hàng nào" hint="Đơn khách đặt sẽ hiện ở đây." />
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {ordersByStatus.map(({ status, count }) => (
                <li key={status}>
                  <div className="flex justify-between text-sm">
                    <span>{ORDER_STATUS_LABELS[status]}</span>
                    <span className="font-semibold">{count} đơn</span>
                  </div>
                  <div className="mt-1 h-3 overflow-hidden rounded-full bg-paper">
                    <div
                      className="h-full rounded-full bg-volt"
                      style={{ width: `${(count / maxStatusCount) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link to="/admin/orders" className="mt-4 inline-block text-sm font-semibold text-ink-mute hover:text-ink">
            Xem tất cả đơn hàng →
          </Link>
        </section>

        <section className="rounded-2xl border border-line bg-white p-4">
          <h2 className="font-display text-xl uppercase tracking-wide">Bán chạy nhất</h2>
          <ul className="mt-4 space-y-3">
            {topSellers.map((p) => (
              <li key={p.id}>
                <div className="flex justify-between gap-2 text-sm">
                  <span className="truncate">{p.name}</span>
                  <span className="shrink-0 font-semibold">{formatCount(p.sold)} đôi</span>
                </div>
                <div className="mt-1 h-3 overflow-hidden rounded-full bg-paper">
                  <div
                    className="h-full rounded-full bg-ink"
                    style={{ width: `${(p.sold / maxSold) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <Link to="/admin/products" className="mt-4 inline-block text-sm font-semibold text-ink-mute hover:text-ink">
            Quản lý sản phẩm →
          </Link>
        </section>
      </div>

      <section className="rounded-2xl border border-line bg-white p-4">
        <h2 className="font-display text-xl uppercase tracking-wide">
          Sản phẩm tồn kho thấp (có size chỉ còn 1–5 đôi)
        </h2>
        {lowStock.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="Không có sản phẩm tồn kho thấp" hint="Mọi size đều còn trên 5 đôi." />
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {lowStock.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <span className="font-medium">{p.name}</span>
                <span className="text-ink-mute">
                  {p.sizes
                    .filter((s) => s.stock > 0 && s.stock <= 5)
                    .map((s) => `Size ${s.size}: còn ${s.stock}`)
                    .join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function Dashboard() {
  return <DashboardInner />;
}
