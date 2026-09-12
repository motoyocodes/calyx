"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import {
  SAMPLE_INVOICES,
  Invoice,
  Customer,
  SAMPLE_CUSTOMERS,
  AuditLogEntry,
  INITIAL_AUDIT_LOGS,
  WebhookTemplate,
  WEBHOOK_TEMPLATES,
} from "@/lib/data";
import { CurrencyCode, FX_RATES, formatMoney } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: "success" | "info" | "warning" | "error";
}

interface UIStateContextType {
  // Billing cycle
  billingCycle: "monthly" | "annual";
  setBillingCycle: (cycle: "monthly" | "annual") => void;

  // Currency & FX
  activeCurrency: CurrencyCode;
  setActiveCurrency: (currency: CurrencyCode) => void;
  convertAmount: (usdAmount: number) => number;
  formatMoneyWithFX: (usdAmount: number, showCents?: boolean) => string;

  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;

  // Invoices
  invoices: Invoice[];
  addInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  deleteInvoices: (ids: string[]) => void;

  // Customers
  customers: Customer[];
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;

  // Audit logs
  auditLogs: AuditLogEntry[];
  addAuditLog: (entry: Omit<AuditLogEntry, "id" | "timestamp">) => void;
  exportAuditLogsToCSV: () => void;

  // Webhooks simulation
  webhookTemplates: WebhookTemplate[];
  dispatchedEventsCount: number;
  dispatchWebhookSimulation: (
    templateId: string
  ) => Promise<{ success: boolean; template: WebhookTemplate; responseTimeMs: number; signature: string }>;

  // Sandbox & Clean Workspace Controls
  isDemoData: boolean;
  loadDemoData: () => void;
  resetWorkspace: () => void;

  // Live Dynamic Telemetry Calculated from Workspace
  liveMRR: number;
  liveSubscribers: number;
  liveARPU: number;
  liveChurn: number;
}

const UIStateContext = createContext<UIStateContextType | undefined>(undefined);

