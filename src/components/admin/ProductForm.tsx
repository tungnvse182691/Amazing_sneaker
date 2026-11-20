import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { products as seedProducts } from "../../data/products";
import { slugify } from "../../lib/format";
import type { AdminProduct } from "../../lib/adminApi";
import type { Brand, Category } from "../../types";
import { ModalShell } from "./AdminStates";

const SIZES = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46];
const CATEGORIES: Category[] = ["Chạy bộ", "Bóng rổ", "Lifestyle", "Bóng đá", "Tập luyện"];
const BRANDS: Brand[] = ["nike", "adidas", "puma"];
const BRAND_LABELS: Record<Brand, string> = { nike: "Nike", adidas: "Adidas", puma: "Puma" };

/** Chỉ cho chọn ảnh thật đã có trong public/images (khớp đúng tên giày). */
const IMAGE_OPTIONS = (() => {
  const seen = new Map<string, string>();
  for (const p of seedProducts) {
    for (const c of p.colors) {
      if (!seen.has(c.image)) seen.set(c.image, `${p.name} — ${c.name}`);
    }
  }
  return [...seen.entries()].map(([image, label]) => ({ image, label }));
})();

const productSchema = z.object({
  name: z.string().trim().min(2, "Tên sản phẩm tối thiểu 2 ký tự"),
  brand: z.enum(["nike", "adidas", "puma"]),
  category: z.string().min(1, "Chọn danh mục"),
  price: z.number().int("Giá phải là số nguyên").positive("Giá phải lớn hơn 0"),
  originalPrice: z.number().int().positive().optional(),
  colorName: z.string().trim().min(1, "Nhập tên màu"),
  colorHex: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Mã màu dạng #RRGGBB, ví dụ #FFFFFF"),
  image: z.string().min(1, "Chọn ảnh sản phẩm"),
  description: z.string().trim().min(10, "Mô tả tối thiểu 10 ký tự"),
  isNew: z.boolean(),
  isHot: z.boolean(),
});

type ProductFormValues = z.infer<typeof productSchema>;

const inputCls =
  "w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink";

