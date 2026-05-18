import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import CartProvider from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import Navbar from "@/components/home/navbar";
import { Footer } from "@/components/home/footer";
import { Toaster } from "react-hot-toast";
import { AiAssistant } from "@/components/ui/ai-assistant";


const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Agriqon | AI Agriculture Marketplace",
  description:
    "AI-powered marketplace for farmers, buyers, semantic product discovery, and RAG assistance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full antialiased", "font-sans", inter.variable)} data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Navbar />
              <div className="flex-1">
                {children}
              </div>
              <Footer />
              <Toaster position="bottom-right" />
              <AiAssistant />

            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
