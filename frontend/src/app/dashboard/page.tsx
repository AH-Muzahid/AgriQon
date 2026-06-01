'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { apiClient } from '@/lib/api-client';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ShoppingBag,
  Users,
  Truck,
  BarChart3,
  Bot,
  Bell,
  Settings,
  Plus,
  Search,
  Globe,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Component imports
import OverviewView from '@/components/dashboard/overview-view';
import POSView from '@/components/dashboard/pos-view';
import InventoryView from '@/components/dashboard/inventory-view';
import AIAssistantView from '@/components/dashboard/ai-assistant-view';
import MarketplaceView from '@/components/dashboard/marketplace-view';
import CRMView, { Customer } from '@/components/dashboard/crm-view';
import ReportsView from '@/components/dashboard/reports-view';
import MobilePreviewFrame from '@/components/dashboard/mobile-preview-frame';

// Custom interfaces
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
  rating?: number;
  warehouseId?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Order {
  id: string;
  customer: string;
  amount: number;
  status: 'ডেলিভারি' | 'প্রসেসিং' | 'পেন্ডিং';
  time: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Initial Data
const initialProducts: Product[] = [
  { id: '1', name: 'আম্রপালি আম', category: 'ফল', sku: 'MANGO-001', stock: 120, unit: 'কেজি', price: 120, status: 'সচল', image: '🥭', rating: 4.8 },
  { id: '2', name: 'লাল টমেটো', category: 'সবজি', sku: 'TOMATO-001', stock: 80, unit: 'কেজি', price: 40, status: 'সচল', image: '🍅', rating: 4.7 },
  { id: '3', name: 'দেশি ডিম', category: 'ডিম', sku: 'EGGS-001', stock: 20, unit: 'ডজন', price: 12, status: 'কম স্টক', image: '🥚', rating: 4.9 },
  { id: '4', name: 'শসা', category: 'সবজি', sku: 'CUCUMBER-001', stock: 5, unit: 'কেজি', price: 60, status: 'কম স্টক', image: '🥒', rating: 4.6 },
  { id: '5', name: 'কাঁচা মরিচ', category: 'সবজি', sku: 'CHILI-001', stock: 0.5, unit: 'কেজি', price: 180, status: 'কম স্টক', image: '🌶️', rating: 4.8 },
  { id: '6', name: 'আলু', category: 'সবজি', sku: 'POTATO-001', stock: 150, unit: 'কেজি', price: 25, status: 'সচল', image: '🥔', rating: 4.5 },
  { id: '7', name: 'মিষ্টি কুমড়া', category: 'সবজি', sku: 'PUMPKIN-001', stock: 45, unit: 'কেজি', price: 35, status: 'সচল', image: '🎃', rating: 4.4 }
];

const initialOrders: Order[] = [
  { id: '#INV-1032', customer: 'মোঃ হাসিবুর রহমান', amount: 1250, status: 'ডেলিভারি', time: 'আজ ১০:৩০ AM' },
  { id: '#INV-1031', customer: 'লতিফা বেগম', amount: 850, status: 'ডেলিভারি', time: 'আজ ০৮:১৫ AM' }
];

const initialCustomers: Customer[] = [
  { id: '1', name: 'মোঃ হাসিবুর রহমান', phone: '01712345678', due: 3400, spent: 12500, points: 125, segment: 'নিয়মিত', risk: 'কম', creditLimit: 15000 },
  { id: '2', name: 'আলহাজ্ব কুদ্দুস মিয়া', phone: '01998765432', due: 8500, spent: 24500, points: 245, segment: 'বাকিদার', risk: 'মাঝারি', creditLimit: 10000 },
  { id: '3', name: 'লতিফা বেগম', phone: '01555666777', due: 0, spent: 1200, points: 12, segment: 'নতুন', risk: 'কম', creditLimit: 5000 },
  { id: '4', name: 'আব্দুর রাজ্জাক', phone: '01811223344', due: 12400, spent: 18500, points: 185, segment: 'বাকিদার', risk: 'উচ্চ', creditLimit: 15000 },
  { id: '5', name: 'সেলিম সওদাগর', phone: '01399887766', due: 0, spent: 7800, points: 78, segment: 'নিয়মিত', risk: 'কম', creditLimit: 20000 }
];

export default function DashboardHub() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Use mock details if local auth is not present
  const activeUser = user || {
    name: 'রহিম এগ্রো ফার্ম',
    email: 'rahim@agriqon.com',
    role: 'SELLER',
    avatarUrl: null
  };

  // State Management
  const [activeTab, setActiveTab] = useState<'home' | 'pos' | 'products' | 'customers' | 'reports' | 'assistant' | 'consumer'>('home');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Screen size detection for automated responsive layout
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setPreviewMode('mobile');
      } else {
        setPreviewMode('desktop');
      }
    };

    // Run once on load
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Dynamic business data
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('guest');
  
  // POS Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [posCategory, setPosCategory] = useState<string>('সব');
  
  // Add Product Modal
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'সবজি',
    stock: '',
    unit: 'কেজি',
    price: '',
    image: '🥬'
  });

  // AI Assistant Chat State
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { role: 'assistant', content: 'আসসালামু আলাইকুম রহিম ভাই, আজকে কী জানতে চান?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [aiIsTyping, setAiIsTyping] = useState(false);

  // Dynamic calculations from state
  const todaySales = orders.reduce((sum, o) => sum + o.amount, 0);
  const todayProfit = Math.round(todaySales * 0.24); // 24% profit margin
  const totalOrders = orders.length;
  const lowStockCount = products.filter(p => p.stock < 10).length;
  
  // Real-time calculations of debtor dues from CRM state
  const dueAmount = customers.reduce((sum, c) => sum + c.due, 0);

  // Load data on mount and provide refresh function
  const refreshData = async () => {
    try {
      // 1. Fetch Warehouses to determine default warehouse id
      const warehousesRes = await apiClient.get('/warehouses');
      const warehousesList = (warehousesRes.data || []) as any[];
      const defaultWarehouseId = warehousesList[0]?.id || '';

      // 2. Fetch inventory
      const invRes = await apiClient.getInventory();
      const inventoryList = (invRes.data || []) as any[];

      // 3. Fetch products list
      const itemsRes = await apiClient.getItems();
      const itemsList = (itemsRes.data || []) as any[];

      // 4. Fetch categories
      const catsRes = await apiClient.getCategories();
      const catsList = (catsRes.data || []) as any[];
      const catMap = new Map(catsList.map(c => [c.id, c.name]));

      // 5. Match inventory to products to calculate stocks
      const mappedProducts: Product[] = itemsList.map(item => {
        const itemInv = inventoryList.filter(inv => inv.itemId === item.id);
        const totalStock = itemInv.reduce((sum, inv) => sum + (inv.availableStock || 0), 0);
        const warehouseId = itemInv[0]?.warehouseId || defaultWarehouseId;
        const categoryName = catMap.get(item.categoryId) || item.category?.name || 'সবজি';

        // Emojis mapping
        let emoji = '🥬';
        const name = item.title.toLowerCase();
        if (name.includes('আম') || name.includes('mango')) emoji = '🥭';
        else if (name.includes('টমেটো') || name.includes('tomato')) emoji = '🍅';
        else if (name.includes('ডিম') || name.includes('egg')) emoji = '🥚';
        else if (name.includes('শসা') || name.includes('cucumber')) emoji = '🥒';
        else if (name.includes('মরিচ') || name.includes('chili')) emoji = '🌶️';
        else if (name.includes('আলু') || name.includes('potato')) emoji = '🥔';
        else if (name.includes('কুমড়া') || name.includes('pumpkin')) emoji = '🎃';
        else if (name.includes('ধান') || name.includes('চাল') || name.includes('rice')) emoji = '🌾';

        return {
          id: item.id,
          name: item.title,
          category: categoryName,
          sku: item.sku || '',
          stock: totalStock,
          unit: item.unit || 'কেজি',
          price: Number(item.price),
          status: totalStock <= 0 ? 'স্টক আউট' : totalStock < 10 ? 'কম স্টক' : 'সচল',
          image: emoji,
          rating: 4.5,
          warehouseId
        };
      });

      setProducts(mappedProducts);

      // 6. Fetch Customers
      const custRes = await apiClient.getCustomers();
      const customersList = (custRes.data || []) as any[];

      // 7. Fetch Invoices to calculate spent and due amounts
      const invoicesRes = await apiClient.get('/invoices');
      const invoicesList = (invoicesRes.data || []) as any[];

      const mappedCustomers: Customer[] = customersList.map(cust => {
        const custInvoices = invoicesList.filter(inv => inv.customerId === cust.id);
        const totalDue = custInvoices.reduce((sum, inv) => sum + Number(inv.dueAmount || 0), 0);
        const totalSpent = custInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);

        const creditLimit = 15000;
        const limitUtil = creditLimit > 0 ? (totalDue / creditLimit) * 100 : 0;
        const risk = limitUtil >= 80 ? 'উচ্চ' : limitUtil > 40 ? 'মাঝারি' : 'কম';
        const segment = totalDue > 5000 ? 'বাকিদার' : totalSpent > 10000 ? 'নিয়মিত' : 'নতুন';

        return {
          id: cust.id,
          name: cust.name,
          phone: cust.phone || '',
          due: totalDue,
          spent: totalSpent,
          points: cust.loyaltyPoints || 0,
          segment: segment as any,
          risk: risk as any,
          creditLimit
        };
      });

      setCustomers(mappedCustomers);

      // 8. Fetch Orders
      const ordersRes = await apiClient.get('/orders');
      const ordersList = (ordersRes.data || []) as any[];

      const mappedOrders: Order[] = ordersList.map(order => {
        const custName = order.customer?.name || 'গেস্ট ক্রেতা';
        const orderTime = new Date(order.createdAt).toLocaleTimeString('bn-BD', {
          hour: '2-digit',
          minute: '2-digit'
        });

        let status: 'ডেলিভারি' | 'প্রসেসিং' | 'পেন্ডিং' = 'পেন্ডিং';
        if (order.status === 'DELIVERED') status = 'ডেলিভারি';
        else if (order.status === 'CONFIRMED' || order.status === 'SHIPPED') status = 'প্রসেসিং';

        return {
          id: `#INV-${order.id.slice(-6).toUpperCase()}`,
          realId: order.id,
          customer: custName,
          amount: Number(order.total),
          status,
          time: orderTime
        };
      });

      setOrders(mappedOrders);
    } catch (error) {
      console.error('Failed to sync state from database:', error);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Add Product Action
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.stock || !newProduct.price) {
      toast.error('দয়া করে সব তথ্য পূরণ করুন');
      return;
    }

    try {
      // Find category in category list or use default
      const catsRes = await apiClient.getCategories();
      const catsList = (catsRes.data || []) as any[];
      let category = catsList.find(c => c.name === newProduct.category);
      if (!category) {
        category = catsList[0] || { id: null };
      }

      // Fetch warehouses to get default warehouse
      const warehousesRes = await apiClient.get('/warehouses');
      const warehousesList = (warehousesRes.data || []) as any[];
      const defaultWarehouseId = warehousesList[0]?.id;

      if (!defaultWarehouseId) {
        toast.error('কোনো গুদাম (Warehouse) পাওয়া যায়নি। দয়া করে গুদাম তৈরি করুন।');
        return;
      }

      await apiClient.post('/products', {
        title: newProduct.name,
        categoryId: category.id,
        price: parseFloat(newProduct.price),
        costPrice: parseFloat(newProduct.price) * 0.6,
        unit: newProduct.unit,
        sku: `${newProduct.category.toUpperCase()}-${Date.now().toString().slice(-6)}`,
        initialStock: parseFloat(newProduct.stock),
        warehouseId: defaultWarehouseId
      });

      toast.success('পণ্যটি সফলভাবে যোগ করা হয়েছে!');
      setShowAddProductModal(false);
      setNewProduct({ name: '', category: 'সবজি', stock: '', unit: 'কেজি', price: '', image: '🥬' });
      refreshData();
    } catch (err: any) {
      console.error(err);
      toast.error('পণ্য যোগ করতে ব্যর্থ হয়েছে: ' + err.message);
    }
  };

  // CRM Customer Addition
  const handleAddCustomer = async (newCust: Omit<Customer, 'id' | 'segment' | 'risk' | 'points'>) => {
    try {
      const isPhoneExists = customers.some(c => c.phone === newCust.phone);
      if (isPhoneExists) {
        toast.error('এই মোবাইল নাম্বার দিয়ে ইতিমধ্যে কাস্টমার রেজিস্টার করা আছে!');
        return;
      }

      await apiClient.createCustomer({
        name: newCust.name,
        phone: newCust.phone
      });

      toast.success(`${newCust.name} সফলভাবে রেজিস্টার হয়েছেন!`);
      refreshData();
    } catch (err: any) {
      console.error(err);
      toast.error('কাস্টমার যুক্ত করতে ব্যর্থ হয়েছে: ' + err.message);
    }
  };

  // CRM Collect Dues callback
  const handleCollectDue = async (customerId: string, amount: number) => {
    try {
      const invoicesRes = await apiClient.get('/invoices', { params: { customerId } });
      const invoicesList = (invoicesRes.data || []) as any[];
      const activeInvoices = invoicesList
        .filter(inv => Number(inv.dueAmount) > 0)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); // FIFO

      if (activeInvoices.length === 0) {
        toast.error('কাস্টমারের কোনো বকেয়া পাওনা পাওয়া যায়নি!');
        return;
      }

      let remainingAmount = amount;

      for (const invoice of activeInvoices) {
        if (remainingAmount <= 0) break;

        const due = Number(invoice.dueAmount);
        const payForThisInvoice = Math.min(remainingAmount, due);

        const newPaidAmount = Number(invoice.paidAmount) + payForThisInvoice;

        await apiClient.patch(`/invoices/${invoice.id}`, {
          paidAmount: newPaidAmount
        });

        const orderId = invoice.orderId;
        await apiClient.post('/payments/initiate', {
          invoiceId: orderId,
          amount: payForThisInvoice,
          gateway: 'CASH',
          currency: 'BDT',
          metadata: { reason: 'CRM due payment collection' }
        });

        remainingAmount -= payForThisInvoice;
      }

      toast.success(`সফলভাবে ৳${amount} বকেয়া আদায় সম্পন্ন হয়েছে!`);
      refreshData();
    } catch (err: any) {
      console.error(err);
      toast.error('বকেয়া পরিশোধ করতে ব্যর্থ হয়েছে: ' + err.message);
    }
  };

  // Cart operations for POS
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast.success(`${product.name} কার্টে যোগ করা হয়েছে`);
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter(item => item.quantity > 0)
    );
  };

  // Integrated Checkout Loop
  const checkoutCart = async (
    paymentMethod: string,
    customerId: string = 'guest',
    discountAmount: number = 0,
    taxAmount: number = 0,
    grandTotal: number = 0
  ) => {
    if (paymentMethod === '') {
      // Clear/Reset action triggered on invoice closure
      setCart([]);
      setSelectedCustomerId('guest');
      return;
    }

    try {
      const itemsPayload = cart.map(item => {
        return {
          itemId: item.product.id,
          warehouseId: item.product.warehouseId || '',
          quantity: item.quantity,
          unitPrice: item.product.price,
          discount: 0,
          tax: 0
        };
      });

      const idempotencyKey = `pos-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      const orderRes = await apiClient.createOrder({
        customerId: customerId === 'guest' ? undefined : customerId,
        items: itemsPayload,
        discount: discountAmount,
        taxAmount,
        idempotencyKey
      });

      const orderData = orderRes.data as any;

      if (paymentMethod !== 'বাকি') {
        const paymentRes = await apiClient.post('/payments/initiate', {
          invoiceId: orderData.id,
          amount: grandTotal,
          gateway: paymentMethod === 'নগদ ক্যাশ' ? 'CASH' : paymentMethod.toUpperCase(),
          currency: 'BDT'
        });

        const paymentData = paymentRes.data as any;

        await apiClient.post(`/payments/webhook/${paymentMethod === 'নগদ ক্যাশ' ? 'CASH' : paymentMethod.toLowerCase()}`, {
          transactionId: paymentData.transactionId,
          status: 'SUCCESS'
        });
      }

      toast.success('অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!');
      refreshData();
    } catch (err: any) {
      console.error(err);
      toast.error('চেকআউট ব্যর্থ হয়েছে: ' + err.message);
    }
  };

  // AI assistant responses
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', content: text };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setAiIsTyping(true);

    try {
      const res = await apiClient.generateAiChat(text);
      const aiReply = res.data.content || 'দুঃখিত ভাই, আমি বিষয়টি বুঝতে পারছি না। আবার বলবেন কি?';
      setChatMessages(prev => [...prev, { role: 'assistant', content: aiReply }]);
    } catch (err: any) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'সার্ভার সংযোগে ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।' }]);
    } finally {
      setAiIsTyping(false);
    }
  };

  return (
    <main className={`min-h-screen bg-radial from-[#fafbfa] to-[#f4f7f5] text-[#17231f] font-sans antialiased ${previewMode === 'desktop' ? 'pb-12 pt-6' : 'pb-0'}`}>
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Render selected view mode */}
      <div className={`max-w-[1700px] mx-auto transition-all duration-500 ${previewMode === 'desktop' ? 'p-2 md:p-3 lg:p-4' : 'p-0'}`}>
        {previewMode === 'desktop' ? (
          <div className="bg-white/80 backdrop-blur-md rounded-[32px] border border-white/60 shadow-[0_20px_50px_rgba(15,79,58,0.06)] overflow-hidden min-h-[88vh] flex">
            {/* LEFT SIDEBAR */}
            <aside className={`relative ${isSidebarCollapsed ? 'w-24 px-4' : 'w-72 p-6'} bg-[#fcfdfc] border-r border-[#eef2ef]/60 py-8 flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out`}>
              {/* Collapse/Expand Toggle Button sitting perfectly on the border line */}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="absolute -right-3.5 top-8 bg-white border border-[#eef2ef] hover:border-[#0f4f3a] text-[#0f4f3a] p-1.5 rounded-full shadow-sm z-30 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                title={isSidebarCollapsed ? "প্যানেল বড় করুন" : "প্যানেল ছোট করুন"}
              >
                {isSidebarCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
              </button>

              <div className="space-y-10">
                {/* Logo */}
                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-2'}`}>
                  <motion.div 
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className="size-10 rounded-2xl bg-gradient-to-tr from-[#0f4f3a] to-[#1bb886] flex items-center justify-center text-white shrink-0 shadow-[0_4px_12px_rgba(15,79,58,0.2)]"
                  >
                    <ShoppingBag className="size-5.5" />
                  </motion.div>
                  {!isSidebarCollapsed && (
                    <div className="flex flex-col">
                      <span className="text-xl font-black text-[#0f4f3a] tracking-tight leading-none">AgriQon</span>
                      <span className="text-[10px] font-bold text-[#66756e] tracking-wider mt-1 uppercase">Smart Marketplace</span>
                    </div>
                  )}
                </div>

                {/* Sidebar Navigation */}
                <nav className="space-y-1.5">
                  {[
                    { id: 'home', label: 'হোম / ড্যাশবোর্ড', icon: LayoutDashboard },
                    { id: 'pos', label: 'POS (বিক্রি)', icon: ShoppingCart },
                    { id: 'products', label: 'পণ্যসমূহ', icon: Package },
                    { id: 'customers', label: 'কাস্টমার (CRM)', icon: Users },
                    { id: 'reports', label: 'রিপোর্টস', icon: BarChart3 },
                    { id: 'assistant', label: 'AI সহকারী', icon: Bot, badge: 'New', badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
                    { id: 'consumer', label: 'মার্কেটপ্লেস', icon: ShoppingBag }
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        title={isSidebarCollapsed ? tab.label : undefined}
                        className={`w-full flex items-center relative ${
                          isSidebarCollapsed ? 'justify-center py-3.5' : 'justify-between px-4 py-3.5'
                        } rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                          isActive
                            ? 'text-[#0f4f3a]'
                            : 'text-[#66756e] hover:bg-[#f3f7f4] hover:text-[#17231f]'
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeTabBg"
                            className="absolute inset-0 bg-[#e8f3ec] rounded-2xl z-0"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                        <div className="flex items-center gap-3.5 z-10">
                          <Icon className={`size-5 shrink-0 ${isActive ? 'text-[#0f4f3a]' : 'text-[#66756e] transition-colors'}`} />
                          {!isSidebarCollapsed && <span className="truncate">{tab.label}</span>}
                        </div>
                        {!isSidebarCollapsed && tab.badge && (
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-black z-10 ${tab.badgeColor}`}>
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                  
                  {/* Divider line in sidebar */}
                  <div className="h-[1px] bg-[#eef2ef] my-4" />

                  {/* Additional Static Tabs to match mockup */}
                  {[
                    { label: 'সাপ্লায়ার', icon: Truck },
                    { label: 'নোটিফিকেশন', icon: Bell, badge: '12', badgeColor: 'bg-red-500 text-white' }
                  ].map((tab, idx) => {
                    const Icon = tab.icon;
                    return (
                      <div
                        key={idx}
                        title={isSidebarCollapsed ? tab.label : undefined}
                        className={`w-full flex items-center ${
                          isSidebarCollapsed ? 'justify-center py-3.5' : 'justify-between px-4 py-3.5'
                        } text-[#66756e]/60 cursor-not-allowed opacity-65`}
                      >
                        <div className="flex items-center gap-3.5">
                          <Icon className="size-5 shrink-0" />
                          {!isSidebarCollapsed && <span className="text-sm font-bold truncate">{tab.label}</span>}
                        </div>
                        {!isSidebarCollapsed && tab.badge && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${tab.badgeColor}`}>
                            {tab.badge}
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {/* Settings Tab - fully interactive */}
                  <button
                    onClick={() => router.push('/dashboard/profile')}
                    title={isSidebarCollapsed ? 'সেটিংস' : undefined}
                    className={`w-full flex items-center ${
                      isSidebarCollapsed ? 'justify-center py-3.5' : 'justify-between px-4 py-3.5'
                    } text-[#66756e] hover:bg-[#f3f7f4] hover:text-[#0f4f3a] rounded-2xl transition-colors cursor-pointer`}
                  >
                    <div className="flex items-center gap-3.5">
                      <Settings className="size-5 shrink-0" />
                      {!isSidebarCollapsed && <span className="text-sm font-bold truncate">সেটিংস</span>}
                    </div>
                  </button>
                </nav>
              </div>

              {/* Bottom Farmer Profile widget */}
              {isSidebarCollapsed ? (
                <div 
                  className="flex items-center justify-center p-2.5 bg-[#f8faf9] rounded-2xl border border-[#eef2ef]/80 shadow-sm cursor-pointer hover:bg-emerald-50 transition-colors"
                  title={activeUser.name}
                >
                  <div className="size-10 bg-[#e8f3ec] rounded-xl flex items-center justify-center text-lg shrink-0 shadow-inner">
                    👨‍🌾
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3.5 p-3.5 bg-[#f8faf9] rounded-2xl border border-[#eef2ef]/80 shadow-sm">
                  <div className="size-11 bg-gradient-to-br from-[#e8f3ec] to-[#d8e8dc] rounded-xl flex items-center justify-center text-xl shrink-0 shadow-inner">
                    👨‍🌾
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-black truncate text-[#17231f]">{activeUser.name}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <p className="text-[10px] font-bold text-[#66756e] uppercase tracking-wider">Owner / Farmer</p>
                    </div>
                  </div>
                </div>
              )}
            </aside>

            {/* MAIN CONTAINER */}
            <div className="flex-1 flex flex-col bg-[#fafbfa] min-w-0">
              {/* TOP HEADER */}
              <header className="h-20 bg-white border-b border-[#eef2ef]/60 px-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-black text-[#17231f] font-heading tracking-tight">
                    {activeTab === 'home' && 'হোম / ড্যাশবোর্ড'}
                    {activeTab === 'products' && 'পণ্য তালিকা'}
                    {activeTab === 'pos' && 'POS - নতুন বিক্রি'}
                    {activeTab === 'customers' && 'CRM - কাস্টমার ডিরেক্টরি'}
                    {activeTab === 'reports' && 'রিপোর্টস ও এনালাইটিক্স'}
                    {activeTab === 'assistant' && 'AgriQon AI সহকারী'}
                    {activeTab === 'consumer' && 'কনজিউমার মার্কেটপ্লেস'}
                  </h2>
                </div>

                {/* Global Clean Search Bar */}
                <div className="flex-1 max-w-md mx-8 relative">
                  <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 size-4 text-[#66756e]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="পণ্য বা অর্ডার সার্চ করুন..."
                    className="w-full bg-[#f4f7f5] border border-[#eef2ef] rounded-full pl-12 pr-5 py-2.5 text-sm focus:outline-none focus:border-[#0f4f3a] focus:bg-white focus:shadow-[0_0_0_3px_rgba(15,79,58,0.08)] transition-all text-[#17231f] font-semibold"
                  />
                </div>

                {/* Topbar Widgets */}
                <div className="flex items-center gap-5">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative p-2.5 bg-[#f4f7f5] hover:bg-[#e8f3ec] rounded-full cursor-pointer transition-all border border-[#eef2ef]"
                  >
                    <Bell className="size-4.5 text-[#0f4f3a]" />
                    <span className="absolute -top-1 -right-1 size-5 bg-red-500 rounded-full text-[9px] font-extrabold text-white flex items-center justify-center border-2 border-white shadow-sm">
                      12
                    </span>
                  </motion.div>
                  <button className="flex items-center gap-2 bg-[#f4f7f5] border border-[#eef2ef] rounded-full px-4 py-2 text-xs font-bold text-[#0f4f3a] hover:bg-[#e8f3ec] hover:border-[#0f4f3a]/20 transition-all cursor-pointer">
                    <Globe className="size-3.5" />
                    <span>বাংলা</span>
                    <ChevronDown className="size-3" />
                  </button>
                  <div className="size-10 rounded-full bg-gradient-to-tr from-[#0f4f3a] to-[#126b4f] text-white font-extrabold text-sm flex items-center justify-center border-2 border-white shadow-md">
                    R
                  </div>
                </div>
              </header>

              {/* VIEW CONTENTS (Split modular components) */}
              <div className="flex-1 p-4 lg:p-5 overflow-y-auto min-h-0 bg-[#fcfdfd]/60">
                {activeTab === 'home' && (
                  <OverviewView
                    products={products}
                    orders={orders}
                    todaySales={todaySales}
                    todayProfit={todayProfit}
                    totalOrders={totalOrders}
                    lowStockCount={lowStockCount}
                    dueAmount={dueAmount}
                    setActiveTab={setActiveTab}
                    setShowAddProductModal={setShowAddProductModal}
                  />
                )}

                {activeTab === 'pos' && (
                  <POSView
                    products={products}
                    cart={cart}
                    addToCart={addToCart}
                    updateCartQty={updateCartQty}
                    checkoutCart={checkoutCart}
                    posCategory={posCategory}
                    setPosCategory={setPosCategory}
                    customers={customers}
                    selectedCustomerId={selectedCustomerId}
                    setSelectedCustomerId={setSelectedCustomerId}
                  />
                )}

                {activeTab === 'products' && (
                  <InventoryView
                    products={products}
                    setProducts={setProducts}
                    setShowAddProductModal={setShowAddProductModal}
                  />
                )}

                {activeTab === 'customers' && (
                  <CRMView
                    customers={customers}
                    onAddCustomer={handleAddCustomer}
                    onCollectDue={handleCollectDue}
                  />
                )}

                {activeTab === 'reports' && (
                  <ReportsView
                    products={products}
                    customers={customers}
                  />
                )}

                {activeTab === 'assistant' && (
                  <AIAssistantView
                    chatMessages={chatMessages}
                    chatInput={chatInput}
                    setChatInput={setChatInput}
                    handleSendMessage={handleSendMessage}
                    aiIsTyping={aiIsTyping}
                  />
                )}

                {activeTab === 'consumer' && (
                  <MarketplaceView
                    products={products}
                    addToCart={addToCart}
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /*                          MOBILE VIEW                                      */
          /* ========================================================================= */
          <MobilePreviewFrame
            activeUser={activeUser}
            todaySales={todaySales}
            todayProfit={todayProfit}
            totalOrders={totalOrders}
            lowStockCount={lowStockCount}
            dueAmount={dueAmount}
            activeTab={activeTab === 'customers' || activeTab === 'reports' ? 'home' : activeTab}
            setActiveTab={setActiveTab as any}
            setShowAddProductModal={setShowAddProductModal}
          />
        )}
      </div>

      {/* POPUP MODAL: ADD PRODUCT FORM */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#eef2ef] p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setShowAddProductModal(false)}
              className="absolute top-4 right-4 p-2 bg-[#f4f7f5] hover:bg-red-50 text-[#66756e] hover:text-red-500 rounded-full transition-all"
            >
              <X className="size-4" />
            </button>

            <h3 className="text-base font-black mb-4 flex items-center gap-2">
              <span>➕</span>
              <span>নতুন পণ্য যোগ করুন</span>
            </h3>

            <form onSubmit={handleAddProduct} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block font-black text-[#66756e] mb-1.5">পণ্যের নাম</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="যেমন: আম্রপালি আম, লাল টমেটো"
                  className="w-full bg-[#f4f7f5] border border-[#e5ebe6] rounded-xl px-4 py-2.5 font-bold focus:outline-none focus:border-[#0f4f3a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-black text-[#66756e] mb-1.5">ক্যাটাগরি</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-[#f4f7f5] border border-[#e5ebe6] rounded-xl px-4 py-2.5 font-bold focus:outline-none focus:border-[#0f4f3a]"
                  >
                    <option value="ফল">ফল</option>
                    <option value="সবজি">সবজি</option>
                    <option value="ডিম">ডিম</option>
                  </select>
                </div>
                <div>
                  <label className="block font-black text-[#66756e] mb-1.5">আইকন / ইমোজি</label>
                  <select
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                    className="w-full bg-[#f4f7f5] border border-[#e5ebe6] rounded-xl px-4 py-2.5 font-bold focus:outline-none focus:border-[#0f4f3a]"
                  >
                    <option value="🥭">🥭 আম</option>
                    <option value="🍅">🍅 টমেটো</option>
                    <option value="🥚">🥚 ডিম</option>
                    <option value="🥒">🥒 শসা</option>
                    <option value="🌶️">🌶️ মরিচ</option>
                    <option value="🥔">🥔 আলু</option>
                    <option value="🥬">🥬 শাকসবজি</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-black text-[#66756e] mb-1.5">স্টক পরিমাণ</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    placeholder="যেমন: ১২০"
                    className="w-full bg-[#f4f7f5] border border-[#e5ebe6] rounded-xl px-4 py-2.5 font-bold focus:outline-none focus:border-[#0f4f3a]"
                  />
                </div>
                <div>
                  <label className="block font-black text-[#66756e] mb-1.5">পরিমাপের একক</label>
                  <select
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                    className="w-full bg-[#f4f7f5] border border-[#e5ebe6] rounded-xl px-4 py-2.5 font-bold focus:outline-none focus:border-[#0f4f3a]"
                  >
                    <option value="কেজি">কেজি (Kg)</option>
                    <option value="ডজন">ডজন (Dozen)</option>
                    <option value="পিস">পিস (Piece)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-black text-[#66756e] mb-1.5">মূল্য প্রতি একক (৳)</label>
                <input
                  type="number"
                  required
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  placeholder="যেমন: ১২০"
                  className="w-full bg-[#f4f7f5] border border-[#e5ebe6] rounded-xl px-4 py-2.5 font-bold focus:outline-none focus:border-[#0f4f3a]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0f4f3a] hover:bg-[#082d22] text-white text-xs font-bold rounded-xl transition-all shadow-md mt-2"
              >
                সফলভাবে সংরক্ষণ করুন
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
