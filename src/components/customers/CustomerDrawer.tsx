"use client";

import React, { useEffect } from "react";
import { Customer } from "@/lib/data";
import { useUIState } from "@/context/UIStateContext";
import { formatDate } from "@/lib/utils";
import StatusBadge from "../invoices/StatusBadge";
import {
  X,
  Building2,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Receipt,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Calendar,
} from "lucide-react";

interface CustomerDrawerProps {
  customer: Customer | null;
  onClose: () => void;
  onIssueInvoice?: (customer: Customer) => void;
}

export default function CustomerDrawer({
  customer,
  onClose,
  onIssueInvoice,
}: CustomerDrawerProps) {
  const { invoices, formatMoneyWithFX, addToast } = useUIState();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!customer) return null;

  // Filter invoices for this specific customer
  const customerInvoices = invoices.filter(
    (inv) =>
      inv.customerCompany.toLowerCase() === customer.company.toLowerCase() ||
      inv.customerEmail.toLowerCase() === customer.email.toLowerCase(),
  );

  const totalPaid = customerInvoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white border-l border-[#E8E6E0] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-6 border-b border-[#E8E6E0] bg-[#FAF9F6]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#2D5A43] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  {customer.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-stone-900">
                      {customer.company}
                    </h2>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        customer.status === "active"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : customer.status === "past_due"
                            ? "bg-rose-50 text-rose-800 border-rose-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      {customer.status === "active"
                        ? "Active"
                        : customer.status === "past_due"
                          ? "Past Due"
                          : "At Risk"}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Primary Contact: {customer.name} • Joined{" "}
                    {customer.joinedDate}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                aria-label="Close customer drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="bg-white border border-[#E8E6E0] p-3 rounded-xl">
                <span className="text-[10px] font-medium text-stone-500 uppercase tracking-wider">
                  Monthly MRR
                </span>
                <p className="text-sm font-bold text-stone-900 mt-0.5 tabular-nums">
                  {formatMoneyWithFX(customer.mrr)}
                </p>
              </div>
              <div className="bg-white border border-[#E8E6E0] p-3 rounded-xl">
                <span className="text-[10px] font-medium text-stone-500 uppercase tracking-wider">
                  Lifetime Value
                </span>
                <p className="text-sm font-bold text-emerald-700 mt-0.5 tabular-nums">
                  {formatMoneyWithFX(customer.ltv)}
                </p>
              </div>
              <div className="bg-white border border-[#E8E6E0] p-3 rounded-xl">
                <span className="text-[10px] font-medium text-stone-500 uppercase tracking-wider">
                  Invoices Paid
                </span>
                <p className="text-sm font-bold text-stone-900 mt-0.5 tabular-nums">
                  {customerInvoices.filter((i) => i.status === "paid").length} /{" "}
                  {customerInvoices.length || customer.totalInvoices}
                </p>
              </div>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
            {/* Account Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Account & Billing Profile
              </h3>
              <div className="bg-[#FAF9F6] border border-[#E8E6E0] rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between py-1 border-b border-[#E8E6E0]/60">
                  <span className="text-stone-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    Billing Email
                  </span>
                  <span className="font-semibold text-stone-900 font-mono">
                    {customer.email}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-[#E8E6E0]/60">
                  <span className="text-stone-500 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-stone-400" />
                    Payment Method
                  </span>
                  <span className="font-semibold text-stone-900">
                    {customer.paymentMethod}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-[#E8E6E0]/60">
                  <span className="text-stone-500 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-stone-400" />
                    Subscription Plan
                  </span>
                  <span className="font-bold text-[#2D5A43] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    {customer.plan}
                  </span>
                </div>

                {customer.vatNumber && (
                  <div className="flex items-center justify-between py-1 border-b border-[#E8E6E0]/60">
                    <span className="text-stone-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
                      Tax Identifier / VAT
                    </span>
                    <span className="font-mono font-medium text-stone-800">
                      {customer.vatNumber}
                    </span>
                  </div>
                )}

                {customer.address && (
                  <div className="flex items-start justify-between py-1">
                    <span className="text-stone-500 flex items-center gap-1.5 shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      Billing Address
                    </span>
                    <span className="font-medium text-stone-800 text-right max-w-[240px]">
                      {customer.address}, {customer.country}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Invoices History */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Associated Invoices ({customerInvoices.length})
                </h3>
                <span className="text-[11px] text-stone-500 font-medium">
                  Total Paid: <strong>{formatMoneyWithFX(totalPaid)}</strong>
                </span>
              </div>

              {customerInvoices.length === 0 ? (
                <div className="p-8 text-center bg-[#FAF9F6] border border-[#E8E6E0] rounded-2xl">
                  <Receipt className="w-6 h-6 text-stone-400 mx-auto mb-2" />
                  <p className="font-semibold text-stone-700">
                    No invoices on file yet
                  </p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Issue a receivable using the button below.
                  </p>
                </div>
              ) : (
                <div className="border border-[#E8E6E0] rounded-2xl overflow-hidden divide-y divide-[#F0EFEA]">
                  {customerInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3 bg-white hover:bg-[#FAF9F6] transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-stone-900">
                            {inv.number}
                          </span>
                          <StatusBadge status={inv.status} size="sm" />
                        </div>
                        <div className="text-[10px] text-stone-500 mt-0.5 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          <span>Issued {formatDate(inv.issueDate)}</span>
                          <span>•</span>
                          <span>Due {formatDate(inv.dueDate)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-stone-900 tabular-nums">
                          {formatMoneyWithFX(inv.amount, true)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="p-4 border-t border-[#E8E6E0] bg-[#FAF9F6] flex items-center justify-between gap-3">
            <button
              onClick={() => {
                addToast({
                  title: "Statement Emailed",
                  description: `Full billing statement sent to ${customer.email}.`,
                  type: "success",
                });
              }}
              className="py-2 px-3.5 rounded-xl border border-[#E8E6E0] bg-white text-stone-700 hover:bg-stone-50 text-xs font-semibold transition-colors cursor-pointer"
            >
              Email Statement
            </button>

            <button
              onClick={() => {
                if (onIssueInvoice) onIssueInvoice(customer);
                onClose();
              }}
              className="py-2 px-4 rounded-xl bg-[#2D5A43] text-white hover:bg-[#1F4231] text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Issue New Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
