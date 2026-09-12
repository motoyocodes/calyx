"use client";

import React, { useState } from "react";
import { REVENUE_HISTORY, RevenueMonth } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, BarChart3, Calendar, Layers } from "lucide-react";

interface RevenueChartProps {
  loading?: boolean;
  isEmpty?: boolean;
  isDemo?: boolean;
  companyName?: string;
  liveMRR?: number;
  invoiceCount?: number;
  onCreateInvoice?: () => void;
  onLoadDemo?: () => void;
}

export default function RevenueChart({
  loading = false,
  isEmpty = false,
  isDemo = false,
  companyName,
  liveMRR,
  invoiceCount,
  onCreateInvoice,
  onLoadDemo,
}: RevenueChartProps) {
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

  if (isEmpty) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-[#E8E6E0] flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F0EFEA]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-stone-900">Revenue Performance</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                New Workspace
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Live recurring subscription metrics for {companyName || "your organization"}.
            </p>
          </div>
        </div>

        <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#2D5A43] flex items-center justify-center mb-3">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-stone-900">No Revenue Cohorts Recorded Yet</h4>
          <p className="text-xs text-stone-500 max-w-sm mt-1 leading-relaxed">
            As you issue customer invoices or connect subscriptions, your monthly recurring revenue (MRR), expansion, and churn cohorts will chart here automatically.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
            {onCreateInvoice && (
              <button
                onClick={onCreateInvoice}
                className="px-4 py-2 bg-[#2D5A43] hover:bg-[#1F4231] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                + Create First Invoice
              </button>
            )}
            {onLoadDemo && (
              <button
                onClick={onLoadDemo}
                className="px-3.5 py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold rounded-xl border border-stone-200 transition-colors cursor-pointer"
              >
                Load Sample Cohorts
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Generate realistic timeline based on active mode
  const monthsData: RevenueMonth[] = React.useMemo(() => {
    if (isDemo || (!liveMRR && !invoiceCount)) {
      return REVENUE_HISTORY;
    }

    const currentAmount = liveMRR || 0;
    return [
      { month: "Nov 2025", shortMonth: "Nov", mrr: 0, netNew: 0, churn: 0, newCustomers: 0 },
      { month: "Dec 2025", shortMonth: "Dec", mrr: 0, netNew: 0, churn: 0, newCustomers: 0 },
      { month: "Jan 2026", shortMonth: "Jan", mrr: 0, netNew: 0, churn: 0, newCustomers: 0 },
      { month: "Feb 2026", shortMonth: "Feb", mrr: 0, netNew: 0, churn: 0, newCustomers: 0 },
      { month: "Mar 2026", shortMonth: "Mar", mrr: currentAmount, netNew: currentAmount, churn: 0, newCustomers: invoiceCount || 1 },
      { month: "Apr 2026", shortMonth: "Apr", mrr: currentAmount, netNew: 0, churn: 0, newCustomers: 0 },
    ];
  }, [isDemo, liveMRR, invoiceCount]);

  // Find scale range
  const values = monthsData.map((m) => m[activeMetric]);
  const maxVal = Math.max(...values, 1);
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
            {isDemo
              ? "Recurring subscription volume and net contraction across previous 7 billing cohorts."
              : `Live recurring billing telemetry and revenue volume for ${companyName || "your workspace"}.`}
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
          {monthsData.map((item) => {
            const val = item[activeMetric];
            const heightPercent = val === 0 ? 6 : Math.max(14, Math.round((val / maxVal) * 100));
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
                  {val >= 1000 ? `$${(val / 1000).toFixed(1)}k` : `$${val}`}
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
