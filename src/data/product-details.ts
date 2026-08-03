import furniture from "@/assets/cat-furniture.jpg";
import stroller from "@/assets/cat-stroller.jpg";
import clothing from "@/assets/cat-clothing.jpg";
import toys from "@/assets/cat-toys.jpg";
import feeding from "@/assets/cat-feeding.jpg";
import dresser from "@/assets/cat-dresser.jpg";
import hero from "@/assets/hero-nursery.jpg";
import workshop from "@/assets/workshop.jpg";

import type { ProductDetail } from "@/types/catalog";
import { products } from "@/data/catalog";

type DetailSeed = Omit<ProductDetail, "sku" | "gallery"> & { gallery?: string[] };

const galleryByCategory: Record<string, string[]> = {
  "servis-khab": [furniture, hero, workshop, dresser],
  dekor: [dresser, hero, workshop],
  kalaskeh: [stroller, hero],
  lebas: [clothing, hero],
  "asbab-bazi": [toys, workshop],
  shirdehi: [feeding, hero],
};

const byCategory: Record<string, DetailSeed> = {
  "servis-khab": {
    description: [
      "این سرویس در کارگاه خودمان در ابهر ساخته می‌شود؛ بدنه چوب راش خشک‌شده در کوره با اتصالات پیچ و مهره فلزی، بدون MDF در قاب اصلی.",
      "رنگ‌کاری با پوشش پایه آب مخصوص کودک انجام می‌شود؛ بدون بو و مقاوم در برابر شست‌وشو با دستمال مرطوب. ابعاد و رنگ را می‌توانید سفارشی بدهید.",
      "تحویل به‌صورت مونتاژشده در ابهر و زنجان، و بسته‌بندی چوبی برای ارسال به سایر شهرها. نصب در محل برای مشتریان ابهر رایگان است.",
    ],
    specs: [
      { label: "جنس بدنه", value: "چوب راش خشک‌شده" },
      { label: "ابعاد تخت", value: "۱۳۰ × ۷۰ سانتی‌متر" },
      { label: "ارتفاع کفی", value: "سه حالت قابل تنظیم" },
      { label: "رنگ", value: "طبیعی، سفید، گردویی" },
      { label: "محل ساخت", value: "کارگاه جهان کودک، ابهر" },
      { label: "گارانتی", value: "۱۸ ماه گارانتی چوب و اتصالات" },
      { label: "زمان تحویل", value: "۱۰ تا ۱۴ روز کاری" },
    ],
    highlights: [
      "چوب راش با اتصالات پیچ و مهره، بدون چسب‌کاری در قاب اصلی",
      "کفی سه‌حالته برای نوزاد تا کودک دو ساله",
      "امکان سفارش ابعاد و رنگ دلخواه",
    ],
  },
  dekor: {
    description: [
      "ساخت کارگاه خودمان در ابهر، بدنه چوب راش و روکش نئوپان ضدآب در سطوح داخلی. ریل کشوها آرام‌بند است و تا انتها بیرون می‌آید.",
      "لبه‌ها گرد و پرداخت‌شده‌اند تا برای اتاق کودک ایمن باشد. رنگ‌کاری پایه آب و بدون بو انجام می‌شود.",
    ],
    specs: [
      { label: "جنس بدنه", value: "چوب راش و نئوپان ضدآب" },
      { label: "ریل کشو", value: "آرام‌بند، تمام‌بازشو" },
      { label: "رنگ", value: "سفید، طبیعی" },
      { label: "محل ساخت", value: "کارگاه جهان کودک، ابهر" },
      { label: "گارانتی", value: "۱۸ ماه" },
      { label: "زمان تحویل", value: "۷ تا ۱۰ روز کاری" },
    ],
    highlights: [
      "ریل آرام‌بند روی همه کشوها",
      "لبه‌های گرد و پرداخت‌شده",
      "امکان هماهنگ کردن رنگ با سرویس خواب",
    ],
  },
  kalaskeh: {
    description: [
      "شاسی آلومینیومی سبک با جمع‌شدن تک‌دستی؛ در صندوق عقب پراید و خودروهای هم‌اندازه جا می‌شود.",
      "کمربند پنج‌نقطه‌ای، ترمز پایی روی چرخ عقب و سایه‌بان با پوشش UV. پارچه رویه قابل جدا شدن و شست‌وشو است.",
    ],
    specs: [
      { label: "وزن", value: "۶.۴ کیلوگرم" },
      { label: "تحمل وزن", value: "تا ۲۲ کیلوگرم" },
      { label: "سن مناسب", value: "از بدو تولد تا ۴ سالگی" },
      { label: "نوع تاشو", value: "تک‌دستی، ایستاده" },
      { label: "کمربند", value: "پنج‌نقطه‌ای" },
      { label: "گارانتی", value: "۱۲ ماه گارانتی شرکتی" },
    ],
    highlights: ["جمع‌شدن تک‌دستی", "کمربند ایمنی پنج‌نقطه‌ای", "رویه قابل شست‌وشو"],
  },
  lebas: {
    description: [
      "پارچه نخ پنبه ۱۰۰٪ با دوخت سردوز؛ بعد از شست‌وشو آب نمی‌رود و رنگ پس نمی‌دهد.",
      "دکمه‌های زیرپا برای تعویض سریع پوشک، و برچسب چاپی به‌جای لیبل دوختی تا پوست نوزاد اذیت نشود.",
    ],
    specs: [
      { label: "جنس", value: "نخ پنبه ۱۰۰٪" },
      { label: "سایز", value: "۰ تا ۶ ماه" },
      { label: "تعداد", value: "۵ تکه" },
      { label: "نوع دوخت", value: "سردوز، بدون درز اضافه" },
      { label: "شست‌وشو", value: "ماشین لباسشویی، دمای ۳۰ درجه" },
      { label: "مرجوعی", value: "۷ روز، در صورت باز نشدن بسته" },
    ],
    highlights: ["نخ پنبه ۱۰۰٪", "دکمه زیرپا برای تعویض سریع پوشک", "بدون لیبل دوختی"],
  },
  "asbab-bazi": {
    description: [
      "چوب طبیعی بدون گره با رنگ خوراکی؛ قطعات از استاندارد اندازه برای جلوگیری از بلع بزرگ‌تر هستند.",
      "سطح قطعات سنباده‌خورده و بدون لبه تیز است. مناسب بازی آزاد و تمرین دست‌ورزی.",
    ],
    specs: [
      { label: "جنس", value: "چوب طبیعی، رنگ خوراکی" },
      { label: "سن مناسب", value: "۶ ماه به بالا" },
      { label: "تعداد قطعات", value: "۲۴ قطعه" },
      { label: "بسته‌بندی", value: "جعبه چوبی درب کشویی" },
      { label: "مرجوعی", value: "۷ روز" },
    ],
    highlights: ["رنگ خوراکی و بی‌خطر", "بدون لبه تیز", "جعبه چوبی برای نگهداری"],
  },
  shirdehi: {
    description: [
      "بدنه بدون BPA و مقاوم در برابر حرارت؛ قابل استفاده در استریلایزر و آب‌گرم‌کن.",
      "سرشیشه سیلیکونی با دریچه ضد نفخ. همه قطعات از هم باز می‌شوند و شست‌وشو ساده است.",
    ],
    specs: [
      { label: "جنس", value: "پلی‌پروپیلن بدون BPA" },
      { label: "سن مناسب", value: "از بدو تولد" },
      { label: "قابل استریل", value: "بله، بخار و جوش" },
      { label: "گارانتی", value: "۱۲ ماه" },
      { label: "مرجوعی", value: "۷ روز، در صورت باز نشدن بسته" },
    ],
    highlights: ["بدون BPA", "سرشیشه ضد نفخ", "قابل استریل با بخار"],
  },
};

