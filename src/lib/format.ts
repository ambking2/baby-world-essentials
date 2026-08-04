/** ابزارهای قالب‌بندی فارسی: قیمت، ارقام، تاریخ شمسی و شمارش معکوس. */

export const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"] as const;

export function toFaDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (digit) => FA_DIGITS[Number(digit)] ?? digit);
}

export function toEnDigits(value: string): string {
  return value
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

/** ۴۹۰۰۰۰۰ → "۴۹۰٬۰۰۰ تومان" */
export function formatToman(amount: number, withUnit = true): string {
  const rounded = Math.max(0, Math.round(amount));
  const grouped = rounded.toLocaleString("fa-IR");
  return withUnit ? `${grouped} تومان` : grouped;
}

/** برای محصولاتی که قیمت مشخص ندارند. */
export function formatPriceLabel(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || amount <= 0) return "تماس برای استعلام";
  return formatToman(amount);
}

export function discountPercent(price: number, effective: number): number {
  if (price <= 0 || effective >= price) return 0;
  return Math.round(((price - effective) / price) * 100);
}

/* ------------------------------------------------------------------ */
/* تاریخ شمسی                                                        */
/* ------------------------------------------------------------------ */

export function toDate(value: string | number | Date | null | undefined): Date | null {
  if (value === null || value === undefined) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

const jalaliDate = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const jalaliDateTime = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatJalali(value: string | number | Date | null | undefined): string {
  const date = toDate(value);
  return date ? jalaliDate.format(date) : "—";
}

export function formatJalaliTime(value: string | number | Date | null | undefined): string {
  const date = toDate(value);
  return date ? jalaliDateTime.format(date) : "—";
}

/** "۳ روز پیش" */
export function timeAgo(value: string | number | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return "—";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "لحطاتی پیش";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${toFaDigits(minutes)} دقیقه پیش`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${toFaDigits(hours)} ساعت پیش`;
  const days = Math.floor(hours / 24);
  if (days < 31) return `${toFaDigits(days)} روز پیش`;
  return formatJalali(date);
}

/* ------------------------------------------------------------------ */
/* شمارش معکوس تخفیف                                              */
/* ------------------------------------------------------------------ */

export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  finished: boolean;
};

export function countdownParts(endsAt: string | Date | null | undefined): CountdownParts {
  const target = toDate(endsAt);
  const remaining = target ? target.getTime() - Date.now() : 0;
  if (!target || remaining <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, finished: true };
  }
  const totalSeconds = Math.floor(remaining / 1000);
  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    finished: false,
  };
}

/* ------------------------------------------------------------------ */
/* متن و ورودی‌ها                                                    */
/* ------------------------------------------------------------------ */

export function slugify(value: string): string {
  return toEnDigits(value)
    .trim()
    .toLowerCase()
    .replace(/[\s\u200c]+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06FF-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeMobile(value: string): string {
  const digits = toEnDigits(value).replace(/[^0-9+]/g, "");
  if (digits.startsWith("+98")) return `0${digits.slice(3)}`;
  if (digits.startsWith("0098")) return `0${digits.slice(4)}`;
  if (digits.startsWith("98") && digits.length === 12) return `0${digits.slice(2)}`;
  return digits;
}

export function isValidMobile(value: string): boolean {
  return /^09\d{9}$/.test(normalizeMobile(value));
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export function formatRating(sum: number, count: number): string {
  if (count <= 0) return "بدون امتیاز";
  return toFaDigits((sum / count).toFixed(1));
}

export function formatCount(value: number): string {
  return toFaDigits(value.toLocaleString("fa-IR"));
}

/** "6037997712345678" → "۶۰۳۷-۹۹۷۷-۱۲۳۴-۵۶۷۸" */
export function formatCardNumber(value: string): string {
  const digits = toEnDigits(value).replace(/\D/g, "");
  return toFaDigits(digits.replace(/(\d{4})(?=\d)/g, "$1-"));
}
