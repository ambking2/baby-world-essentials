import { business } from "@/data/business";

/**
 * ارسال ایمیل.
 *
 * پیش‌فرض روی حالت لاگ است: کد تأیید در کنسول سرور چاپ می‌شود تا بدون
 * هیچ سرویس پولی هم کل جریان ثبت‌نام قابل تست باشد.
 *
 * برای ارسال واقعی کافی است متغیرهای محیطی زیر در فایل .env قرار گیرند:
 *
 *   MAIL_PROVIDER=resend        یا brevo
 *   MAIL_API_KEY=...
 *   MAIL_FROM="جهان کودک <no-reply@jahankoodak.ir>"
 *
 * هر دو سرویس Resend و Brevo طرح رایگان دارند.
 */

export type MailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

function env(key: string): string | undefined {
  const value = process.env[key];
  return value && value.length > 0 ? value : undefined;
}

function fromAddress(): string {
  return env("MAIL_FROM") ?? `${business.name} <no-reply@jahankoodak.ir>`;
}

async function sendViaResend(message: MailMessage, apiKey: string): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: fromAddress(),
      to: [message.to],
      subject: message.subject,
      html: message.html,
      text: message.text,
    }),
  });
  if (!response.ok) throw new Error(`ارسال ایمیل ناموفق بود (${response.status})`);
}

async function sendViaBrevo(message: MailMessage, apiKey: string): Promise<void> {
  const raw = fromAddress();
  const match = /^(.*)<(.+)>$/.exec(raw);
  const senderName = match?.[1]?.trim() ?? business.name;
  const senderEmail = match?.[2]?.trim() ?? raw;

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "content-type": "application/json" },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: message.to }],
      subject: message.subject,
      htmlContent: message.html,
      textContent: message.text,
    }),
  });
  if (!response.ok) throw new Error(`ارسال ایمیل ناموفق بود (${response.status})`);
}

export async function sendMail(message: MailMessage): Promise<void> {
  const provider = env("MAIL_PROVIDER");
  const apiKey = env("MAIL_API_KEY");

  if (!provider || !apiKey) {
    console.info(
      `\n[ایمیل شبیه‌سازی‌شده] به: ${message.to}\nموضوع: ${message.subject}\n${message.text}\n`,
    );
    return;
  }
  if (provider === "resend") return sendViaResend(message, apiKey);
  if (provider === "brevo") return sendViaBrevo(message, apiKey);
  throw new Error(`سرویس ایمیل ناشناخته: ${provider}`);
}

function wrap(title: string, bodyHtml: string): string {
  return `<!doctype html><html lang="fa" dir="rtl"><body style="margin:0;background:#faf7f4;font-family:Tahoma,Arial,sans-serif">
<div style="max-width:520px;margin:24px auto;background:#fff;border-radius:16px;padding:28px;color:#3b2f28">
<h1 style="margin:0 0 16px;font-size:18px">${title}</h1>
${bodyHtml}
<hr style="border:none;border-top:1px solid #eee;margin:24px 0">
<p style="margin:0;font-size:12px;color:#8a7a6e">${business.name} • ${business.city} • ${business.phoneDisplay}</p>
</div></body></html>`;
}

export function verificationEmail(to: string, code: string): MailMessage {
  return {
    to,
    subject: `کد تأیید حساب — ${business.name}`,
    text: `کد تأیید شما: ${code}\nاین کد ۱۵ دقیقه اعتبار دارد.`,
    html: wrap(
      "تأیید نشانی ایمیل",
      `<p style="margin:0 0 12px;font-size:14px">کد زیر را در سایت وارد کنید:</p>
       <p style="font-size:30px;letter-spacing:8px;font-weight:700;text-align:center;background:#f6efe9;border-radius:12px;padding:14px;margin:0">${code}</p>
       <p style="margin:14px 0 0;font-size:12px;color:#8a7a6e">این کد ۱۵ دقیقه اعتبار دارد.</p>`,
    ),
  };
}

export function resetPasswordEmail(to: string, code: string): MailMessage {
  return {
    to,
    subject: `بازیابی رمز عبور — ${business.name}`,
    text: `کد بازیابی رمز: ${code}\nاین کد ۱۵ دقیقه اعتبار دارد.`,
    html: wrap(
      "بازیابی رمز عبور",
      `<p style="margin:0 0 12px;font-size:14px">برای تعیین رمز جدید کد زیر را وارد کنید:</p>
       <p style="font-size:30px;letter-spacing:8px;font-weight:700;text-align:center;background:#f6efe9;border-radius:12px;padding:14px;margin:0">${code}</p>`,
    ),
  };
}

export function orderReceivedEmail(to: string, orderCode: string, total: string): MailMessage {
  return {
    to,
    subject: `سفارش ${orderCode} ثبت شد — ${business.name}`,
    text: `سفارش شما با کد ${orderCode} ثبت شد. مبلغ: ${total} تومان.`,
    html: wrap(
      "سفارش شما ثبت شد",
      `<p style="margin:0 0 8px;font-size:14px">کد پیگیری: <strong>${orderCode}</strong></p>
       <p style="margin:0 0 8px;font-size:14px">مبلغ کل: <strong>${total} تومان</strong></p>
       <p style="margin:12px 0 0;font-size:13px;color:#8a7a6e">پس از بررسی پرداخت، وضعیت سفارش برای شما به‌روز می‌شود.</p>`,
    ),
  };
}
