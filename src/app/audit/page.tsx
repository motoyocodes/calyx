"use client";

import React, { useState, useMemo } from "react";
import { useUIState } from "@/context/UIStateContext";
import { AuditSeverity, AuditLogEntry } from "@/lib/data";
import { formatAuditEventName } from "@/lib/utils";
import {
  Shield,
  Search,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Terminal,
  RefreshCw,
  Lock,
} from "lucide-react";

export default function AuditPage() {
  const { auditLogs, exportAuditLogsToCSV, addToast } = useUIState();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<"all" | AuditSeverity>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesSeverity = selectedSeverity === "all" || log.severity === selectedSeverity;
      const matchesCategory = selectedCategory === "all" || log.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        formatAuditEventName(log.event).toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.ipAddress.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSeverity && matchesCategory && matchesSearch;
    });
  }, [auditLogs, selectedSeverity, selectedCategory, searchQuery]);

  const criticalCount = auditLogs.filter((l) => l.severity === "critical").length;
  const warningCount = auditLogs.filter((l) => l.severity === "warning").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <span>Synthetix AI</span>
            <span>/</span>
            <span className="text-stone-900 font-semibold">Security & Compliance</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 mt-1">
            Audit Trail & Activity Log
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Immutable security event telemetry and compliance ledger for workspace operations.
          </p>
        </div>

        <button
          onClick={() => {
            exportAuditLogsToCSV();
            addToast({
              title: "Audit Trail Exported",
              description: "Saved security event log to CSV.",
              type: "success",
            });
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-[#E8E6E0] text-stone-700 hover:bg-[#FAF9F6] transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-stone-500" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Compliance Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#E8E6E0] p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Recorded Audit Events</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold">
              Append-Only
            </span>
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2 tracking-tight tabular-nums">
            {auditLogs.length} <span className="text-xs text-stone-400 font-normal">events</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Logged across authentication, billing, and API gateways
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E6E0] p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Security Alerts (24h)</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2 tracking-tight tabular-nums">
            {criticalCount + warningCount}{" "}
            <span className="text-xs text-stone-400 font-normal">
              ({criticalCount} critical, {warningCount} warnings)
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Intercepted and logged automatically</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E6E0] p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Compliance Integrity</span>
            <Shield className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold text-emerald-800 mt-2 tracking-tight">
            SOC2 Type II
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Cryptographic integrity check: Verified 100%</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-[#E8E6E0] overflow-hidden">
        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-[#E8E6E0] flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#FAF9F6]">
          {/* Category & Severity Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-white border border-[#E8E6E0] p-1 rounded-xl text-xs">
              {(["all", "info", "warning", "critical"] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSelectedSeverity(sev)}
                  className={`px-2.5 py-1 rounded-lg font-semibold uppercase text-[10px] transition-colors cursor-pointer ${
                    selectedSeverity === sev
                      ? "bg-[#2D5A43] text-white"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#E8E6E0] text-xs font-medium text-stone-700 outline-hidden focus:border-[#2D5A43]"
            >
              <option value="all">All Categories</option>
              <option value="auth">Authentication</option>
              <option value="invoice">Invoices</option>
              <option value="subscription">Subscriptions</option>
              <option value="security">Security & 2FA</option>
              <option value="settings">Settings</option>
              <option value="developer">Developer & Webhooks</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search event, actor, IP, target..."
              className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl bg-white border border-[#E8E6E0] outline-hidden focus:border-[#2D5A43] text-stone-900 placeholder:text-stone-400"
            />
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF9F6] border-b border-[#E8E6E0] text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                <th className="py-3 px-5">Timestamp</th>
                <th className="py-3 px-5">Event Action</th>
                <th className="py-3 px-5">Actor & Role</th>
                <th className="py-3 px-5">Target Resource</th>
                <th className="py-3 px-5">Severity</th>
                <th className="py-3 px-5">Origin IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EFEA] text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400 font-sans">
                    No security events found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="py-3.5 px-5 text-stone-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    <td className="py-3.5 px-5 font-sans">
                      <div className="font-semibold text-stone-900 text-xs">
                        {formatAuditEventName(log.event)}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5 max-w-sm leading-snug">
                        {log.details}
                      </div>
                    </td>

                    <td className="py-3.5 px-5 font-sans whitespace-nowrap">
                      <div className="font-semibold text-stone-800">{log.actor}</div>
                      <div className="text-[10px] text-stone-400">{log.actorRole}</div>
                    </td>

                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-stone-800 text-[11px] font-mono">
                        {log.target}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 whitespace-nowrap font-sans">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          log.severity === "info"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : log.severity === "warning"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-rose-50 text-rose-800 border-rose-200"
                        }`}
                      >
                        {log.severity}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-stone-400 text-[11px] whitespace-nowrap">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
