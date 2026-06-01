import {
  BadgePercent,
  Bike,
  Boxes,
  HandCoins,
  Headphones,
  Leaf,
  PackageCheck,
  ShieldCheck,
  Sprout,
  Tractor,
  Truck,
  Wheat,
} from "lucide-react";

export const marketCategories = [
  "আম",
  "ধান ও চাল",
  "সবজি",
  "ফল",
  "মাছ ও পোল্ট্রি",
  "বীজ",
  "সার ও কীটনাশক",
  "কৃষি যন্ত্র",
  "গরু-ছাগল",
];

export const heroSlides = [
  {
    eyebrow: "রাজশাহী আম সিজন লাইভ",
    title: "রাজশাহী, চাঁপাইনবাবগঞ্জ ও সাতক্ষীরার আম সরাসরি বাগান থেকে",
    description:
      "হিমসাগর, ল্যাংড়া, আম্রপালি ও ফজলি আমের প্রি-অর্ডার, পাইকারি দর, বাগান-ভিত্তিক ট্রেসিং এবং ঢাকাসহ সারাদেশে ডেলিভারি।",
    image:
      "https://images.unsplash.com/photo-1553279768-865429fa0078?w=1400&q=85&auto=format&fit=crop",
    cta: "আম অর্ডার করুন",
  },
];

export const bannerHighlights = [
  "বাগান থেকে সরাসরি আম",
  "প্রি-অর্ডার ও পাইকারি দর",
  "ঢাকাসহ সারাদেশে ডেলিভারি",
];

export const sidePromos = [
  {
    title: "ম্যাঙ্গো বক্স প্রি-অর্ডার",
    subtitle: "১০ কেজি ও ২০ কেজি কার্টন, বাগান থেকে প্যাকিং",
    image:
      "https://images.unsplash.com/photo-1623930376395-0f3ad22cfac2?w=900&q=80&auto=format&fit=crop",
    accent: "bg-[#123a30]",
  },
  {
    title: "আজকের আমের পাইকারি দর",
    subtitle: "রাজশাহী, সাতক্ষীরা ও চাঁপাইনবাবগঞ্জ বাজার আপডেট",
    image:
      "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=900&q=80&auto=format&fit=crop",
    accent: "bg-[#f3f7e9]",
  },
];

export const serviceItems = [
  { icon: HandCoins, label: "ন্যায্য কৃষক মূল্য", color: "text-[#f28c28]" },
  { icon: Truck, label: "দ্রুত জেলা ডেলিভারি", color: "text-[#178f5b]" },
  { icon: PackageCheck, label: "যাচাইকৃত পণ্য", color: "text-[#7c5cff]" },
  { icon: BadgePercent, label: "পাইকারি দর", color: "text-[#ef4444]" },
  { icon: Headphones, label: "বাংলা সাপোর্ট", color: "text-[#0ea5e9]" },
];

export const featuredProducts = [
  {
    id: "himsagar-mango",
    name: "সাতক্ষীরার হিমসাগর আম",
    category: "আম",
    price: 135,
    unit: "কেজি",
    vendor: "কলারোয়া আম বাগান",
    image:
      "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=700&q=80&auto=format&fit=crop",
    badge: "Pre-order",
  },
  {
    id: "langra-mango",
    name: "রাজশাহীর ল্যাংড়া আম",
    category: "আম",
    price: 125,
    unit: "কেজি",
    vendor: "বাঘা অর্চার্ড",
    image:
      "https://images.unsplash.com/photo-1553279768-865429fa0078?w=700&q=80&auto=format&fit=crop",
    badge: "আজকের দর",
  },
  {
    id: "mango-gift-box",
    name: "প্রিমিয়াম আম গিফট বক্স",
    category: "আম",
    price: 1450,
    unit: "১০ কেজি",
    vendor: "AgriQon Select",
    image:
      "https://images.unsplash.com/photo-1623930376395-0f3ad22cfac2?w=700&q=80&auto=format&fit=crop",
    badge: "Seasonal",
  },
  {
    id: "amrapali-mango",
    name: "চাঁপাইনবাবগঞ্জ আম্রপালি",
    category: "আম",
    price: 118,
    unit: "কেজি",
    vendor: "শিবগঞ্জ ম্যাঙ্গো হাব",
    image:
      "https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=700&q=80&auto=format&fit=crop",
    badge: "Verified",
  },
];

export const cropDeals = [
  { icon: Leaf, title: "হিমসাগর", count: "প্রি-অর্ডার চলছে" },
  { icon: Sprout, title: "ল্যাংড়া", count: "রাজশাহী বাগান" },
  { icon: Boxes, title: "আম বক্স", count: "১০/২০ কেজি" },
  { icon: Wheat, title: "ধান-চাল", count: "১৮০+ লট" },
  { icon: Sprout, title: "তাজা সবজি", count: "৩২০+ পণ্য" },
  { icon: Tractor, title: "কৃষি যন্ত্র", count: "৬০+ সাপ্লায়ার" },
  { icon: ShieldCheck, title: "ট্রেসিং", count: "বাগান যাচাই" },
];
