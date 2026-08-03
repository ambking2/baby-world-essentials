const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toFaDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => FA_DIGITS[Number(d)] ?? d);
}

export function formatToman(value: number): string {
  return toFaDigits(value.toLocaleString("en-US").replace(/,/g, "٬"));
}
