"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf, Mail, Lock, ArrowRight, Loader2, ShieldCheck, CheckCircle2, TrendingUp, Users, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { user, isLoading, login, signInWithGoogle } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'ADMIN' || (user.role as string) === 'SUPER_ADMIN') {
        router.replace('/admin');
      } else if (user.businessId) {
        router.replace('/dashboard');
      } else {
        router.replace('/onboarding');
      }
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const loggedInUser = await login(formData.email, formData.password);
      if (loggedInUser.role === 'ADMIN' || (loggedInUser.role as string) === 'SUPER_ADMIN') {
        router.push('/admin');
      } else if (loggedInUser.businessId) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Login failed. Please verify your credentials.");
      } else {
        setError("Login failed. Please verify your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-[var(--brand-cream)] overflow-x-hidden">
      {/* Left Side: Visual/Brand Panel (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[var(--brand-leaf)] p-16 flex-col justify-between overflow-hidden">
        {/* Soft Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
        </div>
        
        {/* Floating Background Orbs */}
        <motion.div 
          animate={{ 
            x: [0, 40, -20, 0],
            y: [0, -30, 40, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none"
        />
        <motion.div 
          animate={{ 
            x: [0, -50, 30, 0],
            y: [0, 40, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-[var(--brand-paddy)]/10 rounded-full blur-[100px] pointer-events-none"
        />

        {/* Top Header / Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 text-white group">
            <div className="w-11 h-11 bg-[var(--brand-paddy)] rounded-xl flex items-center justify-center text-[var(--brand-leaf)] shadow-md transition-transform duration-300 group-hover:scale-105">
              <Leaf className="w-6 h-6 fill-current" />
            </div>
            <span className="text-2xl font-black tracking-tight uppercase">AgriQon</span>
          </Link>
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 max-w-xl my-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-black text-white leading-[1.15] tracking-tight">
              Empowering agriculture <br />
              through <span className="text-[var(--brand-paddy)]">intelligent workflows</span>.
            </h2>
            <p className="mt-4 text-emerald-100/70 text-lg font-medium max-w-md">
              The next-generation marketplace and resource planner connecting local farms directly to business supply chains.
            </p>
          </motion.div>

          {/* Interactive Metric Cards */}
          <div className="space-y-4 pt-4">
            {/* Stat 1 */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[var(--brand-paddy)]">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-white font-extrabold text-lg">12,500+ Active Farmers</div>
                <div className="text-emerald-100/60 text-xs font-semibold">Verified and trading nationwide</div>
              </div>
            </motion.div>

            {/* Stat 2 */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[var(--brand-paddy)]">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <div className="text-white font-extrabold text-lg">450+ Fresh Produce Varieties</div>
                <div className="text-emerald-100/60 text-xs font-semibold">From certified organic & sustainable growers</div>
              </div>
            </motion.div>

            {/* Stat 3 */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[var(--brand-paddy)]">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <div className="text-white font-extrabold text-lg">Real-Time Price Discovery</div>
                <div className="text-emerald-100/60 text-xs font-semibold">Driven by local demand and artificial intelligence</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center gap-4 text-emerald-100/50 text-sm font-semibold">
          <span>© 2026 AgriQon Technologies Inc.</span>
        </div>
      </div>

      {/* Right Side: Form Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full mx-auto space-y-8"
        >
          {/* Header Title */}
          <div className="space-y-3">
            <h1 className="text-4xl font-black text-[var(--brand-ink)] tracking-tight">Welcome Back</h1>
            <p className="text-[var(--brand-muted)] font-bold text-sm">
              Manage your orders, track inventory, and connect with partners.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold flex items-center gap-3 overflow-hidden"
                >
                  <span className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0 animate-ping" />
                  <p className="flex-1">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              {/* Email Address */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-[var(--brand-muted)] ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[var(--brand-leaf)] transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <Input 
                    type="email" 
                    placeholder="name@example.com"
                    required
                    className="pl-12 h-13 rounded-xl border-slate-200/80 focus:border-[var(--brand-leaf)] focus-visible:ring-1 focus-visible:ring-[var(--brand-leaf)] transition-all bg-white font-medium text-slate-800"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-black uppercase tracking-widest text-[var(--brand-muted)]">Password</label>
                  <Link href="#" className="text-xs font-black text-[var(--brand-leaf)] hover:underline">Forgot Password?</Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[var(--brand-leaf)] transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <Input 
                    type="password" 
                    placeholder="••••••••"
                    required
                    className="pl-12 h-13 rounded-xl border-slate-200/80 focus:border-[var(--brand-leaf)] focus-visible:ring-1 focus-visible:ring-[var(--brand-leaf)] transition-all bg-white font-medium text-slate-800"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-13 bg-[var(--brand-leaf)] hover:bg-[var(--brand-leaf-dark)] text-white text-base font-black rounded-xl gap-2 shadow-lg shadow-[var(--brand-leaf)]/10 hover:shadow-xl active:scale-[0.99] transition-all group duration-300"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Log In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/80"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase font-black tracking-widest">
              <span className="bg-[var(--brand-cream)] px-4 text-slate-400">Or continue with</span>
            </div>
          </div>

          {/* Google SSO Button */}
          <Button
            type="button"
            variant="outline"
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full h-13 rounded-xl border-slate-200/80 bg-white font-black text-slate-700 gap-3 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center active:scale-[0.99]"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
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
            Google OAuth
          </Button>

          {/* Registration Prompt */}
          <p className="text-center text-slate-500 font-bold text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-[var(--brand-leaf)] font-black hover:underline underline-offset-4">
              Sign Up
            </Link>
          </p>

          {/* Trust Footer */}
          <div className="pt-8 flex items-center justify-center gap-2 text-xs font-black text-slate-400 uppercase tracking-wider">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Secured by 256-bit encryption
          </div>
        </motion.div>
      </div>
    </main>
  );
}
