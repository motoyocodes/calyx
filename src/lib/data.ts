import { InvoiceStatus } from "./utils";

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  number: string;
  customerName: string;
  customerEmail: string;
  customerCompany: string;
  avatarUrl?: string;
  amount: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  planName: string;
  billingPeriod: string;
  paymentMethod: string;
  taxRate: number;
  items: InvoiceItem[];
}

export interface MetricCardData {
  id: string;
  title: string;
  value: string;
  changePercent: number;
  changeType: "positive" | "negative" | "neutral";
  changeDescription: string;
  timeframe: string;
  sparklineData: number[];
}

export interface RevenueMonth {
  month: string;
  shortMonth: string;
  mrr: number;
  netNew: number;
  churn: number;
  newCustomers: number;
}

export interface PlanTier {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPriceMonthly: number;
  popular?: boolean;
  features: string[];
  ctaText: string;
  seatLimit: string;
  revenueLimit: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Billing Admin" | "Developer" | "Viewer";
  avatar: string;
  status: "Active" | "Pending" | "Inactive";
  joinedDate: string;
}

export const INITIAL_METRICS: MetricCardData[] = [
  {
    id: "mrr",
    title: "Monthly Recurring Revenue",
    value: "$48,250",
    changePercent: 14.2,
    changeType: "positive",
    changeDescription: "+$5,980 from last month",
    timeframe: "vs. previous 30 days",
    sparklineData: [38200, 39500, 41000, 42100, 43800, 45200, 48250],
  },
  {
    id: "churn",
    title: "Net Revenue Churn",
    value: "1.1%",
    changePercent: -0.4,
    changeType: "positive", // A drop in churn is good!
    changeDescription: "-0.4% lower than industry benchmark",
    timeframe: "vs. previous 30 days",
    sparklineData: [1.8, 1.6, 1.5, 1.4, 1.3, 1.2, 1.1],
  },
  {
    id: "active_subscribers",
    title: "Active Subscriptions",
    value: "428",
    changePercent: 8.9,
    changeType: "positive",
    changeDescription: "+36 net new accounts",
    timeframe: "vs. previous 30 days",
    sparklineData: [360, 372, 385, 394, 405, 412, 428],
  },
  {
    id: "arpu",
    title: "Average Revenue Per User",
    value: "$112.70",
    changePercent: 4.8,
    changeType: "positive",
    changeDescription: "+$5.20 plan expansion",
    timeframe: "vs. previous 30 days",
    sparklineData: [98, 102, 104, 107, 109, 110, 112.7],
  },
];

export const REVENUE_HISTORY: RevenueMonth[] = [
  { month: "Oct 2025", shortMonth: "Oct", mrr: 36400, netNew: 3200, churn: 420, newCustomers: 22 },
  { month: "Nov 2025", shortMonth: "Nov", mrr: 38800, netNew: 2800, churn: 400, newCustomers: 24 },
  { month: "Dec 2025", shortMonth: "Dec", mrr: 40500, netNew: 2100, churn: 450, newCustomers: 19 },
  { month: "Jan 2026", shortMonth: "Jan", mrr: 42100, netNew: 2200, churn: 380, newCustomers: 26 },
  { month: "Feb 2026", shortMonth: "Feb", mrr: 44600, netNew: 2900, churn: 390, newCustomers: 28 },
  { month: "Mar 2026", shortMonth: "Mar", mrr: 46100, netNew: 2300, churn: 340, newCustomers: 30 },
  { month: "Apr 2026", shortMonth: "Apr", mrr: 48250, netNew: 2950, churn: 320, newCustomers: 36 },
];

