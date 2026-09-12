"use client";

import React, { useState, useMemo } from "react";
import { useUIState } from "@/context/UIStateContext";
import { useAuth } from "@/context/AuthContext";
import { Customer, CustomerHealth } from "@/lib/data";
import CustomerDrawer from "@/components/customers/CustomerDrawer";
import {
  Users,
  Search,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Building2,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Mail,
  User,
  X,
} from "lucide-react";

export default function CustomersPage() {
  const { customers, addCustomer, formatMoneyWithFX, addToast, loadDemoData } = useUIState();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | CustomerHealth>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Customer Form State
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("Scale Tier (Annual)");
  const [country, setCountry] = useState("United States");
  const [mrrAmount, setMrrAmount] = useState(1490);

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      const matchesTab = activeTab === "all" || cust.status === activeTab;
      const matchesSearch =
        !searchQuery ||
        cust.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.plan.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [customers, activeTab, searchQuery]);

  const totalPortfolioMRR = customers.reduce((sum, c) => sum + c.mrr, 0);
  const averageLTV = customers.length > 0 ? customers.reduce((sum, c) => sum + c.ltv, 0) / customers.length : 0;
  const activeCount = customers.filter((c) => c.status === "active").length;

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !name || !email) return;

    const initials = company
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "CX";

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      company: company.trim(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      avatar: initials,
      plan,
      mrr: Number(mrrAmount) || 890,
      ltv: (Number(mrrAmount) || 890) * 12,
      status: "active",
      joinedDate: "Today",
      country,
      paymentMethod: "Credit Card (Stripe)",
      totalInvoices: 0,
    };

    addCustomer(newCust);
    setIsAddModalOpen(false);
    setCompany("");
    setName("");
    setEmail("");
    addToast({
      title: "Customer Account Created",
      description: `${newCust.company} has been added to your client directory.`,
      type: "success",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <span>{user?.company || "Workspace"}</span>
            <span>/</span>
            <span className="text-stone-900 font-semibold">Customers</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 mt-1">
            Customer Directory & CRM
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage client accounts, contract tiers, lifetime values, and billing health.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#2D5A43] text-white hover:bg-[#1F4231] transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Metric Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#E8E6E0] p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Active Accounts</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${customers.length > 0 ? "bg-emerald-50 text-emerald-800" : "bg-stone-100 text-stone-600"}`}>
              {customers.length > 0 ? "Healthy" : "Clean Ledger"}
            </span>
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2 tracking-tight tabular-nums">
            {activeCount} <span className="text-xs text-stone-400 font-normal">/ {customers.length} total</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            {customers.length > 0 ? `${Math.round((activeCount / customers.length) * 100)}% active subscription rate` : "Awaiting client onboarding"}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E6E0] p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Customer Portfolio MRR</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2 tracking-tight tabular-nums">
            {formatMoneyWithFX(totalPortfolioMRR)}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            {customers.length > 0 ? "Monthly recurring run rate" : "Calculated from active client contracts"}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E6E0] p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Average Lifetime Value</span>
            <span className="text-[10px] font-semibold text-stone-400">12-Mo LTV</span>
          </div>
          <div className="text-2xl font-bold text-[#2D5A43] mt-2 tracking-tight tabular-nums">
            {formatMoneyWithFX(averageLTV)}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            {customers.length > 0 ? "Across all tiers & custom contracts" : "Awaiting billing contract history"}
          </p>
        </div>
      </div>

      {/* Main Directory Card */}
      <div className="bg-white rounded-2xl border border-[#E8E6E0] overflow-hidden">
        {/* Filter bar & Search */}
        <div className="p-4 border-b border-[#E8E6E0] flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#FAF9F6]">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {[
              { id: "all", label: "All Accounts", count: customers.length },
              { id: "active", label: "Active", count: customers.filter((c) => c.status === "active").length },
              { id: "past_due", label: "Past Due", count: customers.filter((c) => c.status === "past_due").length },
              { id: "at_risk", label: "At Risk", count: customers.filter((c) => c.status === "at_risk").length },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-baseline gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? "bg-[#2D5A43] text-white shadow-xs"
                      : "text-stone-600 hover:text-stone-900 hover:bg-white"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] tabular-nums ${
                      active ? "text-emerald-100 font-bold" : "text-stone-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client, contact, email..."
              className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl bg-white border border-[#E8E6E0] outline-hidden focus:border-[#2D5A43] transition-all text-stone-900 placeholder:text-stone-400"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF9F6] border-b border-[#E8E6E0] text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                <th className="py-3 px-5">Organization</th>
                <th className="py-3 px-5">Primary Contact</th>
                <th className="py-3 px-5">Subscription Tier</th>
                <th className="py-3 px-5">Monthly MRR</th>
                <th className="py-3 px-5">Lifetime Value</th>
                <th className="py-3 px-5">Health</th>
                <th className="py-3 px-5 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EFEA] text-xs">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="max-w-md mx-auto text-center">
                      <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto text-stone-400 mb-4 shadow-xs">
                        <Users className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-bold text-stone-900">Your customer directory is empty</h3>
                      <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                        No customer accounts added yet for {user?.company || "your organization"}. Add a client to track subscription contracts or load sample telemetry.
                      </p>
                      <div className="flex items-center justify-center gap-3 mt-6">
                        <button
                          onClick={() => setIsAddModalOpen(true)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2D5A43] text-white text-xs font-semibold rounded-xl hover:bg-[#1F4231] transition-colors cursor-pointer shadow-xs"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add First Customer</span>
                        </button>
                        <button
                          onClick={() => {
                            loadDemoData();
                            addToast({
                              title: "Demo Telemetry Loaded",
                              description: "Populated sample invoices, customers, and MRR metrics.",
                              type: "success",
                            });
                          }}
                          className="px-4 py-2 bg-white border border-[#E8E6E0] text-xs font-semibold text-stone-700 rounded-xl hover:bg-[#FAF9F6] transition-colors cursor-pointer"
                        >
                          Load Sample Data
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    No customer accounts match your search filters.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    onClick={() => setSelectedCustomer(cust)}
                    className="hover:bg-[#FAF9F6] transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#2D5A43] text-white flex items-center justify-center font-bold text-xs">
                          {cust.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-stone-900 group-hover:text-[#2D5A43] transition-colors">
                            {cust.company}
                          </div>
                          <div className="text-[11px] text-stone-400">{cust.country}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <div className="font-semibold text-stone-800">{cust.name}</div>
                      <div className="text-[11px] text-stone-500 font-mono">{cust.email}</div>
                    </td>

                    <td className="py-4 px-5">
                      <span className="inline-block px-2.5 py-0.5 rounded-lg bg-stone-100 text-stone-700 font-medium text-[11px] border border-stone-200">
                        {cust.plan}
                      </span>
                    </td>

                    <td className="py-4 px-5 font-bold text-stone-900 tabular-nums">
                      {formatMoneyWithFX(cust.mrr)}
                    </td>

                    <td className="py-4 px-5 font-semibold text-emerald-800 tabular-nums">
                      {formatMoneyWithFX(cust.ltv)}
                    </td>

                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          cust.status === "active"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : cust.status === "past_due"
                            ? "bg-rose-50 text-rose-800 border-rose-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {cust.status === "active"
                          ? "Active"
                          : cust.status === "past_due"
                          ? "Past Due"
                          : "At Risk"}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(cust);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-[#E8E6E0] text-stone-700 hover:border-stone-400 transition-all cursor-pointer"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Drawer Slide-over */}
      <CustomerDrawer
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#E8E6E0] shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E6E0]">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#2D5A43]" />
                <h3 className="text-base font-bold text-stone-900">Add New Customer</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Company / Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Acme Quantum Corp"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] focus:border-[#2D5A43] focus:bg-white outline-hidden text-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Primary Contact Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Hayes"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] focus:border-[#2D5A43] focus:bg-white outline-hidden text-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Billing Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jordan@acme.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] focus:border-[#2D5A43] focus:bg-white outline-hidden text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Contract Plan Tier
                  </label>
                  <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] focus:border-[#2D5A43] focus:bg-white outline-hidden text-stone-900 text-xs"
                  >
                    <option value="Scale Tier (Annual)">Scale Tier (Annual)</option>
                    <option value="Growth Tier (Annual)">Growth Tier (Annual)</option>
                    <option value="Starter Tier (Monthly)">Starter Tier (Monthly)</option>
                    <option value="Enterprise Custom SLA">Enterprise Custom SLA</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Monthly MRR ($)
                  </label>
                  <input
                    type="number"
                    value={mrrAmount}
                    onChange={(e) => setMrrAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] focus:border-[#2D5A43] focus:bg-white outline-hidden text-stone-900 text-xs tabular-nums"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-[#FAF9F6] border border-[#E8E6E0] rounded-xl font-semibold text-stone-700 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#2D5A43] text-white rounded-xl font-semibold hover:bg-[#1F4231] shadow-xs"
                >
                  Add Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
