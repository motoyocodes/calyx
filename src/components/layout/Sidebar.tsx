"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUIState } from "@/context/UIStateContext";
import { useAuth } from "@/context/AuthContext";
import CalyxLogo from "../brand/CalyxLogo";
import {
  LayoutDashboard,
  Receipt,
  Layers,
  Settings,
  TrendingUp,
  Building2,
  ChevronDown,
  X,
  Menu,
  LogOut,
  ShieldCheck,
  Users,
  Code2,
  FileText,
} from "lucide-react";

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export default function Sidebar({ mobileOpen = false, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { invoices, customers, auditLogs, formatMoneyWithFX, addToast } = useUIState();
  const { user, logout } = useAuth();
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);

  const navSections = [
    {
      title: "Billing Core",
      items: [
        {
          name: "Overview",
          href: "/",
          icon: LayoutDashboard,
          badge: null,
        },
        {
          name: "Invoices",
          href: "/invoices",
          icon: Receipt,
          badge: invoices.length.toString(),
        },
        {
          name: "Customers",
          href: "/customers",
          icon: Users,
          badge: customers.length.toString(),
        },
        {
          name: "Plans & Tiers",
          href: "/subscriptions",
          icon: Layers,
          badge: "3 plans",
        },
      ],
    },
    {
      title: "Operations & Security",
      items: [
        {
          name: "Audit Trail",
          href: "/audit",
          icon: ShieldCheck,
          badge: "Live",
        },
        {
          name: "Settings",
          href: "/settings",
          icon: Settings,
          badge: null,
        },
      ],
    },
    {
      title: "Platform",
      items: [
        {
          name: "Developers",
          href: "/developers",
          icon: Code2,
          badge: "API",
        },
      ],
    },
  ];

  const content = (
    <div className="flex flex-col h-full bg-[#FFFFFF] border-r border-[#E8E6E0] text-[#1A1C1A] select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-[#E8E6E0]">
        <Link href="/" className="flex items-center gap-2 group">
          <CalyxLogo size="md" />
        </Link>
        {setMobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Organization / Workspace Switcher */}
      <div className="px-3 pt-4 pb-2">
        <div className="relative">
          <button
            onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[#E8E6E0] bg-[#FAF9F6] hover:bg-[#F2EFEB] transition-colors text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#2D5A43] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                <Building2 className="w-4 h-4 text-emerald-200" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-stone-900 truncate">Synthetix AI</div>
                <div className="text-[11px] text-stone-500 font-medium">Scale Tier • 25 seats</div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
          </button>

          {workspaceMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E8E6E0] rounded-xl shadow-lg p-1 z-30 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Workspaces
              </div>
              <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200/50 flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-stone-900">Synthetix AI</div>
                  <div className="text-[10px] text-emerald-700 font-medium">Production active</div>
                </div>
              </div>
              <div className="p-2 rounded-lg hover:bg-stone-50 cursor-pointer text-stone-600 transition-colors">
                <div className="text-xs font-medium">Koyo Labs (Staging)</div>
                <div className="text-[10px] text-stone-400">Sandbox environment</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="px-3 pb-1.5 text-[10px] font-bold tracking-wider text-stone-400 uppercase">
              {section.title}
            </div>
            {section.items.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen && setMobileOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? "bg-[#2D5A43] text-white shadow-sm font-semibold"
                      : "text-stone-600 hover:text-stone-900 hover:bg-[#FAF9F6]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? "text-emerald-300" : "text-stone-400 group-hover:text-stone-700"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-white/20 text-white"
                          : item.badge === "Live"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-stone-100 text-stone-600 group-hover:bg-stone-200"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* MRR Pulse Card with FX Support */}
      <div className="p-3 m-3 rounded-xl bg-gradient-to-br from-[#FAF9F6] to-[#EBF3EE] border border-[#D5E3DA]">
        <div className="flex items-center justify-between text-[11px] font-medium text-emerald-800 mb-1">
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
            Monthly Run Rate
          </span>
          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
            +14.2%
          </span>
        </div>
        <div className="text-base font-bold text-[#1A1C1A] tracking-tight tabular-nums">
          {formatMoneyWithFX(48250, false)}<span className="text-xs font-normal text-stone-500"> /mo</span>
        </div>
        <div className="w-full bg-[#D5E3DA] h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-[#2D5A43] h-full rounded-full transition-all duration-500"
            style={{ width: "84%" }}
          ></div>
        </div>
        <div className="flex justify-between items-center text-[10px] text-stone-500 mt-1.5">
          <span>Target: {formatMoneyWithFX(50000, false)}</span>
          <span className="font-semibold text-emerald-700">84% achieved</span>
        </div>
      </div>

      {/* User Footer Profile & Session Controls */}
      <div className="p-3 border-t border-[#E8E6E0] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#E8E6E0] flex items-center justify-center text-xs font-bold text-[#2D5A43] shrink-0">
            {user?.avatar || "CX"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-stone-900 truncate">
              {user?.name || "Calyx User"}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-stone-500 truncate">
                {user?.title || user?.email}
              </span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${
                  user?.role === "admin"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {user?.role === "admin" ? "Admin" : "Billing"}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            addToast({
              title: "Session Terminated",
              description: "You have been signed out successfully.",
              type: "info",
            });
            router.push("/login");
          }}
          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          title="Sign out of Calyx"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed inset-y-0 left-0 z-30">
        {content}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen && setMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-40 animate-in fade-in"
        />
      )}

      {/* Mobile Drawer Content */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform transition-transform duration-200 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {content}
      </aside>
    </>
  );
}