export const SAMPLE_INVOICES: Invoice[] = [
  {
    id: "inv-001",
    number: "INV-2026-089",
    customerName: "Elena Rostova",
    customerEmail: "elena@neuralarc.io",
    customerCompany: "NeuralArc Systems",
    amount: 1490.0,
    status: "paid",
    issueDate: "2026-04-02",
    dueDate: "2026-04-16",
    planName: "Scale Tier (Annual)",
    billingPeriod: "Apr 2026 - Apr 2027",
    paymentMethod: "Mastercard •••• 4829",
    taxRate: 0.08,
    items: [
      { id: "item-1", description: "Scale Tier Annual License (25 seats)", quantity: 1, unitPrice: 1380.0, total: 1380.0 },
      { id: "item-2", description: "Priority Slack SLA & Dedicated Tam", quantity: 1, unitPrice: 110.0, total: 110.0 },
    ],
  },
  {
    id: "inv-002",
    number: "INV-2026-088",
    customerName: "Marcus Vance",
    customerEmail: "marcus@halyard.io",
    customerCompany: "Halyard Analytics",
    amount: 890.0,
    status: "paid",
    issueDate: "2026-04-01",
    dueDate: "2026-04-15",
    planName: "Growth Tier (Annual)",
    billingPeriod: "Apr 2026 - Apr 2027",
    paymentMethod: "Visa •••• 9210",
    taxRate: 0.0,
    items: [
      { id: "item-1", description: "Growth Plan Annual Subscription (10 seats)", quantity: 1, unitPrice: 890.0, total: 890.0 },
    ],
  },
  {
    id: "inv-003",
    number: "INV-2026-087",
    customerName: "Claire Beauchamp",
    customerEmail: "c.beauchamp@luminahealth.com",
    customerCompany: "Lumina Health",
    amount: 249.0,
    status: "pending",
    issueDate: "2026-03-31",
    dueDate: "2026-04-14",
    planName: "Scale Tier (Monthly)",
    billingPeriod: "Apr 1, 2026 - May 1, 2026",
    paymentMethod: "ACH Direct Debit",
    taxRate: 0.05,
    items: [
      { id: "item-1", description: "Scale Tier Monthly Seat (Unlimited seats)", quantity: 1, unitPrice: 249.0, total: 249.0 },
    ],
  },
  {
    id: "inv-004",
    number: "INV-2026-086",
    customerName: "Devon Chen",
    customerEmail: "devon@kineticlabs.co",
    customerCompany: "Kinetic Labs",
    amount: 89.0,
    status: "past_due",
    issueDate: "2026-03-24",
    dueDate: "2026-04-07",
    planName: "Growth Tier (Monthly)",
    billingPeriod: "Mar 24, 2026 - Apr 24, 2026",
    paymentMethod: "Visa •••• 1044",
    taxRate: 0.0,
    items: [
      { id: "item-1", description: "Growth Tier Monthly Subscription", quantity: 1, unitPrice: 89.0, total: 89.0 },
    ],
  },
  {
    id: "inv-005",
    number: "INV-2026-085",
    customerName: "Aiden Thorne",
    customerEmail: "thorne@palisadecapital.org",
    customerCompany: "Palisade Capital",
    amount: 2490.0,
    status: "paid",
    issueDate: "2026-03-22",
    dueDate: "2026-04-05",
    planName: "Enterprise Custom Tier",
    billingPeriod: "Apr 2026 - Oct 2026",
    paymentMethod: "Wire Transfer #9941",
    taxRate: 0.0,
    items: [
      { id: "item-1", description: "Enterprise Core Architecture + Custom Webhooks", quantity: 1, unitPrice: 2490.0, total: 2490.0 },
    ],
  },
  {
    id: "inv-006",
    number: "INV-2026-084",
    customerName: "Sophia Martinez",
    customerEmail: "sophia@novacore.app",
    customerCompany: "Novacore Studios",
    amount: 29.0,
    status: "draft",
    issueDate: "2026-04-04",
    dueDate: "2026-04-18",
    planName: "Starter Tier (Monthly)",
    billingPeriod: "Apr 4, 2026 - May 4, 2026",
    paymentMethod: "Pending selection",
    taxRate: 0.0,
    items: [
      { id: "item-1", description: "Starter Tier Prototyping License", quantity: 1, unitPrice: 29.0, total: 29.0 },
    ],
  },
  {
    id: "inv-007",
    number: "INV-2026-083",
    customerName: "Liam O'Connor",
    customerEmail: "liam@veridian.tech",
    customerCompany: "Veridian Bio",
    amount: 89.0,
    status: "paid",
    issueDate: "2026-03-18",
    dueDate: "2026-04-01",
    planName: "Growth Tier (Monthly)",
    billingPeriod: "Mar 18, 2026 - Apr 18, 2026",
    paymentMethod: "Mastercard •••• 7712",
    taxRate: 0.0,
    items: [
      { id: "item-1", description: "Growth Tier Subscription License", quantity: 1, unitPrice: 89.0, total: 89.0 },
    ],
  },
  {
    id: "inv-008",
    number: "INV-2026-082",
    customerName: "Amara Diallo",
    customerEmail: "amara@koyosystems.com",
    customerCompany: "Koyo Systems",
    amount: 540.0,
    status: "past_due",
    issueDate: "2026-03-12",
    dueDate: "2026-03-26",
    planName: "Growth Tier + 5 Addon Seats",
    billingPeriod: "Mar 12, 2026 - Apr 12, 2026",
    paymentMethod: "American Express •••• 3008",
    taxRate: 0.0,
    items: [
      { id: "item-1", description: "Growth Tier Base Monthly", quantity: 1, unitPrice: 89.0, total: 89.0 },
      { id: "item-2", description: "Dedicated Seat Expansion (5 seats)", quantity: 5, unitPrice: 90.2, total: 451.0 },
    ],
  },
];

