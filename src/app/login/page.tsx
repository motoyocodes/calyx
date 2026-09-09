"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useUIState } from "@/context/UIStateContext";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  UserPlus,
  AlertCircle,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";
  const { login, hasAccounts } = useAuth();
  const { addToast } = useUIState();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg("Please enter your work email address.");
      return;
    }
    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await login(email, password, rememberMe);
      if (res.success) {
        addToast({
          title: "Signed In Successfully",
          description: `Welcome back to Calyx.`,
          type: "success",
        });
        router.push(redirectUrl);
      } else {
        setErrorMsg(res.error || "Authentication failed. Please check your credentials.");
      }
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Ambient background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-100/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#2D5A43]/5 blur-3xl" />
      </div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="text-center">
          <Link href="/login" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#2D5A43] text-white flex items-center justify-center font-bold text-sm tracking-widest shadow-sm group-hover:scale-105 transition-transform">
              CX
            </div>
            <span className="font-bold text-xl tracking-tight text-[#1A1C1A]">
              calyx<span className="text-[#2D5A43]">.</span>
            </span>
          </Link>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-stone-900">
            Sign in to your account
          </h2>
        </div>

        {/* Main Card */}
        <div className="mt-6 bg-white py-8 px-6 shadow-xl border border-[#E8E6E0] sm:rounded-3xl sm:px-8">
          {/* First-time Account Creation Banner */}
          {!hasAccounts && (
            <div className="mb-6 p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-xs">
              <div className="flex items-start gap-2.5">
                <UserPlus className="w-4 h-4 text-[#2D5A43] shrink-0 mt-0.5" />
                <div className="space-y-1.5 flex-1">
                  <p className="font-bold text-stone-900">No account created yet</p>
                  <p className="text-stone-600 leading-relaxed text-[11px]">
                    Create your <strong>Admin</strong> or <strong>Billing</strong> account first, then use it to log in securely.
                  </p>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-1.5 mt-1 font-bold text-[#2D5A43] hover:underline"
                  >
                    <span>Create Admin or Billing Account</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div className="space-y-1">
                  <span>{errorMsg}</span>
                  {errorMsg.includes("No registered accounts") || errorMsg.includes("No account registered") ? (
                    <div>
                      <Link href="/signup" className="font-bold underline text-rose-800">
                        Click here to create an account
                      </Link>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-stone-700 mb-1">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] focus:border-[#2D5A43] focus:bg-white outline-hidden transition-all text-stone-900 placeholder:text-stone-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-xs font-semibold text-stone-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-[#2D5A43] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] focus:border-[#2D5A43] focus:bg-white outline-hidden transition-all text-stone-900 placeholder:text-stone-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#E8E6E0] text-[#2D5A43] focus:ring-[#2D5A43]"
                />
                <span className="text-xs text-stone-600">Remember this device for 30 days</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#2D5A43] hover:bg-[#1F4231] active:bg-[#163023] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E8E6E0] text-center">
            <p className="text-xs text-stone-600">
              Don&apos;t have an account yet?{" "}
              <Link href="/signup" className="font-bold text-[#2D5A43] hover:underline">
                Create an Admin or Billing account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
