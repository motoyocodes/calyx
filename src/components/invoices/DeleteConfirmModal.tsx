"use client";

import React, { useEffect } from "react";
import { Invoice } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import StatusBadge from "./StatusBadge";
import { AlertTriangle, Trash2, X, FileText, ArrowRight } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  invoices: Invoice[];
  currentTotalCount?: number;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  invoices,
  currentTotalCount,
}: DeleteConfirmModalProps) {
  // Handle keyboard shortcuts (Escape to cancel)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || invoices.length === 0) return null;

  const isSingle = invoices.length === 1;
  const singleInvoice = invoices[0];
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const deleteCount = invoices.length;
  const remainingCount =
    typeof currentTotalCount === "number" ? Math.max(0, currentTotalCount - deleteCount) : undefined;

  return (
    <div
      className="fixed inset-0 z-[60] overflow-y-auto flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      />

      {/* Modal Dialog Card */}
      <div
        className="relative bg-white rounded-2xl sm:rounded-3xl border border-[#E8E6E0] shadow-2xl max-w-md w-full p-6 z-10 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-[#FAF9F6] transition-colors cursor-pointer"
          aria-label="Close confirmation modal"
        >
          <X className="w-4 h-4" />
        </button>



        {/* Title & Description */}
        <h3 id="delete-modal-title" className="text-lg font-bold text-stone-900">
          {isSingle ? "Delete Invoice?" : `Delete ${deleteCount} Invoices?`}
        </h3>
        <p className="text-xs text-stone-500 mt-1 leading-relaxed">
          {isSingle
            ? `Are you sure you want to permanently delete invoice ${singleInvoice.number}? This action cannot be undone.`
            : `Are you sure you want to permanently delete these ${deleteCount} selected invoices? This action cannot be undone.`}
        </p>

        {/* Invoice(s) Details Preview Card */}
        <div className="my-4 p-3.5 bg-[#FAF9F6] border border-[#E8E6E0] rounded-2xl space-y-2.5 text-xs">
          {isSingle ? (
            <div>
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#E8E6E0]/60">
                <span className="font-mono font-bold text-stone-900 bg-white border border-[#E8E6E0] px-2 py-0.5 rounded-md">
                  {singleInvoice.number}
                </span>
                <StatusBadge status={singleInvoice.status} size="sm" />
              </div>
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-stone-900">{singleInvoice.customerName}</p>
                  <p className="text-[11px] text-stone-500">{singleInvoice.customerCompany}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-stone-900 tabular-nums text-sm">
                    {formatCurrency(singleInvoice.amount, { showCents: true })}
                  </p>
                  <p className="text-[10px] text-stone-400">Total amount</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E6E0]/60">
                <span className="font-semibold text-stone-700">
                  {deleteCount} Invoices Selected
                </span>
                <span className="font-bold text-stone-900 tabular-nums text-sm">
                  {formatCurrency(totalAmount, { showCents: true })}
                </span>
              </div>
              <div className="pt-2 max-h-36 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between text-[11px] bg-white border border-[#E8E6E0]/80 px-2.5 py-1.5 rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-stone-800">{inv.number}</span>
                      <span className="text-stone-500 truncate max-w-[120px]">
                        {inv.customerName}
                      </span>
                    </div>
                    <span className="font-semibold text-stone-900 tabular-nums">
                      {formatCurrency(inv.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Counter Impact Notice */}
        {typeof remainingCount === "number" && typeof currentTotalCount === "number" && (
          <div className="mb-5 px-3 py-2 rounded-xl bg-amber-50/70 border border-amber-200/60 flex items-center justify-between text-xs text-amber-900">
            <span className="text-[11px] font-medium">Total Invoices count will update:</span>
            <div className="flex items-center gap-1.5 font-bold font-mono text-xs">
              <span className="text-stone-600 line-through">{currentTotalCount}</span>
              <ArrowRight className="w-3 h-3 text-amber-700" />
              <span className="text-emerald-700">{remainingCount}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-[#E8E6E0] text-xs font-semibold text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-xs font-semibold text-white shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isSingle ? "Delete Invoice" : `Delete (${deleteCount})`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
