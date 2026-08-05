import { all, batch, count, nowIso, one, run, statement } from "../db";
import { cartSummary, clearCart, shippingFor, type CartLine, type CartSummary } from "./cart";

/* ------------------------------------------------------------------ */
/* وضعیت‌ها                                                          */
/* ------------------------------------------------------------------ */

export const ORDER_STATUSES = [
  "pending_payment",
  "awaiting_review",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "canceled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "در انتطار پرداخت",
  awaiting_review: "در انتطار بررسی رسید",
  paid: "پرداخت‌شده",
  processing: "در حال آماده‌سازی",
  shipped: "ارسال شده",
  delivered: "تحویل شده",
  canceled: "لغو شده",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  card_transfer: "کارت‌به‌کارت",
  cash_on_delivery: "پرداخت در محل",
};

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as ReadonlyArray<string>).includes(value);
}

export class CheckoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CheckoutError";
  }
}

/* ------------------------------------------------------------------ */
/* کد تخفیف                                                          */
/* ------------------------------------------------------------------ */

export type CouponResult = { code: string; discount: number };

export async function applyCoupon(rawCode: string, itemsTotal: number): Promise<CouponResult> {
  const code = rawCode.trim().toUpperCase();
  const coupon = await one<{
    code: string;
    kind: string;
    value: number;
    min_total: number;
    max_off: number | null;
    max_uses: number | null;
    used_count: number;
    starts_at: string | null;
    ends_at: string | null;
    is_active: number;
  }>("SELECT * FROM coupons WHERE code = ?", code);

  if (!coupon || coupon.is_active !== 1) throw new CheckoutError("کد تخفیف معتبر نیست.");

  const now = Date.now();
  if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now) {
    throw new CheckoutError("این کد تخفیف هنوز فعال نشده است.");
  }
  if (coupon.ends_at && new Date(coupon.ends_at).getTime() <= now) {
    throw new CheckoutError("مدت اعتبار این کد تخفیف به پایان رسیده است.");
  }
  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
    throw new CheckoutError("سقف استفاده از این کد تکمیل شده است.");
  }
  if (itemsTotal < coupon.min_total) {
    throw new CheckoutError("مبلغ سبد برای استفاده از این کد کافی نیست.");
  }

  let discount =
    coupon.kind === "amount"
      ? Number(coupon.value)
      : Math.round((itemsTotal * Number(coupon.value)) / 100 / 1000) * 1000;

  if (coupon.max_off !== null) discount = Math.min(discount, Number(coupon.max_off));
  discount = Math.max(0, Math.min(discount, itemsTotal));

  return { code: coupon.code, discount };
}

/* ------------------------------------------------------------------ */
/* ثبت سفارش                                                        */
/* ------------------------------------------------------------------ */

export async function generateOrderCode(): Promise<string> {
  const total = await count("SELECT COUNT(*) AS c FROM orders");
  const year = new Date().getFullYear() % 100;
  return `JK-${String(year).padStart(2, "0")}-${1001 + total}`;
}

export type CheckoutInput = {
  userId?: number | null;
  receiver: string;
  phone: string;
  province: string;
  city: string;
  postalCode?: string | null;
  addressLine: string;
  note?: string | null;
  paymentMethod: "card_transfer" | "cash_on_delivery";
  couponCode?: string | null;
};

