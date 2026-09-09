"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
}

const UIStateContext = createContext<UIStateContextType | undefined>(undefined);

export function UIStateProvider({ children }: { children: ReactNode }) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [activeCurrency, setActiveCurrency] = useState<CurrencyCode>("USD");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>(SAMPLE_INVOICES);
  const [customers, setCustomers] = useState<Customer[]>(SAMPLE_CUSTOMERS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [dispatchedEventsCount, setDispatchedEventsCount] = useState(0);

  // Load persisted state on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedInvoices = localStorage.getItem("calyx_invoices");
        if (savedInvoices) {
          const parsed = JSON.parse(savedInvoices);
          if (Array.isArray(parsed) && parsed.length > 0) setInvoices(parsed);
        }

        const savedCurrency = localStorage.getItem("calyx_currency") as CurrencyCode;
        if (savedCurrency && FX_RATES[savedCurrency]) {
          setActiveCurrency(savedCurrency);
        }

        const savedCustomers = localStorage.getItem("calyx_customers");
        if (savedCustomers) {
          const parsed = JSON.parse(savedCustomers);
          if (Array.isArray(parsed) && parsed.length > 0) setCustomers(parsed);
        }

        const savedAudit = localStorage.getItem("calyx_audit_logs");
        if (savedAudit) {
          const parsed = JSON.parse(savedAudit);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const cleaned = parsed.map((item: any) => ({
              ...item,
              actor:
                item.actor === "Sarah Lin"
                  ? "Admin Operator"
                  : item.actor === "Marcus Vance"
                  ? "Billing Operator"
                  : item.actor,
            }));
            setAuditLogs(cleaned);
          }
        }
      } catch {
        // fallback
      }
    }
  }, []);

  const handleSetCurrency = (currency: CurrencyCode) => {
    setActiveCurrency(currency);
    try {
      localStorage.setItem("calyx_currency", currency);
    } catch {
      // ignore
    }
    addAuditLog({
      event: "settings.currency_changed",
      category: "settings",
      actor: "Workspace User",
      actorRole: "Admin",
      ipAddress: "192.168.1.42 (US-East)",
      target: currency,
      severity: "info",
      details: `Active reporting currency switched to ${currency} (${FX_RATES[currency].label}).`,
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
      actor: "Active User",
      actorRole: "Admin",
      ipAddress: "192.168.1.42 (US-East)",
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
        actor: "Active User",
        actorRole: "Admin",
        ipAddress: "192.168.1.42 (US-East)",
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
      actor: "Active User",
      actorRole: "Admin",
      ipAddress: "192.168.1.42 (US-East)",
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
      actor: "Active User",
      actorRole: "Admin",
      ipAddress: "192.168.1.42 (US-East)",
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
