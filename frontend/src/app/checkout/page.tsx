"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { 
  ArrowLeft, 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight,
  MapPin,
  Phone,
  User,
  ShoppingBag
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function CheckoutPage() {
  const { cart, totalPrice, cartCount, clearCart } = useCart();
  const [isOrdered, setIsOrdered] = useState(false);
  const [loading, setLoading] = useState(false);

  const shippingCost = cartCount > 0 ? 50 : 0;
  const grandTotal = totalPrice + shippingCost;

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate order processing
    setTimeout(() => {
      setLoading(false);
      setIsOrdered(true);
      clearCart();
    }, 2000);
  };

  if (isOrdered) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-8 shadow-inner">
          <CheckCircle2 className="w-12 h-12 text-[#0a4d3c]" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4 text-center">Order Placed Successfully!</h1>
        <p className="text-gray-500 mb-10 text-center max-w-md text-lg">
          Thank you for shopping with <span className="text-[#0a4d3c] font-bold">AgriQon</span>. 
          Your fresh groceries are on their way to your doorstep.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Link
            href="/"
            className="flex-1 bg-[#0a4d3c] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#07382b] transition-all text-center shadow-lg shadow-emerald-900/10 active:scale-95"
          >
            Continue Shopping
          </Link>
          <button className="flex-1 bg-white border-2 border-gray-100 text-gray-700 px-8 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all active:scale-95">
            Track Order
          </button>
        </div>
      </div>
    );
  }

  if (cartCount === 0 && !isOrdered) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-gray-300" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">No items to checkout</h1>
        <Link
          href="/"
          className="text-[#0a4d3c] font-bold flex items-center gap-2 hover:underline mt-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back to shop
        </Link>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 bg-gray-50/30">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 overflow-x-auto whitespace-nowrap pb-2">
        <Link href="/cart" className="hover:text-[#0a4d3c] transition-colors">Cart</Link>
        <ChevronRight className="w-4 h-4 shrink-0" />
        <span className="font-bold text-[#0a4d3c]">Checkout</span>
        <ChevronRight className="w-4 h-4 shrink-0" />
        <span>Payment</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Checkout Form */}
        <div className="lg:col-span-7 space-y-8">
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Truck className="w-5 h-5 text-[#0a4d3c]" />
              </div>
              Shipping Information
            </h2>
            
            <form id="checkout-form" onSubmit={handleOrder} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4 opacity-50" /> Full Name
                  </label>
                  <Input required placeholder="Muzahid Ahmed" className="rounded-xl h-12 bg-gray-50 border-transparent focus:bg-white transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4 opacity-50" /> Phone Number
                  </label>
                  <Input required type="tel" placeholder="+880 1XXX-XXXXXX" className="rounded-xl h-12 bg-gray-50 border-transparent focus:bg-white transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 opacity-50" /> Full Address
                </label>
                <Input required placeholder="House #, Street name, Area, City" className="rounded-xl h-12 bg-gray-50 border-transparent focus:bg-white transition-all" />
              </div>

              <div className="pt-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                   <div className="p-2 bg-emerald-50 rounded-lg">
                    <CreditCard className="w-5 h-5 text-[#0a4d3c]" />
                  </div>
                  Payment Method
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="relative flex items-center gap-4 p-4 rounded-2xl border-2 border-[#0a4d3c] bg-emerald-50/50 cursor-pointer transition-all">
                    <input type="radio" name="payment" defaultChecked className="accent-[#0a4d3c] size-5" />
                    <div>
                      <p className="font-bold text-[#0a4d3c]">Cash on Delivery</p>
                      <p className="text-xs text-gray-500">Pay when you receive</p>
                    </div>
                  </label>
                  <label className="relative flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-gray-200 cursor-not-allowed opacity-60">
                    <input type="radio" name="payment" disabled className="size-5" />
                    <div>
                      <p className="font-bold text-gray-700">Online Payment</p>
                      <p className="text-xs text-gray-500">Coming soon</p>
                    </div>
                  </label>
                </div>
              </div>
            </form>
          </section>

          <div className="flex items-center gap-3 p-6 bg-[#0a4d3c]/5 rounded-2xl border border-[#0a4d3c]/10 text-[#0a4d3c]">
            <ShieldCheck className="w-6 h-6 shrink-0" />
            <p className="text-sm font-medium">
              Your security is our priority. We use industry-standard encryption to protect your data.
            </p>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 max-h-[40vh] overflow-y-auto mb-8 pr-2 custom-scrollbar">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-xs font-bold text-gray-400">
                      IMG
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-900">৳{(item.price * item.quantity).toFixed(0)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">৳{totalPrice.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping Fee</span>
                <span className="font-bold text-gray-900">৳{shippingCost.toFixed(0)}</span>
              </div>
              <div className="h-px bg-gray-100 my-4" />
              <div className="flex justify-between text-xl font-black text-gray-900">
                <span>Total</span>
                <span className="text-[#0a4d3c]">৳{grandTotal.toFixed(0)}</span>
              </div>
            </div>

            <button
              form="checkout-form"
              type="submit"
              disabled={loading}
              className="w-full bg-[#0a4d3c] text-white py-5 rounded-2xl font-black text-xl hover:bg-[#07382b] transition-all shadow-xl shadow-emerald-900/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Order"
              )}
            </button>
            
            <p className="text-center text-xs text-gray-400 mt-6">
              By confirming, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