export function ProductForm({
  initial,
  saving,
  onSave,
  onClose,
}: {
  initial?: AdminProduct;
  saving: boolean;
  onSave: (product: AdminProduct) => void;
  onClose: () => void;
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ProductFormValues>({
    defaultValues: {
      name: initial?.name ?? "",
      brand: initial?.brand ?? "nike",
      category: initial?.category ?? "Lifestyle",
      price: initial?.price ?? 0,
      originalPrice: initial?.originalPrice ?? undefined,
      colorName: initial?.colors[0]?.name ?? "",
      colorHex: initial?.colors[0]?.hex ?? "#FFFFFF",
      image: initial?.colors[0]?.image ?? IMAGE_OPTIONS[0]?.image ?? "",
      description: initial?.description ?? "",
      isNew: initial?.isNew ?? false,
      isHot: initial?.isHot ?? false,
    },
  });

  const [stocks, setStocks] = useState<Record<number, number>>(() => {
    const map: Record<number, number> = {};
    for (const s of SIZES) {
      map[s] = initial?.sizes.find((x) => x.size === s)?.stock ?? 10;
    }
    return map;
  });
  const [formError, setFormError] = useState("");

  const totalStock = useMemo(
    () => Object.values(stocks).reduce((a, b) => a + b, 0),
    [stocks],
  );

  const submit = (values: ProductFormValues) => {
    const parsed = productSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ProductFormValues | undefined;
        if (key) setError(key, { message: issue.message });
      }
      return;
    }
    if (parsed.data.originalPrice !== undefined && parsed.data.originalPrice <= parsed.data.price) {
      setFormError("Giá gốc phải lớn hơn giá bán (hoặc để trống nếu không giảm giá).");
      return;
    }
    const v = parsed.data;
    const slug = initial?.slug ?? slugify(v.name);
    const product: AdminProduct = {
      id: initial?.id ?? slug,
      slug,
      name: v.name,
      brand: v.brand,
      category: v.category as Category,
      price: v.price,
      originalPrice: v.originalPrice,
      colors: [{ name: v.colorName, hex: v.colorHex, image: v.image }],
      sizes: SIZES.map((size) => ({ size, stock: stocks[size] ?? 0 })),
      rating: initial?.rating ?? 5,
      sold: initial?.sold ?? 0,
      isNew: v.isNew,
      isHot: v.isHot,
      description: v.description,
      hidden: initial?.hidden ?? false,
    };
    onSave(product);
  };

  return (
    <ModalShell title={initial ? "Sửa sản phẩm" : "Thêm sản phẩm mới"} onClose={onClose}>
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <div>
          <label htmlFor="pf-name" className="text-sm font-semibold">
            Tên sản phẩm
          </label>
          <input id="pf-name" className={inputCls} {...register("name")} placeholder="Nike Air Max 90" />
          {errors.name ? <p className="mt-1 text-sm text-red-600">{errors.name.message}</p> : null}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="pf-brand" className="text-sm font-semibold">
              Hãng
            </label>
            <select id="pf-brand" className={inputCls} {...register("brand")}>
              {BRANDS.map((b) => (
                <option key={b} value={b}>
                  {BRAND_LABELS[b]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="pf-category" className="text-sm font-semibold">
              Danh mục
            </label>
            <select id="pf-category" className={inputCls} {...register("category")}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="pf-price" className="text-sm font-semibold">
              Giá bán (VNĐ)
            </label>
            <input
              id="pf-price"
              type="number"
              min={0}
              className={inputCls}
              {...register("price", { valueAsNumber: true })}
            />
            {errors.price ? <p className="mt-1 text-sm text-red-600">{errors.price.message}</p> : null}
          </div>
          <div>
            <label htmlFor="pf-original" className="text-sm font-semibold">
              Giá gốc (VNĐ, để trống nếu không giảm)
            </label>
            <input
              id="pf-original"
              type="number"
              min={0}
              className={inputCls}
              {...register("originalPrice", {
                valueAsNumber: true,
                setValueAs: (v: string) => (v === "" ? undefined : Number(v)),
              })}
            />
            {errors.originalPrice ? (
              <p className="mt-1 text-sm text-red-600">{errors.originalPrice.message}</p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="pf-color" className="text-sm font-semibold">
              Tên màu
            </label>
            <input id="pf-color" className={inputCls} {...register("colorName")} placeholder="Trắng / Đen" />
            {errors.colorName ? (
              <p className="mt-1 text-sm text-red-600">{errors.colorName.message}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor="pf-hex" className="text-sm font-semibold">
              Mã màu
            </label>
            <input id="pf-hex" className={inputCls} {...register("colorHex")} placeholder="#FFFFFF" />
            {errors.colorHex ? (
              <p className="mt-1 text-sm text-red-600">{errors.colorHex.message}</p>
            ) : null}
          </div>
        </div>

        <div>
          <label htmlFor="pf-image" className="text-sm font-semibold">
            Ảnh sản phẩm (chỉ ảnh thật có sẵn)
          </label>
          <select id="pf-image" className={inputCls} {...register("image")}>
            {IMAGE_OPTIONS.map((o) => (
              <option key={o.image} value={o.image}>
                {o.label}
              </option>
            ))}
          </select>
          {errors.image ? <p className="mt-1 text-sm text-red-600">{errors.image.message}</p> : null}
          <p className="mt-1 text-xs text-ink-mute">
            Không tải ảnh mới lên — chỉ dùng ảnh thật đã khớp tên giày trong thư mục public/images.
          </p>
        </div>

        <div>
          <span className="text-sm font-semibold">Tồn kho từng size (36–46)</span>
          <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
            {SIZES.map((size) => (
              <label key={size} className="block">
                <span className="text-xs text-ink-mute">Size {size}</span>
                <input
                  type="number"
                  min={0}
                  value={stocks[size] ?? 0}
                  onChange={(e) =>
                    setStocks((prev) => ({ ...prev, [size]: Math.max(0, Number(e.target.value) || 0) }))
                  }
                  className={inputCls}
                  aria-label={`Tồn kho size ${size}`}
                />
              </label>
            ))}
          </div>
          <p className="mt-1 text-xs text-ink-mute">Tổng tồn kho: {totalStock} đôi.</p>
        </div>

        <div>
          <label htmlFor="pf-desc" className="text-sm font-semibold">
            Mô tả
          </label>
          <textarea id="pf-desc" rows={3} className={inputCls} {...register("description")} />
          {errors.description ? (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          ) : null}
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("isNew")} /> Mới về
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("isHot")} /> Bán chạy
          </label>
        </div>

        {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

        <div className="flex justify-end gap-3 pt-2">
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
            {saving ? "Đang lưu…" : initial ? "Lưu thay đổi" : "Thêm sản phẩm"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
