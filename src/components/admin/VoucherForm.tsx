import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Voucher } from "../../types";
import { ModalShell } from "./AdminStates";

const voucherSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "Mã tối thiểu 3 ký tự")
      .max(20, "Mã tối đa 20 ký tự")
      .regex(/^[A-Z0-9]+$/, "Mã chỉ gồm chữ hoa và số, không dấu, không khoảng trắng"),
    type: z.enum(["percent", "fixed"]),
    value: z.number().int("Giá trị phải là số nguyên").positive("Giá trị phải lớn hơn 0"),
    minOrder: z.number().int("Đơn tối thiểu phải là số nguyên").min(0, "Đơn tối thiểu không âm"),
    maxDiscount: z.number().int().positive().optional(),
    expiresAt: z.string().min(1, "Chọn hạn dùng"),
    active: z.boolean(),
  })
  .refine((v) => v.type !== "percent" || v.value <= 100, {
    message: "Giảm theo % tối đa 100%",
    path: ["value"],
  });

type VoucherFormValues = z.infer<typeof voucherSchema>;

const inputCls =
  "w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink";

function toDateInput(iso: string): string {
  return iso.slice(0, 10);
}

export function VoucherForm({
  initial,
  saving,
  onSave,
  onClose,
}: {
  initial?: Voucher;
  saving: boolean;
  onSave: (voucher: Voucher) => void;
  onClose: () => void;
}) {
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<VoucherFormValues>({
    defaultValues: {
      code: initial?.code ?? "",
      type: initial?.type ?? "percent",
      value: initial?.value ?? 10,
      minOrder: initial?.minOrder ?? 0,
      maxDiscount: initial?.maxDiscount ?? undefined,
      expiresAt: initial ? toDateInput(initial.expiresAt) : "2026-12-31",
      active: initial?.active ?? true,
    },
  });

  const type = watch("type");

  const submit = (values: VoucherFormValues) => {
    const parsed = voucherSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof VoucherFormValues | undefined;
        if (key) setError(key, { message: issue.message });
      }
      return;
    }
    const v = parsed.data;
    onSave({
      id: initial?.id ?? `vch-${Date.now()}`,
      code: v.code,
      type: v.type,
      value: v.value,
      minOrder: v.minOrder,
      maxDiscount: v.type === "percent" ? v.maxDiscount : undefined,
      expiresAt: new Date(`${v.expiresAt}T23:59:59`).toISOString(),
      active: v.active,
    });
  };

  return (
    <ModalShell title={initial ? "Sửa mã giảm giá" : "Thêm mã giảm giá"} onClose={onClose}>
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <div>
          <label htmlFor="vf-code" className="text-sm font-semibold">
            Mã giảm giá
          </label>
          <input
            id="vf-code"
            className={inputCls}
            {...register("code", { setValueAs: (v: string) => v.toUpperCase().trim() })}
            placeholder="VD: CHAO10"
          />
          {errors.code ? <p className="mt-1 text-sm text-red-600">{errors.code.message}</p> : null}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="vf-type" className="text-sm font-semibold">
              Loại giảm
            </label>
            <select id="vf-type" className={inputCls} {...register("type")}>
              <option value="percent">Giảm theo %</option>
              <option value="fixed">Giảm tiền cố định</option>
            </select>
          </div>
          <div>
            <label htmlFor="vf-value" className="text-sm font-semibold">
              {type === "percent" ? "Phần trăm giảm (%)" : "Số tiền giảm (VNĐ)"}
            </label>
            <input
              id="vf-value"
              type="number"
              min={0}
              className={inputCls}
              {...register("value", { valueAsNumber: true })}
            />
            {errors.value ? <p className="mt-1 text-sm text-red-600">{errors.value.message}</p> : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="vf-min" className="text-sm font-semibold">
              Đơn tối thiểu (VNĐ)
            </label>
            <input
              id="vf-min"
              type="number"
              min={0}
              className={inputCls}
              {...register("minOrder", { valueAsNumber: true })}
            />
            {errors.minOrder ? (
              <p className="mt-1 text-sm text-red-600">{errors.minOrder.message}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor="vf-max" className="text-sm font-semibold">
              Giảm tối đa (VNĐ, chỉ cho loại %)
            </label>
            <input
              id="vf-max"
              type="number"
              min={0}
              disabled={type === "fixed"}
              className={`${inputCls} disabled:bg-paper disabled:text-ink-mute`}
              {...register("maxDiscount", {
                valueAsNumber: true,
                setValueAs: (v: string) => (v === "" ? undefined : Number(v)),
              })}
            />
            {errors.maxDiscount ? (
              <p className="mt-1 text-sm text-red-600">{errors.maxDiscount.message}</p>
            ) : null}
          </div>
        </div>

        <div>
          <label htmlFor="vf-exp" className="text-sm font-semibold">
            Hạn dùng
          </label>
          <input id="vf-exp" type="date" className={inputCls} {...register("expiresAt")} />
          {errors.expiresAt ? (
            <p className="mt-1 text-sm text-red-600">{errors.expiresAt.message}</p>
          ) : null}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("active")} /> Đang áp dụng
        </label>

        <div className="sticky bottom-0 -mx-6 -mb-4 flex justify-end gap-3 border-t border-line bg-white px-6 pb-4 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line px-5 py-2 text-sm font-semibold hover:bg-paper"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-volt px-5 py-2 text-sm font-semibold text-ink hover:bg-volt-deep disabled:opacity-50"
          >
            {saving ? "Đang lưu…" : initial ? "Lưu thay đổi" : "Thêm mã"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
