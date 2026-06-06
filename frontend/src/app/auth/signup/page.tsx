'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, User, Briefcase, ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER' as 'USER' | 'SELLER',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user, isLoading, register, signUpWithGoogle } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'SELLER') {
        if (!user.businessId) {
          router.replace('/onboarding');
        } else {
          router.replace('/dashboard');
        }
      } else {
        router.replace('/');
      }
    }
  }, [user, isLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);

    try {
      const signedUpUser = await register(formData.email, formData.password, formData.name, formData.role);
      if (signedUpUser.role === 'SELLER') {
        if (!signedUpUser.businessId) {
          router.push('/onboarding');
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push('/');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(err.response?.data?.message || 'Signup failed. Please try again.');
      } else if (err instanceof Error) {
        setError(err.message || 'Signup failed. Please try again.');
      } else {
        setError('Signup failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* Left Side: Visual/Branding (Consistent with Login) */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex relative overflow-hidden bg-emerald-900"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay scale-110"
          style={{ backgroundImage: "url('/images/auth-bg.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-emerald-900/50" />
        
        <div className="relative z-10 w-full flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2">
            <div className="size-10 bg-white rounded-xl flex items-center justify-center">
              <div className="size-6 bg-emerald-600 rounded-full" />
            </div>
            <span className="text-2xl font-black tracking-tight italic">AGRIQON</span>
          </div>

          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl font-black leading-tight mb-6"
            >
              Start Your <br />
              <span className="text-emerald-400">Green Journey</span>
            </motion.h1>
            <div className="space-y-4">
              {[
                "Access premium seeds and equipment",
                "Direct connection with farmers",
                "AI-powered yield predictions",
                "Secure and transparent payments"
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (idx * 0.1) }}
                  className="flex items-center gap-3 text-emerald-100/90 font-medium"
                >
                  <div className="size-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <ArrowRight size={12} />
                  </div>
                  {item}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
            <p className="text-sm text-emerald-100 font-medium italic">
              &ldquo;AgriQon transformed how we manage our supply chain. The visibility and ease of use are second to none.&rdquo;
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="size-8 rounded-full bg-emerald-700" />
              <div>
                <p className="text-xs font-bold">Jonathan Field</p>
                <p className="text-[10px] text-emerald-300">Organic Harvest Co.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Side: Signup Form */}
      <div className="flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-slate-50/50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Create Account</h2>
            <p className="text-slate-500 font-medium">
              Already have an account? {' '}
              <Link href="/auth/login" className="text-emerald-600 font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-3"
              >
                <div className="size-2 bg-red-600 rounded-full" />
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                    <User size={18} />
                  </div>
                  <Input
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="pl-12 h-12 bg-white border-slate-200 rounded-xl focus:ring-emerald-500 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                    <Mail size={18} />
                  </div>
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="pl-12 h-12 bg-white border-slate-200 rounded-xl focus:ring-emerald-500 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">I am a...</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'USER' })}
                    className={`h-12 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      formData.role === 'USER' 
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700' 
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <User size={16} />
                    Buyer
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'SELLER' })}
                    className={`h-12 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      formData.role === 'SELLER' 
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700' 
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <Briefcase size={16} />
                    Seller
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                      <Lock size={18} />
                    </div>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="pl-12 h-12 bg-white border-slate-200 rounded-xl focus:ring-emerald-500 transition-all shadow-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Confirm</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                      <Lock size={18} />
                    </div>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      className="pl-12 h-12 bg-white border-slate-200 rounded-xl focus:ring-emerald-500 transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

             <Button 
              type="submit" 
              disabled={submitting || isLoading}
              className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-lg shadow-lg shadow-emerald-200 group transition-all active:scale-95 mt-4"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Create Account
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="px-4 bg-slate-50 text-slate-400 font-bold uppercase tracking-widest">Or sign up with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => signUpWithGoogle(formData.role)}
              disabled={submitting || isLoading}
              className="w-full h-12 border-slate-200 hover:bg-white hover:border-slate-300 rounded-xl font-bold flex items-center justify-center gap-3 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#4285F4"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
          </form>

          <footer className="mt-8 text-center">
            <p className="text-[10px] text-slate-400 font-medium max-w-xs mx-auto">
              By creating an account, you agree to our {' '}
              <Link href="/terms" className="underline font-bold text-slate-500">Terms of Service</Link> and {' '}
              <Link href="/privacy" className="underline font-bold text-slate-500">Privacy Policy</Link>.
            </p>
          </footer>
        </motion.div>
      </div>
    </div>
  );
}
