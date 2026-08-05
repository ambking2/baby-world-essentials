/* داده‌های نمونهٔ فروشگاه جهان کودک — برای اجرای اسکریپت seed */

export type SeedCategory = {
  slug: string;
  title: string;
  blurb: string;
  image: string;
  kind?: "general" | "clothing";
  children?: Array<SeedCategory>;
};

export const CATEGORIES: Array<SeedCategory> = [
  {
    slug: "servis-khab",
    title: "سرویس خواب نوزاد",
    blurb: "تخت، دراور و کمد با چوب سالم و رنگ بی‌بو",
    image: "/assets/images/nursery-1.jpg",
    children: [
      {
        slug: "takht-nozad",
        title: "تخت و گهواره",
        blurb: "تخت‌های ایمن با ارتفاع قابل تنظیم",
        image: "/assets/images/nursery-1.jpg",
      },
      {
        slug: "draver",
        title: "دراور و کمد",
        blurb: "دراور با ریل آرام‌بند و سطح تعویض پوشک",
        image: "/assets/images/nursery-2.jpg",
      },
    ],
  },
  {
    slug: "lebas",
    title: "لباس نوزاد و کودک",
    blurb: "پنبهٔ نرم، دوخت تمیز، سایزبندی دقیق",
    image: "/assets/images/nursery-3.jpg",
    kind: "clothing",
    children: [
      {
        slug: "lebas-dokhtaraneh",
        title: "لباس دخترانه",
        blurb: "ست و سرهمی دخترانه",
        image: "/assets/images/nursery-3.jpg",
        kind: "clothing",
      },
      {
        slug: "lebas-pesaraneh",
        title: "لباس پسرانه",
        blurb: "ست و پیراهن پسرانه",
        image: "/assets/images/nursery-3.jpg",
        kind: "clothing",
      },
      {
        slug: "sarhami-khab",
        title: "سرهمی و لباس خواب",
        blurb: "سرهمی راحت برای خواب شب",
        image: "/assets/images/nursery-3.jpg",
        kind: "clothing",
      },
    ],
  },
  {
    slug: "kalaskeh",
    title: "کالسکه و کریر",
    blurb: "کالسکه سبک شهری و صندلی خودرو استاندارد",
    image: "/assets/images/nursery-4.jpg",
  },
  {
    slug: "shirdehi",
    title: "شیردهی و تغذیه",
    blurb: "شیردوش، بطری و لوازم استریل",
    image: "/assets/images/nursery-5.jpg",
  },
  {
    slug: "asbab-bazi",
    title: "اسباب‌بازی و آموزشی",
    blurb: "اسباب‌بازی چوبی و تشک بازی",
    image: "/assets/images/nursery-6.jpg",
  },
  {
    slug: "dekor",
    title: "دکور اتاق کودک",
    blurb: "آباژور، سرویس روتختی و تزئینات",
    image: "/assets/images/nursery-7.jpg",
  },
];

export const SIZES = ["۰ تا ۳ ماه", "۳ تا ۶ ماه", "۶ تا ۹ ماه", "۹ تا ۱۲ ماه", "۱۲ تا ۱۸ ماه"] as const;

export type SeedVariant = {
  size?: string | null;
  color?: string | null;
  colorHex?: string | null;
  priceDelta?: number;
  stock?: number;
};

/** برای محصولات پوشاک: ترکیب هر رنگ با همهٔ سایزها */
export function clothingVariants(
  colors: Array<{ color: string; hex: string }>,
  perSize = 6,
): Array<SeedVariant> {
  const variants: Array<SeedVariant> = [];
  for (const item of colors) {
    for (const size of SIZES) {
      variants.push({ size, color: item.color, colorHex: item.hex, priceDelta: 0, stock: perSize });
    }
  }
  return variants;
}

