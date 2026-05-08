import Image from "next/image";
import deliveryBannerImg from "../../../public/images/delevary-banar.png";

export function DeliveryBanner() {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 my-10">
      <div className="max-w-7xl mx-auto relative h-[260px] md:h-[480px] rounded-2xl ">
        {/* Background Image */}
        <div className="relative h-full w-full pointer-events-none overflow-hidden rounded-2xl">
          <Image
            src={deliveryBannerImg}
            alt="Delivery Scooter"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex flex-col justify-center pt-3 md:pt-6 lg:pt-12 px-3 md:px-16 lg:px-24 w-full">
          <div className="flex flex-col gap-2 md:gap-4">
            <h1 className="text-xl md:text-3xl lg:text-4xl font-black text-white leading-tight">
              Get <span className="text-[#facc15]">20% Off</span> on <br />
              Your First Delivery!
            </h1>
            <p className="text-sm md:text-lg text-emerald-50/90 font-medium max-w-md">
              Fresh groceries, Halal certified, <br className=" md:hidden" /> delivered straight to your door.
            </p>
          </div>
          
          <div className="mt-3 md:mt-5">
            <button className="bg-[#facc15] text-[#0a4d3c] text-sm md:text-lg font-bold px-6 md:px-8 py-1.5 md:py-2 rounded-full hover:bg-white hover:scale-105 transition-all duration-300 shadow-xl shadow-black/10">
              Order now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
