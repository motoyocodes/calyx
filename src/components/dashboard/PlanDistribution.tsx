"use client";

import React, { useMemo } from "react";
import { PieChart, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Invoice } from "@/lib/data";

interface PlanDistributionProps {
  loading?: boolean;
  isEmpty?: boolean;
  isDemo?: boolean;
  invoices?: Invoice[];
}

export default function PlanDistribution({
  loading = false,
  isEmpty = false,
  isDemo = false,
  invoices = [],
}: PlanDistributionProps) {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-[#E8E6E0]">
        <div className="h-4 w-32 bg-stone-200 rounded-md mb-2 animate-shimmer" />
        <div className="h-3 w-48 bg-stone-200 rounded-md mb-6 animate-shimmer" />
        <div className="h-4 w-full bg-stone-100 rounded-full mb-6 animate-shimmer" />
        <div className="space-y-3">
          <div className="h-8 w-full bg-stone-100 rounded-xl animate-shimmer" />
          <div className="h-8 w-full bg-stone-100 rounded-xl animate-shimmer" />
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-[#E8E6E0] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#2D5A43]" />
              <h3 className="text-base font-bold text-stone-900">Plan Distribution</h3>
            </div>
            <Link
              href="/subscriptions"
              className="text-xs font-semibold text-[#2D5A43] hover:text-[#1F4231] flex items-center gap-1 group"
            >
              <span>Manage</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Revenue contribution grouped by subscription package tier.
          </p>

          <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden flex mt-5 p-0.5 border border-[#E8E6E0]">
            <div className="w-full h-full bg-stone-200/60 rounded-full" />
          </div>

          <div className="mt-8 text-center py-6 px-4 rounded-xl bg-[#FAF9F6] border border-dashed border-[#E8E6E0]">
            <div className="w-10 h-10 rounded-full bg-white border border-[#E8E6E0] flex items-center justify-center mx-auto mb-3 shadow-xs">
              <PieChart className="w-5 h-5 text-stone-400" />
            </div>
            <p className="text-xs font-semibold text-stone-700">No active subscription tiers</p>
            <p className="text-[11px] text-stone-500 mt-1 max-w-[240px] mx-auto leading-relaxed">
              Tier breakdown will automatically calculate as recurring customers and invoices are added.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-[#F0EFEA]">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E8E6E0]">
              <div className="text-[10px] font-mono uppercase text-stone-400">Quick Ratio</div>
              <div className="text-base font-bold text-stone-400 mt-0.5 tabular-nums">—</div>
              <div className="text-[10px] text-stone-400 font-medium mt-0.5">Awaiting ledger data</div>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E8E6E0]">
              <div className="text-[10px] font-mono uppercase text-stone-400">LTV / CAC</div>
              <div className="text-base font-bold text-stone-400 mt-0.5 tabular-nums">—</div>
              <div className="text-[10px] text-stone-400 font-medium mt-0.5">Awaiting ledger data</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tiers = useMemo(() => {
    if (isDemo || !invoices || invoices.length === 0) {
      return [
        { name: "Scale Tier", percent: 52, amount: "$25,090", color: "bg-[#2D5A43]", text: "text-[#2D5A43]" },
        { name: "Growth Tier", percent: 36, amount: "$17,370", color: "bg-[#7FA987]", text: "text-[#388E5C]" },
        { name: "Starter Tier", percent: 12, amount: "$5,790", color: "bg-[#E8836B]", text: "text-[#D96B4F]" },
      ];
    }

    const total = invoices.reduce((sum, i) => sum + i.amount, 0) || 1;
    const planMap = new Map<string, number>();
    invoices.forEach((i) => {
      const name = i.planName || "Standard Plan";
      planMap.set(name, (planMap.get(name) || 0) + i.amount);
    });

    const colors = [
      { color: "bg-[#2D5A43]", text: "text-[#2D5A43]" },
      { color: "bg-[#7FA987]", text: "text-[#388E5C]" },
      { color: "bg-[#E8836B]", text: "text-[#D96B4F]" },
      { color: "bg-[#4A7C59]", text: "text-[#4A7C59]" },
    ];

    const result = [];
    let idx = 0;
    for (const [name, amount] of planMap.entries()) {
      const percent = Math.max(1, Math.round((amount / total) * 100));
      const c = colors[idx % colors.length];
      result.push({
        name,
        percent,
        amount: `$${amount.toLocaleString()}`,
        color: c.color,
        text: c.text,
      });
      idx++;
    }
    return result;
  }, [isDemo, invoices]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#E8E6E0] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#2D5A43]" />
            <h3 className="text-base font-bold text-stone-900">Plan Distribution</h3>
          </div>
          <Link
            href="/subscriptions"
            className="text-xs font-semibold text-[#2D5A43] hover:text-[#1F4231] flex items-center gap-1 group"
          >
            <span>Manage</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        <p className="text-xs text-stone-500 mt-1">
          Revenue contribution grouped by subscription package tier.
        </p>

        {/* Multi-segment progress bar */}
        <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden flex mt-5 p-0.5 border border-[#E8E6E0]">
          {tiers.map((t, idx) => (
            <div
              key={t.name}
              style={{ width: `${t.percent}%` }}
              className={`${t.color} h-full ${idx === 0 ? "rounded-l-full" : ""} ${idx === tiers.length - 1 ? "rounded-r-full" : ""}`}
              title={`${t.name}: ${t.percent}%`}
            />
          ))}
        </div>

        {/* Breakdown listing */}
        <div className="mt-5 space-y-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF9F6] border border-[#F0EFEA]"
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-1.5 h-3.5 rounded-xs ${t.color}`} />
                <div>
                  <div className="text-xs font-semibold text-stone-800">{t.name}</div>
                  <div className="text-[10px] text-stone-400">{t.percent}% of total MRR</div>
                </div>
              </div>
              <div className="text-xs font-bold text-stone-900 tabular-nums">{t.amount}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SaaS Efficiency Metrics */}
      <div className="mt-6 pt-5 border-t border-[#F0EFEA]">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E8E6E0]">
            <div className="text-[10px] font-mono uppercase text-stone-400">Quick Ratio</div>
            <div className="text-base font-bold text-[#2D5A43] mt-0.5 tabular-nums">
              {isDemo ? "3.8x" : "1.0x"}
            </div>
            <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
              {isDemo ? "High efficiency" : "Initial baseline"}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E8E6E0]">
            <div className="text-[10px] font-mono uppercase text-stone-400">LTV / CAC</div>
            <div className="text-base font-bold text-[#2D5A43] mt-0.5 tabular-nums">
              {isDemo ? "4.2x" : "—"}
            </div>
            <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
              {isDemo ? "Target > 3.0x" : "Requires 3+ cycles"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
