import { ArrowRight, ShoppingCart } from "lucide-react";
import Link from "next/link";

const deals = [
  {
    id: 1,
    discount: "20% OFF",
    image: "🍅",
    oldPrice: "AED 7.99",
    newPrice: "AED 5.99",
    title: "Fresh Tomatoes",
    subtitle: "1 kg - Farm Fresh",
  },
  {
    id: 2,
    discount: "20% OFF",
    image: "🍌",
    oldPrice: "AED 5.99",
    newPrice: "AED 4.49",
    title: "Premium Bananas",
    subtitle: "1 kg - Naturally Sweet",
  },
  {
    id: 3,
    discount: "20% OFF",
    image: "🍗",
    oldPrice: "AED 22.99",
    newPrice: "AED 18.99",
    title: "Halal Chicken Breast",
    subtitle: "1 kg - Fresh Cut",
  },
];

export function PromoBanners() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 bg-[#f8fafb]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-xl md:text-2xl font-bold text-[#113123]">Exclusive Deals for You</h2>
          <Link href="/deals" className="flex items-center gap-1 text-sm font-bold text-[#113123] hover:underline">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Promo Card */}
          <div className="relative overflow-hidden rounded-[16px] bg-[#113123] text-white p-5 flex flex-col items-center text-center shadow-sm">
            <h3 className="text-lg font-bold mt-1 leading-tight">Today&apos;s<br />Special Offers</h3>
            <p className="text-xs text-white/80 mt-2 max-w-[160px] leading-relaxed">
              Limited-time offers on fresh, halal groceries
            </p>
            
            <div className="flex items-center gap-3 mt-5 mb-4 text-[#fcd43c]">
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold leading-none">09</span>
                <span className="text-[9px] mt-1 font-semibold uppercase">Days</span>
              </div>
              <div className="w-px h-6 bg-white/20"></div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold leading-none">12</span>
                <span className="text-[9px] mt-1 font-semibold uppercase">Hours</span>
              </div>
              <div className="w-px h-6 bg-white/20"></div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold leading-none">35</span>
                <span className="text-[9px] mt-1 font-semibold uppercase">Mins</span>
              </div>
            </div>
            
            <div className="mt-auto w-full flex items-end justify-center pt-4">
              <div className="text-6xl">
                🧺
              </div>
            </div>
          </div>

          {/* Deal Cards */}
          {deals.map((deal) => (
            <div key={deal.id} className="bg-white rounded-[16px] p-4 flex flex-col relative shadow-sm border border-gray-100 group hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 left-4 bg-[#6a1b29] text-white text-[10px] font-bold px-2.5 py-1 rounded-b-md z-10">
                {deal.discount}
              </div>
              
              <div className="flex-1 flex items-center justify-center min-h-[120px] text-7xl pt-6 pb-4 transition-transform duration-500 group-hover:scale-105">
                {deal.image}
              </div>
              
              <div className="border-t border-gray-100 pt-3 flex flex-col items-center text-center mt-auto">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[11px] text-gray-400 line-through">{deal.oldPrice}</span>
                  <span className="text-sm font-extrabold text-[#113123]">{deal.newPrice}</span>
                </div>
                
                <h4 className="font-bold text-gray-900 text-sm">{deal.title}</h4>
                <p className="text-[11px] text-gray-500 mt-0.5 mb-3">{deal.subtitle}</p>
                
                <button className="w-full py-2 rounded-md flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors bg-[#f4f5f7] text-[#113123] group-hover:bg-[#113123] group-hover:text-white">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Shop now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
