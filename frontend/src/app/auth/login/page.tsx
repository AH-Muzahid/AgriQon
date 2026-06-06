"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf, Mail, Lock, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { user, isLoading, login, signInWithGoogle } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "SELLER") {
        if (!user.businessId) {
          router.replace("/onboarding");
        } else {
          router.replace("/dashboard");
        }
      } else {
        router.replace("/");
      }
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const loggedInUser = await login(formData.email, formData.password);
      if (loggedInUser.role === "SELLER") {
        if (!loggedInUser.businessId) {
          router.push("/onboarding");
        } else {
          router.push("/dashboard");
        }
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(err.response?.data?.message || "Login failed. Please verify your credentials.");
      } else if (err instanceof Error) {
        setError(err.message || "Login failed. Please verify your credentials.");
      } else {
        setError("Login failed. Please verify your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-[#fcfdfc]">
      {/* Left Side: Visual/Brand (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0a4d3c] p-16 flex-col justify-between overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px]" />
        </div>
        
        {/* Animated Shapes */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 size-96 bg-emerald-500/20 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-24 -right-24 size-96 bg-yellow-500/10 rounded-full blur-3xl"
        />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 text-white">
            <div className="size-10 bg-[#facc15] rounded-xl flex items-center justify-center text-[#0a4d3c]">
              <Leaf className="size-6 fill-current" />
            </div>
            <span className="text-2xl font-black tracking-tighter">AgriQon</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-5xl font-black text-white leading-[1.1] mb-6 tracking-tight">
            The future of <span className="text-[#facc15]">Direct-to-Consumer</span> agriculture.
          </h2>
          <p className="text-emerald-100/80 text-xl leading-relaxed">
            Join thousands of conscious consumers and local farmers building a sustainable food ecosystem together.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-6">
          <div className="flex -space-x-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="size-12 rounded-full border-4 border-[#0a4d3c] overflow-hidden bg-emerald-800">
                <Image 
                  src={`https://i.pravatar.cc/100?u=${i}`} 
                  alt="User" 
                  width={48} 
                  height={48} 
                />
              </div>
            ))}
          </div>
          <div className="text-white">
            <div className="font-bold">850+ Farmers</div>
            <div className="text-sm opacity-60">Verified & active today</div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-12">
        <div className="max-w-md w-full mx-auto space-y-10">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Welcome Back</h1>
            <p className="text-gray-500 font-medium">Log in to your AgriQon account to continue your journey.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-600 transition-colors">
                    <Mail className="size-5" />
                  </div>
                  <Input 
                    type="email" 
                    placeholder="name@example.com"
                    required
                    className="pl-12 h-14 rounded-2xl border-gray-200 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-bold text-gray-700">Password</label>
                  <Link href="#" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Forgot?</Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-600 transition-colors">
                    <Lock className="size-5" />
                  </div>
                  <Input 
                    type="password" 
                    placeholder="••••••••"
                    required
                    className="pl-12 h-14 rounded-2xl border-gray-200 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 bg-[#0a4d3c] hover:bg-[#07382b] text-white text-lg font-black rounded-2xl shadow-xl shadow-emerald-900/10 gap-3 group"
            >
              {loading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <>
                  Log In Account
                  <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase font-black tracking-widest">
              <span className="bg-[#fcfdfc] px-4 text-gray-400">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full h-14 rounded-2xl border-gray-200 font-bold gap-3 hover:bg-gray-50 transition-all flex items-center justify-center"
          >
            <svg className="w-5 h-5 animate-none" viewBox="0 0 24 24">
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

          <p className="text-center text-gray-500 font-medium">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-emerald-600 font-black hover:underline underline-offset-4">Sign Up</Link>
          </p>

          <div className="pt-8 flex items-center justify-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <ShieldCheck className="size-4 text-emerald-500" />
            Secure Encrypted Login
          </div>
        </div>
      </div>
    </main>
  );
}
