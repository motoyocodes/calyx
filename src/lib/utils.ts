import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type CurrencyCode = "USD" | "EUR" | "GBP" | "JPY" | "CAD";

export const FX_RATES: Record<
  CurrencyCode,
  { rate: number; symbol: string; label: string }
> = {
  USD: { rate: 1.0, symbol: "$", label: "USD ($)" },
  EUR: { rate: 0.92, symbol: "€", label: "EUR (€)" },
  GBP: { rate: 0.79, symbol: "£", label: "GBP (£)" },
  JPY: { rate: 152.4, symbol: "¥", label: "JPY (¥)" },
  CAD: { rate: 1.36, symbol: "CA$", label: "CAD ($)" },
};

export function formatMoney(
  amountInUSD: number,
  currency: CurrencyCode = "USD",
  showCents = false
): string {
  const fx = FX_RATES[currency] || FX_RATES.USD;
  const converted = amountInUSD * fx.rate;
  const isJpy = currency === "JPY";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: isJpy ? 0 : showCents ? 2 : 0,
    maximumFractionDigits: isJpy ? 0 : showCents ? 2 : 0,
  }).format(converted);
}

export function formatCurrency(
  amount: number,
  options?: { showCents?: boolean; currency?: string }
): string {
  const { showCents = false, currency = "USD" } = options || {};
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(amount);
}

export function formatPercentage(value: number): string {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

export type InvoiceStatus = "paid" | "pending" | "past_due" | "draft";

export interface InvoiceStatusConfig {
  label: string;
  dotColor: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export const INVOICE_STATUS_MAP: Record<InvoiceStatus, InvoiceStatusConfig> = {
  paid: {
    label: "Paid",
    dotColor: "bg-emerald-600",
    bgColor: "bg-emerald-50/80",
    textColor: "text-emerald-800",
    borderColor: "border-emerald-200",
  },
  pending: {
    label: "Pending",
    dotColor: "bg-amber-500",
    bgColor: "bg-amber-50/80",
    textColor: "text-amber-800",
    borderColor: "border-amber-200",
  },
  past_due: {
    label: "Past Due",
    dotColor: "bg-rose-500",
    bgColor: "bg-rose-50/80",
    textColor: "text-rose-800",
    borderColor: "border-rose-200",
  },
  draft: {
    label: "Draft",
    dotColor: "bg-stone-400",
    bgColor: "bg-stone-100",
    textColor: "text-stone-700",
    borderColor: "border-stone-200",
  },
};

export function formatAuditEventName(rawEvent: string): string {
  const map: Record<string, string> = {
    "export.revenue_report": "Revenue Report Exported",
    "export.revenue_csv": "Revenue Report Exported",
    "export.invoices_csv": "Invoices CSV Exported",
    "export.audit_csv": "Audit Trail Exported",
    "auth.login_success": "User Login Successful",
    "auth.signup_success": "Account Registered",
    "auth.logout": "User Signed Out",
    "auth.rate_limit_blocked": "Suspicious IP Blocked",
    "invoice.created": "Invoice Issued",
    "invoice.deleted": "Invoice Deleted",
    "invoice.bulk_deleted": "Invoices Bulk Deleted",
    "invoice.paid": "Invoice Marked Paid",
    "invoice.charge_failed": "Recurring Charge Declined",
    "customer.created": "Customer Created",
    "customer.updated": "Customer Updated",
    "security.2fa_enabled": "Two-Factor Auth Enabled",
    "security.2fa_disabled": "Two-Factor Auth Disabled",
    "subscription.tier_upgraded": "Subscription Tier Upgraded",
    "subscription.renewed": "Subscription Renewed",
    "settings.tax_id_verified": "Corporate Tax ID Verified",
    "settings.billing_updated": "Billing Details Saved",
    "settings.currency_changed": "Display Currency Changed",
    "dunning.test_email_dispatched": "Recovery Notice Test Dispatched",
    "dunning.protocol_updated": "Dunning Retry Schedule Configured",
    "webhook.invoice.paid": "Webhook: Invoice Paid",
    "webhook.invoice.payment_failed": "Webhook: Payment Failed",
    "webhook.customer.subscription.renewed": "Webhook: Subscription Renewed",
    "webhook.customer.subscription.deleted": "Webhook: Subscription Canceled",
    "webhook.charge.dispute.created": "Webhook: Charge Dispute Created",
  };

  if (map[rawEvent]) return map[rawEvent];

  if (rawEvent.startsWith("webhook.")) {
    const sub = rawEvent.replace("webhook.", "").replace(/[._]/g, " ");
    return `Webhook: ${sub.replace(/\b\w/g, (c) => c.toUpperCase())}`;
  }

  return rawEvent
    .replace(/[._]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
