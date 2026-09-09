"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Bell,
  Menu,
  ArrowUpRight,
  X,
  ShieldCheck,
  LogOut,
  ChevronDown,
  UserCheck,
  DollarSign,
  Check,
  Coins,
} from "lucide-react";
import { useUIState } from "@/context/UIStateContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { REVENUE_HISTORY, INITIAL_METRICS } from "@/lib/data";
import { exportRevenueToCSV } from "@/lib/exportUtils";
import { CurrencyCode, FX_RATES } from "@/lib/utils";

interface TopHeaderProps {
  onOpenMobileNav: () => void;
}

export default function TopHeader({ onOpenMobileNav }: TopHeaderProps) {
  const { addToast, activeCurrency, setActiveCurrency } = useUIState();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const currencyMenuRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut ⌘K / Ctrl+K focuses the inline search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setIsSearchFocused(false);
        setShowNotifications(false);
        setShowCurrencyMenu(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside to close search, currency, and user menu dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchFocused(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setShowUserMenu(false);
      }
      if (
        currencyMenuRef.current &&
        !currencyMenuRef.current.contains(e.target as Node)
      ) {
        setShowCurrencyMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = [
    {
      id: "notif-1",
      title: "Invoice #INV-2026-089 paid",
      desc: "Elena Rostova ($1,490.00) via Mastercard",
      time: "12m ago",
    },
    {
      id: "notif-2",
      title: "Past due notice sent",
      desc: "Amara Diallo (Koyo Systems) - $540.00",
      time: "2h ago",
    },
    {
      id: "notif-3",
      title: "Stripe Webhook synced",
      desc: "Batch 294 events ingested without error",
      time: "5h ago",
    },
  ];

  const searchResults = [
    { title: "Elena Rostova (NeuralArc Systems)", type: "Customer", href: "/customers" },
    { title: "Invoice #INV-2026-089", type: "Invoice ($1,490)", href: "/invoices", adminOnly: true },
    { title: "Customer Management Directory", type: "CRM", href: "/customers" },
    { title: "Security Audit Trail & Activity", type: "Security", href: "/audit" },
    { title: "Developer Webhook Simulator & API", type: "Platform", href: "/developers" },
    { title: "Scale Tier Upgrade", type: "Plan", href: "/subscriptions" },
    { title: "Two-Factor Auth & TOTP Setup", type: "Security", href: "/settings" },
    { title: "Dunning & Smart Payment Recovery", type: "Billing", href: "/settings" },
    { title: "Payment Methods (Mastercard •••• 4829)", type: "Billing", href: "/settings" },
  ].filter(
    (item) =>
      (!item.adminOnly || user?.role === "admin") &&
      (!searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/invoices?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchFocused(false);
    }
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-[#E8E6E0] sticky top-0 z-20 px-4 md:px-8 flex items-center justify-between">
      {/* Left: Mobile Nav Toggle + Inline Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onOpenMobileNav}
          className="md:hidden p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Real inline Search Bar (stays in place, no modal drop-down) */}
        <div ref={searchContainerRef} className="relative w-full">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search customers, invoices, metrics..."
              className="w-full pl-9 pr-12 py-2 text-xs rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] outline-hidden focus:border-[#2D5A43] focus:bg-white text-stone-900 transition-all shadow-2xs placeholder:text-stone-400"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                className="absolute right-3 p-0.5 rounded-md text-stone-400 hover:text-stone-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-stone-400 bg-white border border-[#E8E6E0] rounded-md shadow-2xs absolute right-2.5 pointer-events-none">
                <span>⌘</span>K
              </kbd>
            )}
          </form>

          {/* Clean attached dropdown suggestions underneath search input */}
          {isSearchFocused && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#E8E6E0] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in duration-100">
              <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider px-2.5 py-1">
                Matching Results
              </div>
              <div className="divide-y divide-[#F0EFEA] max-h-64 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={() => setIsSearchFocused(false)}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-[#FAF9F6] group transition-colors cursor-pointer"
                    >
                      <span className="text-xs font-medium text-stone-800 group-hover:text-[#2D5A43]">
                        {item.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-mono">
                        {item.type}
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-stone-400">
                    Press <strong>Enter</strong> to search &ldquo;{searchQuery}&rdquo; in invoices
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Currency switcher, notifications, export, user profile */}
      <div className="flex items-center gap-2.5">
        {/* Currency FX Switcher */}
        <div className="relative" ref={currencyMenuRef}>
          <button
            onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#E8E6E0] bg-[#FAF9F6] hover:bg-white text-stone-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            title="Switch display currency"
            aria-label="Currency Switcher"
          >
            <Coins className="w-3.5 h-3.5 text-[#2D5A43]" />
            <span className="font-mono text-xs">{activeCurrency}</span>
            <span className="text-stone-400 text-[10px]">({FX_RATES[activeCurrency].symbol})</span>
            <ChevronDown className="w-3 h-3 text-stone-400" />
          </button>

          {showCurrencyMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-[#E8E6E0] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                Display Currency
              </div>
              <div className="space-y-1 mt-1">
                {(Object.keys(FX_RATES) as CurrencyCode[]).map((curr) => {
                  const info = FX_RATES[curr];
                  const isSelected = activeCurrency === curr;
                  return (
                    <button
                      key={curr}
                      onClick={() => {
                        setActiveCurrency(curr);
                        setShowCurrencyMenu(false);
                        addToast({
                          title: `Currency: ${curr} (${info.symbol})`,
                          description: "All monetary values across Calyx converted dynamically.",
                          type: "info",
                        });
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                        isSelected
                          ? "bg-[#EBF3EE] text-[#2D5A43] font-bold"
                          : "hover:bg-[#FAF9F6] text-stone-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-stone-100 flex items-center justify-center font-mono font-bold text-xs text-stone-700">
                          {info.symbol}
                        </span>
                        <div>
                          <div className="font-semibold text-stone-900 leading-tight">{curr}</div>
                          <div className="text-[10px] text-stone-400">
                            {curr === "USD" ? "Base currency" : `1 USD = ${info.rate} ${curr}`}
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#2D5A43]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (unreadCount > 0) setUnreadCount(0);
            }}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-[#FAF9F6] border border-[#E8E6E0] transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E8E6E0] rounded-2xl shadow-xl p-2 z-40 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between p-2.5 border-b border-[#E8E6E0]">
                <span className="text-xs font-semibold text-stone-900">Notifications</span>
                <span className="text-[11px] text-emerald-700 font-medium">All systems green</span>
              </div>
              <div className="divide-y divide-[#F0EFEA] max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 hover:bg-[#FAF9F6] rounded-lg transition-colors cursor-pointer">
                    <div className="flex items-center justify-between text-xs font-semibold text-stone-800">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-stone-400 font-normal">{n.time}</span>
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">{n.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick action: Export or Generate */}
        <button
          onClick={() => {
            exportRevenueToCSV(REVENUE_HISTORY, INITIAL_METRICS);
            addToast({
              title: "Revenue Report Downloaded",
              description: "Saved calyx-revenue-report.csv to your downloads.",
              type: "success",
            });
          }}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#2D5A43] text-white hover:bg-[#1F4231] rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <span>Export CSV</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-200" />
        </button>

        {/* User Profile & Security Session Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl border border-[#E8E6E0] hover:bg-[#FAF9F6] transition-colors cursor-pointer"
            aria-label="User account and security options"
          >
            <div className="w-7 h-7 rounded-lg bg-[#2D5A43] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              {user?.avatar || "CX"}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-stone-900 leading-tight">
                {user?.name || "Calyx User"}
              </span>
              <span className="text-[10px] text-stone-500 font-medium">
                {user?.role === "admin" ? "Admin" : "Billing"}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-[#E8E6E0] rounded-2xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Profile Card */}
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#E8E6E0]">
                <div className="w-9 h-9 rounded-xl bg-[#2D5A43] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {user?.avatar || "CX"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-stone-900 truncate">{user?.name}</div>
                  <div className="text-[11px] text-stone-500 truncate">{user?.email}</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${
                        user?.role === "admin"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user?.role === "admin" ? "Admin" : "Billing"}
                    </span>
                    <span className="text-[10px] text-stone-400 truncate">{user?.company}</span>
                  </div>
                </div>
              </div>

              {/* Navigation links */}
              <div className="py-2 border-b border-[#E8E6E0] space-y-1">
                <Link
                  href="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center justify-between p-2 rounded-xl text-xs text-stone-700 hover:bg-[#FAF9F6] transition-colors"
                >
                  <span>Settings & Team</span>
                  <span className="text-[10px] text-stone-400">Configure</span>
                </Link>
                {user?.role === "admin" && (
                  <Link
                    href="/invoices"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center justify-between p-2 rounded-xl text-xs text-stone-700 hover:bg-[#FAF9F6] transition-colors"
                  >
                    <span>Invoices Ledger</span>
                    <span className="text-[10px] text-emerald-700 font-bold">Admin</span>
                  </Link>
                )}
              </div>

              {/* Security info & Sign Out */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[10px] text-stone-400">{user?.title || "Active Session"}</span>
                <button
                  onClick={() => {
                    logout();
                    addToast({
                      title: "Signed Out",
                      description: "Session securely closed.",
                      type: "info",
                    });
                    setShowUserMenu(false);
                    router.push("/login");
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