export const PLAN_TIERS: PlanTier[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Essential revenue tracking and automated invoicing for early-stage startups.",
    monthlyPrice: 29,
    annualPriceMonthly: 24,
    seatLimit: "Up to 3 team members",
    revenueLimit: "$10k tracked MRR limit",
    features: [
      "Real-time MRR & Churn Tracking",
      "Stripe & Paddle Webhook Ingestion",
      "Automated PDF Invoices (Standard)",
      "Customer Portal & Receipts",
      "Community Slack Support",
    ],
    ctaText: "Current Plan",
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "Advanced cohort metrics, automated dunning, and team seat permissions.",
    monthlyPrice: 89,
    annualPriceMonthly: 72,
    popular: true,
    seatLimit: "Up to 15 team members",
    revenueLimit: "$100k tracked MRR limit",
    features: [
      "Everything in Starter, plus:",
      "Automated Smart Dunning & Churn Prevention",
      "Multi-Currency & VAT Compliance Rules",
      "Custom Brandable Invoices & White-labeling",
      "Cohort Churn & LTV Analysis",
      "Webhook Retries & Audit Logs",
      "Priority 4-Hour Email Support",
    ],
    ctaText: "Upgrade to Growth",
  },
  {
    id: "scale",
    name: "Scale",
    tagline: "Full financial intelligence, custom webhook piping, and dedicated enterprise SLA.",
    monthlyPrice: 249,
    annualPriceMonthly: 199,
    seatLimit: "Unlimited team members",
    revenueLimit: "Unlimited tracked MRR",
    features: [
      "Everything in Growth, plus:",
      "Custom Contract & Annual Billing Cycles",
      "Dedicated Technical Account Manager",
      "99.99% Uptime SLA & Custom Agreements",
      "Real-time BI Data Warehousing Sync (Snowflake/BigQuery)",
      "Single Sign-On (SAML / Okta / Azure AD)",
      "1-Hour Priority Slack Escalation",
    ],
    ctaText: "Upgrade to Scale",
  },
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "user-1",
    name: "Sarah Lin",
    email: "sarah@calyxmetrics.com",
    role: "Owner",
    avatar: "SL",
    status: "Active",
    joinedDate: "Jan 12, 2025",
  },
  {
    id: "user-2",
    name: "Marcus Vance",
    email: "marcus.v@calyxmetrics.com",
    role: "Billing Admin",
    avatar: "MV",
    status: "Active",
    joinedDate: "Feb 03, 2025",
  },
  {
    id: "user-3",
    name: "Elena Rostova",
    email: "elena.r@calyxmetrics.com",
    role: "Developer",
    avatar: "ER",
    status: "Active",
    joinedDate: "Mar 19, 2025",
  },
  {
    id: "user-4",
    name: "David K.",
    email: "david.k@calyxmetrics.com",
    role: "Viewer",
    avatar: "DK",
    status: "Pending",
    joinedDate: "Apr 01, 2026",
  },
];

