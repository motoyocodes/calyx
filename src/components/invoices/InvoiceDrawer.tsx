"use client";

import React, { useEffect } from "react";
import { Invoice } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import StatusBadge from "./StatusBadge";
import {
  X,
  Download,
  Send,
  CreditCard,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  Copy,
  Trash2,
} from "lucide-react";
import { useUIState } from "@/context/UIStateContext";
import { generateInvoicePDF, printInvoiceWindow } from "@/lib/exportUtils";

interface InvoiceDrawerProps {
  invoice: Invoice | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export default function InvoiceDrawer({ invoice, onClose, onDelete }: InvoiceDrawerProps) {
  const { addToast, formatMoneyWithFX } = useUIState();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!invoice) return null;

  const subtotal = invoice.items.reduce((acc, it) => acc + it.total, 0);
  const tax = subtotal * (invoice.taxRate || 0);
  const total = subtotal + tax;

  const handleCopyNumber = () => {
    navigator.clipboard?.writeText(invoice.number);
    addToast({
      title: "Copied Invoice ID",
      description: `${invoice.number} copied to clipboard`,
      type: "success",
    });
  };

  const handleDownloadPDF = () => {
    generateInvoicePDF(invoice);
    addToast({
      title: "Invoice PDF Downloaded",
      description: `Saved ${invoice.number}.pdf to your downloads.`,
      type: "success",
    });
  };

  const handlePrint = () => {
    printInvoiceWindow(invoice);
    addToast({
      title: "Print Receipt Opened",
      description: `Opened printable preview for ${invoice.number}.`,
      type: "info",
    });
  };

  const handleSendEmail = () => {
    addToast({
      title: "Receipt Sent",
      description: `Receipt delivered to ${invoice.customerEmail}`,
      type: "success",
    });
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(invoice.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#E8E6E0] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-6 border-b border-[#E8E6E0] flex items-center justify-between bg-[#FAF9F6]">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-stone-900">
                  {invoice.number}
                </span>
                <button
                  onClick={handleCopyNumber}
                  className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
                  title="Copy Invoice ID"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <StatusBadge status={invoice.status} size="sm" />
              </div>
              <div className="text-xs text-stone-500 mt-1">
                Issued on {formatDate(invoice.issueDate)}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-[#E8E6E0] transition-colors cursor-pointer"
                  title="Delete invoice"
                  aria-label="Delete invoice"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-white border border-[#E8E6E0] transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer Body Scroll */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Customer Card */}
            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E0]">
              <div className="text-[10px] font-mono uppercase text-stone-400 mb-2">
                Billed Customer
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2D5A43] text-white flex items-center justify-center font-bold text-sm">
                  {invoice.customerName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <div className="text-sm font-bold text-stone-900">{invoice.customerName}</div>
                  <div className="text-xs text-stone-500">{invoice.customerCompany}</div>
                  <div className="text-xs text-emerald-800 font-mono mt-0.5">
                    {invoice.customerEmail}
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-stone-50/70 border border-[#E8E6E0]">
                <span className="text-[10px] uppercase font-mono text-stone-400 block mb-1">
                  Payment Method
                </span>
                <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-stone-500" />
                  {invoice.paymentMethod}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50/70 border border-[#E8E6E0]">
                <span className="text-[10px] uppercase font-mono text-stone-400 block mb-1">
                  Due Date
                </span>
                <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-500" />
                  {formatDate(invoice.dueDate)}
                </span>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <h4 className="text-xs font-bold text-stone-900 mb-3 uppercase tracking-wider font-mono">
                Itemized Summary
              </h4>
              <div className="border border-[#E8E6E0] rounded-xl overflow-hidden divide-y divide-[#E8E6E0]">
                {invoice.items.map((item) => (
                  <div key={item.id} className="p-3.5 flex items-start justify-between text-xs">
                    <div className="max-w-[70%]">
                      <div className="font-semibold text-stone-800">{item.description}</div>
                      <div className="text-[11px] text-stone-400">
                        Qty: {item.quantity} × {formatMoneyWithFX(item.unitPrice, true)}
                      </div>
                    </div>
                    <div className="font-bold text-stone-900 tabular-nums">
                      {formatMoneyWithFX(item.total, true)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Totals */}
            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E0] space-y-2 text-xs">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal</span>
                <span className="tabular-nums font-medium">
                  {formatMoneyWithFX(subtotal, true)}
                </span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Tax ({((invoice.taxRate || 0) * 100).toFixed(0)}% VAT)</span>
                <span className="tabular-nums font-medium">
                  {formatMoneyWithFX(tax, true)}
                </span>
              </div>
              <div className="pt-2 border-t border-[#E8E6E0] flex justify-between font-bold text-stone-900 text-sm">
                <span>Total Due</span>
                <span className="tabular-nums text-[#2D5A43]">
                  {formatMoneyWithFX(total, true)}
                </span>
              </div>
            </div>

            {/* Lifecycle Timeline */}
            <div>
              <h4 className="text-xs font-bold text-stone-900 mb-3 uppercase tracking-wider font-mono">
                Audit Timeline
              </h4>
              <div className="space-y-3 relative pl-4 border-l-2 border-[#E8E6E0]">
                <div className="relative">
                  <span className="absolute -left-[20px] top-1 w-2 h-2 rounded-xs bg-emerald-600 ring-2 ring-white" />
                  <div className="text-xs font-semibold text-stone-800">
                    Payment Succeeded
                  </div>
                  <div className="text-[11px] text-stone-400">
                    Settled via webhook from Stripe Payments
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute -left-[20px] top-1 w-2 h-2 rounded-xs bg-stone-300 ring-2 ring-white" />
                  <div className="text-xs font-semibold text-stone-800">
                    Invoice Created & Sent
                  </div>
                  <div className="text-[11px] text-stone-400">
                    Issued to {invoice.customerEmail}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-[#E8E6E0] bg-[#FAF9F6] flex gap-2">
            <button
              onClick={handleDownloadPDF}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#2D5A43] text-white rounded-xl text-xs font-semibold hover:bg-[#1F4231] shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white border border-[#E8E6E0] text-stone-700 rounded-xl text-xs font-semibold hover:bg-stone-50 transition-colors cursor-pointer"
              title="Open printable invoice view"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleSendEmail}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white border border-[#E8E6E0] text-stone-700 rounded-xl text-xs font-semibold hover:bg-stone-50 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Resend</span>
            </button>
            {onDelete && (
              <button
                onClick={handleDelete}
                className="flex items-center justify-center p-2.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                title="Delete this invoice"
                aria-label="Delete invoice"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
