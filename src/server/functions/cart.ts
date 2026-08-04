import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { currentUser, readCartToken, setCartCookie } from "../context";
import {
  addToCart,
  attachCartToUser,
  cartSummary,
  clearCart,
  createCart,
  findCartByToken,
  removeCartItem,
  setCartItemQty,
  type CartSummary,
} from "../repo/cart";

/**
 * سبد جاری را پیدا یا ایجاد می‌کند و کوکی را تنطیم می‌کند.
 * اگر کاربر وارد شده باشد، سبد مهمان به حساب او متصل می‌شود.
 */
function ensureCart() {
  const user = currentUser();
  let cart = findCartByToken(readCartToken());

  if (!cart) {
    cart = createCart(user?.id ?? null);
    setCartCookie(cart.token);
  } else if (user && cart.user_id === null) {
    attachCartToUser(cart.id, user.id);
    cart = { ...cart, user_id: user.id };
  }

  return cart;
}

function summary(): CartSummary {
  return cartSummary(ensureCart());
}

/** خواندن سبد خرید فعلی. */
export const getCart = createServerFn({ method: "GET" }).handler(async () => summary());

/** افزودن محصول (و در پوشاک، تنوع سایز/رنگ) به سبد. */
export const addCartItem = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        productId: z.number().int().positive(),
        variantId: z.number().int().positive().nullable().optional(),
        qty: z.number().int().min(1).max(20).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const cart = ensureCart();
    addToCart({
      cartId: cart.id,
      productId: data.productId,
      variantId: data.variantId ?? null,
      ...(data.qty === undefined ? {} : { qty: data.qty }),
    });
    return { ok: true, cart: cartSummary(cart), message: "محصول به سبد خرید اضافه شد." };
  });

/** تغییر تعداد یک قلم سبد. */
export const updateCartItemQty = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ itemId: z.number().int().positive(), qty: z.number().int().min(0).max(20) }).parse(data),
  )
  .handler(async ({ data }) => {
    const cart = ensureCart();
    setCartItemQty(cart.id, data.itemId, data.qty);
    return { ok: true, cart: cartSummary(cart) };
  });

/** حذف یک قلم از سبد. */
export const deleteCartItem = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ itemId: z.number().int().positive() }).parse(data))
  .handler(async ({ data }) => {
    const cart = ensureCart();
    removeCartItem(cart.id, data.itemId);
    return { ok: true, cart: cartSummary(cart), message: "قلم مورد نظر حذف شد." };
  });

/** خالی‌کردن کامل سبد. */
export const emptyCart = createServerFn({ method: "POST" }).handler(async () => {
  const cart = ensureCart();
  clearCart(cart.id);
  return { ok: true, cart: cartSummary(cart), message: "سبد خرید خالی شد." };
});
