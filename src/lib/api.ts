import { useMutation, useQuery } from "@tanstack/react-query";
import type { Order, Product, Voucher } from "../types";

async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    let message = "Đã có lỗi xảy ra, vui lòng thử lại.";
    try {
      const data = (await res.json()) as { message?: string };
      if (data.message) message = data.message;
    } catch {
      /* giữ message mặc định */
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export interface ProductFilters {
  brand?: string;
  search?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: number;
}

export function buildProductQuery(params: ProductFilters): string {
  const q = new URLSearchParams();
  if (params.brand) q.set("brand", params.brand);
  if (params.search) q.set("search", params.search);
  if (params.sort) q.set("sort", params.sort);
  if (params.minPrice !== undefined) q.set("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined) q.set("maxPrice", String(params.maxPrice));
  if (params.size !== undefined) q.set("size", String(params.size));
  const s = q.toString();
  return s ? `/api/products?${s}` : "/api/products";
}

export function useProducts(params: ProductFilters = {}) {
  const key = buildProductQuery(params);
  return useQuery<Product[]>({
    queryKey: ["products", key],
    queryFn: () => fetchJson<Product[]>(key),
  });
}

export function useProduct(slug: string | undefined) {
  return useQuery<Product>({
    queryKey: ["product", slug],
    queryFn: () => fetchJson<Product>(`/api/products/${slug}`),
    enabled: Boolean(slug),
  });
}

export function useVouchers() {
  return useQuery<Voucher[]>({
    queryKey: ["vouchers"],
    queryFn: () => fetchJson<Voucher[]>("/api/admin/vouchers"),
  });
}

/** Tìm mã giảm theo code (không phân biệt hoa thường), kiểm tra còn hiệu lực. */
export function findVoucher(
  vouchers: Voucher[] | undefined,
  code: string,
): { voucher: Voucher | null; error: string | null } {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return { voucher: null, error: "Vui lòng nhập mã giảm giá." };
  const found = vouchers?.find((v) => v.code.toUpperCase() === trimmed);
  if (!found) return { voucher: null, error: "Mã giảm giá không tồn tại." };
  if (!found.active) return { voucher: null, error: "Mã giảm giá đã ngừng áp dụng." };
  if (new Date(found.expiresAt).getTime() < Date.now())
    return { voucher: null, error: "Mã giảm giá đã hết hạn." };
  return { voucher: found, error: null };
}

/** Số tiền được giảm theo mã, kiểm tra đơn tối thiểu. */
export function calcDiscount(
  voucher: Voucher | null,
  subtotal: number,
): { discount: number; error: string | null } {
  if (!voucher) return { discount: 0, error: null };
  if (subtotal < voucher.minOrder)
    return {
      discount: 0,
      error: `Đơn tối thiểu ${voucher.minOrder.toLocaleString("vi-VN")} ₫ để dùng mã ${voucher.code}.`,
    };
  if (voucher.type === "percent") {
    const raw = Math.round((subtotal * voucher.value) / 100);
    return {
      discount: voucher.maxDiscount ? Math.min(raw, voucher.maxDiscount) : raw,
      error: null,
    };
  }
  return { discount: Math.min(voucher.value, subtotal), error: null };
}

/** Phí giao hàng: miễn phí từ 1.000.000 ₫, còn lại 30.000 ₫. */
export function calcShippingFee(subtotalAfterDiscount: number): number {
  if (subtotalAfterDiscount <= 0) return 0;
  return subtotalAfterDiscount >= 1_000_000 ? 0 : 30_000;
}

export interface CreateOrderPayload {
  customerName: string;
  phone: string;
  address: string;
  items: Order["items"];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  voucherCode?: string;
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) =>
      fetchJson<Order>("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
  });
}

export function useTrackOrder(code: string | null) {
  return useQuery<Order>({
    queryKey: ["track", code],
    queryFn: () => fetchJson<Order>(`/api/track/${encodeURIComponent(code!)}`),
    enabled: Boolean(code),
    retry: false,
  });
}

export const ORDER_STATUS_LABEL: Record<Order["status"], string> = {
  cho_xac_nhan: "Chờ xác nhận",
  dang_chuan_bi: "Đang chuẩn bị",
  dang_giao: "Đang giao hàng",
  da_giao: "Đã giao hàng",
  da_huy: "Đã hủy",
};

/** Các bước hiển thị trên timeline tra cứu (trừ trạng thái hủy). */
export const ORDER_STATUS_STEPS: Order["status"][] = [
  "cho_xac_nhan",
  "dang_chuan_bi",
  "dang_giao",
  "da_giao",
];
