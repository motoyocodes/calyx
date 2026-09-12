"use client";

import React, { useState } from "react";
import { useUIState } from "@/context/UIStateContext";
import { PLAN_TIERS, PlanTier } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import UpgradeModal from "@/components/subscriptions/UpgradeModal";
import { useAuth } from "@/context/AuthContext";
import {
  Check,
  Zap,
  Sparkles,
  ArrowRight,
  Users,
  Activity,
  HardDrive,
} from "lucide-react";

export default function SubscriptionsPage() {
  const {
    billingCycle,
    setBillingCycle,
    addToast,
    isDemoData,
    liveMRR,
    dispatchedEventsCount,
    formatMoneyWithFX,
  } = useUIState();
  const { user } = useAuth();
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<PlanTier | null>(null);
  const [activePlanId, setActivePlanId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("calyx_active_plan");
      if (saved) return saved;
    }
    return isDemoData ? "growth" : "starter";
  });

  // Sync plan if demo mode changes or clean workspace reset occurs
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("calyx_active_plan");
      if (saved) {
        setActivePlanId(saved);
      } else {
        setActivePlanId(isDemoData ? "growth" : "starter");
      }
    }
  }, [isDemoData]);

  const isAnnual = billingCycle === "annual";

  const handleUpgradeSuccess = (plan: PlanTier) => {
    setActivePlanId(plan.id);
    try {
      localStorage.setItem("calyx_active_plan", plan.id);
    } catch {
      // ignore
    }
  };

  const planLimits: Record<
    string,
    { maxSeats: number; maxMRR: number; maxMRRLabel: string; maxWebhooks: number; maxWebhooksLabel: string }
  > = {
    starter: {
      maxSeats: 3,
      maxMRR: 10000,
      maxMRRLabel: "$10k",
      maxWebhooks: 50000,
      maxWebhooksLabel: "50k",
    },
    growth: {
      maxSeats: 15,
      maxMRR: 100000,
      maxMRRLabel: "$100k",
      maxWebhooks: 500000,
      maxWebhooksLabel: "500k",
    },
    scale: {
      maxSeats: 50,
      maxMRR: 500000,
      maxMRRLabel: "Unlimited",
      maxWebhooks: 2000000,
      maxWebhooksLabel: "2M",
    },
  };

  const currentLimit = planLimits[activePlanId] || planLimits.starter;

  // Quota 1: Team Seats
  const seatsUsed = isDemoData ? 14 : 1;
  const seatsMax = isDemoData ? 20 : currentLimit.maxSeats;
  const seatsRemaining = Math.max(0, seatsMax - seatsUsed);
  const seatsPercent = Math.min(100, Math.round((seatsUsed / seatsMax) * 100));

  // Quota 2: Tracked MRR
  const mrrDisplay = isDemoData
    ? "$48.2k / $100k"
    : `${formatMoneyWithFX(liveMRR)} / ${currentLimit.maxMRRLabel}`;
  const mrrPercent = isDemoData
    ? 48
    : currentLimit.maxMRR > 0
    ? Math.min(100, Math.round((liveMRR / currentLimit.maxMRR) * 100))
    : 0;
  const mrrSubtext = isDemoData
    ? "48% capacity utilized"
    : `${mrrPercent}% capacity utilized`;

  // Quota 3: API Ingestion / Webhooks
  const webhooksUsed = isDemoData ? 184000 : dispatchedEventsCount;
  const webhooksMax = isDemoData ? 500000 : currentLimit.maxWebhooks;
  const webhooksDisplay = isDemoData
    ? "184k / 500k"
    : `${webhooksUsed.toLocaleString()} / ${currentLimit.maxWebhooksLabel}`;
  const webhooksRemaining = Math.max(0, webhooksMax - webhooksUsed);
  const webhooksPercent = isDemoData
    ? 36.8
    : Math.min(100, Math.round((webhooksUsed / webhooksMax) * 100));
  const webhooksSubtext = isDemoData
    ? "316,000 events remaining"
    : `${webhooksRemaining.toLocaleString()} events remaining`;

  // Renewal Date
  const renewalBadge = React.useMemo(() => {
    if (isDemoData) return "Renews May 1, 2026";
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return `Renews ${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  }, [isDemoData]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <span>{user?.company || "Workspace"}</span>
            <span>/</span>
            <span className="text-stone-900 font-semibold">Plans & Billing</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 mt-1">
            Subscription Plans & Quotas
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage your organization tier, seat allocation, and API rate limits.
          </p>
        </div>

        {/* Billing frequency toggle */}
        <div className="flex items-center bg-[#FAF9F6] p-1 rounded-2xl border border-[#E8E6E0] self-start sm:self-auto">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              billingCycle === "monthly"
                ? "bg-[#2D5A43] text-white"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              billingCycle === "annual"
                ? "bg-[#2D5A43] text-white"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <span>Annual Billing</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-mono">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Resource Quota Usage Banner */}
      <div className="bg-white rounded-2xl border border-[#E8E6E0] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#2D5A43]" />
              <span>Current Allocation & Quotas</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Your organization is currently on the{" "}
              <strong className="text-stone-800 uppercase font-mono">
                {activePlanId} Tier
              </strong>
              .
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg self-start">
            {renewalBadge}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Quota 1: Team Seats */}
          <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#F0EFEA]">
            <div className="flex justify-between items-center text-xs font-medium text-stone-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-stone-500" />
                <span>Team Seats</span>
              </span>
              <span className="font-mono text-stone-900">{seatsUsed} / {seatsMax} used</span>
            </div>
            <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#2D5A43] h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.max(seatsUsed > 0 ? 5 : 0, seatsPercent)}%` }}
              />
            </div>
            <div className="text-[11px] text-stone-400 mt-1.5">{seatsRemaining} seats remaining</div>
          </div>

          {/* Quota 2: Tracked MRR */}
          <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#F0EFEA]">
            <div className="flex justify-between items-center text-xs font-medium text-stone-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-stone-500" />
                <span>Tracked MRR</span>
              </span>
              <span className="font-mono text-stone-900">{mrrDisplay}</span>
            </div>
            <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#7FA987] h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.max(mrrPercent > 0 ? 3 : 0, mrrPercent)}%` }}
              />
            </div>
            <div className="text-[11px] text-stone-400 mt-1.5">{mrrSubtext}</div>
          </div>

          {/* Quota 3: API Ingestion */}
          <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#F0EFEA]">
            <div className="flex justify-between items-center text-xs font-medium text-stone-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-stone-500" />
                <span>Monthly Webhooks</span>
              </span>
              <span className="font-mono text-stone-900">{webhooksDisplay}</span>
            </div>
            <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#2D5A43] h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.max(webhooksUsed > 0 ? 2 : 0, webhooksPercent)}%` }}
              />
            </div>
            <div className="text-[11px] text-stone-400 mt-1.5">{webhooksSubtext}</div>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {PLAN_TIERS.map((tier) => {
          const isCurrent = activePlanId === tier.id;
          const isPopular = tier.popular;
          const price = isAnnual ? tier.annualPriceMonthly : tier.monthlyPrice;

          return (
            <div
              key={tier.id}
              className={`relative bg-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 ${
                isPopular
                  ? "border-2 border-[#2D5A43]"
                  : "border border-[#E8E6E0] hover:border-[#2D5A43]/50"
              }`}
            >
              {/* Popular pill */}
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#2D5A43] text-white text-[11px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-300" />
                  <span>Most Popular</span>
                </div>
              )}

              <div>
                {/* Tier Name & Tagline */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-stone-900">{tier.name}</h3>
                  {isCurrent && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200 uppercase tracking-wide font-mono">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 mt-2 min-h-[36px]">{tier.tagline}</p>

                {/* Price */}
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-stone-900 tracking-tight font-sans tabular-nums">
                    {formatCurrency(price)}
                  </span>
                  <span className="text-xs text-stone-500 font-medium">/ month</span>
                </div>
                <div className="text-[11px] text-stone-400 mt-1">
                  {isAnnual
                    ? `Billed annually (${formatCurrency(price * 12)} / year)`
                    : "Billed monthly, cancel anytime"}
                </div>

                {/* Limits summary */}
                <div className="mt-5 p-3 rounded-xl bg-[#FAF9F6] border border-[#F0EFEA] text-xs space-y-1">
                  <div className="font-semibold text-stone-800">{tier.seatLimit}</div>
                  <div className="text-stone-500">{tier.revenueLimit}</div>
                </div>

                {/* Features list */}
                <div className="mt-6 space-y-3">
                  <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400">
                    Features Included
                  </span>
                  <ul className="space-y-2.5">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-stone-700">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* CTA Button */}
              <div className="mt-8 pt-4 border-t border-[#F0EFEA]">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-stone-100 text-stone-500 border border-stone-200 cursor-default"
                  >
                    Active Plan
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedPlanForUpgrade(tier)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isPopular
                        ? "bg-[#2D5A43] text-white hover:bg-[#1F4231]"
                        : "bg-[#FAF9F6] text-stone-800 hover:bg-stone-100 border border-[#E8E6E0]"
                    }`}
                  >
                    <span>Upgrade to {tier.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upgrade confirmation modal */}
      <UpgradeModal
        plan={selectedPlanForUpgrade}
        billingCycle={billingCycle}
        onClose={() => setSelectedPlanForUpgrade(null)}
        onConfirmUpgrade={handleUpgradeSuccess}
      />
    </div>
  );
}