export function UIStateProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [activeCurrency, setActiveCurrency] = useState<CurrencyCode>("USD");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [dispatchedEventsCount, setDispatchedEventsCount] = useState(0);
  const [isDemoData, setIsDemoData] = useState<boolean>(false);

  // Load persisted state on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const isDemo = localStorage.getItem("calyx_demo_mode") === "true";
        setIsDemoData(isDemo);

        const savedInvoices = localStorage.getItem("calyx_invoices");
        if (savedInvoices !== null) {
          const parsed = JSON.parse(savedInvoices);
          if (Array.isArray(parsed)) setInvoices(parsed);
        } else if (isDemo) {
          setInvoices(SAMPLE_INVOICES);
        } else {
          setInvoices([]);
        }

        const savedCurrency = localStorage.getItem("calyx_currency") as CurrencyCode;
        if (savedCurrency && FX_RATES[savedCurrency]) {
          setActiveCurrency(savedCurrency);
        }

        const savedCustomers = localStorage.getItem("calyx_customers");
        if (savedCustomers !== null) {
          const parsed = JSON.parse(savedCustomers);
          if (Array.isArray(parsed)) setCustomers(parsed);
        } else if (isDemo) {
          setCustomers(SAMPLE_CUSTOMERS);
        } else {
          setCustomers([]);
        }

        const savedAudit = localStorage.getItem("calyx_audit_logs");
        if (savedAudit !== null) {
          const parsed = JSON.parse(savedAudit);
          if (Array.isArray(parsed)) {
            if (isDemo) {
              setAuditLogs(parsed.length > 0 ? parsed : INITIAL_AUDIT_LOGS);
            } else {
              // In real workspace mode, permanently purge all fake mock demo entries
              const mockIds = new Set(INITIAL_AUDIT_LOGS.map((m) => m.id));
              const realLogs = parsed.filter((item: any) => {
                if (mockIds.has(item.id)) return false;
                if (item.id && typeof item.id === "string" && item.id.startsWith("aud-00")) return false;
                if (item.actor === "Admin Operator" || item.actor === "Billing Operator") return false;
                if (item.actor === "Sarah Lin" || item.actor === "Marcus Vance" || item.actor === "Stripe Webhook Gateway") return false;
                if (item.actor === "root@unknown-proxy.onion" || item.actor === "Unknown Remote Client") return false;
                if (item.target === "Session Token #cx_jwt_live" || item.target === "TOTP Authenticator") return false;
                if (item.target === "INV-2026-089" || item.target === "INV-2026-087") return false;
                if (item.target === "US-EIN-84-2918402" || item.target === "/api/auth/login" || item.target === "calyx-revenue-report.csv") return false;
                if (item.details && typeof item.details === "string") {
                  if (item.details.includes("NeuralArc") || item.details.includes("Koyo")) return false;
                  if (item.details.includes("unknown-proxy") || item.details.includes("US-EIN-84-2918402")) return false;
                  if (item.details.includes("Oct 2025 - Apr 2026") || item.details.includes("emergency recovery codes")) return false;
                  if (item.details.includes("active remember-me token")) return false;
                }
                return true;
              });
              setAuditLogs(realLogs);
              localStorage.setItem("calyx_audit_logs", JSON.stringify(realLogs));
            }
          }
        } else if (isDemo) {
          setAuditLogs(INITIAL_AUDIT_LOGS);
        } else {
          setAuditLogs([]);
        }
      } catch {
        // fallback
      }
    }
  }, []);

  // Live dynamic calculations based on real workspace content
  const liveMRR = useMemo(() => {
    if (customers.length > 0) {
      return customers
        .filter((c) => c.status === "active")
        .reduce((sum, c) => sum + (c.mrr || 0), 0);
    }
    return invoices
      .filter((i) => i.status === "paid" || i.status === "pending")
      .reduce((sum, i) => sum + i.amount, 0);
  }, [customers, invoices]);

  const liveSubscribers = useMemo(() => {
    if (customers.length > 0) {
      return customers.filter((c) => c.status === "active").length;
    }
    return invoices.length;
  }, [customers, invoices]);

  const liveARPU = useMemo(() => {
    return liveSubscribers > 0 ? liveMRR / liveSubscribers : 0;
  }, [liveMRR, liveSubscribers]);

  const liveChurn = useMemo(() => {
    if (customers.length === 0) return 0;
    const atRisk = customers.filter((c) => c.status === "at_risk").length;
    return Number(((atRisk / customers.length) * 100).toFixed(1));
  }, [customers]);

  const loadDemoData = () => {
    setInvoices(SAMPLE_INVOICES);
    setCustomers(SAMPLE_CUSTOMERS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setIsDemoData(true);
    try {
      localStorage.setItem("calyx_invoices", JSON.stringify(SAMPLE_INVOICES));
      localStorage.setItem("calyx_customers", JSON.stringify(SAMPLE_CUSTOMERS));
      localStorage.setItem("calyx_audit_logs", JSON.stringify(INITIAL_AUDIT_LOGS));
      localStorage.setItem("calyx_active_plan", "growth");
      localStorage.setItem("calyx_demo_mode", "true");
    } catch {
      // ignore
    }
    addToast({
      title: "Sample Sandbox Data Loaded",
      description: "Populated sample invoices, customers, and cohorts for feature exploration.",
      type: "info",
    });
  };

  const resetWorkspace = () => {
    setInvoices([]);
    setCustomers([]);
    setAuditLogs([]);
    setIsDemoData(false);
    try {
      localStorage.setItem("calyx_invoices", JSON.stringify([]));
      localStorage.setItem("calyx_customers", JSON.stringify([]));
      localStorage.setItem("calyx_audit_logs", JSON.stringify([]));
      localStorage.removeItem("calyx_active_plan");
      localStorage.removeItem("calyx_demo_mode");
    } catch {
      // ignore
    }
    addToast({
      title: "Clean Workspace Active",
      description: "Workspace reset to fresh state ready for your organization's real data.",
      type: "success",
    });
  };

  const handleSetCurrency = (currency: CurrencyCode) => {
    if (currency === activeCurrency) return;
    setActiveCurrency(currency);
    try {
      localStorage.setItem("calyx_currency", currency);
    } catch {
      // ignore
    }
    addAuditLog({
      event: "settings.currency_changed",
      category: "settings",
      actor: user?.name || (user?.company ? `${user.company} Admin` : "Workspace Admin"),
      actorRole: user?.role === "admin" ? "Admin" : "Billing",
      ipAddress: "127.0.0.1 (Local Session)",
      target: currency,
      severity: "info",
      details: `Active reporting currency switched to ${currency} (${FX_RATES[currency]?.label || currency}).`,
    });
  };

  const convertAmount = (usdAmount: number): number => {
    const rate = FX_RATES[activeCurrency]?.rate || 1.0;
    return usdAmount * rate;
  };

  const formatMoneyWithFX = (usdAmount: number, showCents = false): string => {
    return formatMoney(usdAmount, activeCurrency, showCents);
  };

  const addAuditLog = (entry: Omit<AuditLogEntry, "id" | "timestamp">) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: `${timeStr} today`,
    };

    setAuditLogs((prev) => {
      const updated = [newEntry, ...prev];
      try {
        localStorage.setItem("calyx_audit_logs", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const exportAuditLogsToCSV = () => {
    const headers = ["Timestamp", "Event", "Category", "Actor", "Role", "IP Address", "Target", "Severity", "Details"];
    const rows = auditLogs.map((log) => [
      `"${log.timestamp}"`,
      `"${log.event}"`,
      `"${log.category}"`,
      `"${log.actor}"`,
      `"${log.actorRole}"`,
      `"${log.ipAddress}"`,
      `"${log.target}"`,
      `"${log.severity}"`,
      `"${log.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `calyx-audit-trail-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addInvoice = (newInvoice: Invoice) => {
    setInvoices((prev) => {
      const updated = [newInvoice, ...prev];
      try {
        localStorage.setItem("calyx_invoices", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    addAuditLog({
      event: "invoice.created",
      category: "invoice",
      actor: user?.name || "Workspace Admin",
      actorRole: user?.role === "admin" ? "Admin" : "Billing",
      ipAddress: "127.0.0.1 (Local Session)",
      target: newInvoice.number,
      severity: "info",
      details: `Created invoice ${newInvoice.number} for ${newInvoice.customerName} (${newInvoice.customerCompany}) amounting to $${newInvoice.amount.toFixed(2)}.`,
    });
  };

  const deleteInvoice = (id: string) => {
    const target = invoices.find((i) => i.id === id);
    setInvoices((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      try {
        localStorage.setItem("calyx_invoices", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    if (target) {
      addAuditLog({
        event: "invoice.deleted",
        category: "invoice",
        actor: user?.name || (user?.company ? `${user.company} Admin` : "Workspace Admin"),
        actorRole: user?.role === "admin" ? "Admin" : "Billing",
        ipAddress: "127.0.0.1 (Local Session)",
        target: target.number,
        severity: "warning",
        details: `Deleted invoice ${target.number} ($${target.amount.toFixed(2)}) for ${target.customerCompany}.`,
      });
    }
  };

  const deleteInvoices = (ids: string[]) => {
    const targetNumbers = invoices.filter((i) => ids.includes(i.id)).map((i) => i.number);
    setInvoices((prev) => {
      const updated = prev.filter((i) => !ids.includes(i.id));
      try {
        localStorage.setItem("calyx_invoices", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    addAuditLog({
      event: "invoice.bulk_deleted",
      category: "invoice",
      actor: user?.name || (user?.company ? `${user.company} Admin` : "Workspace Admin"),
      actorRole: user?.role === "admin" ? "Admin" : "Billing",
      ipAddress: "127.0.0.1 (Local Session)",
      target: `${ids.length} Invoices`,
      severity: "warning",
      details: `Bulk deleted ${ids.length} invoices: ${targetNumbers.join(", ")}.`,
    });
  };

  const addCustomer = (newCustomer: Customer) => {
    setCustomers((prev) => {
      const updated = [newCustomer, ...prev];
      try {
        localStorage.setItem("calyx_customers", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    addAuditLog({
      event: "customer.created",
      category: "subscription",
      actor: user?.name || (user?.company ? `${user.company} Admin` : "Workspace Admin"),
      actorRole: user?.role === "admin" ? "Admin" : "Billing",
      ipAddress: "127.0.0.1 (Local Session)",
      target: newCustomer.company,
      severity: "info",
      details: `Registered new organization ${newCustomer.company} (${newCustomer.plan}).`,
    });
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      try {
        localStorage.setItem("calyx_customers", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const dispatchWebhookSimulation = async (
    templateId: string
  ): Promise<{ success: boolean; template: WebhookTemplate; responseTimeMs: number; signature: string }> => {
    const template = WEBHOOK_TEMPLATES.find((t) => t.id === templateId) || WEBHOOK_TEMPLATES[0];
    const latency = Math.floor(Math.random() * 30) + 25; // 25-55ms
    const signature = `t=${Math.floor(Date.now() / 1000)},v1=${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;

    await new Promise((res) => setTimeout(res, latency));

    setDispatchedEventsCount((prev) => prev + 1);

    // Apply real side-effect to state based on event
    if (template.eventType === "invoice.paid") {
      setInvoices((prev) =>
        prev.map((inv) => (inv.status === "pending" || inv.status === "past_due" ? { ...inv, status: "paid" } : inv))
      );
    }

    addAuditLog({
      event: `webhook.${template.eventType}`,
      category: "developer",
      actor: "Webhook Simulation Dispatcher",
      actorRole: "Developer Console",
      ipAddress: "54.187.205.11 (Stripe Ingestion Gateway)",
      target: template.eventType,
      severity: template.eventType.includes("fail") ? "warning" : "info",
      details: `Simulated webhook event ${template.eventType} executed in ${latency}ms with HMAC-SHA256 signature.`,
    });

    return {
      success: true,
      template,
      responseTimeMs: latency,
      signature,
    };
  };

  const addToast = (toast: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <UIStateContext.Provider
      value={{
        billingCycle,
        setBillingCycle,
        activeCurrency,
        setActiveCurrency: handleSetCurrency,
        convertAmount,
        formatMoneyWithFX,
        toasts,
        addToast,
        removeToast,
        invoices,
        addInvoice,
        deleteInvoice,
        deleteInvoices,
        customers,
        addCustomer,
        updateCustomer,
        auditLogs,
        addAuditLog,
        exportAuditLogsToCSV,
        webhookTemplates: WEBHOOK_TEMPLATES,
        dispatchedEventsCount,
        dispatchWebhookSimulation,
        isDemoData,
        loadDemoData,
        resetWorkspace,
        liveMRR,
        liveSubscribers,
        liveARPU,
        liveChurn,
      }}
    >
      {children}
    </UIStateContext.Provider>
  );
}

export function useUIState() {
  const context = useContext(UIStateContext);
  if (!context) {
    throw new Error("useUIState must be used within a UIStateProvider");
  }
  return context;
}
