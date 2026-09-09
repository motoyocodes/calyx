# Calyx — Subscription Billing & Recurring Revenue Intelligence

> **Production-grade SaaS billing, MRR analytics, and subscription lifecycle management platform.** Built with Next.js 16 (App Router), TypeScript, and Tailwind CSS.

---

## 1. Overview

**Calyx** is a modern subscription billing and recurring revenue platform built for SaaS founders and financial operations teams. It provides real-time telemetry into monthly recurring revenue (MRR), churn analysis, invoice lifecycle automation, and team subscription tier management.

Designed with an organic-modern botanical aesthetic, Calyx balances dense financial data presentation with an elegant, warm interface—featuring a warm canvas (`#FAF9F6`), deep botanical forest accents (`#2D5A43`), soft coral alerts (`#D96B4F`), and warm gray dividers (`#E8E6E0`).

---

## 2. Core Features & Architecture

### 1. Dashboard Overview (`/`)
- **Key Performance Metrics:** Real-time tracking of Monthly Recurring Revenue ($48,250, +14.2%), Net Revenue Churn (1.1%, -0.4%), Active Subscriptions (428), and Average Revenue Per User ($112.70) with dynamic 30-day SVG sparkline trajectories.
- **Revenue Performance Visualizer:** Interactive monthly breakdown (Total MRR, Net New MRR, Contraction/Churn) with interactive hover tooltips, subscriber metrics, and automated sync.
- **Plan Distribution Breakdown:** Multi-tier revenue allocation (Scale 52%, Growth 36%, Starter 12%) alongside core SaaS health ratios (Quick Ratio 3.8x, LTV/CAC 4.2x).
- **Recent Invoices Ledger:** Direct inspection of settled billing cycles with instant slide-over drawer details.

### 2. Invoices & Accounts Receivable (`/invoices`)
- **Status Filtering:** Fast filtering across `All`, `Paid`, `Pending`, `Past Due`, and `Draft` statuses with live counter badges.
- **Multi-Field Search & Column Sorting:** Filter by customer name, company, email, or invoice number, with bidirectional sorting by Date, Amount, and Customer.
- **Batch Export:** Multi-select invoice checkboxes for bulk CSV reporting.
- **Slide-Over Detail Drawer (`InvoiceDrawer`):** Itemized line breakdown, VAT/tax calculations, audit timeline, and one-click PDF generation.

### 3. Subscription Plans & Quotas (`/subscriptions`)
- **Dynamic Billing Cadence:** Seamless toggle between Monthly and Annual billing (with automated 20% annual discount calculations).
- **Tier Comparison:** Starter ($29/mo), Growth ($89/mo — "Most Popular"), and Scale ($249/mo).
- **Live Resource Quota Meters:** Real-time progress trackers for Team Seats (14/20 allocated), Tracked MRR ($48.2k/$100k capacity), and Monthly Webhook Ingestion (184k/500k events).
- **Interactive Upgrade Flow (`UpgradeModal`):** Instant calculation of prorated credits for unused cycle days and immediate tier upgrade confirmation.

### 4. Billing, Payment & Team Settings (`/settings`)
- **Payment Method Vault:** Visual EMV chip card component preview with cardholder details, expiration countdown, and default payment switcher.
- **Organization & Tax Information:** Live-validated Tax/VAT identification checking, company address, and AP billing email.
- **Delivery & Dunning Preferences:** Automated email receipts and smart 7-day card expiration alerts.
- **Team Seat Manager:** Member management with role-based access control (`Owner`, `Billing Admin`, `Developer`, `Viewer`) and an interactive **Invite Member** dialog.

---

## 3. Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Typography & Formatting:** Tabular numeric figures and currency localization

---

## 4. Local Development

```bash
# Install dependencies
npm install

# Run the local development server
npm run dev

# Open http://localhost:3000 in your browser
```

---

## 5. Production Build

```bash
# Validate TypeScript and generate optimized static build
npm run build

# Start production server
npm run start
```
