import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, ShoppingBag, TicketPercent } from "lucide-react";
import { useCartStore } from "../stores/cart";
import { formatVND } from "../lib/format";
import {
  calcDiscount,
  calcShippingFee,
  findVoucher,
  useCreateOrder,
  useVouchers,
  type CreateOrderPayload,
} from "../lib/api";

const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "Vui lòng nhập họ tên (ít nhất 2 ký tự)."),
  phone: z
    .string()
    .trim()
    .regex(/^0\d{9}$/, "Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0."),
  address: z.string().trim().min(10, "Vui lòng nhập địa chỉ đầy đủ (ít nhất 10 ký tự)."),
  note: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export function Checkout() {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const subtotal = useCartStore((s) => s.totalPrice());

  const { data: vouchers } = useVouchers();
  const createOrder = useCreateOrder();

  const [code, setCode] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [placedOrderCode, setPlacedOrderCode] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>({ resolver: zodResolver(checkoutSchema) });

  const appliedVoucher = appliedCode
    ? (vouchers?.find((v) => v.code.toUpperCase() === appliedCode.toUpperCase()) ?? null)
    : null;
  const { discount } = calcDiscount(appliedVoucher, subtotal);
  const shippingFee = calcShippingFee(subtotal - discount);
  const total = subtotal - discount + shippingFee;

  function applyVoucher() {
    const { voucher, error } = findVoucher(vouchers, code);
    if (error || !voucher) {
      setVoucherError(error ?? "Mã giảm giá không hợp lệ.");
      return;
    }
    const check = calcDiscount(voucher, subtotal);
    if (check.error) {
      setVoucherError(check.error);
      return;
    }
    setAppliedCode(voucher.code);
    setVoucherError(null);
  }

  function onSubmit(form: CheckoutForm) {
    const payload: CreateOrderPayload = {
      customerName: form.customerName,
      phone: form.phone,
      address: form.address,
      items: items.map((i) => ({
        productId: i.productId,
        name: i.name,
        image: i.image,
        size: i.size,
        price: i.price,
        quantity: i.quantity,
      })),
      subtotal,
      discount,
      shippingFee,
      total,
      ...(appliedCode ? { voucherCode: appliedCode } : {}),
    };
    createOrder.mutate(payload, {
      onSuccess: (order) => {
        clearCart();
        setPlacedOrderCode(order.code);
      },
    });
  }

  // Màn thành công sau khi đặt hàng
  if (placedOrderCode) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 text-center md:px-6">
        <CheckCircle2 className="mx-auto h-16 w-16 text-volt-deep" />
        <h1 className="mt-4 font-display text-4xl uppercase tracking-wide">Đặt hàng thành công!</h1>
        <p className="mt-2 text-ink-mute">
          Cảm ơn bạn đã mua sắm tại Amazing Sneaker. Chúng tôi sẽ liên hệ xác nhận đơn hàng
          trong thời gian sớm nhất.
        </p>
        <div className="mx-auto mt-6 max-w-md rounded-2xl border-2 border-dashed border-ink bg-white p-6">
          <p className="text-sm text-ink-mute">Mã đơn hàng của bạn</p>
          <p className="mt-1 font-display text-3xl tracking-wide">{placedOrderCode}</p>
          <p className="mt-1 text-sm text-ink-mute">
            Lưu lại mã này để tra cứu trạng thái đơn hàng.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to={`/track?code=${encodeURIComponent(placedOrderCode)}`}
            className="rounded-full bg-ink px-6 py-3 text-sm font-bold text-white hover:bg-ink-soft"
          >
            Tra cứu đơn hàng
          </Link>
          <Link
            to="/shop"
            className="rounded-full border border-ink px-6 py-3 text-sm font-bold hover:bg-ink hover:text-white"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 text-center md:px-6">
        <ShoppingBag className="mx-auto h-12 w-12 text-ink-mute" />
        <h1 className="mt-4 font-display text-3xl uppercase">Giỏ hàng đang trống</h1>
        <p className="mt-2 text-ink-mute">
          Bạn cần thêm giày vào giỏ trước khi thanh toán.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-bold text-white hover:bg-ink-soft"
        >
          Xem giày ngay
        </Link>
      </main>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-ink";
  const errCls = "mt-1 text-sm font-bold text-ember";

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="font-display text-4xl uppercase tracking-wide">Thanh toán</h1>
      <p className="mt-1 text-ink-mute">Điền thông tin nhận hàng để hoàn tất đơn hàng.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-2xl border border-line bg-white p-6"
          noValidate
        >
          <h2 className="font-display text-xl uppercase tracking-wide">Thông tin nhận hàng</h2>

          <div>
            <label htmlFor="customerName" className="mb-1 block text-sm font-bold">
              Họ và tên *
            </label>
            <input
              id="customerName"
              {...register("customerName")}
              placeholder="Ví dụ: Nguyễn Văn Tùng"
              className={inputCls}
            />
            {errors.customerName && <p className={errCls}>{errors.customerName.message}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-bold">
              Số điện thoại *
            </label>
            <input
              id="phone"
              {...register("phone")}
              inputMode="tel"
              placeholder="Ví dụ: 0901234567"
              className={inputCls}
            />
            {errors.phone && <p className={errCls}>{errors.phone.message}</p>}
          </div>

          <div>
            <label htmlFor="address" className="mb-1 block text-sm font-bold">
              Địa chỉ nhận hàng *
            </label>
            <textarea
              id="address"
              {...register("address")}
              rows={3}
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
              className={inputCls}
            />
            {errors.address && <p className={errCls}>{errors.address.message}</p>}
          </div>

          <div>
            <label htmlFor="note" className="mb-1 block text-sm font-bold">
              Ghi chú (không bắt buộc)
            </label>
            <textarea
              id="note"
              {...register("note")}
              rows={2}
              placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao…"
              className={inputCls}
            />
          </div>

          <div>
            <p className="mb-1 text-sm font-bold">Phương thức thanh toán</p>
            <p className="rounded-xl border border-line bg-paper px-4 py-3 text-sm">
              Thanh toán khi nhận hàng (COD) — bạn chỉ trả tiền khi nhận được giày.
            </p>
          </div>

          {createOrder.isError && (
            <p className="rounded-xl bg-ember/10 px-4 py-3 text-sm font-bold text-ember">
              {createOrder.error.message} — vui lòng thử lại.
            </p>
          )}

          <button
            type="submit"
            disabled={createOrder.isPending}
            className="w-full rounded-full bg-ink px-6 py-3 font-bold text-white hover:bg-ink-soft disabled:opacity-50"
          >
            {createOrder.isPending ? "Đang đặt hàng…" : `Đặt hàng — ${formatVND(total)}`}
          </button>
        </form>

        <aside className="h-fit space-y-4 rounded-2xl border border-line bg-white p-4 lg:sticky lg:top-24">
          <h2 className="font-display text-xl uppercase tracking-wide">
            Đơn hàng của bạn ({items.length})
          </h2>
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={`${item.productId}-${item.size}`} className="flex items-center gap-3">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[#EFEDE8] p-1">
                  <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                </span>
                <span className="min-w-0 flex-1 text-sm">
                  <span className="block truncate font-bold">{item.name}</span>
                  <span className="text-ink-mute">
                    Size {item.size} · x{item.quantity}
                  </span>
                </span>
                <span className="text-sm font-bold">{formatVND(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

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
            </div>
          )}

          <dl className="space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-mute">Tạm tính</dt>
              <dd className="font-bold">{formatVND(subtotal)}</dd>
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
        </aside>
      </div>
    </main>
  );
}
