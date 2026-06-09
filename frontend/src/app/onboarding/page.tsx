'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, User } from '@/context/auth-context';
import { apiClient, ApiResponse } from '@/lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Building2, 
  ArrowRight, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  DollarSign, 
  FileText, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore, translateBackendUser } from '@/store/auth-store';

export default function OnboardingPage() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    taxNumber: '',
    currency: 'BDT',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Business Name is required');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. Post to create business
      await apiClient.client.post('/business', {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        website: formData.website || undefined,
        taxNumber: formData.taxNumber || undefined,
        currency: formData.currency,
      });

      // 2. Token refresh is required because backend controllers (e.g., Accounting, AI)
      // rely directly on req.user.businessId claims encoded within the JWT.
      const refreshRes = await apiClient.client.post('/auth/refresh') as any;
      const responseData = refreshRes?.data || refreshRes;
      const newAccessToken = responseData?.accessToken;
      if (newAccessToken) {
        apiClient.setToken(newAccessToken);
      }

      // 3. Fetch updated profile (so businessId is populated)
      const userRes = (await apiClient.client.get('/auth/me')) as unknown as ApiResponse<User>;

      // Axios interceptor unwraps response to return response.data
      const updatedUser = userRes.data;

      // 4. Verify that the updated user payload contains the business information
      if (!updatedUser || !updatedUser.businessId) {
        throw new Error('Onboarding failed: businessId was not populated in the retrieved user profile.');
      }
      
      const enrichedUser = updatedUser as any;
      if (!enrichedUser.businessRole) {
        throw new Error('Onboarding failed: businessRole was not populated in the retrieved user profile.');
      }

      if (!enrichedUser.permissions || !Array.isArray(enrichedUser.permissions) || enrichedUser.permissions.length === 0) {
        throw new Error('Onboarding failed: permissions were not populated in the retrieved user profile.');
      }

      // 5. Update Auth Context (React State)
      setUser(updatedUser);

      // 6. Update Zustand Auth Store (Global state used by api-client interceptors)
      useAuthStore.getState().setUser(translateBackendUser(updatedUser));

      toast.success('AgroAI Business set up successfully!');

      // 7. Transition to success step
      setStep(3);

      // 8. Redirect to dashboard only after auth refresh completes
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create business. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white font-sans">
      {/* Left Branding Panel (40%) */}
      <div className="lg:col-span-5 relative overflow-hidden bg-emerald-950 flex flex-col justify-between p-8 lg:p-12 text-white">
        {/* Decorative background grid and gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.15),transparent_40%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(6,78,59,0.8))]" />
        
        <div className="relative z-10 flex items-center gap-2">
          <div className="size-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-950/20">
            <div className="size-6 bg-emerald-600 rounded-full" />
          </div>
          <span className="text-2xl font-black tracking-tight italic">AGRIQON</span>
        </div>

        <div className="relative z-10 my-auto py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/40 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles size={12} /> Workspace Setup
            </div>
            <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight mb-6">
              Welcome, <br />
              <span className="text-emerald-400">{user?.name || 'Partner'}</span>!
            </h1>
            <p className="text-emerald-100/80 text-lg font-medium leading-relaxed max-w-md">
              Let&apos;s set up your business workspace. This creates your multi-tenant environment, default warehouse, and system ledger.
            </p>
          </motion.div>

          {/* Stepper HUD */}
          <div className="mt-12 flex items-center gap-4">
            <div className={`size-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${
              step >= 1 ? 'border-emerald-400 bg-emerald-500 text-white' : 'border-emerald-800 text-emerald-600'
            }`}>1</div>
            <div className="h-0.5 w-12 bg-emerald-900" />
            <div className={`size-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${
              step >= 2 ? 'border-emerald-400 bg-emerald-500 text-white' : 'border-emerald-800 text-emerald-600'
            }`}>2</div>
            <div className="h-0.5 w-12 bg-emerald-900" />
            <div className={`size-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${
              step === 3 ? 'border-emerald-400 bg-emerald-500 text-white' : 'border-emerald-800 text-emerald-600'
            }`}><CheckCircle2 size={16} /></div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-emerald-300/60 font-medium">
          &copy; 2026 AgriQon Agriculture Platform. All rights reserved.
        </div>
      </div>

      {/* Right Form Panel (60%) */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 lg:p-16 bg-slate-50/50">
        <Card className="w-full max-w-lg border-slate-200/60 shadow-xl shadow-slate-100 bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden">
          <CardContent className="p-8 lg:p-10">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="mb-8">
                    <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2.5">
                      <Building2 className="text-emerald-600" size={24} /> Basic Business Details
                    </h2>
                    <p className="text-sm font-medium text-slate-500">Provide the fundamental identity of your farm or firm.</p>
                  </div>

                  {error && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-3 mb-6">
                      <AlertCircle size={18} />
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleNextStep} className="space-y-6">
                    <div className="space-y-2.5">
                      <Label htmlFor="name" className="text-xs font-black uppercase tracking-wider text-slate-400">Business / Farm Name *</Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Building2 size={18} /></span>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="e.g. Golden Harvest Co."
                          required
                          className="pl-12 h-12 bg-white border-slate-200 rounded-xl focus:ring-emerald-500 shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <Label htmlFor="currency" className="text-xs font-black uppercase tracking-wider text-slate-400">Base Currency</Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><DollarSign size={18} /></span>
                        <Input
                          id="currency"
                          name="currency"
                          value={formData.currency}
                          onChange={handleChange}
                          placeholder="BDT"
                          disabled
                          className="pl-12 h-12 bg-slate-50 border-slate-200 text-slate-500 rounded-xl cursor-not-allowed shadow-sm"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold ml-1">Currently restricted to BDT for standard transaction ledgers.</p>
                    </div>

                    <div className="space-y-2.5">
                      <Label htmlFor="taxNumber" className="text-xs font-black uppercase tracking-wider text-slate-400">Trade License / Tax ID (Optional)</Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><FileText size={18} /></span>
                        <Input
                          id="taxNumber"
                          name="taxNumber"
                          value={formData.taxNumber}
                          onChange={handleChange}
                          placeholder="e.g. TR-8372692"
                          className="pl-12 h-12 bg-white border-slate-200 rounded-xl focus:ring-emerald-500 shadow-sm"
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-13 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 group shadow-lg shadow-emerald-100 transition-all active:scale-95 mt-8"
                    >
                      Continue
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </form>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="mb-8">
                    <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2.5">
                      <MapPin className="text-emerald-600" size={24} /> Contact & Scope
                    </h2>
                    <p className="text-sm font-medium text-slate-500">Provide details for logistics, invoicing, and communications.</p>
                  </div>

                  {error && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-3 mb-6">
                      <AlertCircle size={18} />
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2.5">
                      <Label htmlFor="address" className="text-xs font-black uppercase tracking-wider text-slate-400">Physical Address / Farm Location</Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><MapPin size={18} /></span>
                        <Input
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="e.g. House 42, Road 12, Gulshan, Dhaka"
                          className="pl-12 h-12 bg-white border-slate-200 rounded-xl focus:ring-emerald-500 shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2.5">
                        <Label htmlFor="phone" className="text-xs font-black uppercase tracking-wider text-slate-400">Phone Number</Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Phone size={18} /></span>
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+880 17..."
                            className="pl-12 h-12 bg-white border-slate-200 rounded-xl focus:ring-emerald-500 shadow-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-2.5">
                        <Label htmlFor="email" className="text-xs font-black uppercase tracking-wider text-slate-400">Contact Email</Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Mail size={18} /></span>
                          <Input
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="sales@harvest.com"
                            className="pl-12 h-12 bg-white border-slate-200 rounded-xl focus:ring-emerald-500 shadow-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <Label htmlFor="website" className="text-xs font-black uppercase tracking-wider text-slate-400">Website / Facebook Page URL</Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Globe size={18} /></span>
                        <Input
                          id="website"
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                          placeholder="www.goldenharvest.com"
                          className="pl-12 h-12 bg-white border-slate-200 rounded-xl focus:ring-emerald-500 shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(1)}
                        disabled={isLoading}
                        className="h-13 border-slate-200 rounded-xl font-bold active:scale-95"
                      >
                        Back
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="h-13 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 group shadow-lg shadow-emerald-100 transition-all active:scale-95"
                      >
                        {isLoading ? (
                          <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          'Launch Business'
                        )}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="text-center py-12 space-y-6"
                >
                  <div className="inline-flex items-center justify-center size-20 rounded-full bg-emerald-50 text-emerald-600 mb-2">
                    <CheckCircle2 size={48} className="animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Setup Complete!</h2>
                    <p className="text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
                      Your transactional ledger and warehouse environments are ready. Redirecting to your dashboard...
                    </p>
                  </div>
                  <div className="size-8 rounded-full border-4 border-emerald-50 border-t-emerald-600 animate-spin mx-auto mt-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
