/**
 * useFlyToCart — hook tiện dùng cho trang Shop / ProductDetail / card sản phẩm.
 * Logic nằm ở `src/components/effects/FlyToCart.tsx`; file này chỉ re-export
 * để agent B import từ `src/hooks/useFlyToCart` cho gọn.
 *
 * Cách dùng:
 *   import { useFlyToCart } from "../hooks/useFlyToCart";
 *   const { flyToCart } = useFlyToCart();
 *   // trong onClick thêm giỏ: flyToCart(e.currentTarget, product.colors[0].image)
 * Nhớ đặt `data-cart-target` lên icon giỏ trong header (xem FlyToCart.tsx).
 */
export { flyToCart, useFlyToCart } from "../components/effects/FlyToCart";
export type { FlyToCartOptions } from "../components/effects/FlyToCart";
export { default } from "../components/effects/FlyToCart";
