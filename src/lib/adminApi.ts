import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Order, OrderStatus, Product, Voucher } from "../types";

/** Một QueryClient dùng chung cho toàn khu admin. */
export const adminQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const data = (await res.json().catch(() => null)) as T & { message?: string };
  if (!res.ok) {
    throw new Error(
      (data as { message?: string } | null)?.message ?? `Lỗi ${res.status} khi gọi ${path}`,
    );
  }
  return data as T;
}

/**
 * Product chưa có field `hidden` trong type chung.
 * MSW lưu nguyên body gửi lên (PUT merge) nên flag ẩn/hiện đi qua được
 * CRUD /api/admin/products, chỉ là type phụ ở phía admin.
 */
export type AdminProduct = Product & { hidden?: boolean };

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  cho_xac_nhan: "Chờ xác nhận",
  dang_chuan_bi: "Đang chuẩn bị",
  dang_giao: "Đang giao",
  da_giao: "Đã giao",
  da_huy: "Đã hủy",
};

export const ORDER_STATUSES: OrderStatus[] = [
  "cho_xac_nhan",
  "dang_chuan_bi",
  "dang_giao",
  "da_giao",
  "da_huy",
];

/** Trạng thái tiếp theo hợp lý từ một trạng thái (để hiện nút chuyển nhanh). */
export function nextStatuses(status: OrderStatus): OrderStatus[] {
  switch (status) {
    case "cho_xac_nhan":
      return ["dang_chuan_bi", "da_huy"];
    case "dang_chuan_bi":
      return ["dang_giao", "da_huy"];
    case "dang_giao":
      return ["da_giao", "da_huy"];
    default:
      return [];
  }
}

// ── Sản phẩm ──
export function useAdminProducts() {
  return useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => api<AdminProduct[]>("/api/products"),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminProduct) =>
      api<AdminProduct>("/api/admin/products", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "products"] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<AdminProduct> }) =>
      api<AdminProduct>(`/api/admin/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "products"] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api<{ message: string }>(`/api/admin/products/${id}`, { method: "DELETE" }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "products"] }),
  });
}

// ── Đơn hàng ──
export function useOrders() {
  return useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => api<Order[]>("/api/orders"),
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      api<Order>(`/api/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "orders"] }),
  });
}

// ── Voucher ──
export function useVouchers() {
  return useQuery({
    queryKey: ["admin", "vouchers"],
    queryFn: () => api<Voucher[]>("/api/admin/vouchers"),
  });
}

export function useCreateVoucher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Voucher) =>
      api<Voucher>("/api/admin/vouchers", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "vouchers"] }),
  });
}

export function useUpdateVoucher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Voucher> }) =>
      api<Voucher>(`/api/admin/vouchers/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "vouchers"] }),
  });
}

export function useDeleteVoucher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api<{ message: string }>(`/api/admin/vouchers/${id}`, { method: "DELETE" }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "vouchers"] }),
  });
}

// ── Auth mock ──
export async function loginRequest(email: string, password: string) {
  return api<{ user: import("../types").User; token: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
