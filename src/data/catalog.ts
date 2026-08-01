import furniture from "@/assets/cat-furniture.jpg";
import stroller from "@/assets/cat-stroller.jpg";
import clothing from "@/assets/cat-clothing.jpg";
import toys from "@/assets/cat-toys.jpg";
import feeding from "@/assets/cat-feeding.jpg";
import dresser from "@/assets/cat-dresser.jpg";

export type Category = {
  slug: string;
  title: string;
  note: string;
  image: string;
};

export const categories: Category[] = [
  {
    slug: "servis-khab",
    title: "سرویس خواب نوزاد",
    note: "تخت، کمد و دراور ست",
    image: furniture,
  },
  { slug: "kalaskeh", title: "کالسکه و کریر", note: "سبک، تاشو و ایمن", image: stroller },
  { slug: "lebas", title: "لباس نوزاد", note: "نخ پنبه، سایز ۰ تا ۲۴ ماه", image: clothing },
  { slug: "asbab-bazi", title: "اسباب‌بازی چوبی", note: "مناسب ۶ ماه به بالا", image: toys },
  { slug: "shirdehi", title: "شیردهی و تغذیه", note: "شیشه شیر، استریلایزر، پیش‌بند", image: feeding },
  { slug: "dekor", title: "دکور اتاق کودک", note: "دراور، تعویض‌کن و قفسه", image: dresser },
];

export type Product = {
  id: string;
  title: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  badge?: string;
  inStock: boolean;
  madeInWorkshop?: boolean;
};

export const featuredProducts: Product[] = [
  {
    id: "crib-oak-arta",
    title: "سرویس خواب چوبی آرتا – تخت و دراور",
    category: "سرویس خواب نوزاد",
    price: 28500000,
    oldPrice: 31900000,
    image: furniture,
    badge: "ساخت کارگاه خودمان",
    inStock: true,
    madeInWorkshop: true,
  },
  {
    id: "dresser-white-noel",
    title: "دراور شش کشو نوئل با تعویض‌کن رویه",
    category: "دکور اتاق کودک",
    price: 12900000,
    image: dresser,
    inStock: true,
    madeInWorkshop: true,
  },
  {
    id: "stroller-lite-b7",
    title: "کالسکه تاشو مدل لایت B7 – وزن ۶.۴ کیلوگرم",
    category: "کالسکه و کریر",
    price: 9450000,
    oldPrice: 10200000,
    image: stroller,
    inStock: true,
  },
  {
    id: "clothes-set-5",
    title: "ست ۵ تکه لباس نوزاد نخ پنبه – سایز ۰ تا ۶ ماه",
    category: "لباس نوزاد",
    price: 1180000,
    image: clothing,
    inStock: true,
  },
  {
    id: "toy-wood-set",
    title: "ست اسباب‌بازی چوبی رنگ‌بندی و شکل",
    category: "اسباب‌بازی چوبی",
    price: 890000,
    image: toys,
    inStock: false,
  },
  {
    id: "feeding-kit",
    title: "پک تغذیه نوزاد: شیشه شیر، استریلایزر و پیش‌بند",
    category: "شیردهی و تغذیه",
    price: 2350000,
    oldPrice: 2600000,
    image: feeding,
    inStock: true,
  },
];
