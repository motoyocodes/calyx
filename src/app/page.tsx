"use client";

import React, { useState } from "react";
import { useUIState } from "@/context/UIStateContext";
import { Invoice, MetricCardData } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import MetricCard from "@/components/ui/MetricCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import PlanDistribution from "@/components/dashboard/PlanDistribution";
import StatusBadge from "@/components/invoices/StatusBadge";
import InvoiceDrawer from "@/components/invoices/InvoiceDrawer";
import CreateInvoiceModal from "@/components/invoices/CreateInvoiceModal";
import DeleteConfirmModal from "@/components/invoices/DeleteConfirmModal";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
  ArrowRight,
  Receipt,
  Plus,
  RefreshCw,
  Lock,
  Sparkles,
  RotateCcw,
} from "lucide-react";

export default function DashboardOverview() {
  const {
    addToast,
    invoices,
    customers,
    addInvoice,
    deleteInvoice,
    formatMoneyWithFX,
    isDemoData,
    loadDemoData,
    resetWorkspace,
    liveMRR,
    liveSubscribers,
    liveARPU,
    liveChurn,
  } = useUIState();

  const { user, hasPermission } = useAuth();
  const canCreate = hasPermission("create_invoice");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  const isCleanSlate = invoices.length === 0 && !isDemoData;

  const handleCreateInvoice = (newInvoice: Invoice) => {
    addInvoice(newInvoice);
    setSelectedInvoice(newInvoice);
    addToast({
      title: `Invoice ${newInvoice.number} Created`,
      description: `Issued to ${newInvoice.customerName} (${newInvoice.customerCompany}).`,
      type: "success",
    });
  };

  const handleSyncData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      addToast({
        title: "Telemetry Synchronized",
        description: "Latest Stripe webhook events and MRR calculations synced.",
        type: "success",
      });
    }, 600);
  };

  // Dynamically compute display metrics based on live state
  const displayMetrics: MetricCardData[] = [
    {
      id: "mrr",
      title: "Monthly Recurring Revenue",
      value: formatMoneyWithFX(liveMRR, false),
      changePercent: isCleanSlate ? 0 : 14.2,
      changeType: isCleanSlate ? "neutral" : "positive",
      changeDescription: isCleanSlate ? "Awaiting ledger transactions" : `+${formatMoneyWithFX(5980, false)} from last month`,
      timeframe: isCleanSlate ? "Current period" : "vs. previous 30 days",
      sparklineData: isCleanSlate ? [0, 0, 0, 0, 0, 0, 0] : [38200, 39500, 41000, 42100, 43800, 45200, liveMRR || 48250],
    },
    {
      id: "churn",
      title: "Net Revenue Churn",
      value: `${liveChurn.toFixed(1)}%`,
      changePercent: isCleanSlate ? 0 : -0.4,
      changeType: isCleanSlate ? "neutral" : "positive",
      changeDescription: isCleanSlate ? "0.0% benchmark target" : "-0.4% lower than industry benchmark",
      timeframe: isCleanSlate ? "Current period" : "vs. previous 30 days",
      sparklineData: isCleanSlate ? [0, 0, 0, 0, 0, 0, 0] : [1.8, 1.6, 1.5, 1.4, 1.3, 1.2, 1.1],
    },
    {
      id: "active_subscribers",
      title: "Active Subscriptions",
      value: liveSubscribers.toString(),
      changePercent: isCleanSlate ? 0 : 8.9,
      changeType: isCleanSlate ? "neutral" : "positive",
      changeDescription: isCleanSlate ? "Awaiting customer enrollment" : "+36 net new accounts",
      timeframe: isCleanSlate ? "Current period" : "vs. previous 30 days",
      sparklineData: isCleanSlate ? [0, 0, 0, 0, 0, 0, 0] : [360, 372, 385, 394, 405, 412, liveSubscribers || 428],
    },
    {
      id: "arpu",
      title: "Average Revenue Per User",
      value: formatMoneyWithFX(liveARPU, true),
      changePercent: isCleanSlate ? 0 : 4.8,
      changeType: isCleanSlate ? "neutral" : "positive",
      changeDescription: isCleanSlate ? "Calculated across active accounts" : `+${formatMoneyWithFX(5.2, true)} plan expansion`,
      timeframe: isCleanSlate ? "Current period" : "vs. previous 30 days",
      sparklineData: isCleanSlate ? [0, 0, 0, 0, 0, 0, 0] : [98, 102, 104, 107, 109, 110, liveARPU || 112.7],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Sandbox / Clean Workspace Banner */}
      {isDemoData ? (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-amber-50/90 border border-amber-200/90 text-amber-900 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-semibold">Demo Sandbox Active:</span>
            <span className="text-amber-800">Displaying sample ledger telemetry for evaluation.</span>
          </div>
          <button
            onClick={() => {
              resetWorkspace();
              addToast({
                title: "Clean Workspace Restored",
                description: `Reset to clean 0-state ledger for ${user?.company || "your organization"}.`,
                type: "info",
              });
            }}
            className="inline-flex items-center gap-1 font-medium underline hover:text-amber-950 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset to Clean Workspace</span>
          </button>
        </div>
      ) : isCleanSlate ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#F4F7F4] border border-[#DDE7DF] text-stone-800 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#2D5A43]" />
            <div>
              <span className="font-semibold text-stone-900">Welcome to {user?.company || "your workspace"}!</span>
              <span className="text-stone-500 ml-1.5">Your billing ledger is clean and ready.</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                loadDemoData();
                addToast({
                  title: "Demo Telemetry Loaded",
                  description: "Populated sample invoices, customers, and MRR metrics.",
                  type: "success",
                });
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#2D5A43] hover:text-[#1F4231] underline cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Sample Data</span>
            </button>
            <span className="text-stone-300">|</span>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="text-xs font-semibold text-stone-700 hover:text-stone-900 cursor-pointer"
            >
              + Create Invoice
            </button>
          </div>
        </div>
      ) : null}

      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <span>{user?.company || "Workspace"}</span>
            <span>/</span>
            <span className="text-stone-900 font-semibold">Overview</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 mt-1">
            Revenue & Subscription Intelligence
          </h1>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncData}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-[#E8E6E0] text-stone-700 hover:bg-[#FAF9F6] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-stone-500 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Syncing..." : "Sync Live Data"}</span>
          </button>

          <Link
            href="/invoices"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-[#E8E6E0] text-stone-700 hover:bg-[#FAF9F6] transition-colors"
          >
            <Receipt className="w-3.5 h-3.5 text-stone-500" />
            <span>Invoices</span>
          </Link>

          {canCreate ? (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#2D5A43] text-white hover:bg-[#1F4231] transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Invoice</span>
            </button>
          ) : (
            <button
              onClick={() => {
                addToast({
                  title: "Action Restricted",
                  description:
                    "Admin access required: Creating invoices is restricted to Admin roles. Your current role is Billing Manager.",
                  type: "warning",
                });
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed"
              title="Create invoice is restricted to Admin role"
            >
              <Lock className="w-3.5 h-3.5 text-stone-400" />
              <span>Create Invoice (Locked)</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Metric Cards */}
      <section aria-label="Key Performance Metrics">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayMetrics.map((metric) => (
            <MetricCard key={metric.id} data={metric} loading={isRefreshing} />
          ))}
        </div>
      </section>

      {/* Revenue Performance Chart + Plan Distribution */}
      <section aria-label="Revenue Charts" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart
            loading={isRefreshing}
            isEmpty={isCleanSlate}
            companyName={user?.company || "Your Company"}
            onCreateInvoice={() => setIsCreateModalOpen(true)}
            onLoadDemo={loadDemoData}
          />
        </div>
        <div>
          <PlanDistribution loading={isRefreshing} isEmpty={isCleanSlate} />
        </div>
      </section>

      {/* Recent Invoices Table */}
      <section aria-label="Recent Invoices" className="bg-white rounded-2xl border border-[#E8E6E0] overflow-hidden">
        <div className="p-5 border-b border-[#E8E6E0] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900">Recent Invoices</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Latest transactions settled across current billing cycle.
            </p>
          </div>
          <Link
            href="/invoices"
            className="text-xs font-semibold text-[#2D5A43] hover:text-[#1F4231] flex items-center gap-1 group"
          >
            <span>View all invoices</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF9F6] border-b border-[#E8E6E0] text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                <th className="py-3 px-5">Invoice</th>
                <th className="py-3 px-5">Customer</th>
                <th className="py-3 px-5">Plan</th>
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-5">Amount</th>
                <th className="py-3 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EFEA] text-xs">
              {isRefreshing ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td className="py-4 px-5">
                      <div className="h-4 w-24 bg-stone-200 rounded animate-shimmer" />
                    </td>
                    <td className="py-4 px-5">
                      <div className="h-4 w-32 bg-stone-200 rounded animate-shimmer" />
                    </td>
                    <td className="py-4 px-5">
                      <div className="h-4 w-28 bg-stone-200 rounded animate-shimmer" />
                    </td>
                    <td className="py-4 px-5">
                      <div className="h-4 w-20 bg-stone-200 rounded animate-shimmer" />
                    </td>
                    <td className="py-4 px-5">
                      <div className="h-4 w-16 bg-stone-200 rounded animate-shimmer" />
                    </td>
                    <td className="py-4 px-5">
                      <div className="h-6 w-16 bg-stone-200 rounded-full animate-shimmer" />
                    </td>
                  </tr>
                ))
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-5 text-center">
                    <div className="max-w-xs mx-auto text-center">
                      <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto mb-3">
                        <Receipt className="w-5 h-5 text-stone-400" />
                      </div>
                      <p className="text-xs font-semibold text-stone-800">No invoices issued yet</p>
                      <p className="text-[11px] text-stone-500 mt-1 mb-4 leading-relaxed">
                        Create your first invoice or import billing telemetry to begin tracking revenue.
                      </p>
                      {canCreate && (
                        <button
                          onClick={() => setIsCreateModalOpen(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2D5A43] text-white text-xs font-medium hover:bg-[#1F4231] transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Create First Invoice</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.slice(0, 4).map((invoice) => (
                  <tr
                    key={invoice.id}
                    onClick={() => setSelectedInvoice(invoice)}
                    className="hover:bg-[#FAF9F6] transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-5 font-mono font-medium text-stone-900 group-hover:text-[#2D5A43]">
                      {invoice.number}
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-semibold text-stone-800">{invoice.customerName}</div>
                      <div className="text-[11px] text-stone-500">{invoice.customerCompany}</div>
                    </td>
                    <td className="py-4 px-5 text-stone-600">{invoice.planName}</td>
                    <td className="py-4 px-5 text-stone-500 tabular-nums">
                      {formatDate(invoice.issueDate)}
                    </td>
                    <td className="py-4 px-5 font-bold text-stone-900 tabular-nums">
                      {formatMoneyWithFX(invoice.amount, true)}
                    </td>
                    <td className="py-4 px-5">
                      <StatusBadge status={invoice.status} size="sm" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Slide-over Invoice Detail Drawer */}
      <InvoiceDrawer
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onDelete={(id) => {
          const inv = invoices.find((i) => i.id === id);
          if (inv) setInvoiceToDelete(inv);
        }}
      />

      {/* Create New Invoice Modal */}
      <CreateInvoiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateInvoice}
        existingCount={invoices.length}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!invoiceToDelete}
        onClose={() => setInvoiceToDelete(null)}
        onConfirm={() => {
          if (invoiceToDelete) {
            deleteInvoice(invoiceToDelete.id);
            if (selectedInvoice?.id === invoiceToDelete.id) {
              setSelectedInvoice(null);
            }
            addToast({
              title: "Invoice Deleted",
              description: `${invoiceToDelete.number} has been deleted. Total updated to ${invoices.length - 1}.`,
              type: "info",
            });
            setInvoiceToDelete(null);
          }
        }}
        invoices={invoiceToDelete ? [invoiceToDelete] : []}
        currentTotalCount={invoices.length}
      />
    </div>
  );
}
