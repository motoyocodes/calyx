"use client";

import React, { useState } from "react";
import { PlanTier } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { X, Check, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { useUIState } from "@/context/UIStateContext";

interface UpgradeModalProps {
  plan: PlanTier | null;
  billingCycle: "monthly" | "annual";
  onClose: () => void;
  onConfirmUpgrade: (plan: PlanTier) => void;
}

export default function UpgradeModal({
  plan,
  billingCycle,
  onClose,
  onConfirmUpgrade,
}: UpgradeModalProps) {
  const { addToast } = useUIState();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!plan) return null;

  const isAnnual = billingCycle === "annual";
  const price = isAnnual ? plan.annualPriceMonthly : plan.monthlyPrice;
  const annualTotal = plan.annualPriceMonthly * 12;
  const proratedCredit = 48.0; // Simulated unused days on current Starter tier
  const totalDueToday = isAnnual ? Math.max(0, annualTotal - proratedCredit) : Math.max(0, price - proratedCredit);

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onConfirmUpgrade(plan);
      addToast({
        title: `Upgraded to ${plan.name} Plan!`,
        description: `Your subscription is now upgraded with ${isAnnual ? "annual" : "monthly"} billing.`,
        type: "success",
      });
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="relative bg-white rounded-3xl border border-[#E8E6E0] shadow-2xl max-w-lg w-full p-6 sm:p-8 z-10 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EBF3EE] text-[#2D5A43] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900">Upgrade to {plan.name} Tier</h3>
            <p className="text-xs text-stone-500">
              Immediate unlock of advanced subscription analytics and team seats.
            </p>
          </div>
        </div>

        {/* Tier Details Summary */}
        <div className="mt-6 p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E0]">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-semibold text-stone-700">Billing Cadence</span>
            <span className="text-xs font-bold text-[#2D5A43] capitalize">
              {billingCycle} ({isAnnual ? "20% Saved" : "Standard"})
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-[#E8E6E0]">
            <span className="text-xs text-stone-500">Plan Rate</span>
            <span className="text-xs font-mono font-bold text-stone-900">
              {formatCurrency(price)} / mo
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-2 text-xs text-emerald-800">
            <span>Prorated credit for current cycle</span>
            <span className="font-mono font-bold">-{formatCurrency(proratedCredit)}</span>
          </div>
          <div className="flex items-baseline justify-between mt-3 pt-3 border-t border-[#E8E6E0] text-sm font-bold text-stone-900">
            <span>Charged today</span>
            <span className="text-base text-[#2D5A43] font-mono">
              {formatCurrency(totalDueToday, { showCents: true })}
            </span>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-6">
          <span className="text-[11px] font-mono uppercase text-stone-400 font-semibold block mb-2">
            Included in this tier:
          </span>
          <ul className="space-y-2">
            {plan.features.slice(0, 4).map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-stone-700">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Payment Confirmation */}
        <div className="mt-6 p-3 rounded-xl bg-stone-50 border border-[#E8E6E0] flex items-center justify-between text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2D5A43]" />
            <span>Mastercard ending in <strong>4829</strong></span>
          </div>
          <span className="text-[11px] text-stone-400">Default method</span>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-[#FAF9F6] border border-[#E8E6E0] rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="flex-1 py-2.5 px-4 bg-[#2D5A43] text-white rounded-xl text-xs font-semibold hover:bg-[#1F4231] shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <span>Updating Subscription...</span>
            ) : (
              <>
                <span>Confirm & Upgrade</span>
                <ArrowRight className="w-4 h-4 text-emerald-200" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
