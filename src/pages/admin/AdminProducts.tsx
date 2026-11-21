import { useMemo, useState } from "react";
import {
  useAdminProducts,
  useCreateProduct,
  useDeleteProduct,
  useUpdateProduct,
  type AdminProduct,
} from "../../lib/adminApi";
import { BRAND_LABELS } from "../../data/products";
import { formatCount, formatVND } from "../../lib/format";
import { ConfirmModal } from "../../components/admin/ConfirmModal";
import { EmptyState, ErrorState, TableSkeleton } from "../../components/admin/AdminStates";
import { ProductForm } from "../../components/admin/ProductForm";
import type { Brand } from "../../types";

const inputCls =
  "rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-volt/60";

function AdminProductsInner() {
  const { data: products, isPending, isError, error, refetch } = useAdminProducts();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState<"all" | Brand>("all");
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<AdminProduct | null>(null);
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (products ?? []).filter((p) => {
      if (brandFilter !== "all" && p.brand !== brandFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
      );
    });
  }, [products, search, brandFilter]);

  const saving = createMutation.isPending || updateMutation.isPending;

  const handleSave = (product: AdminProduct) => {
    const done = () => {
      setCreating(false);
      setEditing(null);
      setNotice(editing ? "Đã lưu thay đổi sản phẩm." : "Đã thêm sản phẩm mới.");
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, body: product }, { onSuccess: done });
    } else {
      createMutation.mutate(product, { onSuccess: done });
    }
  };

  const toggleHidden = (product: AdminProduct) => {
    updateMutation.mutate(
      { id: product.id, body: { hidden: !product.hidden } },
      { onSuccess: () => setNotice(product.hidden ? "Đã hiện lại sản phẩm." : "Đã ẩn sản phẩm.") },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-wide">
            Sản phẩm {products ? `(${formatCount(products.length)})` : ""}
          </h1>
          <p className="mt-1 text-sm text-ink-mute">Giá, tồn kho và trạng thái bán của từng sản phẩm.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setCreating(true);
          }}
          className="rounded-full bg-volt px-5 py-2 text-sm font-bold text-ink shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-px hover:bg-volt-deep hover:shadow-[0_6px_16px_rgba(0,0,0,0.10)] active:translate-y-0 active:scale-[0.98]"
        >
          + Thêm sản phẩm
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên, danh mục…"
          aria-label="Tìm sản phẩm"
          className={`${inputCls} min-w-56 flex-1`}
        />
        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value as "all" | Brand)}
          aria-label="Lọc theo hãng"
          className={inputCls}
        >
          <option value="all">Tất cả hãng</option>
          <option value="nike">Nike</option>
          <option value="adidas">Adidas</option>
          <option value="puma">Puma</option>
          <option value="vans">Vans</option>
        </select>
      </div>

      {notice ? (
        <p role="status" className="rounded-xl border border-volt-deep/50 bg-volt/40 px-3 py-2 text-sm font-medium">
          {notice}
        </p>
      ) : null}
      {(createMutation.isError || updateMutation.isError || deleteMutation.isError) ? (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {(createMutation.error as Error | null)?.message ??
            (updateMutation.error as Error | null)?.message ??
            (deleteMutation.error as Error | null)?.message ??
            "Đã có lỗi xảy ra, thử lại sau."}
        </p>
      ) : null}

      {isPending ? (
        <TableSkeleton rows={6} cols={6} />
      ) : isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : "Đã có lỗi xảy ra."}
          onRetry={() => void refetch()}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Không tìm thấy sản phẩm"
          hint={search || brandFilter !== "all" ? "Thử đổi từ khóa hoặc bỏ lọc hãng." : "Bấm “Thêm sản phẩm” để tạo sản phẩm đầu tiên."}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-paper text-xs font-semibold uppercase tracking-wide text-ink-mute">
                <th className="px-4 py-3">Sản phẩm</th>
                <th className="px-4 py-3">Hãng</th>
                <th className="px-4 py-3">Giá</th>
                <th className="px-4 py-3">Tồn kho</th>
                <th className="px-4 py-3">Đã bán</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const stock = p.sizes.reduce((s, x) => s + x.stock, 0);
                return (
                  <tr key={p.id} className="border-b border-line transition-colors last:border-0 hover:bg-paper/70">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.colors[0]?.image}
                          alt={p.name}
                          className="h-12 w-12 rounded-lg border border-line object-cover shadow-sm"
                        />
                        <div>
                          <p className="font-semibold">{p.name}</p>
                          <p className="text-xs text-ink-mute">{p.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{BRAND_LABELS[p.brand] ?? p.brand}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold">{formatVND(p.price)}</span>
                      {p.originalPrice ? (
                        <span className="ml-2 text-xs text-ink-mute line-through">
                          {formatVND(p.originalPrice)}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">{formatCount(stock)} đôi</td>
                    <td className="px-4 py-3">{formatCount(p.sold)}</td>
                    <td className="px-4 py-3">
                      {p.hidden ? (
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-line px-2.5 py-1 text-xs font-semibold">
                          <span className="h-1.5 w-1.5 rounded-full bg-ink-mute" aria-hidden="true" />
                          Đã ẩn
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-volt px-2.5 py-1 text-xs font-semibold">
                          <span className="h-1.5 w-1.5 rounded-full bg-ink" aria-hidden="true" />
                          Đang bán
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditing(p)}
                          className="rounded-full border border-line px-3 py-1 text-xs font-semibold transition hover:border-ink/40 hover:bg-paper active:scale-95"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleHidden(p)}
                          disabled={updateMutation.isPending}
                          className="rounded-full border border-line px-3 py-1 text-xs font-semibold transition hover:border-ink/40 hover:bg-paper active:scale-95 disabled:opacity-50"
                        >
                          {p.hidden ? "Hiện" : "Ẩn"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(p)}
                          className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-100 active:scale-95"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {creating ? (
        <ProductForm saving={saving} onSave={handleSave} onClose={() => setCreating(false)} />
      ) : null}
      {editing ? (
        <ProductForm
          initial={editing}
          saving={saving}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      ) : null}
      {deleting ? (
        <ConfirmModal
          title="Xóa sản phẩm"
          message={`Xóa “${deleting.name}” khỏi cửa hàng? Hành động này không hoàn tác được.`}
          loading={deleteMutation.isPending}
          onCancel={() => setDeleting(null)}
          onConfirm={() =>
            deleteMutation.mutate(deleting.id, {
              onSuccess: () => {
                setDeleting(null);
                setNotice("Đã xóa sản phẩm.");
              },
            })
          }
        />
      ) : null}
    </div>
  );
}

export default function AdminProducts() {
  return <AdminProductsInner />;
}
