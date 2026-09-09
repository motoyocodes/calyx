"use client";

import React, { useState } from "react";
import { REVENUE_HISTORY, RevenueMonth } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, BarChart3, Calendar, Layers } from "lucide-react";

interface RevenueChartProps {
  loading?: boolean;
}

export default function RevenueChart({ loading = false }: RevenueChartProps) {
  const [activeMetric, setActiveMetric] = useState<"mrr" | "netNew" | "churn">("mrr");
  const [hoveredMonth, setHoveredMonth] = useState<RevenueMonth | null>(null);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-[#E8E6E0]">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-4 w-40 bg-stone-200 rounded-md animate-shimmer" />
            <div className="h-3 w-56 bg-stone-200 rounded-md animate-shimmer" />
          </div>
          <div className="h-8 w-44 bg-stone-200 rounded-xl animate-shimmer" />
        </div>
        <div className="h-64 w-full bg-stone-100 rounded-xl animate-shimmer" />
      </div>
    );
  }

  // Find scale range
  const values = REVENUE_HISTORY.map((m) => m[activeMetric]);
  const maxVal = Math.max(...values);
  const minVal = 0;

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#E8E6E0]">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F0EFEA]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-stone-900">Revenue Performance</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Live Stream
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Recurring subscription volume and net contraction across previous 7 billing cohorts.
          </p>
        </div>

        {/* Metric toggles */}
        <div className="flex items-center bg-[#FAF9F6] p-1 rounded-xl border border-[#E8E6E0] self-start sm:self-auto">
          <button
            onClick={() => setActiveMetric("mrr")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeMetric === "mrr"
                ? "bg-[#2D5A43] text-white"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Total MRR
          </button>
          <button
            onClick={() => setActiveMetric("netNew")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeMetric === "netNew"
                ? "bg-[#2D5A43] text-white"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Net New
          </button>
          <button
            onClick={() => setActiveMetric("churn")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeMetric === "churn"
                ? "bg-[#D96B4F] text-white"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Churn
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="mt-6 relative">
        {/* Dynamic Hover Tooltip */}
        {hoveredMonth && (
          <div className="absolute top-2 left-6 z-10 bg-[#14201A] text-white text-xs px-3 py-2 rounded-xl border border-[#2B3D33] pointer-events-none flex items-center gap-4 animate-in fade-in duration-150">
            <div>
              <div className="text-[10px] text-stone-400 uppercase font-mono">
                {hoveredMonth.month}
              </div>
              <div className="font-bold text-sm text-white tabular-nums">
                {formatCurrency(hoveredMonth[activeMetric])}
              </div>
            </div>
            <div className="border-l border-stone-700 pl-3">
              <div className="text-[10px] text-stone-400">New Customers</div>
              <div className="font-semibold text-emerald-400 tabular-nums">
                +{hoveredMonth.newCustomers}
              </div>
            </div>
          </div>
        )}

        {/* Chart Bars */}
        <div className="h-64 flex items-end justify-between gap-3 sm:gap-6 pt-12 pb-2 px-2">
          {REVENUE_HISTORY.map((item) => {
            const val = item[activeMetric];
            const heightPercent = Math.max(12, Math.round((val / maxVal) * 100));
            const isSelected = hoveredMonth?.month === item.month;

            return (
              <div
                key={item.month}
                onMouseEnter={() => setHoveredMonth(item)}
                onMouseLeave={() => setHoveredMonth(null)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
              >
                {/* Bar Value on Hover */}
                <span
                  className={`text-[11px] font-semibold mb-1.5 tabular-nums transition-opacity ${
                    isSelected ? "text-stone-900 opacity-100 font-bold" : "opacity-0 group-hover:opacity-100 text-stone-500"
                  }`}
                >
                  ${(val / 1000).toFixed(1)}k
                </span>

                {/* Animated Rounded Column */}
                <div className="w-full max-w-[48px] bg-[#FAF9F6] rounded-xl overflow-hidden p-1 flex flex-col justify-end h-full">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-lg transition-all duration-300 ${
                      activeMetric === "churn"
                        ? isSelected
                          ? "bg-[#D96B4F]"
                          : "bg-[#E8836B] group-hover:bg-[#D96B4F]"
                        : isSelected
                        ? "bg-[#1F4231]"
                        : "bg-[#2D5A43] group-hover:bg-[#36694E]"
                    }`}
                  />
                </div>

                {/* Month label */}
                <span
                  className={`mt-2 text-xs transition-colors ${
                    isSelected ? "font-bold text-[#2D5A43]" : "text-stone-500 group-hover:text-stone-900"
                  }`}
                >
                  {item.shortMonth}
                </span>
              </div>
            );
          })}
        </div>

        {/* Chart Legend & Summary */}
        <div className="mt-4 pt-4 border-t border-[#F0EFEA] flex flex-wrap items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#2D5A43]"></span>
              <span>MRR Growth</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#D96B4F]"></span>
              <span>Contraction / Churn</span>
            </span>
          </div>
          <span className="font-mono text-[11px] text-stone-400">
            Updated today at 02:00 UTC
          </span>
        </div>
      </div>
    </div>
  );
}
