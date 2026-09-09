"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/context/AuthContext";
import { useUIState } from "@/context/UIStateContext";
import {
  ShieldCheck,
  Building2,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Shield,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const { addToast } = useUIState();

  const [role, setRole] = useState<UserRole>("admin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Password Strength Calculation
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumberOrSymbol = /[0-9!@#$%^&*(),.?":{}|<>]/.test(password);
  const strengthScore = [hasMinLength, hasUpperCase, hasNumberOrSymbol].filter(Boolean).length;

  const strengthLabel =
    password.length === 0
      ? ""
      : strengthScore === 1
      ? "Weak"
      : strengthScore === 2
      ? "Good"
      : "Strong";

  const strengthColor =
    strengthScore === 1
      ? "bg-rose-500"
      : strengthScore === 2
      ? "bg-amber-500"
      : strengthScore === 3
      ? "bg-emerald-500"
      : "bg-stone-200";

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !company) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    if (!hasMinLength) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }
    if (!agreedToTerms) {
      setErrorMsg("You must accept the terms of service to proceed.");
      return;
    }

    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await signup({
        name,
        email,
        company,
        role,
        password,
      });

      if (res.success) {
        addToast({
          title: `Account Created Successfully!`,
          description: `Registered as ${role === "admin" ? "Administrator" : "Billing Officer"} for ${company}.`,
          type: "success",
        });
        router.push("/");
      } else {
        setErrorMsg(res.error || "Failed to create account. Please try again.");
      }
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Ambient decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-100/30 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#2D5A43]/5 blur-3xl" />
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
            Create your account
          </h2>
          <p className="mt-1 text-xs text-stone-500">
            Set up an Admin or Billing account to access your workspace
          </p>
        </div>

        {/* Main Card */}
        <div className="mt-6 bg-white py-8 px-6 shadow-xl border border-[#E8E6E0] sm:rounded-3xl sm:px-8">
          <form className="space-y-4" onSubmit={handleSignupSubmit}>
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 animate-in fade-in">
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Account Role Selector */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                Account Type / Role *
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    role === "admin"
                      ? "border-[#2D5A43] bg-emerald-50/50 ring-1 ring-[#2D5A43]"
                      : "border-[#E8E6E0] bg-[#FAF9F6] hover:bg-stone-50"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-stone-900 mb-1">
                    <Shield className="w-3.5 h-3.5 text-[#2D5A43]" />
                    <span>Admin</span>
                  </div>
                  <p className="text-[10px] text-stone-500 leading-tight">
                    Full access including confidential Invoices ledger & team.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("billing")}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    role === "billing"
                      ? "border-[#2D5A43] bg-emerald-50/50 ring-1 ring-[#2D5A43]"
                      : "border-[#E8E6E0] bg-[#FAF9F6] hover:bg-stone-50"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-stone-900 mb-1">
                    <CreditCard className="w-3.5 h-3.5 text-[#2D5A43]" />
                    <span>Billing</span>
                  </div>
                  <p className="text-[10px] text-stone-500 leading-tight">
                    Subscriptions & MRR telemetry (Invoices ledger restricted).
                  </p>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="company" className="block text-xs font-semibold text-stone-700 mb-1">
                Company / Organization Name *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="company"
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Acme Technologies, Inc."
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] focus:border-[#2D5A43] focus:bg-white outline-hidden transition-all text-stone-900 placeholder:text-stone-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-stone-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Hayes"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] focus:border-[#2D5A43] focus:bg-white outline-hidden transition-all text-stone-900 placeholder:text-stone-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-stone-700 mb-1">
                Work Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jordan@acme.com"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] focus:border-[#2D5A43] focus:bg-white outline-hidden transition-all text-stone-900 placeholder:text-stone-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-stone-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password (8+ chars)"
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

              {/* Password Strength Meter */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-stone-500">Security strength:</span>
                    <span className="font-bold text-stone-700">{strengthLabel}</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden flex gap-1">
                    <div
                      className={`h-full flex-1 rounded-full transition-all ${
                        strengthScore >= 1 ? strengthColor : "bg-stone-200"
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-all ${
                        strengthScore >= 2 ? strengthColor : "bg-stone-200"
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-all ${
                        strengthScore >= 3 ? strengthColor : "bg-stone-200"
                      }`}
                    />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-stone-400">
                    <span className={hasMinLength ? "text-emerald-700 font-semibold" : ""}>
                      ✓ 8+ chars
                    </span>
                    <span className={hasUpperCase ? "text-emerald-700 font-semibold" : ""}>
                      ✓ Uppercase
                    </span>
                    <span className={hasNumberOrSymbol ? "text-emerald-700 font-semibold" : ""}>
                      ✓ Digit/symbol
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer text-xs text-stone-600">
                <input
                  type="checkbox"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-[#E8E6E0] text-[#2D5A43] focus:ring-[#2D5A43]"
                />
                <span>
                  I agree to the Master Services Agreement and Privacy Policy.
                </span>
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
                  <span>Create {role === "admin" ? "Admin" : "Billing"} Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E8E6E0] text-center">
            <p className="text-xs text-stone-600">
              Already created an account?{" "}
              <Link href="/login" className="font-bold text-[#2D5A43] hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
