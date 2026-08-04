import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { business } from "@/data/business";
import { formatToman } from "@/lib/format";

import { AuthError, currentUser, readCartToken, requireUser, setCartCookie } from "../context";
import { orderReceivedEmail, sendMail } from "../mailer";
import { allSettings, getSettingNumber } from "../repo/catalog";
import { cartSummary, createCart, findCartByToken } from "../repo/cart";
import {
  applyCoupon,
  CheckoutError,
  orderByCode,
  ordersForUser,
  placeOrder,
  submitPaymentReceipt,
  type CheckoutInput,
} from "../repo/orders";

function currentCart() {
  let cart = findCartByToken(readCartToken());
  if (!cart) {
    const user = currentUser();
    cart = createCart(user?.id ?? null);
    setCartCookie(cart.token);
  }
  return cart;
}

/** دادهٔ صفحهٔ پرداخت: سبد، روش‌های پرداخت و شمارهٔ کارت. */
export const getCheckoutData = createServerFn({ method: "GET" }).handler(async () => {
  const cart = currentCart();
  const settings = allSettings();

  return {
    cart: cartSummary(cart),
    user: currentUser(),
    freeShippingThreshold: getSettingNumber("free_shipping_threshold", business.freeShippingThreshold),
    shippingFlatFee: getSettingNumber("shipping_flat_fee", business.shippingFlatFee),
    card: {
      number: settings["card_number"] ?? business.cardNumber,
      holder: settings["card_holder"] ?? business.cardHolder,
      bank: settings["card_bank"] ?? business.cardBank,
    },
  };
});

/** بررسی کد تخفیف پیش از ثبت سفارش. */
export const checkCoupon = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ code: z.string().min(2).max(40) }).parse(data))
  .handler(async ({ data }) => {
    const summary = cartSummary(currentCart());
    try {
      const result = applyCoupon(data.code, summary.itemsTotal);
      return { ok: true, code: result.code, discount: result.discount, message: "کد تخفیف اعمال شد." };
    } catch (error) {
      const message = error instanceof CheckoutError ? error.message : "کد تخفیف معتبر نیست.";
      return { ok: false, code: null, discount: 0, message };
    }
  });

const checkoutSchema = z.object({
  receiver: z.string().min(3, "نام تحویل‌گیرنده را وارد کنید.").max(80),
  phone: z.string().min(10, "شمارهٔ تماس را درست وارد کنید.").max(20),
  province: z.string().min(2, "استان را انتخاب کنید.").max(40),
  city: z.string().min(2, "شهر را وارد کنید.").max(40),
  postalCode: z.string().max(12).optional(),
  addressLine: z.string().min(10, "نشانی دقیق را وارد کنید.").max(400),
  note: z.string().max(500).optional(),
  paymentMethod: z.enum(["card_transfer", "cash_on_delivery"]),
  couponCode: z.string().max(40).optional(),
});

/** ثبت نهایی سفارش (مهمان یا کاربر واردشده). */
export const submitCheckout = createServerFn({ method: "POST" })
  .validator((data: unknown) => checkoutSchema.parse(data))
  .handler(async ({ data }) => {
    const cart = currentCart();
    const user = currentUser();

    const input: CheckoutInput = {
      userId: user?.id ?? null,
      receiver: data.receiver.trim(),
      phone: data.phone.trim(),
      province: data.province.trim(),
      city: data.city.trim(),
      postalCode: data.postalCode ?? null,
      addressLine: data.addressLine.trim(),
      note: data.note ?? null,
      paymentMethod: data.paymentMethod,
      couponCode: data.couponCode ?? null,
    };

    const order = placeOrder(cart, input);

    if (user?.email) {
      await sendMail(orderReceivedEmail(user.email, order.code, formatToman(order.grandTotal)));
    }

    return {
      ok: true,
      code: order.code,
      grandTotal: order.grandTotal,
      paymentMethod: data.paymentMethod,
      message: "سفارش شما ثبت شد.",
    };
  });

/** پیگیری سفارش با کد — برای مهمان هم کار می‌کند. */
export const getOrder = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ code: z.string().min(4).max(30) }).parse(data))
  .handler(async ({ data }) => {
    const settings = allSettings();
    return {
      order: orderByCode(data.code),
      card: {
        number: settings["card_number"] ?? business.cardNumber,
        holder: settings["card_holder"] ?? business.cardHolder,
        bank: settings["card_bank"] ?? business.cardBank,
      },
    };
  });

/** فهرست سفارش‌های کاربر جاری. */
export const getMyOrders = createServerFn({ method: "GET" }).handler(async () => {
  const user = requireUser();
  return { orders: ordersForUser(user.id) };
});

/** ثبت رسید کارت‌به‌کارت توسط مشتری. */
export const submitReceipt = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        orderCode: z.string().min(4).max(30),
        payerName: z.string().min(3, "نام پرداخت‌کننده را وارد کنید.").max(80),
        reference: z.string().min(4, "شمارهٔ پیگیری واریز را وارد کنید.").max(60),
        paidAtText: z.string().min(4, "تاریخ و ساعت واریز را وارد کنید.").max(60),
        receiptUrl: z.string().max(300).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const order = orderByCode(data.orderCode);
    if (!order) throw new AuthError("سفارشی با این کد پیدا نشد.", 404);

    submitPaymentReceipt({
      orderCode: data.orderCode,
      payerName: data.payerName.trim(),
      reference: data.reference.trim(),
      paidAtText: data.paidAtText.trim(),
      receiptUrl: data.receiptUrl ?? null,
    });

    return { ok: true, message: "رسید شما ثبت شد و پس از بررسی تأیید می‌شود." };
  });
