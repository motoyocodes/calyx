"use client";

import React, { useState } from "react";
import { useUIState } from "@/context/UIStateContext";
import { useAuth } from "@/context/AuthContext";
import { TEAM_MEMBERS, TeamMember } from "@/lib/data";
import TwoFactorModal from "@/components/settings/TwoFactorModal";
import DunningModal from "@/components/settings/DunningModal";
import {
  CreditCard,
  Building2,
  Mail,
  Shield,
  ShieldCheck,
  Key,
  RotateCcw,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  Bell,
  X,
  Sliders,
} from "lucide-react";

export default function SettingsPage() {
  const { addToast, formatMoneyWithFX } = useUIState();
  const { user } = useAuth();

  // 2FA & Dunning modal states
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [showDunningModal, setShowDunningModal] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState("Synthetix AI, Inc.");
  const [billingEmail, setBillingEmail] = useState("billing@synthetix.ai");
  const [address, setAddress] = useState("548 Market Street, Suite 9200");
  const [city, setCity] = useState("San Francisco");
  const [postalCode, setPostalCode] = useState("94104");
  const [country, setCountry] = useState("United States");
  const [taxId, setTaxId] = useState("US-EIN-84-2918402");
  const [taxIdValid, setTaxIdValid] = useState(true);

  // Email notifications toggles
  const [emailReceipts, setEmailReceipts] = useState(true);
  const [dunningAlerts, setDunningAlerts] = useState(true);

  // Team state
  const [team, setTeam] = useState<TeamMember[]>(TEAM_MEMBERS);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamMember["role"]>("Billing Admin");

  const handleTaxIdChange = (val: string) => {
    setTaxId(val);
    setTaxIdValid(val.length >= 6);
  };

  const handleSaveBilling = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      title: "Settings Saved",
      description: "Organization and VAT details successfully updated.",
      type: "success",
    });
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const newMember: TeamMember = {
      id: `user-${Date.now()}`,
      name: inviteName || inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole,
      avatar: (inviteName || inviteEmail.substring(0, 2)).toUpperCase().slice(0, 2),
      status: "Pending",
      joinedDate: "Today",
    };

    setTeam((prev) => [...prev, newMember]);
    setShowInviteModal(false);
    setInviteEmail("");
    setInviteName("");

    addToast({
      title: `Invited ${newMember.email}`,
      description: `Role assigned: ${newMember.role}. Activation link emailed.`,
      type: "success",
    });
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
          <span>Synthetix AI</span>
          <span>/</span>
          <span className="text-stone-900 font-semibold">Settings</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 mt-1">
          Billing, Payment & Team Settings
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Configure payment methods, invoice VAT identifiers, receipt preferences, and team seats.
        </p>
      </div>

      {/* Section 1: Payment Method Card */}
      <section aria-label="Payment Methods" className="bg-white rounded-2xl border border-[#E8E6E0] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F0EFEA]">
          <div>
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#2D5A43]" />
              <span>Payment Methods</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Primary card used for automated recurring monthly & annual renewals.
            </p>
          </div>
          <button
            onClick={() => {
              addToast({
                title: "Update Payment Method",
                description: "Secure Stripe Elements dialog opened.",
                type: "info",
              });
            }}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#2D5A43] text-white hover:bg-[#1F4231] shadow-xs transition-colors self-start sm:self-auto"
          >
            + Add New Card
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Visual Credit Card Preview */}
          <div className="relative h-52 w-full max-w-sm rounded-2xl p-6 text-white shadow-xl bg-gradient-to-tr from-[#14201A] via-[#1F3328] to-[#2D5A43] border border-[#3E5C4B] flex flex-col justify-between overflow-hidden group">
            {/* Card background embellishment */}
            <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute top-0 right-0 p-6 flex items-center gap-2">
              <span className="font-mono text-xs font-bold tracking-widest uppercase opacity-80">
                CALYX VAULT
              </span>
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-[#EB001B] opacity-90" />
                <div className="w-6 h-6 rounded-full bg-[#F79E1B] opacity-90" />
              </div>
            </div>

            {/* EMV Chip */}
            <div className="w-10 h-7 rounded-md bg-gradient-to-r from-amber-200 to-amber-400 border border-amber-500/30 shadow-xs flex items-center justify-center">
              <div className="w-7 h-5 border border-amber-700/40 rounded-sm" />
            </div>

            {/* Card Number */}
            <div>
              <div className="font-mono text-lg tracking-widest font-semibold flex gap-3 text-stone-100">
                <span>••••</span>
                <span>••••</span>
                <span>••••</span>
                <span className="text-white font-bold">4829</span>
              </div>
              <div className="flex justify-between items-end mt-4 text-[10px] uppercase font-mono tracking-wider text-stone-300">
                <div>
                  <span className="block opacity-60 text-[9px]">Cardholder</span>
                  <span className="font-bold text-white text-xs">SARAH LIN</span>
                </div>
                <div>
                  <span className="block opacity-60 text-[9px]">Expires</span>
                  <span className="font-bold text-white text-xs">09 / 28</span>
                </div>
              </div>
            </div>
          </div>

          {/* Backup cards list */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border-2 border-[#2D5A43]/40 bg-[#EBF3EE]/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-7 rounded bg-white border border-[#E8E6E0] flex items-center justify-center font-bold text-[10px] text-stone-800">
                  MC
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900 flex items-center gap-2">
                    <span>Mastercard ending in 4829</span>
                    <span className="text-[10px] px-2 py-0.2 bg-[#2D5A43] text-white rounded-full font-mono">
                      Default
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500">Expires 09/2028 • Auto-renewal active</div>
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-[#2D5A43]" />
            </div>

            <div className="p-3.5 rounded-xl border border-[#E8E6E0] bg-[#FAF9F6] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-7 rounded bg-white border border-[#E8E6E0] flex items-center justify-center font-bold text-[10px] text-blue-700 font-serif">
                  VISA
                </div>
                <div>
                  <div className="text-xs font-semibold text-stone-800">Visa ending in 1104</div>
                  <div className="text-[11px] text-stone-500">Expires 11/2027 • Backup method</div>
                </div>
              </div>
              <button
                onClick={() =>
                  addToast({
                    title: "Default Card Switched",
                    description: "Visa ending in 1104 set as default.",
                    type: "success",
                  })
                }
                className="text-xs font-semibold text-[#2D5A43] hover:underline"
              >
                Set Default
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Organization & Billing Address Form */}
      <section aria-label="Billing Details" className="bg-white rounded-2xl border border-[#E8E6E0] p-6 shadow-xs">
        <div className="pb-6 border-b border-[#F0EFEA]">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#2D5A43]" />
            <span>Organization & Tax Details</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            This information will appear on your generated invoices, receipts, and VAT filings.
          </p>
        </div>

        <form onSubmit={handleSaveBilling} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Legal Entity Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] focus:border-[#2D5A43] focus:bg-white outline-hidden text-stone-900 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Accounts Payable Email
              </label>
              <input
                type="email"
                value={billingEmail}
                onChange={(e) => setBillingEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] focus:border-[#2D5A43] focus:bg-white outline-hidden text-stone-900 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Registered Street Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] focus:border-[#2D5A43] focus:bg-white outline-hidden text-stone-900 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] focus:border-[#2D5A43] focus:bg-white outline-hidden text-stone-900 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Postal / Zip Code
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] focus:border-[#2D5A43] focus:bg-white outline-hidden text-stone-900 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] focus:border-[#2D5A43] focus:bg-white outline-hidden text-stone-900 transition-all"
              />
            </div>
          </div>

          {/* Tax / VAT Identification with validation */}
          <div className="pt-2">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-stone-700">
                Tax / VAT Identification Number
              </label>
              <span
                className={`text-[10px] font-medium ${
                  taxIdValid ? "text-emerald-700" : "text-rose-600"
                }`}
              >
                {taxIdValid ? "✓ Valid Format Verified" : "⚠ Please enter a valid Tax/VAT ID"}
              </span>
            </div>
            <input
              type="text"
              value={taxId}
              onChange={(e) => handleTaxIdChange(e.target.value)}
              className={`w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-[#FAF9F6] border focus:bg-white outline-hidden transition-all ${
                taxIdValid
                  ? "border-[#E8E6E0] focus:border-[#2D5A43]"
                  : "border-rose-300 focus:border-rose-500"
              }`}
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#2D5A43] text-white text-xs font-semibold rounded-xl hover:bg-[#1F4231] shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-emerald-200" />
              <span>Save Billing Preferences</span>
            </button>
          </div>
        </form>
      </section>

      {/* Section 3: Notification Preferences */}
      <section aria-label="Notification Preferences" className="bg-white rounded-2xl border border-[#E8E6E0] p-6 shadow-xs">
        <div className="pb-4 border-b border-[#F0EFEA]">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#2D5A43]" />
            <span>Invoice Delivery & Alerts</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Automated communication hooks for failed payments and settled receipts.
          </p>
        </div>

        <div className="mt-4 space-y-3">
          <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF9F6] border border-[#F0EFEA] cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-stone-900">
                Email receipts upon successful payment
              </div>
              <div className="text-[11px] text-stone-500">
                Sends full itemized PDF copy directly to {billingEmail}
              </div>
            </div>
            <input
              type="checkbox"
              checked={emailReceipts}
              onChange={(e) => setEmailReceipts(e.target.checked)}
              className="w-4 h-4 text-[#2D5A43] rounded border-stone-300 focus:ring-[#2D5A43]"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF9F6] border border-[#F0EFEA] cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-stone-900">
                Smart Dunning & Card Expiration Alerts
              </div>
              <div className="text-[11px] text-stone-500">
                Notify 7 days before automated renewal if card is expiring
              </div>
            </div>
            <input
              type="checkbox"
              checked={dunningAlerts}
              onChange={(e) => setDunningAlerts(e.target.checked)}
              className="w-4 h-4 text-[#2D5A43] rounded border-stone-300 focus:ring-[#2D5A43]"
            />
          </label>
        </div>
      </section>

      {/* Section 4: Two-Factor Authentication & Operator Security */}
      <section aria-label="Security & Authentication" className="bg-white rounded-2xl border border-[#E8E6E0] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F0EFEA]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2D5A43]" />
                <span>Two-Factor Authentication (2FA)</span>
              </h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  user?.twoFactorEnabled
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-amber-100 text-amber-800 border border-amber-300"
                }`}
              >
                {user?.twoFactorEnabled ? "Active & Enforced" : "Not Configured"}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Secure operator access with time-based one-time passwords (TOTP) and single-use emergency backup recovery keys.
            </p>
          </div>
          <button
            onClick={() => setShowTwoFactorModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#2D5A43] text-white hover:bg-[#1F4231] shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-emerald-200" />
            <span>{user?.twoFactorEnabled ? "Manage 2FA & Backup Codes" : "Enable 2FA Protection"}</span>
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-stone-400 font-semibold tracking-wider">
                Authentication Standard
              </span>
              <div className="text-xs font-bold text-stone-900 mt-1">RFC 6238 (TOTP)</div>
              <p className="text-[11px] text-stone-500 mt-1">
                Works with Google Authenticator, 1Password, Authy, and hardware tokens.
              </p>
            </div>
            <div className="mt-3 text-[10px] text-emerald-700 font-medium">✓ Cryptographic verification</div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-stone-400 font-semibold tracking-wider">
                Emergency Backup
              </span>
              <div className="text-xs font-bold text-stone-900 mt-1">8 Single-Use Keys</div>
              <p className="text-[11px] text-stone-500 mt-1">
                Offline alphanumeric recovery keys stored for device loss contingencies.
              </p>
            </div>
            <div className="mt-3 text-[10px] text-stone-500 font-medium">Auto-generated upon activation</div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-stone-400 font-semibold tracking-wider">
                Account Status
              </span>
              <div className="text-xs font-bold text-stone-900 mt-1">{user?.email || "Admin Account"}</div>
              <p className="text-[11px] text-stone-500 mt-1">
                Role: <span className="font-semibold text-stone-700 capitalize">{user?.role || "admin"}</span>
              </p>
            </div>
            <div className="mt-3 text-[10px] text-stone-500 font-medium">Session token active</div>
          </div>
        </div>
      </section>

      {/* Section 5: Dunning Management & Automated Payment Recovery */}
      <section aria-label="Dunning & Recovery" className="bg-white rounded-2xl border border-[#E8E6E0] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F0EFEA]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#2D5A43]" />
                <span>Dunning Management & Payment Recovery</span>
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wider">
                Smart Retries Active
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Automate invoice reattempts, recovery notices, and grace periods to eliminate voluntary customer churn.
            </p>
          </div>
          <button
            onClick={() => setShowDunningModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-[#E8E6E0] hover:bg-[#FAF9F6] text-stone-700 shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-stone-500" />
            <span>Configure Dunning Protocol</span>
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E8E6E0]">
            <span className="text-[10px] font-mono uppercase text-stone-400 font-semibold tracking-wider">
              Retry Cadence
            </span>
            <div className="text-sm font-bold text-stone-900 mt-1">Days 1, 3, and 7</div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              3 automated card charges with exponential backoff before service escalation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E8E6E0]">
            <span className="text-[10px] font-mono uppercase text-stone-400 font-semibold tracking-wider">
              90-Day Recovery Rate
            </span>
            <div className="text-sm font-bold text-[#2D5A43] mt-1">78.4% Recovered</div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Over {formatMoneyWithFX(6480)} in recurring MRR retained via smart dunning.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E8E6E0]">
            <span className="text-[10px] font-mono uppercase text-stone-400 font-semibold tracking-wider">
              Customer Grace Period
            </span>
            <div className="text-sm font-bold text-stone-900 mt-1">7 Days Grace Access</div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Workspaces retain active subscription access while payment method is re-verified.
            </p>
          </div>
        </div>
      </section>

      {/* Section 6: Team Member Seat Manager */}
      <section aria-label="Team Seats" className="bg-white rounded-2xl border border-[#E8E6E0] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F0EFEA]">
          <div>
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#2D5A43]" />
              <span>Team Member Seats & Roles</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              4 of 20 allocated seats assigned. Manage billing permissions.
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#2D5A43] text-white hover:bg-[#1F4231] shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Invite Member</span>
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8E6E0] text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                <th className="py-3 px-2">Member</th>
                <th className="py-3 px-2">Role</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2">Joined</th>
                <th className="py-3 px-2 text-right">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EFEA] text-xs">
              {team.map((member) => (
                <tr key={member.id} className="hover:bg-[#FAF9F6]">
                  <td className="py-3.5 px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#2D5A43] text-white flex items-center justify-center font-bold text-xs">
                        {member.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-stone-900">{member.name}</div>
                        <div className="text-[11px] text-stone-500 font-mono">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-2 font-medium text-stone-700">{member.role}</td>
                  <td className="py-3.5 px-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        member.status === "Active"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-2 text-stone-500">{member.joinedDate}</td>
                  <td className="py-3.5 px-2 text-right">
                    {member.role === "Owner" ? (
                      <span className="text-[11px] text-stone-400 font-mono">Full Access</span>
                    ) : (
                      <button
                        onClick={() => {
                          setTeam((prev) => prev.filter((m) => m.id !== member.id));
                          addToast({
                            title: "Member Removed",
                            description: `${member.name} access revoked.`,
                            type: "info",
                          });
                        }}
                        className="text-stone-400 hover:text-rose-600 p-1 rounded transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#E8E6E0] shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E6E0]">
              <h3 className="text-base font-bold text-stone-900">Invite Team Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteMember} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] focus:border-[#2D5A43] focus:bg-white outline-hidden text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Work Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="alex@synthetix.ai"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] focus:border-[#2D5A43] focus:bg-white outline-hidden text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Role & Permissions
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as TeamMember["role"])}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] focus:border-[#2D5A43] focus:bg-white outline-hidden text-stone-900"
                >
                  <option value="Owner">Admin (Full Control & Financial Ledger Access)</option>
                  <option value="Billing Admin">Billing (Subscriptions & Settings Access)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 py-2.5 bg-[#FAF9F6] border border-[#E8E6E0] rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#2D5A43] text-white rounded-xl text-xs font-semibold hover:bg-[#1F4231] shadow-xs"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Two Factor Configuration Modal */}
      <TwoFactorModal
        isOpen={showTwoFactorModal}
        onClose={() => setShowTwoFactorModal(false)}
      />

      {/* Dunning Management Modal */}
      <DunningModal
        isOpen={showDunningModal}
        onClose={() => setShowDunningModal(false)}
      />
    </div>
  );
}