export async function placeOrder(
  cart: { id: number; token: string; user_id: number | null },
  input: CheckoutInput,
): Promise<{ code: string; grandTotal: number }> {
  const summary: CartSummary = await cartSummary(cart);
  if (summary.lines.length === 0) throw new CheckoutError("سبد خرید شما خالی است.");

  for (const line of summary.lines) {
    if (line.qty > line.stock) {
      throw new CheckoutError(`موجودی «${line.title}» کافی نیست.`);
    }
  }

  const coupon = input.couponCode ? await applyCoupon(input.couponCode, summary.itemsTotal) : null;
  const discountTotal = coupon?.discount ?? 0;
  const shipping = await shippingFor(summary.itemsTotal - discountTotal);
  const grandTotal = summary.itemsTotal - discountTotal + shipping.fee;
  const now = nowIso();
  const code = await generateOrderCode();

  const order = await run(
    `INSERT INTO orders (
       code, user_id, status, payment_method, receiver, phone, province, city,
       postal_code, address_line, note, coupon_code,
       items_total, discount_total, shipping_total, grand_total, created_at, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    code,
    input.userId ?? cart.user_id ?? null,
    input.paymentMethod === "cash_on_delivery" ? "processing" : "pending_payment",
    input.paymentMethod,
    input.receiver,
    input.phone,
    input.province,
    input.city,
    input.postalCode ?? null,
    input.addressLine,
    input.note ?? null,
    coupon?.code ?? null,
    summary.itemsTotal,
    discountTotal,
    shipping.fee,
    grandTotal,
    now,
    now,
  );

  const orderId = order.lastInsertRowid;
  const writes = [];

  for (const line of summary.lines as Array<CartLine>) {
    writes.push(
      statement(
        `INSERT INTO order_items (
           order_id, product_id, variant_id, title, code, size, color, image, unit_price, qty, line_total
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        orderId,
        line.productId,
        line.variantId,
        line.title,
        line.code,
        line.size,
        line.color,
        line.image,
        line.unitPrice,
        line.qty,
        line.lineTotal,
      ),
    );

    if (line.variantId === null) {
      writes.push(
        statement(
          "UPDATE products SET stock = MAX(stock - ?, 0), sold_count = sold_count + ? WHERE id = ?",
          line.qty,
          line.qty,
          line.productId,
        ),
      );
    } else {
      writes.push(
        statement(
          "UPDATE product_variants SET stock = MAX(stock - ?, 0) WHERE id = ?",
          line.qty,
          line.variantId,
        ),
        statement(
          "UPDATE products SET sold_count = sold_count + ? WHERE id = ?",
          line.qty,
          line.productId,
        ),
      );
    }
  }

  if (coupon) {
    writes.push(statement("UPDATE coupons SET used_count = used_count + 1 WHERE code = ?", coupon.code));
  }

  writes.push(statement("DELETE FROM cart_items WHERE cart_id = ?", cart.id));

  await batch(writes);
  await clearCart(cart.id);

  return { code, grandTotal };
}

/* ------------------------------------------------------------------ */
/* خواندن سفارش                                                    */
/* ------------------------------------------------------------------ */

export type OrderItem = {
  title: string;
  code: string | null;
  size: string | null;
  color: string | null;
  image: string | null;
  unitPrice: number;
  qty: number;
  lineTotal: number;
};

export type OrderPayment = {
  id: number;
  method: string;
  amount: number;
  payerName: string | null;
  reference: string | null;
  paidAtText: string | null;
  receiptUrl: string | null;
  status: string;
  adminNote: string | null;
  createdAt: string;
};

export type Order = {
  id: number;
  code: string;
  status: OrderStatus;
  statusLabel: string;
  paymentMethod: string;
  paymentMethodLabel: string;
  receiver: string;
  phone: string;
  province: string;
  city: string;
  postalCode: string | null;
  addressLine: string;
  note: string | null;
  couponCode: string | null;
  itemsTotal: number;
  discountTotal: number;
  shippingTotal: number;
  grandTotal: number;
  createdAt: string;
  paidAt: string | null;
  items: Array<OrderItem>;
  payments: Array<OrderPayment>;
};

type OrderRow = {
  id: number;
  code: string;
  status: string;
  payment_method: string;
  receiver: string;
  phone: string;
  province: string;
  city: string;
  postal_code: string | null;
  address_line: string;
  note: string | null;
  coupon_code: string | null;
  items_total: number;
  discount_total: number;
  shipping_total: number;
  grand_total: number;
  created_at: string;
  paid_at: string | null;
};

async function mapOrder(row: OrderRow): Promise<Order> {
  const status: OrderStatus = isOrderStatus(row.status) ? row.status : "pending_payment";

  const [itemRows, paymentRows] = await Promise.all([
    all<{
      title: string;
      code: string | null;
      size: string | null;
      color: string | null;
      image: string | null;
      unit_price: number;
      qty: number;
      line_total: number;
    }>(
      "SELECT title, code, size, color, image, unit_price, qty, line_total FROM order_items WHERE order_id = ? ORDER BY id ASC",
      row.id,
    ),
    all<{
      id: number;
      method: string;
      amount: number;
      payer_name: string | null;
      reference: string | null;
      paid_at_text: string | null;
      receipt_url: string | null;
      status: string;
      admin_note: string | null;
      created_at: string;
    }>(
      "SELECT id, method, amount, payer_name, reference, paid_at_text, receipt_url, status, admin_note, created_at FROM payments WHERE order_id = ? ORDER BY id DESC",
      row.id,
    ),
  ]);

  return {
    id: row.id,
    code: row.code,
    status,
    statusLabel: ORDER_STATUS_LABELS[status],
    paymentMethod: row.payment_method,
    paymentMethodLabel: PAYMENT_METHOD_LABELS[row.payment_method] ?? row.payment_method,
    receiver: row.receiver,
    phone: row.phone,
    province: row.province,
    city: row.city,
    postalCode: row.postal_code,
    addressLine: row.address_line,
    note: row.note,
    couponCode: row.coupon_code,
    itemsTotal: Number(row.items_total),
    discountTotal: Number(row.discount_total),
    shippingTotal: Number(row.shipping_total),
    grandTotal: Number(row.grand_total),
    createdAt: row.created_at,
    paidAt: row.paid_at,
    items: itemRows.map((item) => ({
      title: item.title,
      code: item.code,
      size: item.size,
      color: item.color,
      image: item.image,
      unitPrice: Number(item.unit_price),
      qty: Number(item.qty),
      lineTotal: Number(item.line_total),
    })),
    payments: paymentRows.map((payment) => ({
      id: Number(payment.id),
      method: payment.method,
      amount: Number(payment.amount),
      payerName: payment.payer_name,
      reference: payment.reference,
      paidAtText: payment.paid_at_text,
      receiptUrl: payment.receipt_url,
      status: payment.status,
      adminNote: payment.admin_note,
      createdAt: payment.created_at,
    })),
  };
}

