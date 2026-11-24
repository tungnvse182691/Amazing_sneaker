import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, PackageSearch, Search } from "lucide-react";
import { ORDER_STATUS_LABEL, ORDER_STATUS_STEPS, useTrackOrder } from "../lib/api";
import { formatDateTime, formatVND } from "../lib/format";
import type { Order } from "../types";

function OrderTimeline({ order }: { order: Order }) {
  if (order.status === "da_huy") {
    return (
      <p className="rounded-xl bg-ember/10 px-4 py-3 font-bold text-ember">
        Đơn hàng này đã bị hủy.
      </p>
    );
  }
  const currentIndex = ORDER_STATUS_STEPS.indexOf(order.status);
  return (
    <ol className="space-y-0">
      {ORDER_STATUS_STEPS.map((step, i) => {
        const done = i <= currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <li key={step} className="relative flex gap-3 pb-6 last:pb-0">
            {i < ORDER_STATUS_STEPS.length - 1 && (
              <span
                className={`absolute left-[11px] top-6 h-full w-0.5 ${done ? "bg-volt-deep" : "bg-line"}`}
                aria-hidden="true"
              />
            )}
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                done ? "border-volt-deep bg-volt-deep text-ink" : "border-line bg-white text-ink-mute"
              }`}
            >
              {done && <Check className="h-4 w-4" />}
            </span>
            <div>
              <p className={`font-bold ${isCurrent ? "text-ink" : done ? "text-ink" : "text-ink-mute"}`}>
                {ORDER_STATUS_LABEL[step]}
                {isCurrent && (
                  <span className="ml-2 rounded-full bg-volt px-2 py-0.5 text-xs font-extrabold uppercase">
                    Hiện tại
                  </span>
                )}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function TrackOrder() {
  const [params, setParams] = useSearchParams();
  const codeParam = params.get("code") ?? "";
  const [input, setInput] = useState(codeParam);
  const [code, setCode] = useState<string | null>(codeParam || null);

  // Đồng bộ khi mở link /track?code=AS-... từ màn đặt hàng thành công
  useEffect(() => {
    setInput(codeParam);
    setCode(codeParam || null);
  }, [codeParam]);

  const { data: order, isPending, isError, error, refetch } = useTrackOrder(code);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim().toUpperCase();
    if (!trimmed) return;
    setParams({ code: trimmed });
    setCode(trimmed);
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 md:px-6">
      <h1 className="font-display text-4xl uppercase tracking-wide">Tra cứu đơn hàng</h1>
      <p className="mt-1 text-ink-mute">
        Nhập mã đơn hàng để xem trạng thái giao hàng. Thử mã mẫu:{" "}
        <button
          type="button"
          onClick={() => {
            setInput("AS-20261120-001");
            setCode("AS-20261120-001");
            setParams({ code: "AS-20261120-001" });
          }}
          className="font-bold text-ember underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          AS-20261120-001
        </button>
      </p>

      <form onSubmit={submit} className="mt-6 flex gap-2">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            placeholder="Ví dụ: AS-20261120-001"
            aria-label="Mã đơn hàng"
            className="w-full rounded-full border border-line bg-white py-3 pl-9 pr-3 uppercase focus:border-ink"
          />
        </label>
        <button
          type="submit"
          className="rounded-full bg-ink px-6 py-3 text-sm font-bold text-white hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          Tra cứu
        </button>
      </form>

      {code && (
        <div className="mt-8">
          {isPending ? (
            <div className="space-y-3 rounded-2xl border border-line bg-white p-6">
              <div className="h-6 w-1/2 animate-pulse rounded bg-line" />
              <div className="h-4 w-full animate-pulse rounded bg-line" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-line" />
              <p className="text-sm text-ink-mute">Đang tra cứu đơn {code}…</p>
            </div>
          ) : isError || !order ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-white px-6 py-12 text-center">
              <PackageSearch className="h-12 w-12 text-ink-mute" />
              <p className="mt-4 text-lg font-bold">Không tìm thấy đơn hàng {code}</p>
              <p className="mt-1 text-ink-mute">
                {error?.message ?? "Kiểm tra lại mã đơn rồi thử lại nhé."}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 rounded-full bg-ink px-6 py-3 text-sm font-bold text-white hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:py-2"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <div className="space-y-6 rounded-2xl border border-line bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm text-ink-mute">Mã đơn hàng</p>
                  <p className="font-display text-2xl tracking-wide">{order.code}</p>
                  <p className="text-sm text-ink-mute">
                    Đặt ngày {formatDateTime(order.createdAt)}
                  </p>
                </div>
                <span className="rounded-full bg-volt px-3 py-1 text-sm font-extrabold">
                  {ORDER_STATUS_LABEL[order.status]}
                </span>
              </div>

              <OrderTimeline order={order} />

              <div>
                <h2 className="mb-3 font-bold">Sản phẩm trong đơn</h2>
                <ul className="space-y-3">
                  {order.items.map((item, i) => (
                    <li key={`${item.productId}-${i}`} className="flex items-center gap-3">
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[#EFEDE8] p-1">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            const img = e.currentTarget;
                            if (img.src.endsWith(".jpg")) {
                              img.src = img.src.replace(/\.jpg$/, ".png");
                            }
                          }}
                        />
                      </span>
                      <span className="min-w-0 flex-1 text-sm">
                        <span className="block truncate font-bold">{item.name}</span>
                        <span className="text-ink-mute">
                          Size {item.size} · x{item.quantity}
                        </span>
                      </span>
                      <span className="text-sm font-bold">
                        {formatVND(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <dl className="space-y-2 border-t border-line pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-mute">Người nhận</dt>
                  <dd className="font-bold">{order.customerName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-mute">Điện thoại</dt>
                  <dd className="font-bold">{order.phone}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="shrink-0 text-ink-mute">Địa chỉ</dt>
                  <dd className="text-right font-bold">{order.address}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-mute">Tạm tính</dt>
                  <dd className="font-bold">{formatVND(order.subtotal)}</dd>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-ink-mute">Giảm giá</dt>
                    <dd className="font-bold text-ember">-{formatVND(order.discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-ink-mute">Phí giao hàng</dt>
                  <dd className="font-bold">
                    {order.shippingFee === 0 ? "Miễn phí" : formatVND(order.shippingFee)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-line pt-2 text-base">
                  <dt className="font-bold">Tổng tiền</dt>
                  <dd className="font-extrabold">{formatVND(order.total)}</dd>
                </div>
              </dl>

              <Link
                to="/shop"
                className="block rounded-full bg-ink px-6 py-3 text-center text-sm font-bold text-white hover:bg-ink-soft"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
