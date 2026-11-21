import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-12 border-t-4 border-ink bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4 md:px-6">
        <div>
          <p className="font-display text-2xl uppercase leading-none">
            Amazing<span className="bg-volt px-1 text-ink">Sneaker</span>
          </p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
            Giày thể thao Nike, Adidas, Puma, Vans chính hãng. Chạy bộ, bóng rổ, lifestyle —
            đủ size 36–46, giao nhanh toàn quốc.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wide">Mua sắm</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li><Link className="hover:text-volt" to="/shop">Tất cả giày</Link></li>
            <li><Link className="hover:text-volt" to="/brand/nike">Nike</Link></li>
            <li><Link className="hover:text-volt" to="/brand/adidas">Adidas</Link></li>
            <li><Link className="hover:text-volt" to="/brand/puma">Puma</Link></li>
            <li><Link className="hover:text-volt" to="/wishlist">Yêu thích</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wide">Hỗ trợ</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li><Link className="hover:text-volt" to="/track">Tra cứu đơn hàng</Link></li>
            <li><Link className="hover:text-volt" to="/cart">Giỏ hàng</Link></li>
            <li><Link className="hover:text-volt" to="/checkout">Thanh toán</Link></li>
            <li>Đổi size miễn phí trong 7 ngày</li>
            <li>Miễn phí giao hàng đơn từ 1.000.000 ₫</li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wide">Ưu đãi</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li>
              Mã <span className="font-bold text-volt">CHAO10</span> — giảm 10% (tối đa
              500.000 ₫) cho đơn từ 1.000.000 ₫
            </li>
            <li>
              Mã <span className="font-bold text-volt">FREESHIP</span> — giảm 30.000 ₫ phí
              ship cho đơn từ 500.000 ₫
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/15">
        <p className="mx-auto max-w-7xl px-4 py-4 text-center text-xs text-white/50 md:px-6">
          © 2026 Amazing Sneaker — Bản demo. Giá và khuyến mãi chỉ mang tính minh họa.
        </p>
      </div>
    </footer>
  );
}
