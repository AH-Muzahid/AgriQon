import Image from "next/image";
import Link from "next/link";
export function HeroBanner() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8  pt-2 md:pt-4 pb-4 md:pb-8">
      <div className="relative w-full max-w-7xl mx-auto overflow-hidden rounded-[32px] bg-[#0e3b2e] text-white">
        {/* Background decorative patterns */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          {/* We use a repeating SVG pattern or absolute positioned SVGs to mimic the line art.
              For simplicity in this implementation, we will use a pseudo-element pattern or a few SVG icons scattered. */}
          <div className="absolute top-10 left-[40%] text-white/20">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <div className="absolute bottom-20 left-[35%] text-white/20 transform -rotate-12">
            <svg width="80" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            </svg>
          </div>
          <div className="absolute top-20 right-[10%] text-white/20 transform rotate-45">
             <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
               <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
             </svg>
          </div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between min-h-[480px]">
          {/* Left Content */}
          <div className="w-full md:w-[55%] px-8 md:px-16 py-12 md:py-20 flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold leading-[1.1] mb-6 tracking-tight">
              Your Trusted Source<br />
              for <span className="text-[#a4d45c]">Fresh & Healthy</span><br />
              Foods
            </h1>
            <p className="text-gray-300 text-base md:text-lg max-w-md mb-8 leading-relaxed">
              Experience the convenience of hassle-free shopping with quick delivery for all your favorite products.
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <Link 
                href="/shop" 
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#a4d45c] text-[#0e3b2e] font-semibold hover:bg-[#8ebb4f] transition-colors"
              >
                Shop Now
              </Link>
              <Link 
                href="/offers" 
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border border-[#a4d45c] text-white font-medium hover:bg-white/5 transition-colors"
              >
                Explore Offers
              </Link>
            </div>
          </div>

          {/* Right Content - Image */}
          <div className="w-full md:w-[45%] relative h-[300px] md:h-[500px] self-end hidden md:block">
            {/* Using a placeholder for the lady with groceries, but styling it to fit seamlessly */}
            <div className="absolute bottom-0 right-0 w-[120%] h-[110%] z-20 overflow-visible flex items-end">
              <Image 
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop" 
                alt="Woman holding fresh groceries" 
                width={800} 
                height={600}
                className="object-contain object-bottom w-full h-full transform translate-x-12"
                priority
              />
            </div>
            
            {/* Custom bottom curve (simulated with CSS for the card effect) */}
            {/* <div className="absolute bottom-0 left-0 right-0 h-16 bg-white transform translate-y-1/2 rotate-[2deg] scale-110 z-30"></div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
