import React from "react";
import { MetricCardData } from "@/lib/data";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface MetricCardProps {
  data: MetricCardData;
  loading?: boolean;
}

export default function MetricCard({ data, loading = false }: MetricCardProps) {
  if (loading) {
    return (
      <div className="bg-white p-5 rounded-2xl border border-[#E8E6E0]">
        <div className="flex items-center justify-between">
          <div className="h-3.5 w-28 bg-stone-200 rounded-md animate-shimmer" />
          <div className="h-5 w-12 bg-stone-200 rounded-full animate-shimmer" />
        </div>
        <div className="h-8 w-24 bg-stone-200 rounded-md mt-3 animate-shimmer" />
        <div className="h-3 w-36 bg-stone-200 rounded-md mt-2 animate-shimmer" />
        <div className="h-9 w-full bg-stone-100 rounded-lg mt-4 animate-shimmer" />
      </div>
    );
  }

  const isPositive = data.changePercent > 0;
  const isNeutral = data.changePercent === 0;

  // Mini sparkline SVG path calculation
  const values = data.sparklineData;
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;
  const width = 120;
  const height = 32;

  const points = values.map((val, idx) => {
    const x = (idx / (values.length - 1)) * width;
    const y = height - ((val - minVal) / range) * (height - 6) - 3;
    return `${x},${y}`;
  });
  const pathD = `M ${points.join(" L ")}`;

  return (
    <div className="bg-white p-5 rounded-2xl border border-[#E8E6E0] hover:border-[#2D5A43]/60 transition-colors duration-200 group flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
          <span>{data.title}</span>
          <div
            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
              isPositive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                : isNeutral
                ? "bg-stone-50 text-stone-600 border border-stone-200"
                : "bg-rose-50 text-rose-700 border border-rose-200/60"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3 text-emerald-600" />
            ) : isNeutral ? (
              <Minus className="w-3 h-3 text-stone-500" />
            ) : (
              <ArrowDownRight className="w-3 h-3 text-rose-600" />
            )}
            <span>
              {isPositive ? "+" : ""}
              {data.changePercent}%
            </span>
          </div>
        </div>

        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1C1A] mt-2 tabular-nums">
          {data.value}
        </div>

        <div className="text-[11px] text-stone-500 mt-1">
          {data.changeDescription}{" "}
          <span className="text-stone-400">({data.timeframe})</span>
        </div>
      </div>

      {/* Sparkline Graphic */}
      <div className="mt-4 pt-3 border-t border-[#F5F4F0] flex items-center justify-between">
        <span className="text-[10px] uppercase font-mono text-stone-400 tracking-wider">
          30d Trend
        </span>
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible"
        >
          <path
            d={pathD}
            fill="none"
            stroke={isPositive ? "#2D5A43" : "#D96B4F"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:stroke-[2.5] transition-all"
          />
        </svg>
      </div>
    </div>
  );
}
