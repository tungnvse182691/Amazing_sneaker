import { delay, http, HttpResponse } from "msw";
import { products as seedProducts } from "../data/products";
import type { Order, OrderStatus, Product, Voucher } from "../types";

/**
 * Dữ liệu mock lưu trong bộ nhớ (Map/array) để CRUD admin có tác dụng
 * trong phiên. Reload trang sẽ reset về seed.
 */
const productStore = new Map<string, Product>(
  seedProducts.map((p) => [p.id, structuredClone(p)]),
);

const orderStore: Order[] = [
  {
    id: "ord-1",
    code: "AS-20261120-001",
    customerName: "Nguyễn Văn Tùng",
    phone: "0901234567",
    address: "Khu đô thị mới, Bình Chánh, TP. Hồ Chí Minh",
    items: [
      {
        productId: "nike-air-jordan-1-retro-high",
        name: "Nike Air Jordan 1 Retro High",
        image: "https://image.goat.com/transform/v1/attachments/product_template_additional_pictures/images/083/401/929/original/14741_01.jpg.jpeg?action=crop&width=1500",
        size: 42,
        price: 4590000,
        quantity: 1,
      },
    ],
    subtotal: 4590000,
    discount: 0,
    shippingFee: 0,
    total: 4590000,
    status: "dang_giao",
    createdAt: "2026-11-19T10:24:00.000Z",
  },
];

const voucherStore = new Map<string, Voucher>([
  [
    "vch-1",
    {
      id: "vch-1",
      code: "CHAO10",
      type: "percent",
      value: 10,
      minOrder: 1000000,
      maxDiscount: 500000,
      expiresAt: "2026-12-31T23:59:59.000Z",
      active: true,
    },
  ],
  [
    "vch-2",
    {
      id: "vch-2",
      code: "FREESHIP",
      type: "fixed",
      value: 30000,
      minOrder: 500000,
      expiresAt: "2026-12-31T23:59:59.000Z",
      active: true,
    },
  ],
]);

const ORDER_STATUSES: OrderStatus[] = [
  "cho_xac_nhan",
  "dang_chuan_bi",
  "dang_giao",
  "da_giao",
  "da_huy",
];

function listProducts(url: URL): Product[] {
  const brand = url.searchParams.get("brand");
  const search = url.searchParams.get("search")?.toLowerCase();
  const sort = url.searchParams.get("sort");
  const minPrice = Number(url.searchParams.get("minPrice") ?? "");
  const maxPrice = Number(url.searchParams.get("maxPrice") ?? "");
  const size = Number(url.searchParams.get("size") ?? "");

  let list = [...productStore.values()];
  if (brand) list = list.filter((p) => p.brand === brand);
  if (search) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.brand.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search),
    );
  }
  if (!Number.isNaN(minPrice) && url.searchParams.get("minPrice") !== null) {
    list = list.filter((p) => p.price >= minPrice);
  }
  if (!Number.isNaN(maxPrice) && url.searchParams.get("maxPrice") !== null) {
    list = list.filter((p) => p.price <= maxPrice);
  }
  if (!Number.isNaN(size) && url.searchParams.get("size") !== null) {
    list = list.filter((p) => p.sizes.some((s) => s.size === size && s.stock > 0));
  }
  switch (sort) {
    case "price-asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      list.sort((a, b) => b.rating - a.rating);
      break;
    case "sold":
      list.sort((a, b) => b.sold - a.sold);
      break;
    case "newest":
      list.sort((a, b) => Number(b.isNew ?? false) - Number(a.isNew ?? false));
      break;
    default:
      break;
  }
  return list;
}