export type SeedProduct = {
  code: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  price: number;
  discountPercent?: number;
  salePercent?: number;
  saleDays?: number;
  stock: number;
  weightGrams?: number;
  isFeatured?: boolean;
  madeInWorkshop?: boolean;
  badge?: string | null;
  soldCount?: number;
  images: Array<string>;
  attributes: Array<{ name: string; value: string }>;
  variants?: Array<SeedVariant>;
};

const BODY_COLORS = [
  { color: "سفید", hex: "#f7f5f1" },
  { color: "صورتی", hex: "#f2c0c8" },
  { color: "آبی روشن", hex: "#bcd7e8" },
];

export const PRODUCTS: Array<SeedProduct> = [
  {
    code: "JK-1001",
    slug: "crib-oak-arta",
    title: "تخت نوزاد چوب راش مدل آرتا",
    subtitle: "ارتفاع تشک سه حالته، رنگ بی‌بو",
    description:
      "تخت آرتا از چوب راش خشک‌شده ساخته می‌شود و بدنهٔ آن با رنگ پایه‌آب و بی‌بو پوشش داده شده است. فاصلهٔ میله‌ها استاندارد است و ارتفاع تشک در سه حالت تنظیم می‌شود تا با رشد نوزاد هماهنگ بماند. یک طرف تخت قابل برداشتن است و می‌توانید آن را کنار تخت بزرگسال قرار دهید.",
    category: "takht-nozad",
    price: 18_500_000,
    stock: 6,
    weightGrams: 24_000,
    isFeatured: true,
    madeInWorkshop: true,
    badge: "ساخت کارگاه خودمان",
    soldCount: 41,
    images: ["/assets/images/nursery-1.jpg", "/assets/images/nursery-7.jpg"],
    attributes: [
      { name: "جنس بدنه", value: "چوب راش خشک‌شده" },
      { name: "اندازه تشک", value: "۷۰ × ۱۳۰ سانتی‌متر" },
      { name: "تنظیم ارتفاع", value: "سه حالت" },
      { name: "گارانتی سازه", value: "۱۸ ماه" },
    ],
  },
  {
    code: "JK-1002",
    slug: "dresser-white-noel",
    title: "دراور سفید مدل نوئل با سطح تعویض پوشک",
    subtitle: "چهار کشو با ریل آرام‌بند",
    description:
      "دراور نوئل چهار کشوی جادار با ریل آرام‌بند دارد و سطح بالای آن برای تعویض پوشک لبهٔ محافظ دارد. بدنه از ام‌دی‌اف ضدرطوبت با روکش سفید مات است و گوشه‌ها گرد شده‌اند.",
    category: "draver",
    price: 14_900_000,
    stock: 5,
    weightGrams: 32_000,
    isFeatured: true,
    madeInWorkshop: true,
    soldCount: 33,
    images: ["/assets/images/nursery-2.jpg", "/assets/images/nursery-8.jpg"],
    attributes: [
      { name: "تعداد کشو", value: "۴ کشو" },
      { name: "جنس", value: "ام‌دی‌اف ضدرطوبت" },
      { name: "ابعاد", value: "۹۰ × ۴۵ × ۹۵ سانتی‌متر" },
    ],
  },
  {
    code: "JK-1003",
    slug: "crib-side-mama",
    title: "گهواره کنار تخت مادر مدل ماما",
    subtitle: "قابل اتصال به تخت بزرگسال",
    description:
      "گهواره ماما با پایهٔ چرخ‌دار و ترمز، کنار تخت مادر قرار می‌گیرد و شیردهی شبانه را آسان می‌کند. بدنه توری و تنفسی است و ارتفاع آن با تخت شما هم‌سطح می‌شود.",
    category: "takht-nozad",
    price: 9_800_000,
    salePercent: 15,
    saleDays: 5,
    stock: 9,
    weightGrams: 11_000,
    isFeatured: true,
    soldCount: 58,
    images: ["/assets/images/nursery-1.jpg"],
    attributes: [
      { name: "قابلیت", value: "اتصال به تخت بزرگسال" },
      { name: "وزن", value: "۱۱ کیلوگرم" },
    ],
  },
  {
    code: "JK-2011",
    slug: "stroller-lite-b7",
    title: "کالسکه سبک شهری مدل لایت B7",
    subtitle: "تاشو یک‌دستی، وزن ۶.۵ کیلوگرم",
    description:
      "کالسکه لایت B7 برای رفت‌وآمد شهری طراحی شده است؛ با یک دست تا می‌شود و در صندوق عقب خودروهای کوچک جا می‌گیرد. پشتی چهار حالته و سایبان بزرگ با پوشش ضدآفتاب دارد.",
    category: "kalaskeh",
    price: 12_400_000,
    discountPercent: 8,
    stock: 12,
    weightGrams: 6_500,
    isFeatured: true,
    soldCount: 76,
    images: ["/assets/images/nursery-4.jpg"],
    attributes: [
      { name: "وزن", value: "۶.۵ کیلوگرم" },
      { name: "تحمل وزن", value: "تا ۲۲ کیلوگرم" },
      { name: "حالت پشتی", value: "۴ حالت" },
    ],
  },
  {
    code: "JK-2012",
    slug: "car-seat-safe-i7",
    title: "صندلی خودرو نوزاد مدل سیف i7",
    subtitle: "مناسب ۰ تا ۱۳ کیلوگرم",
    description:
      "صندلی خودرو سیف i7 با کمربند پنج‌نقطه و بالشتک محافظ سر، برای نوزاد تا ۱۳ کیلوگرم مناسب است. روکش آن قابل شست‌وشو است و دستهٔ حمل دارد.",
    category: "kalaskeh",
    price: 8_600_000,
    stock: 10,
    weightGrams: 4_200,
    soldCount: 44,
    images: ["/assets/images/nursery-4.jpg"],
    attributes: [
      { name: "محدودهٔ وزن", value: "۰ تا ۱۳ کیلوگرم" },
      { name: "کمربند", value: "پنج‌نقطه" },
    ],
  },
  {
    code: "JK-3040",
    slug: "clothes-set-5",
    title: "ست پنج‌تکه نوزاد پنبه‌ای",
    subtitle: "بادی، شلوار، کلاه، دستکش و پاپوش",
    description:
      "ست پنج‌تکه از پنبهٔ ۱۰۰ درصد با دوخت تخت و بدون درز آزاردهنده. رنگ‌ها ثابت هستند و پس از چند بار شست‌وشو تغییر نمی‌کنند. سایز را از جدول انتخاب کنید.",
    category: "lebas",
    price: 1_450_000,
    stock: 0,
    weightGrams: 400,
    isFeatured: true,
    soldCount: 132,
    images: ["/assets/images/nursery-3.jpg"],
    attributes: [
      { name: "جنس", value: "پنبهٔ ۱۰۰ درصد" },
      { name: "تعداد تکه", value: "۵ تکه" },
    ],
    variants: clothingVariants(BODY_COLORS, 6),
  },
  {
    code: "JK-3041",
    slug: "sleep-play-pajamas",
    title: "سرهمی خواب و بازی",
    subtitle: "زیپ سراسری، پاپوش سرخود",
    description:
      "سرهمی خواب و بازی با زیپ سراسری، تعویض شبانه را ساده می‌کند. پارچهٔ پنبه‌ای نرم و کشسان است و پاپوش سرخود دارد تا پای نوزاد گرم بماند.",
    category: "sarhami-khab",
    price: 980_000,
    salePercent: 20,
    saleDays: 3,
    stock: 0,
    weightGrams: 260,
    isFeatured: true,
    badge: "پرفروش",
    soldCount: 189,
    images: ["/assets/images/nursery-3.jpg"],
    attributes: [
      { name: "جنس", value: "پنبه و الاستان" },
      { name: "نوع بسته‌شدن", value: "زیپ سراسری" },
    ],
    variants: clothingVariants(BODY_COLORS, 8),
  },
  {
    code: "JK-3042",
    slug: "boy-shirt-pants-set",
    title: "ست پیراهن و شلوار پسرانه",
    subtitle: "مناسب مهمانی و عکس یادگاری",
    description:
      "ست پیراهن و شلوار پسرانه با پارچهٔ نخی خنک و دوخت تمیز؛ برای مهمانی و عکس یادگاری مناسب است. دکمه‌ها محکم دوخته شده‌اند.",
    category: "lebas-pesaraneh",
    price: 1_180_000,
    stock: 0,
    weightGrams: 320,
    soldCount: 64,
    images: ["/assets/images/nursery-3.jpg"],
    attributes: [{ name: "جنس", value: "نخ پنبه" }],
    variants: clothingVariants(
      [
        { color: "سرمه‌ای", hex: "#26334d" },
        { color: "طوسی", hex: "#9aa0a6" },
      ],
      5,
    ),
  },
  {
    code: "JK-4055",
    slug: "toy-wood-set",
    title: "ست اسباب‌بازی چوبی حسی",
    subtitle: "رنگ خوراکی و بدون گوشهٔ تیز",
    description:
      "ست اسباب‌بازی چوبی با رنگ خوراکی و لبه‌های گرد؛ برای تقویت مهارت حسی و حرکتی نوزاد از شش ماهگی مناسب است.",
    category: "asbab-bazi",
    price: 890_000,
    stock: 18,
    weightGrams: 700,
    soldCount: 97,
    images: ["/assets/images/nursery-6.jpg"],
    attributes: [
      { name: "جنس", value: "چوب طبیعی" },
      { name: "ردهٔ سنی", value: "از ۶ ماه" },
    ],
  },
  {
    code: "JK-4056",
    slug: "activity-gym-mat",
    title: "تشک بازی و جیم فعالیت نوزاد",
    subtitle: "قوس آویز با آویزهای صدادار",
    description:
      "تشک بازی با روکش قابل شست‌وشو و دو قوس آویز که آویزهای صدادار روی آن نصب می‌شود. کف تشک ضدلغزش است.",
    category: "asbab-bazi",
    price: 1_650_000,
    discountPercent: 10,
    stock: 14,
    weightGrams: 1_800,
    soldCount: 71,
    images: ["/assets/images/nursery-6.jpg"],
    attributes: [{ name: "ابعاد", value: "۱۰۰ × ۱۰۰ سانتی‌متر" }],
  },
  {
    code: "JK-5072",
    slug: "feeding-kit",
    title: "ست تغذیه و بطری نوزاد",
    subtitle: "بدون بیس‌فنول، مقاوم به حرارت",
    description:
      "ست تغذیه شامل دو بطری با سرشیشهٔ سیلیکونی، برس شست‌وشو و جای بطری. مواد اولیه بدون بیس‌فنول و مقاوم به آب‌جوش است.",
    category: "shirdehi",
    price: 1_250_000,
    stock: 22,
    weightGrams: 600,
    soldCount: 88,
    images: ["/assets/images/nursery-5.jpg"],
    attributes: [{ name: "جنس", value: "پلی‌پروپیلن و سیلیکون" }],
  },
  {
    code: "JK-5073",
    slug: "breast-pump-soft",
    title: "شیردوش برقی آرام",
    subtitle: "دو حالت مکش، کم‌صدا",
    description:
      "شیردوش برقی با دو حالت تحریک و مکش، سطح مکش قابل تنظیم و کارکرد کم‌صدا. قطعات در تماس با شیر بدون بیس‌فنول هستند.",
    category: "shirdehi",
    price: 3_400_000,
    stock: 9,
    weightGrams: 900,
    soldCount: 52,
    images: ["/assets/images/nursery-5.jpg"],
    attributes: [
      { name: "منبع تغذیه", value: "برق و باتری شارژی" },
      { name: "حالت مکش", value: "۲ حالت" },
    ],
  },
  {
    code: "JK-6081",
    slug: "nursery-lamp-cloud",
    title: "آباژور اتاق کودک مدل ابر",
    subtitle: "نور گرم و کم‌آزار برای شب",
    description:
      "آباژور ابری با نور گرم و شدت قابل تنظیم؛ برای شیردهی شبانه بدون بیدارکردن کامل نوزاد مناسب است.",
    category: "dekor",
    price: 740_000,
    stock: 25,
    weightGrams: 500,
    soldCount: 63,
    images: ["/assets/images/nursery-7.jpg"],
    attributes: [{ name: "نوع لامپ", value: "ال‌ای‌دی نور گرم" }],
  },
  {
    code: "JK-6082",
    slug: "nursery-bedding-set",
    title: "سرویس روتختی نوزاد سه‌تکه",
    subtitle: "ملحفه کشدار، روبالشی و محافظ دور تخت",
    description:
      "سرویس روتختی سه‌تکه با پارچهٔ پنبه‌ای نرم؛ ملحفه کشدار روی تشک ثابت می‌ماند و محافظ دور تخت از برخورد دست و پا جلوگیری می‌کند.",
    category: "dekor",
    price: 1_980_000,
    stock: 16,
    weightGrams: 1_400,
    soldCount: 49,
    images: ["/assets/images/nursery-7.jpg", "/assets/images/nursery-1.jpg"],
    attributes: [
      { name: "تعداد تکه", value: "۳ تکه" },
      { name: "جنس", value: "پنبه" },
    ],
  },
];

