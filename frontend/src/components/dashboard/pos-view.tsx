'use client';

import React, { useState } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Users, 
  CreditCard, 
  Sparkles, 
  Receipt, 
  X, 
  Printer, 
  ArrowRight, 
  CheckCircle2, 
  ShieldAlert, 
  Info,
  BadgeAlert
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Customer } from './crm-view';

interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  stock: number;
  unit: string;
  price: number;
  status: 'সচল' | 'কম স্টক' | 'স্টক আউট';
  image: string;
  warehouseId?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface POSViewProps {
  products: Product[];
  cart: CartItem[];
  addToCart: (product: Product) => void;
  updateCartQty: (productId: string, delta: number) => void;
  checkoutCart: (
    paymentMethod: string,
    customerId: string,
    discountAmount: number,
    taxAmount: number,
    grandTotal: number
  ) => void;
  posCategory: string;
  setPosCategory: (cat: string) => void;
  customers: Customer[];
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
}

export default function POSView({
  products,
  cart,
  addToCart,
  updateCartQty,
  checkoutCart,
  posCategory,
  setPosCategory,
  customers,
  selectedCustomerId,
  setSelectedCustomerId
}: POSViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [discountInput, setDiscountInput] = useState('');
  
  // Invoice overlay state
  const [activeInvoice, setActiveInvoice] = useState<{
    invoiceNo: string;
    date: string;
    customerName: string;
    customerPhone: string;
    items: CartItem[];
    subtotal: number;
    discount: number;
    vat: number;
    total: number;
    paymentMethod: string;
  } | null>(null);

  // Active Customer object
  const activeCustomer = customers.find(c => c.id === selectedCustomerId) || null;

  // Filter products by search & category
  const filteredProducts = products.filter(p => {
    const matchesCategory = posCategory === 'সব' || p.category === posCategory;
    const matchesSearch = p.name.includes(searchQuery) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate Cart Metrics
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = parseFloat(discountInput) || 0;
  
  // VAT is 5% of (Subtotal - Discount)
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const vatAmount = Math.round(taxableAmount * 0.05);
  const grandTotal = Math.max(0, taxableAmount + vatAmount);

  // Credit warnings check
  const isOverCreditLimit = activeCustomer 
    ? (activeCustomer.due + grandTotal) > activeCustomer.creditLimit 
    : false;

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error('দুঃখিত, এই পণ্যটি বর্তমানে স্টক আউট!');
      return;
    }
    const currentQtyInCart = cart.find(item => item.product.id === product.id)?.quantity || 0;
    if (currentQtyInCart >= product.stock) {
      toast.error(`দুঃখিত, স্টকে পর্যাপ্ত পরিমাণ নেই (সর্বোচ্চ সীমা ${product.stock} ${product.unit})!`);
      return;
    }
    addToCart(product);
  };

  const handleQtyChange = (product: Product, delta: number) => {
    if (delta > 0) {
      const currentQtyInCart = cart.find(item => item.product.id === product.id)?.quantity || 0;
      if (currentQtyInCart >= product.stock) {
        toast.error(`দুঃখিত, স্টকে পর্যাপ্ত পরিমাণ নেই (সর্বোচ্চ সীমা ${product.stock} ${product.unit})!`);
        return;
      }
    }
    updateCartQty(product.id, delta);
  };

  const handleCheckout = (method: string) => {
    if (cart.length === 0) {
      toast.error('কার্টটি খালি আছে!');
      return;
    }

    // Strict CRM checkout rule: blocker for "বাকি" payment method if guest is selected
    if (method === 'বাকি' && selectedCustomerId === 'guest') {
      toast.error('বাকি বিক্রয়ের ক্ষেত্রে কাস্টমার প্রোফাইল নির্বাচন করা আবশ্যক!');
      return;
    }

    // Restrict checkout if it violates credit limits
    if (method === 'বাকি' && activeCustomer && isOverCreditLimit) {
      toast.error(`পেমেন্ট ব্যর্থ! বকেয়াসহ কাস্টমারের বকেয়া পরিমাণ (৳${activeCustomer.due + grandTotal}) তার ক্রেডিট সীমা (৳${activeCustomer.creditLimit}) অতিক্রম করবে!`);
      return;
    }

    // Call checkout on parent page to sync records
    checkoutCart(method, selectedCustomerId, discountAmount, vatAmount, grandTotal);

    // Prepare live receipt data for visual presentation
    const invoiceNo = `INV-10${33 + Math.floor(Math.random() * 900)}`;
    const now = new Date();
    const dateFormatted = `${now.toLocaleDateString('bn-BD')} ${now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}`;

    setActiveInvoice({
      invoiceNo,
      date: dateFormatted,
      customerName: activeCustomer ? activeCustomer.name : 'গেস্ট ক্রেতা',
      customerPhone: activeCustomer ? activeCustomer.phone : 'N/A',
      items: [...cart],
      subtotal,
      discount: discountAmount,
      vat: vatAmount,
      total: grandTotal,
      paymentMethod: method
    });

    // Reset local states
    setDiscountInput('');
  };

  // Animation variants
  const gridVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  } as const;

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 25 } }
  } as const;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in text-[#17231f]">
      {/* Left: Product Catalog Selection Grid */}
      <div className="lg:col-span-2 space-y-6 bg-white p-6 md:p-8 rounded-3xl border border-[#eef2ef] shadow-sm">
        {/* Search & Category tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-[#eef2ef] pb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-[#66756e]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="পণ্য বা SKU দিয়ে খুঁজুন..."
              className="w-full bg-[#f4f7f5] border border-[#eef2ef] rounded-2xl pl-11 pr-5 py-3 text-xs focus:outline-none focus:border-[#0f4f3a] focus:bg-white focus:shadow-[0_0_0_3px_rgba(15,79,58,0.06)] transition-all font-black text-[#17231f]"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar relative">
            {['সব', ...Array.from(new Set(products.map(p => p.category)))].map((cat, idx) => {
              const isActive = posCategory === cat;
              return (
                <button
                  key={idx}
                  onClick={() => setPosCategory(cat)}
                  className={`px-5 py-3 rounded-2xl text-xs font-black whitespace-nowrap transition-all duration-200 cursor-pointer relative ${
                    isActive
                      ? 'text-white'
                      : 'bg-[#f4f7f5] text-[#66756e] hover:bg-[#eef2ef]'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeCategoryBg"
                      className="absolute inset-0 bg-[#0f4f3a] rounded-2xl z-0"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product selection grid layout */}
        {filteredProducts.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-center text-[#66756e] font-bold space-y-2">
            <span className="text-4xl">🌾</span>
            <p className="text-sm">কোনো পণ্য পাওয়া যায়নি</p>
          </div>
        ) : (
          <motion.div 
            variants={gridVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-3 gap-5"
          >
            {filteredProducts.map((product) => {
              const cartItem = cart.find(item => item.product.id === product.id);
              const cartQty = cartItem?.quantity || 0;
              const remainingStock = Math.max(0, product.stock - cartQty);
              const isLowStock = product.stock > 0 && product.stock < 10;
              const isOut = product.stock <= 0;

              return (
                <motion.div
                  key={product.id}
                  variants={cardVariants}
                  whileHover={!isOut ? { y: -4, boxShadow: "0 12px 20px rgba(0,0,0,0.04)" } : undefined}
                  className={`border rounded-2xl p-4.5 flex flex-col justify-between transition-all ${
                    isOut
                      ? 'border-[#eef2ef] bg-gray-50/50 opacity-60'
                      : 'border-[#e5ebe6] hover:border-[#0f4f3a] bg-[#fbfaf2]/20'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-3xl p-3 bg-white rounded-xl shadow-sm border border-[#eef2ef]/80 shrink-0">{product.image}</span>
                    {isOut ? (
                      <span className="text-[8px] bg-red-50 text-red-700 font-extrabold px-2 py-0.5 rounded-full border border-red-100">
                        স্টক আউট
                      </span>
                    ) : isLowStock ? (
                      <span className="text-[8px] bg-amber-50 text-amber-700 font-extrabold px-2 py-0.5 rounded-full border border-amber-100 animate-pulse">
                        কম স্টক ({product.stock})
                      </span>
                    ) : null}
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-xs font-black truncate text-[#17231f]">{product.name}</h4>
                    <p className="text-[10px] font-black text-[#66756e] mt-1">৳ {product.price} / {product.unit}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className={`size-1.5 rounded-full ${remainingStock <= 0 ? 'bg-red-400' : 'bg-emerald-500'}`} />
                      <p className="text-[9px] font-bold text-emerald-800">
                        স্টক: {remainingStock} {product.unit}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-5 flex items-center justify-between gap-2.5">
                    {cartQty > 0 ? (
                      <div className="flex items-center bg-[#e8f3ec] border border-[#d3ebd8] rounded-xl px-3 py-1.5 w-full justify-between shadow-inner">
                        <button
                          onClick={() => handleQtyChange(product, -1)}
                          className="font-extrabold text-[#0f4f3a] text-sm hover:scale-120 active:scale-90 p-1 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-black text-[#0f4f3a]">{cartQty}</span>
                        <button
                          onClick={() => handleQtyChange(product, 1)}
                          className="font-extrabold text-[#0f4f3a] text-sm hover:scale-120 active:scale-90 p-1 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAddToCart(product)}
                        disabled={isOut}
                        className={`w-full py-2.5 text-xs font-black rounded-xl transition-all shadow-sm cursor-pointer ${
                          isOut
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                            : 'bg-[#0f4f3a] hover:bg-[#082d22] text-white'
                        }`}
                      >
                        যোগ করুন
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Right Sidebar: Billing and CRM Profiles Selection */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#eef2ef] shadow-sm flex flex-col justify-between min-h-[580px] gap-6">
        <div className="space-y-6">
          {/* CRM Profile Selection Widget */}
          <div className="bg-[#fcfdfd] border border-[#e5ebe6] p-4.5 rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-[#66756e] uppercase tracking-wider flex items-center gap-1.5">
                <Users className="size-4 text-[#0f4f3a]" /> কাস্টমার নির্বাচন
              </span>
              {selectedCustomerId !== 'guest' && (
                <button
                  onClick={() => setSelectedCustomerId('guest')}
                  className="text-[9px] font-bold text-red-500 hover:underline cursor-pointer"
                >
                  গেস্ট ক্রেতা করুন
                </button>
              )}
            </div>
            
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-[#f4f7f5] border border-[#e5ebe6] rounded-xl px-3 py-2.5 text-xs font-black text-[#17231f] focus:outline-none focus:border-[#0f4f3a] cursor-pointer"
            >
              <option value="guest">👤 গেস্ট ক্রেতা (অনিবন্ধিত)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  👥 {c.name} ({c.phone}) - বাকি: ৳{c.due}
                </option>
              ))}
            </select>

            {/* Linked Customer Quick Details Dashboard */}
            <AnimatePresence mode="wait">
              {activeCustomer && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-3.5 border-t border-[#eef2ef] grid grid-cols-2 gap-3 text-[9px] font-black"
                >
                  <div className="space-y-0.5">
                    <span className="text-[#66756e]">বকেয়া বাকি হিসাব:</span>
                    <span className={`block text-xs font-black ${activeCustomer.due > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                      ৳ {activeCustomer.due}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[#66756e]">লয়্যালটি পয়েন্ট:</span>
                    <span className="block text-xs text-emerald-700 font-black flex items-center gap-1">
                      <Sparkles className="size-3.5 fill-emerald-50 text-emerald-500" />
                      {activeCustomer.points}
                    </span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-dashed border-[#eef2ef] flex items-center justify-between text-[8px] text-[#66756e]">
                    <span>ক্রেডিট সীমা: ৳{activeCustomer.creditLimit}</span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full ${
                      activeCustomer.risk === 'উচ্চ' ? 'bg-red-50 text-red-700 font-extrabold border border-red-100' : 
                      activeCustomer.risk === 'মাঝারি' ? 'bg-amber-50 text-amber-700 font-extrabold border border-amber-100' :
                      'bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-100'
                    }`}>
                      বাকি ঝুঁকি: {activeCustomer.risk}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cart item listing container */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#eef2ef] pb-3">
              <h3 className="text-xs font-black flex items-center gap-2">
                <ShoppingCart className="size-4.5 text-[#0f4f3a]" />
                <span>কার্ট তালিকা</span>
              </h3>
              <span className="bg-[#e8f3ec] text-[#0f4f3a] text-[10px] font-black px-2.5 py-0.5 rounded-full">
                {cart.length} টি পণ্য
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center text-[#66756e] bg-[#f8faf9] rounded-2xl border border-dashed border-[#e5ebe6] gap-2">
                <span className="text-4xl">🛒</span>
                <p className="text-[10px] font-bold">কার্ট খালি আছে। বাম দিক থেকে পণ্য যোগ করুন।</p>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                <AnimatePresence>
                  {cart.map((item) => (
                    <motion.div 
                      key={item.product.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center justify-between border-b border-dashed border-[#eef2ef] pb-3.5"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-1 bg-[#f8faf9] rounded-lg border border-[#eef2ef]">{item.product.image}</span>
                        <div>
                          <h4 className="text-xs font-black text-[#17231f]">{item.product.name}</h4>
                          <p className="text-[10px] font-bold text-[#66756e] mt-0.5">
                            ৳ {item.product.price} × {item.quantity} {item.product.unit}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-black text-[#17231f]">৳ {item.product.price * item.quantity}</span>
                        <button
                          onClick={() => handleQtyChange(item.product, -item.quantity)}
                          className="text-[#b3bfb9] hover:text-red-500 transition-all p-1 cursor-pointer"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Totals & Real-time Checkout Processing Panel */}
        {cart.length > 0 && (
          <div className="border-t border-[#eef2ef] pt-4.5 space-y-4">
            <div className="space-y-2.5 text-xs font-bold text-[#66756e]">
              <div className="flex justify-between">
                <span>সাবটোটাল</span>
                <span className="text-[#17231f]">৳ {subtotal}</span>
              </div>
              
              {/* Custom Discount input element */}
              <div className="flex items-center justify-between py-1 border-y border-dashed border-[#eef2ef]">
                <span className="text-[#66756e]">ডিসকাউন্ট (৳)</span>
                <input
                  type="number"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  placeholder="০"
                  className="w-24 bg-[#f4f7f5] border border-[#eef2ef] rounded-lg px-2 py-1.5 text-right text-xs font-black text-[#17231f] focus:outline-none focus:border-[#0f4f3a] focus:bg-white"
                />
              </div>

              <div className="flex justify-between text-emerald-800">
                <span className="flex items-center gap-1">কৃষি ভ্যাট / ট্যাক্স <span className="bg-emerald-50 text-emerald-700 text-[8px] font-black px-1.5 py-0.5 rounded-full border border-emerald-100">৫%</span></span>
                <span>৳ {vatAmount}</span>
              </div>
              
              {/* Debt Warning warning signal in cart */}
              {selectedCustomerId !== 'guest' && isOverCreditLimit && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-2xl text-red-800 text-[10px] font-bold flex gap-2 shadow-sm animate-pulse">
                  <ShieldAlert className="size-4.5 shrink-0 text-red-600" />
                  <span>ক্রেডিট সীমা ছাড়াবে! বাকি পেমেন্ট ব্লকড।</span>
                </div>
              )}

              <div className="flex justify-between text-[#17231f] text-sm font-black pt-3.5 border-t border-[#eef2ef]">
                <span>সর্বমোট পরিশোধযোগ্য</span>
                <span className="text-[#0f4f3a] text-lg font-black">৳ {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Structured payment triggers */}
            <div className="grid grid-cols-3 gap-2.5">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCheckout('নগদ ক্যাশ')}
                className="py-3 bg-[#0f4f3a] hover:bg-[#082d22] text-white text-xs font-extrabold rounded-2xl transition-all shadow-sm cursor-pointer flex flex-col items-center justify-center gap-0.5"
              >
                <span>নগদ</span>
                <span className="text-[8px] opacity-80 font-semibold">Cash</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCheckout('bKash')}
                className="py-3 bg-[#e2125b] hover:bg-[#c10c4d] text-white text-xs font-extrabold rounded-2xl transition-all shadow-sm cursor-pointer flex flex-col items-center justify-center gap-0.5"
              >
                <span>bKash</span>
                <span className="text-[8px] opacity-80 font-semibold">ডিজিটাল</span>
              </motion.button>
              <motion.button
                whileHover={!(selectedCustomerId === 'guest' || isOverCreditLimit) ? { scale: 1.02 } : undefined}
                whileTap={!(selectedCustomerId === 'guest' || isOverCreditLimit) ? { scale: 0.98 } : undefined}
                onClick={() => handleCheckout('বাকি')}
                disabled={selectedCustomerId === 'guest' || isOverCreditLimit}
                className={`py-3 text-white text-xs font-extrabold rounded-2xl transition-all shadow-sm flex flex-col items-center justify-center gap-0.5 ${
                  selectedCustomerId === 'guest' || isOverCreditLimit
                    ? 'bg-[#e5ebe6] text-[#b3bfb9] cursor-not-allowed shadow-none'
                    : 'bg-[#d96f32] hover:bg-[#c05e26] cursor-pointer'
                }`}
              >
                <span>বাকি</span>
                <span className="text-[8px] opacity-80 font-semibold">Accounts</span>
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {/* SUCCESS MODAL: PRINT-READY MODERN INVOICE MOCKUP */}
      <AnimatePresence>
        {activeInvoice && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] border border-[#eef2ef] p-6 w-full max-w-sm shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => {
                  setActiveInvoice(null);
                  checkoutCart('', 'guest', 0, 0, 0); // resets cart in parent
                }}
                className="absolute top-5 right-5 p-2 bg-[#f4f7f5] hover:bg-red-50 text-[#66756e] hover:text-red-500 rounded-full transition-all print:hidden cursor-pointer"
              >
                <X className="size-4" />
              </button>

              {/* Success Alert Header */}
              <div className="flex flex-col items-center text-center pb-5 border-b border-dashed border-[#eef2ef] print:hidden">
                <div className="size-14 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-3 shadow-inner">
                  <CheckCircle2 className="size-9" />
                </div>
                <h3 className="text-base font-black text-[#0f4f3a]">বিক্রি সফলভাবে সম্পন্ন হয়েছে!</h3>
                <p className="text-[10px] font-bold text-[#66756e] mt-0.5">অর্ডার চালান বিবরণ নিচে দেওয়া হলো</p>
              </div>

              {/* RECEIPT STARTS */}
              <div className="py-4 space-y-4 font-sans text-xs">
                {/* Receipt Head */}
                <div className="text-center space-y-1.5">
                  <h2 className="text-base font-black text-[#0f4f3a] tracking-tight">AgriQon POS Receipts</h2>
                  <p className="text-[9px] font-black text-[#66756e]">রহিম এগ্রো ফার্ম লিমিটেড</p>
                  <p className="text-[8px] text-[#66756e]">উপজেলা বাজার, কৃষি ব্লক-বি, বাংলাদেশ</p>
                  <p className="text-[8px] text-[#66756e]">মোবাইল: 01712-345678</p>
                </div>

                {/* Order Meta info */}
                <div className="border-y border-dashed border-[#eef2ef] py-3.5 grid grid-cols-2 gap-y-1.5 text-[9px] font-bold text-[#66756e]">
                  <div>মেমো নং: <strong className="text-[#17231f]">{activeInvoice.invoiceNo}</strong></div>
                  <div className="text-right">তারিখ: <span className="text-[#17231f]">{activeInvoice.date}</span></div>
                  <div>ক্রেতা: <strong className="text-[#17231f]">{activeInvoice.customerName}</strong></div>
                  <div className="text-right">মোবাইল: <span className="text-[#17231f]">{activeInvoice.customerPhone}</span></div>
                </div>

                {/* Invoice Products list Table */}
                <div className="space-y-2.5">
                  <div className="grid grid-cols-5 font-black text-[9px] text-[#66756e] border-b border-[#eef2ef] pb-1.5">
                    <div className="col-span-2">বিবরণ</div>
                    <div className="text-center">পরিমাণ</div>
                    <div className="text-right">দর (৳)</div>
                    <div className="text-right">মোট (৳)</div>
                  </div>
                  <div className="space-y-2">
                    {activeInvoice.items.map((item) => (
                      <div key={item.product.id} className="grid grid-cols-5 text-[9px] font-semibold text-[#17231f]">
                        <div className="col-span-2 truncate">{item.product.name}</div>
                        <div className="text-center">{item.quantity} {item.product.unit}</div>
                        <div className="text-right">{item.product.price}</div>
                        <div className="text-right">{item.product.price * item.quantity}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calculations Block */}
                <div className="border-t border-[#eef2ef] pt-3.5 space-y-2 text-[9px] font-bold text-[#66756e]">
                  <div className="flex justify-between">
                    <span>সাবটোটাল</span>
                    <span className="text-[#17231f]">৳ {activeInvoice.subtotal}</span>
                  </div>
                  {activeInvoice.discount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>ডিসকাউন্ট ছাড় (-)</span>
                      <span>৳ {activeInvoice.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-emerald-800">
                    <span>ভ্যাট ও ট্যাক্স (৫%)</span>
                    <span>৳ {activeInvoice.vat}</span>
                  </div>
                  <div className="flex justify-between text-[#17231f] text-xs font-black pt-2 border-t border-dashed border-[#eef2ef]">
                    <span>পরিশোধিত সর্বমোট</span>
                    <span className="text-base text-[#0f4f3a]">৳ {activeInvoice.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment details */}
                <div className="bg-[#f8faf9] p-3 rounded-xl border border-[#eef2ef] flex justify-between items-center text-[9px] font-black text-[#66756e]">
                  <span>পেমেন্ট মেথড:</span>
                  <span className="text-[#0f4f3a] uppercase">{activeInvoice.paymentMethod}</span>
                </div>

                {/* Receipt Barcode mockup */}
                <div className="flex flex-col items-center pt-3.5 space-y-1.5">
                  <div className="w-full h-8 bg-black/5 border-y border-black flex items-center justify-around overflow-hidden select-none opacity-80">
                    {Array.from({ length: 24 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="bg-black h-full"
                        style={{ width: `${(idx % 3 === 0 ? 3 : idx % 2 === 0 ? 1 : 2)}px` }}
                      ></div>
                    ))}
                  </div>
                  <span className="text-[7px] text-[#66756e] font-mono tracking-widest">{activeInvoice.invoiceNo}</span>
                </div>

                <div className="text-center text-[8px] text-[#66756e] font-black tracking-wide border-t border-dashed border-[#eef2ef] pt-3.5 leading-relaxed">
                  গ্রাহক লয়ালটি পয়েন্ট যোগ করা হয়েছে। ধন্যবাদ, আবার আসবেন!
                </div>
              </div>
              {/* RECEIPT ENDS */}

              {/* Receipt Modal actions */}
              <div className="flex gap-3 pt-5 border-t border-[#eef2ef] print:hidden">
                <button
                  onClick={() => {
                    toast.success('রিসিপ্ট প্রিন্ট করা হচ্ছে...');
                    window.print();
                  }}
                  className="flex-1 py-3 bg-[#f4f7f5] hover:bg-[#eef2ef] text-[#0f4f3a] text-xs font-black rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#eef2ef]"
                >
                  <Printer className="size-4" />
                  <span>প্রিন্ট</span>
                </button>
                <button
                  onClick={() => {
                    setActiveInvoice(null);
                    checkoutCart('', 'guest', 0, 0, 0); // resets cart in parent
                  }}
                  className="flex-1 py-3 bg-[#0f4f3a] hover:bg-[#082d22] text-white text-xs font-black rounded-2xl transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <span>নতুন অর্ডার</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
