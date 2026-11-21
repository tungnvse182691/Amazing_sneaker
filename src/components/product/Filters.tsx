import type { Brand, Category, Product } from "../../types";
import { BRAND_LABELS } from "../../data/products";
import { formatVND } from "../../lib/format";

export interface ShopFilters {
  brands: Brand[];
  categories: Category[];
  sizes: number[];
  colorHexes: string[];
  minPrice: string;
  maxPrice: string;
}

export const EMPTY_FILTERS: ShopFilters = {
  brands: [],
  categories: [],
  sizes: [],
  colorHexes: [],
  minPrice: "",
  maxPrice: "",
};

const ALL_SIZES = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46];
const BRANDS: Brand[] = ["nike", "adidas", "puma", "vans"];
const CATEGORIES: Category[] = ["Chạy bộ", "Bóng rổ", "Lifestyle", "Bóng đá", "Tập luyện"];

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function Filters({
  allProducts,
  filters,
  onChange,
  onClear,
}: {
  allProducts: Product[];
  filters: ShopFilters;
  onChange: (f: ShopFilters) => void;
  onClear: () => void;
}) {
  const colorOptions = Array.from(
    new Map(allProducts.flatMap((p) => p.colors).map((c) => [c.hex, c])).values(),
  );
  // Chỉ hiện dòng giày còn hàng thật — tính động từ data, không hardcode.
  // Sau này thêm sản phẩm "Bóng đá"/"Tập luyện" thì mục đó tự hiện lại.
  const visibleCategories = CATEGORIES.filter(
    (c) => allProducts.some((p) => p.category === c),
  );
  const activeCount =
    filters.brands.length +
    filters.categories.length +
    filters.sizes.length +
    filters.colorHexes.length +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0);

  return (
    <aside className="space-y-6 rounded-2xl border border-line bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl uppercase tracking-wide">Bộ lọc</h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-sm font-bold text-ember underline"
          >
            Xóa hết ({activeCount})
          </button>
        )}
      </div>

      <section>
        <h3 className="mb-2 text-sm font-extrabold uppercase">Hãng</h3>
        <div className="space-y-2">
          {BRANDS.map((b) => (
            <label key={b} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.brands.includes(b)}
                onChange={() => onChange({ ...filters, brands: toggle(filters.brands, b) })}
                className="h-4 w-4 accent-[#111111]"
              />
              {BRAND_LABELS[b]}
              <span className="text-ink-mute">
                ({allProducts.filter((p) => p.brand === b).length})
              </span>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-extrabold uppercase">Dòng giày</h3>
        <div className="space-y-2">
          {visibleCategories.map((c) => (
            <label key={c} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.categories.includes(c)}
                onChange={() =>
                  onChange({ ...filters, categories: toggle(filters.categories, c) })
                }
                className="h-4 w-4 accent-[#111111]"
              />
              {c}
              <span className="text-ink-mute">
                ({allProducts.filter((p) => p.category === c).length})
              </span>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-extrabold uppercase">Size (36 – 46)</h3>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((s) => {
            const active = filters.sizes.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => onChange({ ...filters, sizes: toggle(filters.sizes, s) })}
                aria-pressed={active}
                className={`h-10 w-10 rounded-lg border text-sm font-bold ${
                  active ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-extrabold uppercase">Màu sắc</h3>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((c) => {
            const active = filters.colorHexes.includes(c.hex);
            return (
              <button
                key={c.hex}
                type="button"
                title={c.name}
                aria-label={`Màu ${c.name}`}
                aria-pressed={active}
                onClick={() =>
                  onChange({ ...filters, colorHexes: toggle(filters.colorHexes, c.hex) })
                }
                className={`h-9 w-9 rounded-full border-2 ${
                  active ? "border-ember ring-2 ring-ember/30" : "border-line"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            );
          })}
        </div>
        <p className="mt-2 text-xs text-ink-mute">
          {filters.colorHexes.length > 0
            ? `Đang chọn ${filters.colorHexes.length} màu`
            : "Chạm vào ô màu để lọc theo màu chủ đạo."}
        </p>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-extrabold uppercase">Khoảng giá</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Từ"
            aria-label="Giá tối thiểu"
            value={filters.minPrice}
            onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
            className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-ink"
          />
          <span className="text-ink-mute">–</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Đến"
            aria-label="Giá tối đa"
            value={filters.maxPrice}
            onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
            className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </div>
        <p className="mt-2 text-xs text-ink-mute">
          Giá giày từ {formatVND(1_990_000)} đến {formatVND(4_590_000)}.
        </p>
      </section>
    </aside>
  );
}
