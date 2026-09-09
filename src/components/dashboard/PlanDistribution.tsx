"use client";

import React from "react";
import { PieChart, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

interface PlanDistributionProps {
  loading?: boolean;
}

export default function PlanDistribution({ loading = false }: PlanDistributionProps) {
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

  const tiers = [
    { name: "Scale Tier", percent: 52, amount: "$25,090", color: "bg-[#2D5A43]", text: "text-[#2D5A43]" },
    { name: "Growth Tier", percent: 36, amount: "$17,370", color: "bg-[#7FA987]", text: "text-[#388E5C]" },
    { name: "Starter Tier", percent: 12, amount: "$5,790", color: "bg-[#E8836B]", text: "text-[#D96B4F]" },
  ];

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
          <div style={{ width: "52%" }} className="bg-[#2D5A43] h-full rounded-l-full" title="Scale: 52%" />
          <div style={{ width: "36%" }} className="bg-[#7FA987] h-full" title="Growth: 36%" />
          <div style={{ width: "12%" }} className="bg-[#E8836B] h-full rounded-r-full" title="Starter: 12%" />
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
            <div className="text-base font-bold text-[#2D5A43] mt-0.5 tabular-nums">3.8x</div>
            <div className="text-[10px] text-emerald-700 font-medium mt-0.5">High efficiency</div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E8E6E0]">
            <div className="text-[10px] font-mono uppercase text-stone-400">LTV / CAC</div>
            <div className="text-base font-bold text-[#2D5A43] mt-0.5 tabular-nums">4.2x</div>
            <div className="text-[10px] text-emerald-700 font-medium mt-0.5">Target &gt; 3.0x</div>
          </div>
        </div>
      </div>
    </div>
  );
}
