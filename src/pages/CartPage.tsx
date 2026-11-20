import { useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingBag, TicketPercent, Trash2 } from "lucide-react";
import { useCartStore } from "../stores/cart";
import { formatVND } from "../lib/format";
import { calcDiscount, calcShippingFee, findVoucher, useVouchers } from "../lib/api";

export function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = useCartStore((s) => s.totalPrice());

  const { data: vouchers } = useVouchers();
  const [code, setCode] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  const appliedVoucher = appliedCode
    ? (vouchers?.find((v) => v.code.toUpperCase() === appliedCode.toUpperCase()) ?? null)
    : null;
  const { discount, error: discountError } = calcDiscount(appliedVoucher, totalPrice);
  const shippingFee = calcShippingFee(totalPrice - discount);
  const total = totalPrice - discount + shippingFee;

  function applyVoucher() {
    const { voucher, error } = findVoucher(vouchers, code);
    if (error || !voucher) {
      setVoucherError(error ?? "Mã giảm giá không hợp lệ.");
      return;
    }
    const check = calcDiscount(voucher, totalPrice);
    if (check.error) {
      setVoucherError(check.error);
      return;
    }
    setAppliedCode(voucher.code);
    setVoucherError(null);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="font-display text-4xl uppercase tracking-wide">Giỏ hàng</h1>
      <p className="mt-1 text-ink-mute">
        {items.length === 0
          ? "Chưa có sản phẩm nào trong giỏ."
          : `${items.reduce((n, i) => n + i.quantity, 0)} sản phẩm trong giỏ`}
      </p>

      {items.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-line bg-white px-6 py-12 text-center">
          <ShoppingBag className="h-12 w-12 text-ink-mute" />
          <p className="mt-4 text-lg font-bold">Giỏ hàng đang trống</p>
          <p className="mt-1 text-ink-mute">Thêm vài đôi giày bạn thích vào giỏ rồi quay lại đây nhé.</p>
          <Link
            to="/shop"
            className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-bold text-white hover:bg-ink-soft"
          >
            Xem giày ngay
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.size}-${item.colorName}`}
                  className="flex gap-4 rounded-2xl border border-line bg-white p-4"
                >
                  <Link
                    to={`/product/${item.slug}`}
                    className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-[#EFEDE8] p-2"
                  >
                    <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link to={`/product/${item.slug}`} className="font-bold hover:underline">
                          {item.name}
                        </Link>
                        <p className="text-sm text-ink-mute">
                          {item.colorName} · Size {item.size}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Xóa ${item.name}`}
                        onClick={() => removeItem(item.productId, item.size)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center text-ink-mute hover:text-ember"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-line">
                        <button
                          type="button"
                          aria-label="Giảm số lượng"
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                          className="flex h-9 w-9 items-center justify-center hover:text-ember"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Tăng số lượng"
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                          className="flex h-9 w-9 items-center justify-center hover:text-ember"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="font-extrabold">{formatVND(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={clearCart}
              className="mt-4 text-sm font-bold text-ember underline"
            >
              Xóa toàn bộ giỏ hàng
            </button>
          </div>

          <aside className="h-fit space-y-4 rounded-2xl border border-line bg-white p-4 lg:sticky lg:top-24">
            <h2 className="font-display text-xl uppercase tracking-wide">Tóm tắt đơn hàng</h2>
            {appliedCode ? (
              <p className="flex items-center justify-between rounded-lg bg-volt/60 px-3 py-2 text-sm font-bold">
                <span className="flex items-center gap-2">
                  <TicketPercent className="h-4 w-4" /> Mã {appliedCode} (-{formatVND(discount)})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedCode(null);
                    setCode("");
                  }}
                  className="underline"
                >
                  Gỡ
                </button>
              </p>
            ) : (
              <div>
                <div className="flex gap-2">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Mã giảm giá (vd: CHAO10)"
                    aria-label="Mã giảm giá"
                    className="min-w-0 flex-1 rounded-full border border-line px-4 py-2 text-sm outline-none focus:border-ink"
                  />
                  <button
                    type="button"
                    onClick={applyVoucher}
                    className="rounded-full border border-ink px-4 py-2 text-sm font-bold hover:bg-ink hover:text-white"
                  >
                    Áp dụng
                  </button>
                </div>
                {voucherError && <p className="mt-1 text-xs font-bold text-ember">{voucherError}</p>}
                <p className="mt-2 text-xs text-ink-mute">
                  Thử mã CHAO10 (giảm 10%) hoặc FREESHIP (giảm 30.000 ₫ phí ship).
                </p>
              </div>
            )}
            {discountError && <p className="text-xs font-bold text-ember">{discountError}</p>}
            <dl className="space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-mute">Tạm tính</dt>
                <dd className="font-bold">{formatVND(totalPrice)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-ink-mute">Giảm giá</dt>
                  <dd className="font-bold text-ember">-{formatVND(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink-mute">Phí giao hàng</dt>
                <dd className="font-bold">{shippingFee === 0 ? "Miễn phí" : formatVND(shippingFee)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-base">
                <dt className="font-bold">Tổng tiền</dt>
                <dd className="font-extrabold">{formatVND(total)}</dd>
              </div>
            </dl>
            <Link
              to="/checkout"
              className="block rounded-full bg-ink px-6 py-3 text-center font-bold text-white hover:bg-ink-soft"
            >
              Tiến hành thanh toán
            </Link>
            <Link
              to="/shop"
              className="block text-center text-sm font-bold text-ink-mute hover:text-ink"
            >
              ← Tiếp tục mua sắm
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