const faqByCategory: Record<string, { q: string; a: string }[]> = {
  default: [
    {
      q: "پرداخت قسطی چطور انجام می‌شود؟",
      a: "۶ قسط ماهیانه بدون بهره، با چک یا کارت. برای ثبت قسطی کارت ملی و یک شماره تماس ثابت لازم است. ثبت قرارداد حضوری در فروشگاه ابهر یا از طریق ارسال مدارک انجام می‌شود.",
    },
    {
      q: "هزینه ارسال چقدر است؟",
      a: "ارسال در ابهر رایگان است. برای سایر شهرها با باربری و پس‌کرایه ارسال می‌شود. خریدهای بالای ۵٬۰۰۰٬۰۰۰ تومان ارسال رایگان دارند.",
    },
    {
      q: "امکان مرجوع کردن کالا هست؟",
      a: "تا ۷ روز پس از تحویل، در صورتی که کالا استفاده نشده و بسته‌بندی سالم باشد، مرجوعی پذیرفته می‌شود.",
    },
    {
      q: "می‌توانم قبل از خرید کالا را از نزدیک ببینم؟",
      a: "بله. فروشگاه در ابهر، خیابان طالقانی، روبه‌روی بانک ملت، پلاک ۱۴۲، شنبه تا پنجشنبه ۹ تا ۲۱ باز است.",
    },
  ],
  "servis-khab": [
    {
      q: "سفارش ابعاد یا رنگ دلخواه امکان‌پذیر است؟",
      a: "بله. ابعاد و رنگ را در کارگاه سفارشی می‌سازیم. برای سفارش اختصاصی با ۰۲۴-۳۵۲۲-۳۳۴۴ تماس بگیرید؛ اندازه‌گیری اتاق در ابهر رایگان است.",
    },
    {
      q: "نصب در محل انجام می‌شود؟",
      a: "در ابهر و زنجان نصب رایگان است. برای شهرهای دیگر سرویس با راهنمای مونتاژ و ابزار لازم ارسال می‌شود.",
    },
  ],
};