export const handlers = [
  // ── Sản phẩm ──
  http.get("/api/products", async ({ request }) => {
    await delay(150);
    return HttpResponse.json(listProducts(new URL(request.url)));
  }),

  http.get("/api/products/:slug", async ({ params }) => {
    await delay(120);
    const product = [...productStore.values()].find((p) => p.slug === params.slug);
    if (!product) {
      return HttpResponse.json({ message: "Không tìm thấy sản phẩm" }, { status: 404 });
    }
    return HttpResponse.json(product);
  }),

  // ── Admin: sản phẩm ──
  http.post("/api/admin/products", async ({ request }) => {
    await delay(150);
    const body = (await request.json()) as Product;
    const product: Product = { ...body, id: body.id || `p-${Date.now()}` };
    productStore.set(product.id, product);
    return HttpResponse.json(product, { status: 201 });
  }),

  http.put("/api/admin/products/:id", async ({ params, request }) => {
    await delay(150);
    const id = String(params.id);
    if (!productStore.has(id)) {
      return HttpResponse.json({ message: "Không tìm thấy sản phẩm" }, { status: 404 });
    }
    const body = (await request.json()) as Partial<Product>;
    const updated: Product = { ...productStore.get(id)!, ...body, id };
    productStore.set(id, updated);
    return HttpResponse.json(updated);
  }),

  http.delete("/api/admin/products/:id", async ({ params }) => {
    await delay(150);
    const id = String(params.id);
    if (!productStore.delete(id)) {
      return HttpResponse.json({ message: "Không tìm thấy sản phẩm" }, { status: 404 });
    }
    return HttpResponse.json({ message: "Đã xóa sản phẩm" });
  }),

  // ── Đơn hàng ──
  http.get("/api/orders", async () => {
    await delay(150);
    return HttpResponse.json(orderStore);
  }),

  http.post("/api/orders", async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as Omit<Order, "id" | "code" | "createdAt" | "status">;
    const order: Order = {
      ...body,
      id: `ord-${Date.now()}`,
      code: `AS-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${String(
        orderStore.length + 1,
      ).padStart(3, "0")}`,
      status: "cho_xac_nhan",
      createdAt: new Date().toISOString(),
    };
    orderStore.push(order);
    return HttpResponse.json(order, { status: 201 });
  }),

  http.patch("/api/orders/:id", async ({ params, request }) => {
    await delay(150);
    const order = orderStore.find((o) => o.id === params.id);
    if (!order) {
      return HttpResponse.json({ message: "Không tìm thấy đơn hàng" }, { status: 404 });
    }
    const body = (await request.json()) as { status: OrderStatus };
    if (!ORDER_STATUSES.includes(body.status)) {
      return HttpResponse.json({ message: "Trạng thái không hợp lệ" }, { status: 400 });
    }
    order.status = body.status;
    return HttpResponse.json(order);
  }),

  // ── Admin: voucher ──
  http.get("/api/admin/vouchers", async () => {
    await delay(120);
    return HttpResponse.json([...voucherStore.values()]);
  }),

  http.post("/api/admin/vouchers", async ({ request }) => {
    await delay(150);
    const body = (await request.json()) as Voucher;
    const voucher: Voucher = { ...body, id: body.id || `vch-${Date.now()}` };
    voucherStore.set(voucher.id, voucher);
    return HttpResponse.json(voucher, { status: 201 });
  }),

  http.put("/api/admin/vouchers/:id", async ({ params, request }) => {
    await delay(150);
    const id = String(params.id);
    if (!voucherStore.has(id)) {
      return HttpResponse.json({ message: "Không tìm thấy mã giảm giá" }, { status: 404 });
    }
    const body = (await request.json()) as Partial<Voucher>;
    const updated: Voucher = { ...voucherStore.get(id)!, ...body, id };
    voucherStore.set(id, updated);
    return HttpResponse.json(updated);
  }),

  http.delete("/api/admin/vouchers/:id", async ({ params }) => {
    await delay(150);
    if (!voucherStore.delete(String(params.id))) {
      return HttpResponse.json({ message: "Không tìm thấy mã giảm giá" }, { status: 404 });
    }
    return HttpResponse.json({ message: "Đã xóa mã giảm giá" });
  }),

  // ── Auth (mock) ──
  http.post("/api/auth/login", async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as { email?: string; password?: string };
    if (!body.email?.includes("@") || !body.password || body.password.length < 6) {
      return HttpResponse.json(
        { message: "Email hoặc mật khẩu không hợp lệ (mật khẩu tối thiểu 6 ký tự)" },
        { status: 400 },
      );
    }
    const isAdmin = body.email.toLowerCase().startsWith("admin@");
    return HttpResponse.json({
      user: {
        id: isAdmin ? "user-admin" : "user-demo",
        name: isAdmin ? "Quản trị viên" : "Khách demo",
        email: body.email,
        role: isAdmin ? "admin" : "customer",
      },
      token: `mock-token-${Date.now()}`,
    });
  }),

  // ── Tra cứu đơn hàng ──
  http.get("/api/track/:code", async ({ params }) => {
    await delay(200);
    const order = orderStore.find(
      (o) => o.code.toLowerCase() === String(params.code).toLowerCase(),
    );
    if (!order) {
      return HttpResponse.json({ message: "Không tìm thấy đơn hàng" }, { status: 404 });
    }
    return HttpResponse.json(order);
  }),
];
