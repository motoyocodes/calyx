"use client";

import React, { useState, useEffect } from "react";
import { Invoice, InvoiceItem } from "@/lib/data";
import { InvoiceStatus, formatCurrency } from "@/lib/utils";
import { X, Plus, Trash2, Building2, User, Mail } from "lucide-react";

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (invoice: Invoice) => void;
  existingCount: number;
}

const PLAN_PRESETS = [
  { name: "Scale Tier (Annual)", price: 1490.0, description: "Scale Tier Annual License (25 seats)" },
  { name: "Growth Tier (Annual)", price: 890.0, description: "Growth Plan Annual Subscription (10 seats)" },
  { name: "Starter Tier (Monthly)", price: 49.0, description: "Starter Tier Monthly Ingestion (3 seats)" },
  { name: "Enterprise Custom SLA", price: 2490.0, description: "Enterprise Dedicated Telemetry & 99.99% SLA" },
  { name: "Custom Billing Item", price: 0.0, description: "Custom Professional Services" },
];

export default function CreateInvoiceModal({
  isOpen,
  onClose,
  onCreate,
  existingCount,
}: CreateInvoiceModalProps) {
  // Generate incremental invoice number
  const nextNumber = `INV-2026-${String(89 + existingCount - 7).padStart(3, "0")}`;

  const todayStr = new Date().toISOString().split("T")[0];
  const defaultDue = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(PLAN_PRESETS[0].name);
  const [issueDate, setIssueDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState(defaultDue);
  const [status, setStatus] = useState<InvoiceStatus>("pending");
  const [paymentMethod, setPaymentMethod] = useState("Credit Card (Stripe)");
  const [taxRate, setTaxRate] = useState(8); // 8% default
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: "item-1",
      description: PLAN_PRESETS[0].description,
      quantity: 1,
      unitPrice: PLAN_PRESETS[0].price,
      total: PLAN_PRESETS[0].price,
    },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle plan preset selection
  const handlePlanPresetChange = (presetName: string) => {
    setSelectedPlan(presetName);
    const preset = PLAN_PRESETS.find((p) => p.name === presetName);
    if (preset && preset.price > 0) {
      setItems([
        {
          id: `item-${Date.now()}`,
          description: preset.description,
          quantity: 1,
          unitPrice: preset.price,
          total: preset.price,
        },
      ]);
    }
  };

  // Line item manipulation
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      description: "Additional Seat / Add-on Service",
      quantity: 1,
      unitPrice: 100.0,
      total: 100.0,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof InvoiceItem, val: string | number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: val };
        if (field === "quantity" || field === "unitPrice") {
          const qty = field === "quantity" ? Number(val) || 0 : item.quantity;
          const price = field === "unitPrice" ? Number(val) || 0 : item.unitPrice;
          updated.total = Math.round(qty * price * 100) / 100;
        }
        return updated;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
  const grandTotal = Math.round((subtotal + taxAmount) * 100) / 100;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!customerName.trim()) newErrors.customerName = "Customer name is required";
    if (!customerEmail.trim()) newErrors.customerEmail = "Customer email is required";
    else if (!customerEmail.includes("@")) newErrors.customerEmail = "Enter a valid email address";
    if (!customerCompany.trim()) newErrors.customerCompany = "Company name is required";
    if (items.length === 0 || grandTotal <= 0) newErrors.items = "At least one item with a price is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (initialStatus?: InvoiceStatus) => {
    if (!validate()) return;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      number: nextNumber,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerCompany: customerCompany.trim(),
      amount: grandTotal,
      status: initialStatus || status,
      issueDate,
      dueDate,
      planName: selectedPlan,
      billingPeriod: `${issueDate} - ${dueDate}`,
      paymentMethod,
      taxRate: taxRate / 100,
      items,
    };

    onCreate(newInvoice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl border border-[#E8E6E0] shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E8E6E0] flex items-center justify-between bg-[#FAF9F6]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2D5A43] text-white flex items-center justify-center font-mono font-bold text-xs">
              +
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-stone-900">Create New Invoice</h2>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-[#FAF9F6] border border-[#E8E6E0] text-[#2D5A43]">
                  {nextNumber}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Issue a billable receivable to an organization or client
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Customer Details Grid */}
          <div>
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider font-mono mb-3">
              Customer & Organization
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Julian Vance"
                    className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#FAF9F6] border outline-hidden transition-all ${
                      errors.customerName
                        ? "border-rose-300 focus:border-rose-500"
                        : "border-[#E8E6E0] focus:border-[#2D5A43] focus:bg-white"
                    }`}
                  />
                </div>
                {errors.customerName && (
                  <p className="text-[10px] text-rose-600 mt-1">{errors.customerName}</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Work Email *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="julian@vortex.co"
                    className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#FAF9F6] border outline-hidden transition-all ${
                      errors.customerEmail
                        ? "border-rose-300 focus:border-rose-500"
                        : "border-[#E8E6E0] focus:border-[#2D5A43] focus:bg-white"
                    }`}
                  />
                </div>
                {errors.customerEmail && (
                  <p className="text-[10px] text-rose-600 mt-1">{errors.customerEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Company / Organization *
                </label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customerCompany}
                    onChange={(e) => setCustomerCompany(e.target.value)}
                    placeholder="Vortex Robotics"
                    className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#FAF9F6] border outline-hidden transition-all ${
                      errors.customerCompany
                        ? "border-rose-300 focus:border-rose-500"
                        : "border-[#E8E6E0] focus:border-[#2D5A43] focus:bg-white"
                    }`}
                  />
                </div>
                {errors.customerCompany && (
                  <p className="text-[10px] text-rose-600 mt-1">{errors.customerCompany}</p>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Parameters */}
          <div className="pt-2 border-t border-[#F0EFEA]">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider font-mono mb-3">
              Billing Terms & Dates
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Plan Template
                </label>
                <select
                  value={selectedPlan}
                  onChange={(e) => handlePlanPresetChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] focus:border-[#2D5A43] focus:bg-white outline-hidden cursor-pointer"
                >
                  {PLAN_PRESETS.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} {p.price > 0 ? `(${formatCurrency(p.price)})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Initial Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] focus:border-[#2D5A43] focus:bg-white outline-hidden cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="draft">Draft</option>
                  <option value="paid">Paid</option>
                  <option value="past_due">Past Due</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] focus:border-[#2D5A43] focus:bg-white outline-hidden cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] focus:border-[#2D5A43] focus:bg-white outline-hidden cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Line Items Section */}
          <div className="pt-2 border-t border-[#F0EFEA]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider font-mono">
                Itemized Summary
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#2D5A43] hover:text-[#1F4231] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="border border-[#E8E6E0] rounded-xl overflow-hidden divide-y divide-[#F0EFEA]">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleUpdateItem(item.id, "description", e.target.value)}
                      placeholder="Item description..."
                      className="w-full px-2.5 py-1 text-xs rounded-lg bg-[#FAF9F6] border border-[#E8E6E0] focus:border-[#2D5A43] focus:bg-white outline-hidden font-medium text-stone-800"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateItem(item.id, "quantity", parseInt(e.target.value) || 1)
                        }
                        className="w-full px-2 py-1 text-xs rounded-lg bg-[#FAF9F6] border border-[#E8E6E0] text-center font-mono outline-hidden"
                        title="Quantity"
                      />
                    </div>
                    <span className="text-stone-400">×</span>
                    <div className="w-24">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleUpdateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-2 py-1 text-xs rounded-lg bg-[#FAF9F6] border border-[#E8E6E0] text-right font-mono outline-hidden"
                        title="Unit Price"
                      />
                    </div>
                    <span className="text-stone-400">=</span>
                    <div className="w-24 text-right font-bold text-stone-900 tabular-nums">
                      {formatCurrency(item.total, { showCents: true })}
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove line item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {errors.items && <p className="text-[10px] text-rose-600 mt-1">{errors.items}</p>}
          </div>

          {/* Pricing Totals Card */}
          <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] flex flex-col items-end text-xs space-y-1.5">
            <div className="flex justify-between w-48 text-stone-600">
              <span>Subtotal:</span>
              <span className="font-mono tabular-nums">
                {formatCurrency(subtotal, { showCents: true })}
              </span>
            </div>
            <div className="flex justify-between w-48 text-stone-600 items-center">
              <span className="flex items-center gap-1">
                <span>Tax Rate:</span>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                  className="w-10 px-1 py-0.5 text-[10px] rounded bg-white border border-[#E8E6E0] font-mono text-center"
                />
                <span>%</span>
              </span>
              <span className="font-mono tabular-nums">
                {formatCurrency(taxAmount, { showCents: true })}
              </span>
            </div>
            <div className="pt-2 border-t border-[#E8E6E0] flex justify-between w-48 text-sm font-bold text-stone-900">
              <span>Total Due:</span>
              <span className="tabular-nums font-mono">
                {formatCurrency(grandTotal, { showCents: true })}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#E8E6E0] bg-[#FAF9F6] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmit("draft")}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-[#E8E6E0] text-stone-700 hover:bg-[#FAF9F6] transition-colors cursor-pointer"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-[#2D5A43] text-white hover:bg-[#1F4231] transition-colors cursor-pointer"
            >
              <span>Create & Issue Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