const reviewsByCategory: Record<string, ProductDetail["reviews"]> = {
  default: [
    {
      id: "r1",
      author: "مریم ک.",
      city: "ابهر",
      rating: 5,
      date: "۱۴۰۴/۰۳/۱۲",
      body: "سفارش را چهار روزه تحویل گرفتم. کیفیت با عکس‌ها یکی بود و بسته‌بندی سالم رسید.",
      verified: true,
    },
    {
      id: "r2",
      author: "سعید ر.",
      city: "زنجان",
      rating: 4,
      date: "۱۴۰۴/۰۲/۲۸",
      body: "قیمتش نسبت به بازار منصفانه است. یک ستاره کم کردم چون رنگ کمی روشن‌تر از تصویر بود.",
      verified: true,
    },
    {
      id: "r3",
      author: "فاطمه ن.",
      city: "قزوین",
      rating: 5,
      date: "۱۴۰۴/۰۱/۱۹",
      body: "قسطی خریدم و روند ثبت قرارداد ساده بود. پیگیری ارسال هم تلفنی انجام شد.",
      verified: false,
    },
  ],
  "servis-khab": [
    {
      id: "r1",
      author: "زهرا م.",
      city: "ابهر",
      rating: 5,
      date: "۱۴۰۴/۰۴/۰۲",
      body: "تخت را در کارگاه از نزدیک دیدیم و بعد سفارش دادیم. چوب واقعاً راش است و لق نمی‌زند. نصب هم خودشان انجام دادند.",
      verified: true,
    },
    {
      id: "r2",
      author: "حمید ع.",
      city: "خرمدره",
      rating: 4,
      date: "۱۴۰۴/۰۳/۰۵",
      body: "دو روز دیرتر از قول‌شان آماده شد ولی کیفیت ساخت خوب بود. دراور با تخت کاملاً هم‌رنگ است.",
      verified: true,
    },
    {
      id: "r3",
      author: "نرگس ب.",
      city: "زنجان",
      rating: 5,
      date: "۱۴۰۴/۰۲/۱۴",
      body: "کفی سه‌حالته خیلی به کار می‌آید؛ ماه‌های اول بلند و بعد پایین بردیم.",
      verified: true,
    },
  ],
};

function skuFor(id: string, categorySlug: string): string {
  const prefix = categorySlug.slice(0, 2).toUpperCase();
  return `JK-${prefix}-${id}`;
}

export const productDetails: Record<string, ProductDetail> = Object.fromEntries(
  products.map((p) => {
    const seed = byCategory[p.categorySlug] ?? byCategory["lebas"]!;
    const faqs = [...(faqByCategory[p.categorySlug] ?? []), ...faqByCategory["default"]!];
    return [
      p.slug,
      {
        sku: skuFor(p.id, p.categorySlug),
        gallery: galleryByCategory[p.categorySlug] ?? [p.image],
        description: seed.description,
        specs: seed.specs,
        highlights: seed.highlights,
        faqs,
        reviews: reviewsByCategory[p.categorySlug] ?? reviewsByCategory["default"]!,
      } satisfies ProductDetail,
    ];
  }),
);