// ==========================================
// 1. Customer Directory Models & Sample Data
// ==========================================
export type CustomerHealth = "active" | "past_due" | "at_risk" | "churned";

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  avatar: string;
  plan: string;
  mrr: number;
  ltv: number;
  status: CustomerHealth;
  joinedDate: string;
  country: string;
  paymentMethod: string;
  totalInvoices: number;
  vatNumber?: string;
  address?: string;
  phone?: string;
}

export const SAMPLE_CUSTOMERS: Customer[] = [
  {
    id: "cust-001",
    name: "Elena Rostova",
    company: "NeuralArc Systems",
    email: "elena@neuralarc.io",
    avatar: "NA",
    plan: "Scale Tier (Annual)",
    mrr: 1490.0,
    ltv: 17880.0,
    status: "active",
    joinedDate: "Jan 14, 2025",
    country: "United States",
    paymentMethod: "Mastercard •••• 4829",
    totalInvoices: 14,
    vatNumber: "US-EIN-94-3829104",
    address: "742 Montgomery St, Suite 400, San Francisco, CA",
    phone: "+1 (415) 892-0192",
  },
  {
    id: "cust-002",
    name: "Marcus Vance",
    company: "Halyard Analytics",
    email: "marcus@halyard.io",
    avatar: "HA",
    plan: "Growth Tier (Annual)",
    mrr: 890.0,
    ltv: 10680.0,
    status: "active",
    joinedDate: "Feb 02, 2025",
    country: "United Kingdom",
    paymentMethod: "Visa •••• 9210",
    totalInvoices: 12,
    vatNumber: "GB-VAT-891029481",
    address: "14 Holborn Viaduct, London EC1A 2AT",
    phone: "+44 20 7946 0912",
  },
  {
    id: "cust-003",
    name: "Amara Diallo",
    company: "Koyo Systems",
    email: "amara@koyosystems.de",
    avatar: "KS",
    plan: "Starter Tier (Monthly)",
    mrr: 240.0,
    ltv: 1440.0,
    status: "past_due",
    joinedDate: "Jul 18, 2025",
    country: "Germany",
    paymentMethod: "Visa •••• 1042",
    totalInvoices: 6,
    vatNumber: "DE-381920194",
    address: "Friedrichstraße 43, 10117 Berlin",
    phone: "+49 30 901820",
  },
  {
    id: "cust-004",
    name: "Soren Lindqvist",
    company: "Nordic Telemetry",
    email: "soren@nordictelemetry.se",
    avatar: "NT",
    plan: "Enterprise Custom SLA",
    mrr: 2490.0,
    ltv: 29880.0,
    status: "active",
    joinedDate: "Aug 29, 2024",
    country: "Sweden",
    paymentMethod: "SEPA Direct Debit",
    totalInvoices: 18,
    vatNumber: "SE-556123456701",
    address: "Kungsgatan 12, 111 35 Stockholm",
    phone: "+46 8 123 456 78",
  },
  {
    id: "cust-005",
    name: "Julian Vance",
    company: "Vortex Robotics",
    email: "julian@vortexrobotics.ai",
    avatar: "VR",
    plan: "Growth Tier (Annual)",
    mrr: 890.0,
    ltv: 5340.0,
    status: "at_risk",
    joinedDate: "Nov 11, 2025",
    country: "United States",
    paymentMethod: "AMEX •••• 3004",
    totalInvoices: 7,
    vatNumber: "US-EIN-81-2940192",
    address: "500 Technology Square, Cambridge, MA",
    phone: "+1 (617) 495-1000",
  },
  {
    id: "cust-006",
    name: "Maya Patel",
    company: "Quantix Labs",
    email: "maya@quantixlabs.ca",
    avatar: "QL",
    plan: "Scale Tier (Annual)",
    mrr: 1490.0,
    ltv: 11920.0,
    status: "active",
    joinedDate: "May 04, 2025",
    country: "Canada",
    paymentMethod: "Mastercard •••• 8812",
    totalInvoices: 9,
    vatNumber: "CA-GST-920194012RT0001",
    address: "250 Yonge St, Toronto, ON M5B 2L7",
    phone: "+1 (416) 978-2011",
  },
];

