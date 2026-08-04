# یادداشت ساخت — فروشگاه جهان کودک

پیاده‌سازی بک‌اند بر پایه‌ی TanStack Start server functions و `node:sqlite` (نیازمند Node 24).

- `src/server/db.ts` — طرحواره‌ی دیتابیس و توابع کمکی
- `src/server/auth.ts` — رمز scrypt، کد تأیید ایمیل، سشن
- `src/server/repo/*` — دسترسی به داده‌ها
- `src/server/seed.ts` — داده‌ی اولیه
