"use client";

import React, { useState } from "react";
import { useUIState } from "@/context/UIStateContext";
import { INITIAL_METRICS, SAMPLE_INVOICES, Invoice } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";
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
  TrendingUp,
  Lock,
} from "lucide-react";

export default function DashboardOverview() {
  const { addToast, invoices, addInvoice, deleteInvoice, formatMoneyWithFX } = useUIState();
  const { hasPermission } = useAuth();
  const canCreate = hasPermission("create_invoice");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

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

  // Dynamically convert currency metrics based on active global currency
  const displayMetrics = INITIAL_METRICS.map((metric) => {
    if (metric.id === "mrr") {
      return {
        ...metric,
        value: formatMoneyWithFX(48250, false),
        changeDescription: `+${formatMoneyWithFX(5980, false)} from last month`,
      };
    }
    if (metric.id === "arpu") {
      return {
        ...metric,
        value: formatMoneyWithFX(112.7, true),
        changeDescription: `+${formatMoneyWithFX(5.2, true)} plan expansion`,
      };
    }
    return metric;
  });

  return (
    <div className="space-y-8">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <span>Synthetix AI</span>
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
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-[#E8E6E0] text-stone-700 hover:bg-[#FAF9F6] transition-colors"
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
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#2D5A43] text-white hover:bg-[#1F4231] transition-colors cursor-pointer"
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
          <RevenueChart loading={isRefreshing} />
        </div>
        <div>
          <PlanDistribution loading={isRefreshing} />
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
