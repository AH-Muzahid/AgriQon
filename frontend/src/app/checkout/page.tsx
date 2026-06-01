"use client";

import React, { useState } from "react";
import { 
  CreditCard, 
  ShieldCheck, 
  ChevronRight, 
  ArrowLeft,
  ShoppingBag,
  MapPin,
  Lock,
  Loader2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/cart-context";
import { apiClient } from "@/lib/api-client";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [step] = useState(1);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    phone: "",
    cardNumber: "4242 4242 4242 4242",
    expiry: "12/25",
    cvv: "123"
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setLoading(true);
    try {
      // Simulate multiple order creations if needed or one batch
      // Based on the API client, it takes itemId, quantity, totalPrice
      // Usually, it should be one order with multiple items, but let's check OrderData
      // interface OrderData { itemId: string; quantity: number; totalPrice: number; }
      
      for (const item of cart) {
        await apiClient.createOrder({
          itemId: item.id,
          quantity: item.quantity,
          totalPrice: item.price * item.quantity
        });
      }

      toast.success("Order placed successfully!");
      clearCart();
      router.push("/order-success");
    } catch (error) {
      console.error("Checkout failed:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] px-4">
        <div className="size-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-6">
          <ShoppingBag className="size-10" />
        </div>
        <h2 className="text-3xl font-black text-[#0a4d3c] mb-2">Your cart is empty</h2>
        <p className="text-gray-500 font-medium mb-8">Add some fresh harvest items before checking out.</p>
        <Link 
          href="/shop" 
          className="bg-[#0a4d3c] text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-emerald-900/20 hover:bg-emerald-900 transition-all"
        >
          Explore Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-12">
          <Link href="/shop" className="size-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 hover:text-[#0a4d3c] transition-colors shadow-sm">
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-[#0a4d3c]">Secure Checkout</h1>
            <p className="text-gray-500 font-medium">Step {step} of 2: {step === 1 ? "Shipping & Payment" : "Review"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form Area */}
          <div className="lg:col-span-8 space-y-8">
            {/* Delivery Info */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50">
              <div className="flex items-center gap-3 mb-8">
                <div className="size-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <MapPin className="size-5" />
                </div>
                <h3 className="text-xl font-black text-[#0a4d3c]">Delivery Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 px-1">Full Name</label>
                  <input 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe" 
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500/20 transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 px-1">Phone Number</label>
                  <input 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+971 50 123 4567" 
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500/20 transition-all" 
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 px-1">Address Line</label>
                  <input 
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Street, Building, Apartment" 
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500/20 transition-all" 
                  />
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50">
              <div className="flex items-center gap-3 mb-8">
                <div className="size-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <CreditCard className="size-5" />
                </div>
                <h3 className="text-xl font-black text-[#0a4d3c]">Payment Method</h3>
              </div>

              <div className="space-y-6">
                <div className="p-6 rounded-3xl border-2 border-[#0a4d3c] bg-emerald-50/30 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <CreditCard className="size-6 text-[#0a4d3c]" />
                    </div>
                    <div>
                      <p className="font-black text-[#0a4d3c]">Credit / Debit Card</p>
                      <p className="text-xs font-bold text-emerald-600/70">Safe & Encrypted</p>
                    </div>
                  </div>
                  <div className="size-6 rounded-full border-4 border-[#0a4d3c] bg-[#0a4d3c] relative">
                    <div className="absolute inset-0 m-auto size-2 bg-white rounded-full"></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 px-1">Card Number</label>
                    <input 
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500/20 transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 px-1">CVV</label>
                    <input 
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500/20 transition-all" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50 sticky top-32">
              <h3 className="text-xl font-black text-[#0a4d3c] mb-8">Order Summary</h3>
              
              <div className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative size-16 rounded-2xl overflow-hidden shrink-0 bg-gray-50">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-[#0a4d3c] line-clamp-1">{item.name}</h4>
                      <p className="text-xs font-bold text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-black text-[#0a4d3c]">{(Number(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 border-t border-gray-50 pt-6">
                <div className="flex justify-between text-sm font-bold text-gray-500">
                  <span>Subtotal</span>
                  <span>{Number(totalPrice).toFixed(2)} AED</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-500">
                  <span>Delivery</span>
                  <span className="text-emerald-600 font-black">FREE</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="text-lg font-black text-[#0a4d3c]">Total</span>
                  <span className="text-2xl font-black text-emerald-600">{Number(totalPrice).toFixed(2)} AED</span>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={loading}
                className="w-full mt-10 bg-[#0a4d3c] text-white py-5 rounded-[1.5rem] font-black text-lg shadow-2xl shadow-emerald-900/20 hover:bg-emerald-900 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="size-6 animate-spin" />
                ) : (
                  <>
                    Confirm Order
                    <ChevronRight className="size-5" />
                  </>
                )}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-gray-400">
                <Lock className="size-3" />
                <span className="text-[10px] font-black uppercase tracking-widest">SSL Secure Payment</span>
              </div>
            </div>

            <div className="mt-8 bg-emerald-50 rounded-3xl p-6 border border-emerald-100 flex items-start gap-4">
              <ShieldCheck className="size-6 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-black text-emerald-800 uppercase tracking-wider mb-1">AgriQon Guarantee</p>
                <p className="text-[11px] font-medium text-emerald-700/70 leading-relaxed">
                  Your purchase is protected. If you&apos;re not satisfied with the freshness, we&apos;ll refund you instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
