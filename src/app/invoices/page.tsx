"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useUIState } from "@/context/UIStateContext";
import { SAMPLE_INVOICES, Invoice } from "@/lib/data";
import { formatCurrency, formatDate, InvoiceStatus } from "@/lib/utils";
import StatusBadge from "@/components/invoices/StatusBadge";
import InvoiceDrawer from "@/components/invoices/InvoiceDrawer";
import CreateInvoiceModal from "@/components/invoices/CreateInvoiceModal";
import DeleteConfirmModal from "@/components/invoices/DeleteConfirmModal";
import { exportInvoicesToCSV } from "@/lib/exportUtils";
import { useAuth } from "@/context/AuthContext";
import {
  Search,
  ArrowUpDown,
  Download,
  Plus,
  CheckSquare,
  Square,
  Inbox,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Lock,
} from "lucide-react";

export default function InvoicesPage() {
  const { addToast, invoices, addInvoice, deleteInvoice, deleteInvoices, formatMoneyWithFX } = useUIState();
  const { user, hasPermission } = useAuth();
  const canCreate = hasPermission("create_invoice");
  const canDelete = hasPermission("delete_invoice");
  const [activeFilter, setActiveFilter] = useState<"all" | InvoiceStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"issueDate" | "amount" | "customerName">("issueDate");
  const [sortAsc, setSortAsc] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [highlightedInvoiceId, setHighlightedInvoiceId] = useState<string | null>(null);
  const [invoicesToDelete, setInvoicesToDelete] = useState<Invoice[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleCreateInvoice = (newInvoice: Invoice) => {
    addInvoice(newInvoice);
    // Switch to 'all' and clear search so the new invoice is guaranteed to show on the list
    setActiveFilter("all");
    setSearchQuery("");
    setHighlightedInvoiceId(newInvoice.id);
    addToast({
      title: `Invoice ${newInvoice.number} Created`,
      description: `Issued to ${newInvoice.customerName} (${newInvoice.customerCompany}).`,
      type: "success",
    });
    setTimeout(() => {
      setHighlightedInvoiceId(null);
    }, 5000);
  };

  const handleRequestDeleteOne = (invoiceToDelete: Invoice, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!canDelete) {
      addToast({
        title: "Permission Restricted",
        description: `Your role (${user?.role}) has read-only access. Only Admins and Billing Managers can delete invoices.`,
        type: "warning",
      });
      return;
    }
    setInvoicesToDelete([invoiceToDelete]);
    setIsDeleteModalOpen(true);
  };

  const handleRequestBulkDelete = () => {
    if (!canDelete) {
      addToast({
        title: "Permission Restricted",
        description: `Your role (${user?.role}) cannot delete invoices.`,
        type: "warning",
      });
      return;
    }
    const targets = invoices.filter((inv) => selectedInvoiceIds.includes(inv.id));
    if (targets.length > 0) {
      setInvoicesToDelete(targets);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    const count = invoicesToDelete.length;
    if (count === 0) return;

    if (count === 1) {
      const target = invoicesToDelete[0];
      deleteInvoice(target.id);
      setSelectedInvoiceIds((prev) => prev.filter((id) => id !== target.id));
      if (selectedInvoice?.id === target.id) {
        setSelectedInvoice(null);
      }
      addToast({
        title: "Invoice Deleted",
        description: `${target.number} has been deleted. Total updated to ${invoices.length - 1}.`,
        type: "info",
      });
    } else {
      const ids = invoicesToDelete.map((i) => i.id);
      deleteInvoices(ids);
      setSelectedInvoiceIds((prev) => prev.filter((id) => !ids.includes(id)));
      if (selectedInvoice && ids.includes(selectedInvoice.id)) {
        setSelectedInvoice(null);
      }
      addToast({
        title: `${count} Invoices Deleted`,
        description: `Removed ${count} invoices. Total updated to ${invoices.length - count}.`,
        type: "info",
      });
    }

    setIsDeleteModalOpen(false);
    setInvoicesToDelete([]);
  };

  // Sync initial search from header query if present
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const query = params.get("search");
      if (query) setSearchQuery(query);
    }
  }, []);

  // Filtered & Sorted Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesFilter = activeFilter === "all" || inv.status === activeFilter;
      const matchesSearch =
        !searchQuery ||
        inv.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customerCompany.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortField === "amount") comparison = a.amount - b.amount;
      else if (sortField === "customerName")
        comparison = a.customerName.localeCompare(b.customerName);
      else comparison = new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime();

      return sortAsc ? comparison : -comparison;
    });
  }, [invoices, activeFilter, searchQuery, sortField, sortAsc]);

  const handleToggleSelectAll = () => {
    if (selectedInvoiceIds.length === filteredInvoices.length) {
      setSelectedInvoiceIds([]);
    } else {
      setSelectedInvoiceIds(filteredInvoices.map((i) => i.id));
    }
  };

  const handleToggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedInvoiceIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSort = (field: "issueDate" | "amount" | "customerName") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleBulkExport = () => {
    const toExport = invoices.filter((inv) => selectedInvoiceIds.includes(inv.id));
    exportInvoicesToCSV(toExport.length > 0 ? toExport : filteredInvoices, "calyx-selected-invoices");
    addToast({
      title: `Exported ${toExport.length} Invoices`,
      description: "Downloaded CSV to your device.",
      type: "success",
    });
    setSelectedInvoiceIds([]);
  };

  const handleExportAll = () => {
    exportInvoicesToCSV(invoices, "calyx-all-invoices");
    addToast({
      title: "All Invoices Exported",
      description: `Downloaded ${invoices.length} invoices as CSV.`,
      type: "success",
    });
  };

  const filterTabs: { id: "all" | InvoiceStatus; label: string; count: number }[] = [
    { id: "all", label: "All Invoices", count: invoices.length },
    { id: "paid", label: "Paid", count: invoices.filter((i) => i.status === "paid").length },
    { id: "pending", label: "Pending", count: invoices.filter((i) => i.status === "pending").length },
    { id: "past_due", label: "Past Due", count: invoices.filter((i) => i.status === "past_due").length },
    { id: "draft", label: "Draft", count: invoices.filter((i) => i.status === "draft").length },
  ];

  // Restrict invoices viewing to Admin only
  if (user?.role !== "admin") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E8E6E0] shadow-xl p-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto shadow-xs">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-stone-900">Access Restricted</h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            The Invoices & Accounts Receivable ledger contains confidential financial records and is restricted to <strong>Workspace Administrators</strong> only.
          </p>
          <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] text-[11px] text-stone-600">
            Your current account role:{" "}
            <span className="font-bold text-stone-800 uppercase">{user?.role || "Billing"}</span>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D5A43] text-white text-xs font-semibold hover:bg-[#1F4231] transition-colors"
            >
              <span>Return to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <span>Synthetix AI</span>
            <span>/</span>
            <span className="text-stone-900 font-semibold">Invoices</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 mt-1">
            Invoices & Accounts Receivable
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {selectedInvoiceIds.length > 0 ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleRequestBulkDelete}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Delete selected invoices"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete ({selectedInvoiceIds.length})</span>
              </button>
              <button
                onClick={handleBulkExport}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-[#E8E6E0] text-stone-700 hover:bg-[#FAF9F6] transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-stone-500" />
                <span>Export Selected ({selectedInvoiceIds.length})</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleExportAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-[#E8E6E0] text-stone-700 hover:bg-[#FAF9F6] transition-colors cursor-pointer"
              title="Export all invoices to CSV"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              <span>Export All CSV</span>
            </button>
          )}

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
                    "Read-only mode: Your current role (Viewer) cannot create invoices. Switch to Admin or Billing Manager to create.",
                  type: "warning",
                });
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed"
              title="Create invoice is restricted in Viewer mode"
            >
              <Lock className="w-3.5 h-3.5 text-stone-400" />
              <span>Create Invoice (Locked)</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-[#E8E6E0] overflow-hidden">
        {/* Table Filter Tabs & Search Bar */}
        <div className="p-4 border-b border-[#E8E6E0] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {filterTabs.map((tab) => {
              const active = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`inline-flex items-baseline gap-1 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? "bg-[#2D5A43] text-white font-semibold"
                      : "text-stone-600 hover:text-stone-900 hover:bg-[#FAF9F6] font-medium"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[11px] font-semibold tabular-nums ${
                      active ? "text-emerald-100" : "text-stone-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by customer, ID, company..."
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] outline-hidden focus:border-[#2D5A43] focus:bg-white transition-all text-stone-900 placeholder:text-stone-400"
            />
          </div>
        </div>

        {/* Table Content */}
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400 mb-3">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">No matching invoices</h3>
            <p className="text-xs text-stone-500 mt-1">
              No records found matching &ldquo;{searchQuery || activeFilter}&rdquo;.
            </p>
            <button
              onClick={() => {
                setActiveFilter("all");
                setSearchQuery("");
              }}
              className="mt-4 px-3.5 py-1.5 bg-[#FAF9F6] border border-[#E8E6E0] text-xs font-semibold text-stone-700 rounded-xl hover:bg-stone-100 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF9F6] border-b border-[#E8E6E0] text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-10 text-center">
                    <button
                      onClick={handleToggleSelectAll}
                      className="text-stone-400 hover:text-stone-700 p-0.5 rounded"
                      aria-label="Select all invoices"
                    >
                      {selectedInvoiceIds.length === filteredInvoices.length &&
                      filteredInvoices.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-[#2D5A43]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4">Invoice</th>
                  <th
                    onClick={() => handleSort("customerName")}
                    className="py-3 px-4 cursor-pointer hover:text-stone-900 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Customer & Organization</span>
                      <ArrowUpDown className="w-3 h-3 text-stone-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("issueDate")}
                    className="py-3 px-4 cursor-pointer hover:text-stone-900 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Issue Date</span>
                      <ArrowUpDown className="w-3 h-3 text-stone-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("amount")}
                    className="py-3 px-4 cursor-pointer hover:text-stone-900 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Amount Due</span>
                      <ArrowUpDown className="w-3 h-3 text-stone-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EFEA] text-xs">
                {filteredInvoices.map((invoice) => {
                  const isSelected = selectedInvoiceIds.includes(invoice.id);
                  const isNew = invoice.id === highlightedInvoiceId;
                  return (
                    <tr
                      key={invoice.id}
                      onClick={() => setSelectedInvoice(invoice)}
                      className={`hover:bg-[#FAF9F6] transition-all duration-300 cursor-pointer group ${
                        isNew
                          ? "bg-emerald-50/90 ring-1 ring-emerald-400"
                          : isSelected
                          ? "bg-emerald-50/40"
                          : ""
                      }`}
                    >
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={(e) => handleToggleSelectOne(invoice.id, e)}
                          className="text-stone-400 hover:text-stone-700 p-0.5 rounded"
                          aria-label={`Select invoice ${invoice.number}`}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#2D5A43]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-4 font-mono font-medium text-stone-900 group-hover:text-[#2D5A43]">
                        {invoice.number}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-stone-800">
                          {invoice.customerName}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {invoice.customerCompany} • {invoice.customerEmail}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-stone-500 tabular-nums">
                        {formatDate(invoice.issueDate)}
                      </td>
                      <td className="py-4 px-4 font-bold text-stone-900 tabular-nums">
                        {formatMoneyWithFX(invoice.amount, true)}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={invoice.status} size="sm" />
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedInvoice(invoice);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-[#E8E6E0] text-stone-700 hover:border-stone-400 group-hover:bg-[#FAF9F6] transition-all cursor-pointer"
                          >
                            Details
                          </button>
                          <button
                            onClick={(e) => handleRequestDeleteOne(invoice, e)}
                            className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                            title={`Delete invoice ${invoice.number}`}
                            aria-label={`Delete invoice ${invoice.number}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Pagination Bar */}
        <div className="p-4 border-t border-[#E8E6E0] bg-[#FAF9F6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <div>
            Showing <strong className="text-stone-800">{filteredInvoices.length}</strong> of{" "}
            <strong className="text-stone-800">{invoices.length}</strong> invoices
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled
              className="p-1.5 rounded-lg border border-[#E8E6E0] bg-white text-stone-300 cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-[#E8E6E0] font-semibold text-stone-800">
              1
            </span>
            <button
              disabled
              className="p-1.5 rounded-lg border border-[#E8E6E0] bg-white text-stone-300 cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Invoice Detail Drawer */}
      <InvoiceDrawer
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onDelete={(id) => {
          const invToDelete = invoices.find((i) => i.id === id);
          if (invToDelete) handleRequestDeleteOne(invToDelete);
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
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setInvoicesToDelete([]);
        }}
        onConfirm={handleConfirmDelete}
        invoices={invoicesToDelete}
        currentTotalCount={invoices.length}
      />
    </div>
  );
}
