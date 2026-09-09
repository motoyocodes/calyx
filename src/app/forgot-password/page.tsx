"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { useUIState } from "@/context/UIStateContext";

export default function ForgotPasswordPage() {
  const { addToast } = useUIState();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 600));
    setIsLoading(false);
    setIsSubmitted(true);
    addToast({
      title: "Reset Link Dispatched",
      description: `Password recovery token sent to ${email}.`,
      type: "success",
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#2D5A43] text-white flex items-center justify-center font-bold text-sm tracking-widest shadow-sm group-hover:scale-105 transition-transform">
              CX
            </div>
            <span className="font-bold text-xl tracking-tight text-[#1A1C1A]">
              calyx<span className="text-[#2D5A43]">.</span>
            </span>
          </Link>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-stone-900">
            Reset your password
          </h2>
          <p className="mt-1 text-xs text-stone-500">
            Enter your work email address to receive a secure recovery token
          </p>
        </div>

        <div className="mt-6 bg-white py-8 px-6 shadow-xl border border-[#E8E6E0] sm:rounded-3xl sm:px-8">
          {isSubmitted ? (
            <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900">Check your inbox</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                We sent a password reset token and verification link to{" "}
                <strong className="text-stone-800">{email}</strong>.
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D5A43] text-white text-xs font-bold hover:bg-[#1F4231] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] focus:border-[#2D5A43] focus:bg-white outline-hidden transition-all text-stone-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#2D5A43] hover:bg-[#1F4231] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
