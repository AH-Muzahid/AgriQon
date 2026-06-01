'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { 
  User, 
  Building2, 
  ShieldCheck, 
  ChevronLeft, 
  Camera, 
  Mail, 
  Phone, 
  Tag, 
  FileText,
  Save,
  CheckCircle2
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'personal' | 'business' | 'security'>('personal');
  
  // Safe default user context in dev/local mode if auth session is not fully ready
  const activeUser = user || {
    name: 'রহিম এগ্রো ফার্ম',
    email: 'rahim@agriqon.com',
    role: 'SELLER',
    avatarUrl: null
  };

  // Form States
  const [personalForm, setPersonalForm] = useState({
    name: activeUser.name,
    email: activeUser.email,
    phone: '01712345678',
    designation: 'চিফ এগ্রো প্রডিউসার'
  });

  const [businessForm, setBusinessForm] = useState({
    shopName: 'রহিম এগ্রিকালচারাল সলিউশনস',
    taxNumber: 'TXN-9023412',
    currency: 'BDT',
    location: 'উত্তরা আড়ত, ঢাকা'
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  // Sync state if user loads late
  useEffect(() => {
    if (user) {
      setPersonalForm(prev => ({
        ...prev,
        name: user.name,
        email: user.email
      }));
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API update
    setTimeout(() => {
      setIsSaving(false);
      
      // Update local context
      if (user) {
        setUser({
          ...user,
          name: personalForm.name,
          email: personalForm.email
        });
      }
      
      toast.success('আপনার প্রোফাইল তথ্য সফলভাবে সংরক্ষণ করা হয়েছে!');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-[#17231f] font-sans pb-16">
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Background soft ambient glowing blobs */}
      <div className="absolute top-0 left-0 w-full h-[320px] bg-gradient-to-b from-[#0f4f3a]/8 to-transparent pointer-events-none z-0" />
      <div className="absolute top-24 left-[10%] size-72 rounded-full bg-emerald-400/5 blur-3xl pointer-events-none z-0" />
      
      <div className="max-w-4xl mx-auto px-4 pt-8 relative z-10 space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-xs font-black text-[#0f4f3a] bg-white border border-[#e5ebe6] px-4 py-2.5 rounded-2xl hover:bg-[#e8f3ec] transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <ChevronLeft className="size-4" />
            <span>ড্যাশবোর্ডে ফিরুন</span>
          </button>
          
          <span className="text-[10px] font-black text-[#7d8a84] uppercase tracking-widest bg-white border border-[#e5ebe6] px-3.5 py-1.5 rounded-full shadow-inner">
            প্রোফাইল সেটিংস
          </span>
        </div>

        {/* Profile Card Header */}
        <div className="bg-white rounded-[2rem] border border-[#e5ebe6] p-6 md:p-8 shadow-xl shadow-emerald-950/5 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
          {/* Glass design visual overlay */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-100/30 via-transparent to-transparent blur-2xl pointer-events-none" />

          {/* Avatar Section */}
          <div className="relative group shrink-0">
            <div className="size-28 rounded-[2rem] bg-gradient-to-tr from-[#0f4f3a] to-[#207c5c] flex items-center justify-center text-4xl font-black text-white shadow-lg shadow-emerald-950/15">
              {personalForm.name ? personalForm.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'U'}
            </div>
            <button className="absolute -bottom-1 -right-1 size-9 bg-[#0f4f3a] hover:bg-[#082d22] text-white border-2 border-white rounded-xl flex items-center justify-center cursor-pointer shadow-md transition-all group-hover:scale-105 active:scale-95">
              <Camera className="size-4" />
            </button>
          </div>

          {/* Title Text Info */}
          <div className="text-center md:text-left space-y-2.5 flex-1">
            <div>
              <h2 className="text-2xl font-black text-[#17231f]">{personalForm.name}</h2>
              <p className="text-xs font-semibold text-[#7d8a84] mt-0.5">{personalForm.email}</p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-[10px] font-black bg-[#e8f3ec] text-[#0f4f3a] border border-emerald-100">
                <ShieldCheck className="size-3.5" />
                {activeUser.role === 'SELLER' ? 'অনুমোদিত বিক্রেতা' : activeUser.role === 'ADMIN' ? 'সিস্টেম অ্যাডমিন' : 'সদস্য'}
              </span>
              
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-100">
                ⭐ প্রফেশনাল আড়তদার
              </span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="bg-white rounded-2xl border border-[#e5ebe6] p-1.5 flex gap-1 shadow-sm">
          {[
            { id: 'personal', label: 'ব্যক্তিগত তথ্য', icon: User },
            { id: 'business', label: 'ব্যবসায়িক প্রোফাইল', icon: Building2 },
            { id: 'security', label: 'নিরাপত্তা ও পাসওয়ার্ড', icon: ShieldCheck }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0f4f3a] text-white shadow-md shadow-emerald-950/15'
                    : 'text-[#66756e] hover:bg-[#f4f7f5] hover:text-[#17231f]'
                }`}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Forms Content Area */}
        <div className="bg-white rounded-[2rem] border border-[#e5ebe6] p-6 md:p-8 shadow-xl shadow-emerald-950/5">
          <AnimatePresence mode="wait">
            {activeSubTab === 'personal' && (
              <motion.form 
                key="personal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSaveProfile}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h3 className="text-base font-black text-[#17231f]">ব্যক্তিগত প্রোফাইল এডিট করুন</h3>
                  <p className="text-xs text-[#7d8a84] font-semibold">আপনার যোগাযোগের সাধারণ বিবরণ আপডেট রাখুন</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#66756e]">নাম বা প্রোফাইল টাইটেল</label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 size-4 text-[#7d8a84]" />
                      <input 
                        type="text" 
                        required
                        value={personalForm.name}
                        onChange={(e) => setPersonalForm({...personalForm, name: e.target.value})}
                        className="w-full bg-[#f4f7f5] border border-[#e5ebe6] rounded-2xl pl-11 pr-4 py-3.5 text-xs font-bold text-[#17231f] focus:outline-none focus:border-[#0f4f3a] focus:bg-white transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#66756e]">ইমেইল এড্রেস</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 size-4 text-[#7d8a84]" />
                      <input 
                        type="email" 
                        required
                        value={personalForm.email}
                        onChange={(e) => setPersonalForm({...personalForm, email: e.target.value})}
                        className="w-full bg-[#f4f7f5] border border-[#e5ebe6] rounded-2xl pl-11 pr-4 py-3.5 text-xs font-bold text-[#17231f] focus:outline-none focus:border-[#0f4f3a] focus:bg-white transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#66756e]">মোবাইল নাম্বার</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-3.5 size-4 text-[#7d8a84]" />
                      <input 
                        type="tel" 
                        value={personalForm.phone}
                        onChange={(e) => setPersonalForm({...personalForm, phone: e.target.value})}
                        className="w-full bg-[#f4f7f5] border border-[#e5ebe6] rounded-2xl pl-11 pr-4 py-3.5 text-xs font-bold text-[#17231f] focus:outline-none focus:border-[#0f4f3a] focus:bg-white transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#66756e]">পদবী / ডেজিগনেশন</label>
                    <div className="relative">
                      <Tag className="absolute left-4 top-3.5 size-4 text-[#7d8a84]" />
                      <input 
                        type="text" 
                        value={personalForm.designation}
                        onChange={(e) => setPersonalForm({...personalForm, designation: e.target.value})}
                        className="w-full bg-[#f4f7f5] border border-[#e5ebe6] rounded-2xl pl-11 pr-4 py-3.5 text-xs font-bold text-[#17231f] focus:outline-none focus:border-[#0f4f3a] focus:bg-white transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-[#eef2ef]">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSaving}
                    type="submit"
                    className="flex items-center gap-2 bg-[#0f4f3a] hover:bg-[#082d22] text-white px-6 py-3.5 rounded-2xl text-xs font-black shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>সংরক্ষণ হচ্ছে...</>
                    ) : (
                      <>
                        <Save className="size-4" />
                        <span>প্রোফাইল সেভ করুন</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.form>
            )}

            {activeSubTab === 'business' && (
              <motion.form 
                key="business"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  toast.success('ব্যবসায়িক তথ্য সফলভাবে সেভ করা হয়েছে!');
                }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h3 className="text-base font-black text-[#17231f]">ব্যবসায়িক বিবরণী</h3>
                  <p className="text-xs text-[#7d8a84] font-semibold">আপনার আড়ত বা ফার্মের প্রাতিষ্ঠানিক তথ্য মেলাুন</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#66756e]">আড়ত বা শপের নাম</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-3.5 size-4 text-[#7d8a84]" />
                      <input 
                        type="text" 
                        required
                        value={businessForm.shopName}
                        onChange={(e) => setBusinessForm({...businessForm, shopName: e.target.value})}
                        className="w-full bg-[#f4f7f5] border border-[#e5ebe6] rounded-2xl pl-11 pr-4 py-3.5 text-xs font-bold text-[#17231f] focus:outline-none focus:border-[#0f4f3a] focus:bg-white transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#66756e]">ট্যাক্স লাইসেন্স নাম্বার / TIN</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-3.5 size-4 text-[#7d8a84]" />
                      <input 
                        type="text" 
                        value={businessForm.taxNumber}
                        onChange={(e) => setBusinessForm({...businessForm, taxNumber: e.target.value})}
                        className="w-full bg-[#f4f7f5] border border-[#e5ebe6] rounded-2xl pl-11 pr-4 py-3.5 text-xs font-bold text-[#17231f] focus:outline-none focus:border-[#0f4f3a] focus:bg-white transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#66756e]">মুদ্রা (Currency)</label>
                    <select 
                      value={businessForm.currency}
                      onChange={(e) => setBusinessForm({...businessForm, currency: e.target.value})}
                      className="w-full bg-[#f4f7f5] border border-[#e5ebe6] rounded-2xl px-4 py-3.5 text-xs font-bold text-[#17231f] focus:outline-none focus:border-[#0f4f3a] focus:bg-white cursor-pointer shadow-inner"
                    >
                      <option value="BDT">BDT (৳) - বাংলাদেশী টাকা</option>
                      <option value="USD">USD ($) - ইউএস ডলার</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#66756e]">আড়তের মূল লোকেশন</label>
                    <input 
                      type="text" 
                      value={businessForm.location}
                      onChange={(e) => setBusinessForm({...businessForm, location: e.target.value})}
                      className="w-full bg-[#f4f7f5] border border-[#e5ebe6] rounded-2xl px-4 py-3.5 text-xs font-bold text-[#17231f] focus:outline-none focus:border-[#0f4f3a] focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-[#eef2ef]">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex items-center gap-2 bg-[#0f4f3a] hover:bg-[#082d22] text-white px-6 py-3.5 rounded-2xl text-xs font-black shadow-sm cursor-pointer"
                  >
                    <Save className="size-4" />
                    <span>ব্যবসায়িক তথ্য সংরক্ষণ করুন</span>
                  </motion.button>
                </div>
              </motion.form>
            )}

            {activeSubTab === 'security' && (
              <motion.form 
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  if (securityForm.newPassword !== securityForm.confirmPassword) {
                    toast.error('নতুন পাসওয়ার্ড দুটি মিলছে না!');
                    return;
                  }
                  toast.success('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!');
                  setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h3 className="text-base font-black text-[#17231f]">নিরাপত্তা সেটিংস</h3>
                  <p className="text-xs text-[#7d8a84] font-semibold">নিয়মিত পাসওয়ার্ড আপডেট করে একাউন্ট সুরক্ষিত রাখুন</p>
                </div>

                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#66756e]">বর্তমান পাসওয়ার্ড</label>
                    <input 
                      type="password" 
                      required
                      value={securityForm.currentPassword}
                      onChange={(e) => setSecurityForm({...securityForm, currentPassword: e.target.value})}
                      className="w-full bg-[#f4f7f5] border border-[#e5ebe6] rounded-2xl px-4 py-3.5 text-xs font-bold text-[#17231f] focus:outline-none focus:border-[#0f4f3a] focus:bg-white transition-all shadow-inner"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#66756e]">নতুন পাসওয়ার্ড</label>
                    <input 
                      type="password" 
                      required
                      value={securityForm.newPassword}
                      onChange={(e) => setSecurityForm({...securityForm, newPassword: e.target.value})}
                      className="w-full bg-[#f4f7f5] border border-[#e5ebe6] rounded-2xl px-4 py-3.5 text-xs font-bold text-[#17231f] focus:outline-none focus:border-[#0f4f3a] focus:bg-white transition-all shadow-inner"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#66756e]">নতুন পাসওয়ার্ড নিশ্চিত করুন</label>
                    <input 
                      type="password" 
                      required
                      value={securityForm.confirmPassword}
                      onChange={(e) => setSecurityForm({...securityForm, confirmPassword: e.target.value})}
                      className="w-full bg-[#f4f7f5] border border-[#e5ebe6] rounded-2xl px-4 py-3.5 text-xs font-bold text-[#17231f] focus:outline-none focus:border-[#0f4f3a] focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-[#eef2ef]">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3.5 rounded-2xl text-xs font-black shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="size-4" />
                    <span>পাসওয়ার্ড আপডেট করুন</span>
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