// ==========================================
// 2. Audit Trail Models & Sample Data
// ==========================================
export type AuditSeverity = "info" | "warning" | "critical";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  event: string;
  category: "auth" | "invoice" | "subscription" | "settings" | "security" | "developer";
  actor: string;
  actorRole: string;
  ipAddress: string;
  target: string;
  severity: AuditSeverity;
  details: string;
}

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "aud-001",
    timestamp: "Just now",
    event: "auth.login_success",
    category: "auth",
    actor: "Admin User",
    actorRole: "Admin",
    ipAddress: "192.168.1.42 (US-East)",
    target: "Session Token #cx_jwt_live",
    severity: "info",
    details: "Authenticated via password credentials with active session token.",
  },
  {
    id: "aud-002",
    timestamp: "12m ago",
    event: "invoice.created",
    category: "invoice",
    actor: "Admin User",
    actorRole: "Admin",
    ipAddress: "192.168.1.42 (US-East)",
    target: "INV-2026-089",
    severity: "info",
    details: "Issued $1,490.00 receivable to Elena Rostova (NeuralArc Systems).",
  },
  {
    id: "aud-003",
    timestamp: "45m ago",
    event: "security.2fa_enabled",
    category: "security",
    actor: "Admin User",
    actorRole: "Admin",
    ipAddress: "192.168.1.42 (US-East)",
    target: "TOTP Authenticator",
    severity: "info",
    details: "Two-factor authentication bound; 8 emergency recovery codes generated.",
  },
  {
    id: "aud-004",
    timestamp: "1h ago",
    event: "subscription.tier_upgraded",
    category: "subscription",
    actor: "Billing Operator",
    actorRole: "Billing",
    ipAddress: "192.168.2.19 (EU-West)",
    target: "NeuralArc Systems",
    severity: "info",
    details: "License upgraded from Growth Tier ($890/mo) to Scale Tier ($1,490/mo).",
  },
  {
    id: "aud-005",
    timestamp: "3h ago",
    event: "invoice.charge_failed",
    category: "invoice",
    actor: "Stripe Webhook Gateway",
    actorRole: "System",
    ipAddress: "54.187.205.11 (US-West)",
    target: "INV-2026-087",
    severity: "warning",
    details: "Automated recurring charge of $540.00 for Koyo Systems declined (insufficient_funds). Dunning cycle initiated.",
  },
  {
    id: "aud-006",
    timestamp: "5h ago",
    event: "settings.tax_id_verified",
    category: "settings",
    actor: "Admin User",
    actorRole: "Admin",
    ipAddress: "192.168.1.42 (US-East)",
    target: "US-EIN-84-2918402",
    severity: "info",
    details: "Corporate EIN validated against IRS tax identifier registry.",
  },
  {
    id: "aud-007",
    timestamp: "8h ago",
    event: "auth.rate_limit_blocked",
    category: "security",
    actor: "Unknown Remote Client",
    actorRole: "Unauthenticated",
    ipAddress: "185.220.101.5 (Tor Exit Node)",
    target: "/api/auth/login",
    severity: "critical",
    details: "Repeated failed authentication attempts intercepted by security rate limiter.",
  },
  {
    id: "aud-008",
    timestamp: "14h ago",
    event: "export.revenue_report",
    category: "developer",
    actor: "Admin User",
    actorRole: "Admin",
    ipAddress: "192.168.1.42 (US-East)",
    target: "calyx-revenue-report.csv",
    severity: "info",
    details: "Exported historical recurring revenue telemetry ledger (Oct 2025 - Apr 2026).",
  },
];

