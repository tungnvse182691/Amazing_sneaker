import { PackageSearch } from "lucide-react";
import type { Product } from "../../types";
import { ProductCard } from "./ProductCard";

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="aspect-square animate-pulse bg-line" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-line" />
        <div className="h-4 w-full animate-pulse rounded bg-line" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-line" />
        <div className="h-9 w-full animate-pulse rounded-full bg-line" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductGridEmpty({
  title = "Không tìm thấy giày nào",
  hint = "Thử đổi từ khóa hoặc bỏ bớt bộ lọc để xem thêm sản phẩm.",
  onReset,
}: {
  title?: string;
  hint?: string;
  onReset?: () => void;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-white px-6 py-12 text-center">
      <PackageSearch className="h-12 w-12 text-ink-mute" />
      <p className="mt-4 text-lg font-bold">{title}</p>
      <p className="mt-1 max-w-md text-ink-mute">{hint}</p>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-4 rounded-full bg-ink px-6 py-2 text-sm font-bold text-white hover:bg-ink-soft"
        >
          Xóa bộ lọc
        </button>
      )}
    </div>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
