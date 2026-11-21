export type Brand = "nike" | "adidas" | "puma" | "vans";

export type Category = "Chạy bộ" | "Bóng rổ" | "Lifestyle" | "Bóng đá" | "Tập luyện";

export interface ProductColor {
  /** Tên màu tiếng Việt, vd "Trắng / Đen" */
  name: string;
  /** Mã hex của màu chủ đạo, vd "#FFFFFF" */
  hex: string;
  /**
   * Ảnh thật đã verify khớp đúng colorway này.
   * Chỉ khai colorway nào có ảnh thật; không bịa màu giả.
   */
  image: string;
}

export interface SizeStock {
  size: number;
  /** Số lượng tồn; 0 = hết hàng */
  stock: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: Brand;
  category: Category;
  price: number;
  originalPrice?: number;
  colors: ProductColor[];
  sizes: SizeStock[];
  rating: number;
  sold: number;
  isNew?: boolean;
  isHot?: boolean;
  description: string;
  /**
   * Ảnh cắt nền (nền trong suốt) của colorway đầu, dùng riêng cho hero
   * hộp giày — giày trồi lên khỏi hộp trên nền tối mà không lộ khung
   * ảnh trắng. Tạo từ ảnh thật bằng flood-fill từ viền, đã kiểm bằng mắt.
   */
  cutoutImage?: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  brand: Brand;
  image: string;
  colorName: string;
  size: number;
  price: number;
  quantity: number;
}

export type OrderStatus =
  | "cho_xac_nhan"
  | "dang_chuan_bi"
  | "dang_giao"
  | "da_giao"
  | "da_huy";

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  size: number;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  code: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  voucherCode?: string;
  status: OrderStatus;
  createdAt: string;
}

export interface Voucher {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  maxDiscount?: number;
  expiresAt: string;
  active: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
}