// ==========================================
// 3. Webhook Simulation Templates
// ==========================================
export interface WebhookTemplate {
  id: string;
  eventType: string;
  label: string;
  description: string;
  defaultPayload: Record<string, unknown>;
}

export const WEBHOOK_TEMPLATES: WebhookTemplate[] = [
  {
    id: "wh-01",
    eventType: "invoice.paid",
    label: "Invoice Paid (invoice.paid)",
    description: "Fires whenever an invoice receivable is successfully paid by a client.",
    defaultPayload: {
      id: "evt_inv_paid_928104",
      object: "event",
      api_version: "2026-03-01",
      created: 1775088000,
      type: "invoice.paid",
      data: {
        object: {
          id: "inv-001",
          number: "INV-2026-089",
          customer_name: "Elena Rostova",
          customer_company: "NeuralArc Systems",
          amount_paid: 149000,
          currency: "usd",
          paid: true,
          status: "paid",
          charge_id: "ch_3Pq94819401",
          payment_method: "Mastercard •••• 4829",
        },
      },
    },
  },
  {
    id: "wh-02",
    eventType: "invoice.payment_failed",
    label: "Payment Failed (invoice.payment_failed)",
    description: "Fires when an automated payment method charge attempt is declined.",
    defaultPayload: {
      id: "evt_inv_fail_381029",
      object: "event",
      api_version: "2026-03-01",
      created: 1775089200,
      type: "invoice.payment_failed",
      data: {
        object: {
          id: "inv-003",
          number: "INV-2026-087",
          customer_name: "Amara Diallo",
          customer_company: "Koyo Systems",
          amount_due: 54000,
          attempt_count: 2,
          decline_code: "insufficient_funds",
          next_retry_at: 1775175600,
          dunning_step: 1,
        },
      },
    },
  },
  {
    id: "wh-03",
    eventType: "customer.subscription.renewed",
    label: "Subscription Renewed (subscription.renewed)",
    description: "Fires upon successful recurring contract renewal and MRR recognition.",
    defaultPayload: {
      id: "evt_sub_ren_749102",
      object: "event",
      api_version: "2026-03-01",
      created: 1775091400,
      type: "customer.subscription.renewed",
      data: {
        object: {
          subscription_id: "sub_scale_annual_481",
          customer_company: "NeuralArc Systems",
          plan_name: "Scale Tier (Annual)",
          mrr: 149000,
          current_period_start: 1775088000,
          current_period_end: 1806624000,
          status: "active",
        },
      },
    },
  },
  {
    id: "wh-04",
    eventType: "customer.subscription.canceled",
    label: "Subscription Canceled (subscription.canceled)",
    description: "Fires when a customer downgrades, churns, or cancels recurring renewal.",
    defaultPayload: {
      id: "evt_sub_can_109284",
      object: "event",
      api_version: "2026-03-01",
      created: 1775093800,
      type: "customer.subscription.canceled",
      data: {
        object: {
          subscription_id: "sub_growth_annual_910",
          customer_company: "Vortex Robotics",
          plan_name: "Growth Tier (Annual)",
          churn_mrr: 89000,
          cancellation_reason: "consolidation_of_tools",
          ended_at: 1775093800,
        },
      },
    },
  },
];

