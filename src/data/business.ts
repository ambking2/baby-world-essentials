/**
 * اطلاعات واقعی کسب‌وکار.
 *
 * مواردی که با TODO(client) علامت خورده‌اند باید توسط مدیر فروشگاه تأیید یا اصلاح شوند.
 */
export const business = {
  name: "سیسمونی جهان کودک",
  shortName: "جهان کودک",
  tagline: "همه‌ی سیسمونی نوزاد، با انتخاب آسوده و قیمت منصفانه",
  manager: "آقای عسگری",

  city: "ابهر",
  province: "زنجان",
  addressLine: "ابهر، خیابان طالقانی، روبه‌روی بانک ملت، پلاک ۱۴۲", // TODO(client)
  geo: { lat: 36.1469, lng: 49.2181 }, // TODO(client)

  phoneDisplay: "024-3522-3344", // TODO(client)
  phoneHref: "tel:+982435223344",
  phoneE164: "+982435223344",
  supportEmail: "info@jahankoodak.ir",

  instagramHandle: "jahankoodak.abhar", // TODO(client)
  instagramHref: "https://instagram.com/jahankoodak.abhar",

  siteUrl: "https://jahankoodak.ir",
  ogImage: "https://jahankoodak.ir/og.jpg",

  hoursFull: "شنبه تا پنجشنبه ۹ تا ۲۱ • جمعه ۱۰ تا ۱۴",
  hoursShort: "۹ تا ۲۱",
  openingHoursSchema: ["Sa-Th 09:00-21:00", "Fr 10:00-14:00"],

  foundedJalali: 1389,
  currentJalali: 1404,

  structureWarrantyMonths: 18, // TODO(client)
  customBuildDays: "۲۰ تا ۳۰ روز کاری",
  returnWindowDays: 7,

  freeShippingThreshold: 5_000_000,
  shippingFlatFee: 180_000,
  localCities: ["ابهر", "خرمدره", "صائین‌قلعه"],

  cardNumber: "6037-9977-1234-5678", // TODO(client)
  cardHolder: "محمد عسگری", // TODO(client)
  cardBank: "بانک ملی ایران", // TODO(client)
} as const;

/** سابقه‌ی فعالیت به سال — برای نمایش در صفحات مختلف. */
export const yearsInBusiness = business.currentJalali - business.foundedJalali;

export const serviceAreas = [
  {
    title: "فروشگاه مرکزی ابهر",
    detail: "حضوری، با مشاوره‌ی رایگان خرید سیسمونی",
  },
  {
    title: "ارسال روزانه به خرمدره و صائین‌قلعه",
    detail: "تحویل دربست، پرداخت در محل هم ممکن است",
  },
  {
    title: "ارسال به سراسر ایران",
    detail: "با باربری و پست پیشتاز، بسته‌بندی ایمن",
  },
] as const;
