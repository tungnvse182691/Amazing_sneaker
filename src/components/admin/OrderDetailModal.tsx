import { formatDateTime, formatVND } from "../../lib/format";
import { ORDER_STATUS_LABELS } from "../../lib/adminApi";
import type { Order } from "../../types";
import { ModalShell } from "./AdminStates";

export function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <ModalShell title={`Đơn hàng ${order.code}`} onClose={onClose}>
      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-ink-mute">Khách hàng</p>
            <p className="font-semibold">{order.customerName}</p>
            <p>{order.phone}</p>
            <p className="text-ink-soft">{order.address}</p>
          </div>
          <div>
            <p className="text-ink-mute">Trạng thái</p>
            <p className="font-semibold">{ORDER_STATUS_LABELS[order.status]}</p>
            <p className="mt-2 text-ink-mute">Đặt lúc</p>
            <p>{formatDateTime(order.createdAt)}</p>
            {order.voucherCode ? (
              <p className="mt-2">
                Mã đã dùng: <span className="font-semibold">{order.voucherCode}</span>
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <p className="font-semibold">Sản phẩm</p>
          <ul className="mt-2 divide-y divide-line rounded-xl border border-line">
            {order.items.map((item, i) => (
              <li key={`${item.productId}-${i}`} className="flex items-center gap-3 px-3 py-2">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-12 w-12 rounded-lg border border-line object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.name}</p>
                  <p className="text-ink-mute">
                    Size {item.size} × {item.quantity}
                  </p>
                </div>
                <p className="font-semibold">{formatVND(item.price * item.quantity)}</p>
              </li>
            ))}
          </ul>
        </div>

        <dl className="space-y-1 rounded-xl bg-paper px-4 py-3">
          <div className="flex justify-between">
            <dt className="text-ink-mute">Tạm tính</dt>
            <dd>{formatVND(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-mute">Giảm giá</dt>
            <dd>−{formatVND(order.discount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-mute">Phí giao hàng</dt>
            <dd>{order.shippingFee === 0 ? "Miễn phí" : formatVND(order.shippingFee)}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-2 font-semibold">
            <dt>Tổng cộng</dt>
            <dd>{formatVND(order.total)}</dd>
          </div>
        </dl>
      </div>
    </ModalShell>
  );
}