export async function orderByCode(code: string): Promise<Order | null> {
  const row = await one<OrderRow>("SELECT * FROM orders WHERE code = ?", code.trim().toUpperCase());
  return row ? mapOrder(row) : null;
}

export async function ordersForUser(userId: number): Promise<Array<Order>> {
  const rows = await all<OrderRow>("SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC", userId);
  return Promise.all(rows.map(mapOrder));
}

export async function submitPaymentReceipt(input: {
  orderCode: string;
  payerName: string;
  reference: string;
  paidAtText: string;
  receiptUrl?: string | null;
}): Promise<void> {
  const order = await one<{ id: number; grand_total: number; status: string }>(
    "SELECT id, grand_total, status FROM orders WHERE code = ?",
    input.orderCode.trim().toUpperCase(),
  );
  if (!order) throw new CheckoutError("سفارش پیدا نشد.");

  const now = nowIso();
  await batch([
    statement(
      `INSERT INTO payments (order_id, method, amount, payer_name, reference, paid_at_text, receipt_url, status, created_at)
       VALUES (?, 'card_transfer', ?, ?, ?, ?, ?, 'submitted', ?)`,
      order.id,
      order.grand_total,
      input.payerName,
      input.reference,
      input.paidAtText,
      input.receiptUrl ?? null,
      now,
    ),
    statement("UPDATE orders SET status = 'awaiting_review', updated_at = ? WHERE id = ?", now, order.id),
  ]);
}

/* ------------------------------------------------------------------ */
/* پنل مدیریت                                                        */
/* ------------------------------------------------------------------ */

export type AdminOrderRow = {
  id: number;
  code: string;
  status: OrderStatus;
  statusLabel: string;
  receiver: string;
  phone: string;
  city: string;
  grandTotal: number;
  paymentMethodLabel: string;
  itemCount: number;
  createdAt: string;
};

export async function adminListOrders(
  filters: { status?: string; q?: string; page?: number } = {},
): Promise<{
  items: Array<AdminOrderRow>;
  total: number;
  page: number;
  pageCount: number;
}> {
  const perPage = 20;
  const page = Math.max(filters.page ?? 1, 1);
  const clauses: Array<string> = ["1 = 1"];
  const params: Array<string | number> = [];

  if (filters.status && isOrderStatus(filters.status)) {
    clauses.push("o.status = ?");
    params.push(filters.status);
  }
  if (filters.q && filters.q.trim().length > 0) {
    clauses.push("(o.code LIKE ? OR o.receiver LIKE ? OR o.phone LIKE ?)");
    const like = `%${filters.q.trim()}%`;
    params.push(like, like, like);
  }
  const where = clauses.join(" AND ");

  const [total, rows] = await Promise.all([
    count(`SELECT COUNT(*) AS c FROM orders o WHERE ${where}`, ...params),
    all<{
      id: number;
      code: string;
      status: string;
      receiver: string;
      phone: string;
      city: string;
      grand_total: number;
      payment_method: string;
      item_count: number;
      created_at: string;
    }>(
      `SELECT o.id, o.code, o.status, o.receiver, o.phone, o.city, o.grand_total, o.payment_method, o.created_at,
         (SELECT COALESCE(SUM(oi.qty), 0) FROM order_items oi WHERE oi.order_id = o.id) AS item_count
       FROM orders o WHERE ${where}
       ORDER BY o.id DESC LIMIT ? OFFSET ?`,
      ...params,
      perPage,
      (page - 1) * perPage,
    ),
  ]);

  return {
    items: rows.map((row) => {
      const status: OrderStatus = isOrderStatus(row.status) ? row.status : "pending_payment";
      return {
        id: row.id,
        code: row.code,
        status,
        statusLabel: ORDER_STATUS_LABELS[status],
        receiver: row.receiver,
        phone: row.phone,
        city: row.city,
        grandTotal: Number(row.grand_total),
        paymentMethodLabel: PAYMENT_METHOD_LABELS[row.payment_method] ?? row.payment_method,
        itemCount: Number(row.item_count),
        createdAt: row.created_at,
      };
    }),
    total,
    page,
    pageCount: Math.max(Math.ceil(total / perPage), 1),
  };
}

