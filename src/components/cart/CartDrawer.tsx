import { useState } from "react";
import { Link } from "react-router-dom";
import { create } from "zustand";
import { Minus, Plus, ShoppingBag, TicketPercent, Trash2, X } from "lucide-react";
import { useCartStore } from "../../stores/cart";
import { formatVND } from "../../lib/format";
import { calcDiscount, findVoucher, useVouchers } from "../../lib/api";

interface CartDrawerState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useCartDrawerOpen = create<CartDrawerState>()((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

export function CartDrawer() {
  const isOpen = useCartDrawerOpen((s) => s.isOpen);
  const close = useCartDrawerOpen((s) => s.close);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const totalItems = useCartStore((s) => s.totalItems());

  const { data: vouchers } = useVouchers();
  const [code, setCode] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  const appliedVoucher = appliedCode
    ? (vouchers?.find((v) => v.code.toUpperCase() === appliedCode.toUpperCase()) ?? null)
    : null;
  const { discount } = calcDiscount(appliedVoucher, totalPrice);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-label="Giỏ hàng">
      <button
        type="button"
        aria-label="Đóng giỏ hàng"
        onClick={close}
        className="absolute inset-0 cursor-default bg-ink/50"
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-paper shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-4 py-4">
          <h2 className="font-display text-xl uppercase tracking-wide">
            Giỏ hàng ({totalItems})
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Đóng"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line hover:border-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <ShoppingBag className="h-12 w-12 text-ink-mute" />
            <p className="mt-4 text-lg font-bold">Giỏ hàng đang trống</p>
            <p className="mt-1 text-sm text-ink-mute">
              Thêm vài đôi giày bạn thích vào giỏ rồi quay lại đây nhé.
            </p>
            <Link
              to="/shop"
              onClick={close}
              className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-bold text-white hover:bg-ink-soft"
            >
              Xem giày ngay
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.size}-${item.colorName}`}
                  className="flex gap-3 rounded-2xl border border-line bg-white p-3"
                >
                  <Link
                    to={`/product/${item.slug}`}
                    onClick={close}
                    className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[#EFEDE8] p-1"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/product/${item.slug}`}
                      onClick={close}
                      className="block truncate text-sm font-bold hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-ink-mute">
                      {item.colorName} · Size {item.size}
                    </p>
                    <p className="mt-1 text-sm font-extrabold">{formatVND(item.price)}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-line">
                        <button
                          type="button"
                          aria-label="Giảm số lượng"
                          onClick={() =>
                            updateQuantity(item.productId, item.size, item.quantity - 1)
                          }
                          className="flex h-8 w-8 items-center justify-center hover:text-ember"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Tăng số lượng"
                          onClick={() =>
                            updateQuantity(item.productId, item.size, item.quantity + 1)
                          }
                          className="flex h-8 w-8 items-center justify-center hover:text-ember"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        aria-label={`Xóa ${item.name}`}
                        onClick={() => removeItem(item.productId, item.size)}
                        className="flex h-8 w-8 items-center justify-center text-ink-mute hover:text-ember"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="space-y-3 border-t border-line bg-white px-4 py-4">
              {appliedCode ? (
                <p className="flex items-center justify-between rounded-lg bg-volt/60 px-3 py-2 text-sm font-bold">
                  <span className="flex items-center gap-2">
                    <TicketPercent className="h-4 w-4" /> Đã áp mã {appliedCode} (-
                    {formatVND(discount)})
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
                      placeholder="Nhập mã giảm giá (vd: CHAO10)"
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
                  {voucherError && (
                    <p className="mt-1 text-xs font-bold text-ember">{voucherError}</p>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-mute">Tạm tính</span>
                <span className="font-bold">{formatVND(totalPrice)}</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-mute">Giảm giá</span>
                  <span className="font-bold text-ember">-{formatVND(discount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="font-bold">Tổng tiền</span>
                <span className="text-lg font-extrabold">
                  {formatVND(totalPrice - discount)}
                </span>
              </div>
              <div className="flex gap-2">
                <Link
                  to="/cart"
                  onClick={close}
                  className="flex-1 rounded-full border border-ink px-4 py-3 text-center text-sm font-bold hover:bg-ink hover:text-white"
                >
                  Xem giỏ hàng
                </Link>
                <Link
                  to="/checkout"
                  onClick={close}
                  className="flex-1 rounded-full bg-ink px-4 py-3 text-center text-sm font-bold text-white hover:bg-ink-soft"
                >
                  Thanh toán
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