export type SeedPost = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover: string;
  tag: string;
  daysAgo: number;
};

export const POSTS: Array<SeedPost> = [
  {
    slug: "chek-list-sismoni",
    title: "چک‌لیست کامل خرید سیسمونی نوزاد",
    excerpt: "فهرست اقلام ضروری، اقلامی که می‌توانید بعداً بخرید و چیزهایی که لازم نیستند.",
    body: "خرید سیسمونی وقتی بدون فهرست شروع شود، هم پرهزینه می‌شود و هم بخشی از وسایل بی‌استفاده می‌ماند.\n\nاقلام ضروری ماه اول: تخت یا گهواره، تشک با روکش قابل شست‌وشو، شش عدد بادی پنبه‌ای، پنج سرهمی، حوله کلاه‌دار، پوشک و دستمال، وسایل شیردهی.\n\nاقلامی که می‌توانید بعد از ماه دوم بخرید: تشک بازی، اسباب‌بازی حسی، صندلی غذا و واکر ثابت.\n\nپیشنهاد ما این است که ابتدا اقلام ضروری را با کیفیت بخرید و برای بقیه صبر کنید؛ سلیقهٔ شما بعد از یک ماه زندگی با نوزاد دقیق‌تر می‌شود.",
    cover: "/assets/images/nursery-3.jpg",
    tag: "راهنمای خرید",
    daysAgo: 3,
  },
  {
    slug: "entekhab-takht-nozad",
    title: "چگونه تخت نوزاد ایمن انتخاب کنیم؟",
    excerpt: "فاصلهٔ میله‌ها، جنس رنگ، پایداری بدنه و اندازهٔ تشک؛ چهار نکته‌ای که باید بررسی کنید.",
    body: "فاصلهٔ میله‌ها باید بین ۴.۵ تا ۶.۵ سانتی‌متر باشد تا سر نوزاد گیر نکند.\n\nرنگ بدنه باید پایه‌آب و بی‌بو باشد؛ بوی تند رنگ نشانهٔ حل‌شوندهٔ صنعتی است.\n\nبدنه را با دست تکان دهید؛ لقی در اتصال‌ها یعنی پیچ و قطعات استاندارد نیستند.\n\nتشک باید کاملاً اندازهٔ کف تخت باشد و بیش از دو انگشت فاصله نداشته باشد.",
    cover: "/assets/images/nursery-1.jpg",
    tag: "ایمنی",
    daysAgo: 9,
  },
  {
    slug: "shostan-lebas-nozad",
    title: "شست‌وشوی لباس نوزاد؛ اصول ساده و مهم",
    excerpt: "دمای آب، شویندهٔ مناسب و نکاتی برای حفظ نرمی پارچه.",
    body: "لباس نوزاد را قبل از اولین استفاده بشویید تا پرزها و مواد کارخانه پاک شود.\n\nاز شویندهٔ بدون عطر و بدون سفیدکننده استفاده کنید و آب را روی ۳۰ تا ۴۰ درجه بگذارید.\n\nنرم‌کننده را کم مصرف کنید؛ باقی‌ماندهٔ آن روی پوست حساس نوزاد واکنش ایجاد می‌کند.\n\nلباس‌ها را در سایه خشک کنید تا رنگ‌شان ثابت بماند.",
    cover: "/assets/images/nursery-3.jpg",
    tag: "نگهداری",
    daysAgo: 15,
  },
  {
    slug: "kalaskeh-monaseb-shahr",
    title: "کالسکهٔ مناسب شهر شما کدام است؟",
    excerpt: "وزن، اندازهٔ تاشو، چرخ و مسیرهای روزانه را با هم بسنجید.",
    body: "اگر روزانه از پله یا آسانسور کوچک استفاده می‌کنید، کالسکهٔ زیر هفت کیلوگرم انتخاب بهتری است.\n\nبرای پیاده‌روهای ناهموار، چرخ بزرگ‌تر با کمک‌فنر راحت‌تر است.\n\nاندازهٔ تاشو را با صندوق خودرو بسنجید؛ بسیاری از خریدها به همین دلیل تغییر می‌کند.\n\nپیش از خرید، حتماً در فروشگاه یک بار کالسکه را باز و بسته کنید.",
    cover: "/assets/images/nursery-4.jpg",
    tag: "راهنمای خرید",
    daysAgo: 21,
  },
  {
    slug: "dekor-otagh-koodak",
    title: "دکور اتاق کودک با بودجهٔ محدود",
    excerpt: "با چند تغییر کوچک، اتاق نوزاد را آرام و دلنشین کنید.",
    body: "رنگ دیوار روشن و مات، فضا را بزرگ‌تر نشان می‌دهد و نور را پخش می‌کند.\n\nنور شب گرم و کم‌شدت بگذارید؛ نور سفید خواب نوزاد را به هم می‌زند.\n\nقفسهٔ کم‌ارتفاع برای اسباب‌بازی، عادت جمع‌کردن را از سال دوم آسان می‌کند.\n\nپارچه‌های دور تخت را ساده انتخاب کنید تا گردوغبار کمتری جمع شود.",
    cover: "/assets/images/nursery-7.jpg",
    tag: "دکور",
    daysAgo: 30,
  },
  {
    slug: "garanti-va-khadamat",
    title: "گارانتی سازه و خدمات پس از فروش ما",
    excerpt: "چه چیزهایی شامل گارانتی می‌شود و مراحل درخواست خدمات چگونه است.",
    body: "گارانتی سازهٔ محصولات چوبی کارگاه ما هجده ماه است و شامل اتصالات، ریل کشو و پایداری بدنه می‌شود.\n\nخط و خش سطحی و آسیب ناشی از رطوبت یا ضربه شامل گارانتی نیست.\n\nبرای درخواست خدمات، کد سفارش و یک عکس از قطعه را برای ما ارسال کنید.\n\nدر ابهر و شهرهای اطراف، بازدید کارشناس در محل انجام می‌شود.",
    cover: "/assets/images/nursery-2.jpg",
    tag: "خدمات",
    daysAgo: 42,
  },
];