export async function adminSetOrderStatus(code: string, status: OrderStatus): Promise<void> {
  const now = nowIso();
  const writes = [statement("UPDATE orders SET status = ?, updated_at = ? WHERE code = ?", status, now, code)];
  if (status === "paid") {
    writes.push(statement("UPDATE orders SET paid_at = COALESCE(paid_at, ?) WHERE code = ?", now, code));
  }
  await batch(writes);
}

export async function adminReviewPayment(
  paymentId: number,
  approve: boolean,
  adminNote?: string | null,
): Promise<void> {
  const payment = await one<{ order_id: number }>("SELECT order_id FROM payments WHERE id = ?", paymentId);
  if (!payment) return;
  const now = nowIso();

  await batch([
    statement(
      "UPDATE payments SET status = ?, admin_note = ? WHERE id = ?",
      approve ? "approved" : "rejected",
      adminNote ?? null,
      paymentId,
    ),
    statement(
      "UPDATE orders SET status = ?, paid_at = CASE WHEN ? = 1 THEN COALESCE(paid_at, ?) ELSE paid_at END, updated_at = ? WHERE id = ?",
      approve ? "paid" : "pending_payment",
      approve ? 1 : 0,
      now,
      now,
      payment.order_id,
    ),
  ]);
}

export type DashboardStats = {
  orderCount: number;
  paidOrderCount: number;
  pendingReviewCount: number;
  revenue: number;
  todayRevenue: number;
  customerCount: number;
  productCount: number;
  lowStockCount: number;
  pendingCommentCount: number;
  pendingReviewsCount: number;
  revenueByDay: Array<{ day: string; revenue: number; orders: number }>;
};

export async function dashboardStats(): Promise<DashboardStats> {
  const paidStatuses = "('paid', 'processing', 'shipped', 'delivered')";

  const [
    revenueRows,
    orderCount,
    paidOrderCount,
    pendingReviewCount,
    revenue,
    todayRevenue,
    customerCount,
    productCount,
    lowStockCount,
    pendingCommentCount,
    pendingReviewsCount,
  ] = await Promise.all([
    all<{ day: string; revenue: number; orders: number }>(
      `SELECT date(created_at) AS day, COALESCE(SUM(grand_total), 0) AS revenue, COUNT(*) AS orders
       FROM orders
       WHERE status IN ${paidStatuses} AND date(created_at) >= date('now', '-13 days')
       GROUP BY date(created_at) ORDER BY day ASC`,
    ),
    count("SELECT COUNT(*) AS c FROM orders"),
    count(`SELECT COUNT(*) AS c FROM orders WHERE status IN ${paidStatuses}`),
    count("SELECT COUNT(*) AS c FROM orders WHERE status = 'awaiting_review'"),
    count(`SELECT COALESCE(SUM(grand_total), 0) AS c FROM orders WHERE status IN ${paidStatuses}`),
    count(`SELECT COALESCE(SUM(grand_total), 0) AS c FROM orders WHERE status IN ${paidStatuses} AND date(created_at) = date('now')`),
    count("SELECT COUNT(*) AS c FROM users WHERE role = 'customer'"),
    count("SELECT COUNT(*) AS c FROM products WHERE is_active = 1"),
    count("SELECT COUNT(*) AS c FROM products WHERE is_active = 1 AND stock <= 2"),
    count("SELECT COUNT(*) AS c FROM blog_comments WHERE status = 'pending'"),
    count("SELECT COUNT(*) AS c FROM reviews WHERE status = 'pending'"),
  ]);

  return {
    orderCount,
    paidOrderCount,
    pendingReviewCount,
    revenue,
    todayRevenue,
    customerCount,
    productCount,
    lowStockCount,
    pendingCommentCount,
    pendingReviewsCount,
    revenueByDay: revenueRows.map((row) => ({
      day: row.day,
      revenue: Number(row.revenue),
      orders: Number(row.orders),
    })),
  };
}
