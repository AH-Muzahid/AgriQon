'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, User, Briefcase, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

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
      if (err instanceof Error) {
        setError(err.message || 'Signup failed. Please try again.');
      } else {
        setError('Signup failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-[var(--brand-cream)] overflow-x-hidden">
      {/* Left Side: Visual/Branding (Consistent with Login) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[var(--brand-leaf)] p-16 flex-col justify-between overflow-hidden">
        {/* Soft Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
        </div>
        
        {/* Floating Background Orbs */}
        <motion.div 
          animate={{ 
            x: [0, -30, 40, 0],
            y: [0, 50, -30, 0],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none"
        />
        <motion.div 
          animate={{ 
            x: [0, 40, -40, 0],
            y: [0, -40, 30, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-32 -left-32 w-96 h-96 bg-[var(--brand-paddy)]/10 rounded-full blur-[100px] pointer-events-none"
        />

        {/* Top Header / Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 text-white group">
            <div className="w-11 h-11 bg-[var(--brand-paddy)] rounded-xl flex items-center justify-center text-[var(--brand-leaf)] shadow-md transition-transform duration-300 group-hover:scale-105">
              <div className="w-6 h-6 flex items-center justify-center font-black text-lg">AQ</div>
            </div>
            <span className="text-2xl font-black tracking-tight uppercase">AgriQon</span>
          </Link>
        </div>

        {/* Heading & Benefits */}
        <div className="relative z-10 max-w-xl my-auto space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-black text-white leading-[1.15] tracking-tight">
              Start your <br />
              <span className="text-[var(--brand-paddy)]">sustainable journey</span>.
            </h2>
            <p className="mt-4 text-emerald-100/70 text-lg font-medium max-w-md">
              Create an account and connect with our fast-growing network of sustainable producers and buyers.
            </p>
          </motion.div>

          {/* Benefits Checklist */}
          <div className="space-y-4">
            {[
              { title: "Direct Farmer Connections", desc: "No middle-men. Buy directly from source." },
              { title: "AI-Powered Yield Predictions", desc: "Know the crop volume before harvest." },
              { title: "Secure & Instant Settlements", desc: "Worry-free payments directly to farmer bank accounts." },
              { title: "Real-Time Inventory Tracking", desc: "Full traceablity from seeding to shipment." },
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -35 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + (idx * 0.1), duration: 0.5 }}
                className="flex items-start gap-4"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-[var(--brand-paddy)] mt-1 flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 fill-current text-[var(--brand-paddy)] stroke-[var(--brand-leaf)]" />
                </div>
                <div>
                  <div className="text-white font-extrabold text-base">{item.title}</div>
                  <div className="text-emerald-100/50 text-xs font-medium">{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Glassmorphic Testimonial */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md max-w-md"
          >
            <p className="text-emerald-50/80 text-sm font-semibold italic leading-relaxed">
              &ldquo;AgriQon has completely transformed how we manage our supplier agreements. The workflow and dashboard visibility are outstanding.&rdquo;
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[var(--brand-paddy)] flex items-center justify-center text-[var(--brand-leaf)] font-black text-sm">
                JF
              </div>
              <div>
                <p className="text-xs font-black text-white">Jonathan Field</p>
                <p className="text-[10px] text-emerald-200/60 font-semibold">Organic Harvest Co.</p>
              </div>
            </div>
          </motion.div>
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
          {/* Title Headers */}
          <div className="space-y-3">
            <h2 className="text-4xl font-black text-[var(--brand-ink)] tracking-tight">Create Account</h2>
            <p className="text-[var(--brand-muted)] font-bold text-sm">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-[var(--brand-leaf)] font-black hover:underline underline-offset-4">
                Log In
              </Link>
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
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
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-[var(--brand-muted)] ml-1">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[var(--brand-leaf)] transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <Input
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="pl-12 h-13 rounded-xl border-slate-200/80 focus:border-[var(--brand-leaf)] focus-visible:ring-1 focus-visible:ring-[var(--brand-leaf)] transition-all bg-white font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-[var(--brand-muted)] ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[var(--brand-leaf)] transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <Input
                    type="email"
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="pl-12 h-13 rounded-xl border-slate-200/80 focus:border-[var(--brand-leaf)] focus-visible:ring-1 focus-visible:ring-[var(--brand-leaf)] transition-all bg-white font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* I am a... (Role Selector Toggle) */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-[var(--brand-muted)] ml-1">Register As</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'USER' })}
                    className={`h-13 rounded-xl border-2 font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                      formData.role === 'USER' 
                        ? 'border-[var(--brand-leaf)] bg-[var(--brand-leaf-soft)] text-[var(--brand-leaf)]' 
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Buyer / Enterprise
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'SELLER' })}
                    className={`h-13 rounded-xl border-2 font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                      formData.role === 'SELLER' 
                        ? 'border-[var(--brand-leaf)] bg-[var(--brand-leaf-soft)] text-[var(--brand-leaf)]' 
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    Seller / Producer
                  </button>
                </div>
              </div>

              {/* Passwords (Side by side on desktop) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-[var(--brand-muted)] ml-1">Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[var(--brand-leaf)] transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="pl-12 h-13 rounded-xl border-slate-200/80 focus:border-[var(--brand-leaf)] focus-visible:ring-1 focus-visible:ring-[var(--brand-leaf)] transition-all bg-white font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-[var(--brand-muted)] ml-1">Confirm</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[var(--brand-leaf)] transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      className="pl-12 h-13 rounded-xl border-slate-200/80 focus:border-[var(--brand-leaf)] focus-visible:ring-1 focus-visible:ring-[var(--brand-leaf)] transition-all bg-white font-medium text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Register Button */}
            <Button 
              type="submit" 
              disabled={submitting || isLoading}
              className="w-full h-13 bg-[var(--brand-leaf)] hover:bg-[var(--brand-leaf-dark)] text-white text-base font-black rounded-xl gap-2 shadow-lg shadow-[var(--brand-leaf)]/10 hover:shadow-xl active:scale-[0.99] transition-all group duration-300 mt-2"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Create Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/80"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase font-black tracking-widest">
              <span className="bg-[var(--brand-cream)] px-4 text-slate-400">Or sign up with</span>
            </div>
          </div>

          {/* Google SSO Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => signUpWithGoogle(formData.role)}
            disabled={submitting || isLoading}
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

          {/* Terms / Privacy Footer */}
          <footer className="text-center">
            <p className="text-[10.5px] text-slate-400 font-bold max-w-xs mx-auto leading-relaxed uppercase tracking-wider">
              By creating an account, you agree to our {' '}
              <Link href="/terms" className="underline font-black text-slate-500 hover:text-[var(--brand-leaf)]">Terms</Link> and {' '}
              <Link href="/privacy" className="underline font-black text-slate-500 hover:text-[var(--brand-leaf)]">Privacy</Link>.
            </p>
          </footer>
        </motion.div>
      </div>
    </main>
  );
}
