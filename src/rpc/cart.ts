import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { currentUser, readCartToken, setCartCookie } from "../server/context";
import {
  addToCart,
  attachCartToUser,
  cartSummary,
  clearCart,
  createCart,
  findCartByToken,
  removeCartItem,
  setCartItemQty,
  type CartRow,
  type CartSummary,
} from "../server/repo/cart";

async function ensureCart(): Promise<CartRow> {
  const [user, existing] = await Promise.all([currentUser(), findCartByToken(readCartToken())]);
  let cart = existing;

  if (!cart) {
    cart = await createCart(user?.id ?? null);
    setCartCookie(cart.token);
  } else if (user && cart.user_id === null) {
    await attachCartToUser(cart.id, user.id);
    cart = { ...cart, user_id: user.id };
  }

  return cart;
}

async function summary(): Promise<CartSummary> {
  return cartSummary(await ensureCart());
}

export const getCart = createServerFn({ method: "GET" }).handler(async () => summary());

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
    const cart = await ensureCart();
    await addToCart({
      cartId: cart.id,
      productId: data.productId,
      variantId: data.variantId ?? null,
      ...(data.qty === undefined ? {} : { qty: data.qty }),
    });
    return { ok: true, cart: await cartSummary(cart), message: "محصول به سبد خرید اضافه شد." };
  });

export const updateCartItemQty = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({ itemId: z.number().int().positive(), qty: z.number().int().min(0).max(20) })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const cart = await ensureCart();
    await setCartItemQty(cart.id, data.itemId, data.qty);
    return { ok: true, cart: await cartSummary(cart) };
  });

export const deleteCartItem = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ itemId: z.number().int().positive() }).parse(data))
  .handler(async ({ data }) => {
    const cart = await ensureCart();
    await removeCartItem(cart.id, data.itemId);
    return { ok: true, cart: await cartSummary(cart), message: "قلم مورد نطر حذف شد." };
  });

export const emptyCart = createServerFn({ method: "POST" }).handler(async () => {
  const cart = await ensureCart();
  await clearCart(cart.id);
  return { ok: true, cart: await cartSummary(cart), message: "سبد خرید خالی شد." };
});
