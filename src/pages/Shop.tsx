import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { useProducts } from "../lib/api";
import { ProductGrid, ProductGridEmpty, ProductGridSkeleton } from "../components/product/ProductGrid";
import { EMPTY_FILTERS, Filters, type ShopFilters } from "../components/product/Filters";
import type { Brand } from "../types";

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: "", label: "Mặc định" },
  { value: "sold", label: "Bán chạy nhất" },
  { value: "newest", label: "Mới nhất" },
  { value: "price-asc", label: "Giá tăng dần" },
  { value: "price-desc", label: "Giá giảm dần" },
  { value: "rating", label: "Đánh giá cao nhất" },
];

export function Shop() {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") ?? "";
  const sort = params.get("sort") ?? "";
  const brandParam = params.get("brand") as Brand | null;

  const [filters, setFilters] = useState<ShopFilters>(() => ({
    ...EMPTY_FILTERS,
    brands: brandParam ? [brandParam] : [],
  }));
  const [searchInput, setSearchInput] = useState(search);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [showFilters, setShowFilters] = useState(false);

  // Đồng bộ ô tìm kiếm khi đi từ Header sang
  useEffect(() => setSearchInput(search), [search]);
  // Đồng bộ hãng khi vào từ link ?brand=
  useEffect(() => {
    setFilters((f) => ({ ...f, brands: brandParam ? [brandParam] : [] }));
  }, [brandParam]);
  // Đổi bộ lọc/tìm kiếm/sắp xếp thì quay về trang đầu
  useEffect(() => setVisible(PAGE_SIZE), [filters, search, sort]);

  const { data: allProducts, isPending, isError, refetch } = useProducts({
    search: search || undefined,
    sort: sort || undefined,
  });

  const filtered = useMemo(() => {
    let list = allProducts ?? [];
    if (filters.brands.length > 0) list = list.filter((p) => filters.brands.includes(p.brand));
    if (filters.categories.length > 0)
      list = list.filter((p) => filters.categories.includes(p.category));
    if (filters.sizes.length > 0)
      list = list.filter((p) =>
        p.sizes.some((s) => filters.sizes.includes(s.size) && s.stock > 0),
      );
    if (filters.colorHexes.length > 0)
      list = list.filter((p) => p.colors.some((c) => filters.colorHexes.includes(c.hex)));
    const min = Number(filters.minPrice);
    const max = Number(filters.maxPrice);
    if (filters.minPrice !== "" && !Number.isNaN(min)) list = list.filter((p) => p.price >= min);
    if (filters.maxPrice !== "" && !Number.isNaN(max)) list = list.filter((p) => p.price <= max);
    return list;
  }, [allProducts, filters]);

  const shown = filtered.slice(0, visible);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams(params);
    if (searchInput.trim()) next.set("search", searchInput.trim());
    else next.delete("search");
    setParams(next);
  }

  function changeSort(value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set("sort", value);
    else next.delete("sort");
    setParams(next);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="font-display text-4xl uppercase tracking-wide">Cửa hàng</h1>
      <p className="mt-1 text-ink-mute">
        {isPending ? "Đang tải giày…" : `${filtered.length} mẫu giày`}
        {search ? ` cho “${search}”` : ""}
      </p>

      <form onSubmit={submitSearch} className="mt-6 flex gap-2">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm tên giày, hãng, dòng giày…"
            aria-label="Tìm kiếm giày"
            className="w-full rounded-full border border-line bg-white py-3 pl-9 pr-3 outline-none focus:border-ink"
          />
        </label>
        <button
          type="submit"
          className="rounded-full bg-ink px-6 py-3 text-sm font-bold text-white hover:bg-ink-soft"
        >
          Tìm
        </button>
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className="flex items-center gap-2 rounded-full border border-ink px-4 py-3 text-sm font-bold lg:hidden"
          aria-expanded={showFilters}
        >
          <SlidersHorizontal className="h-4 w-4" /> Lọc
        </button>
      </form>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <div className={`${showFilters ? "block" : "hidden"} lg:block lg:w-72 lg:shrink-0`}>
          <div className="lg:sticky lg:top-24">
            <Filters
              allProducts={allProducts ?? []}
              filters={filters}
              onChange={setFilters}
              onClear={() => setFilters(EMPTY_FILTERS)}
            />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-sm text-ink-mute">
              {filtered.length > 0 && (
                <>Đang xem {shown.length} / {filtered.length} sản phẩm</>
              )}
            </p>
            <label className="flex items-center gap-2 text-sm font-bold">
              Sắp xếp
              <select
                value={sort}
                onChange={(e) => changeSort(e.target.value)}
                aria-label="Sắp xếp sản phẩm"
                className="rounded-full border border-line bg-white px-3 py-2 text-sm font-normal outline-none focus:border-ink"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {isPending ? (
            <ProductGridSkeleton count={12} />
          ) : isError ? (
            <div className="rounded-2xl border border-line bg-white p-8 text-center">
              <p className="text-lg font-bold">Không tải được danh sách giày.</p>
              <p className="mt-1 text-ink-mute">Kiểm tra mạng rồi thử tải lại nhé.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 rounded-full bg-ink px-6 py-2 text-sm font-bold text-white hover:bg-ink-soft"
              >
                Thử lại
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <ProductGridEmpty
              onReset={() => {
                setFilters(EMPTY_FILTERS);
                setParams({});
              }}
            />
          ) : (
            <>
              <ProductGrid products={shown} />
              {visible < filtered.length && (
                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={() => setVisible((v) => v + PAGE_SIZE)}
                    className="rounded-full border-2 border-ink bg-white px-8 py-3 font-bold hover:bg-ink hover:text-white"
                  >
                    Xem thêm {Math.min(PAGE_SIZE, filtered.length - visible)} sản phẩm
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
