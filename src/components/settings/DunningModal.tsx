"use client";

import React, { useState } from "react";
import { useUIState } from "@/context/UIStateContext";
import { useAuth } from "@/context/AuthContext";
import {
  RotateCcw,
  Mail,
  Send,
  CheckCircle2,
  Calendar,
  AlertCircle,
  X,
  Settings2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

interface DunningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DunningModal({ isOpen, onClose }: DunningModalProps) {
  const { addToast, addAuditLog, formatMoneyWithFX } = useUIState();
  const { user } = useAuth();

  // Dunning protocol configuration state
  const [maxRetries, setMaxRetries] = useState<number>(3);
  const [retryIntervals, setRetryIntervals] = useState<string>("1, 3, 7");
  const [finalAction, setFinalAction] = useState<"cancel" | "mark_uncollectible" | "pause">("mark_uncollectible");
  const [emailGracePeriodDays, setEmailGracePeriodDays] = useState<number>(7);
  const [customSubject, setCustomSubject] = useState(
    "Urgent: Action required on your {{company_name}} payment"
  );
  const [isSendingTest, setIsSendingTest] = useState(false);

  if (!isOpen) return null;

  const sampleCustomer = {
    name: "Elena Rostova",
    company: "NeuralArc Systems",
    email: "elena@neuralarc.ai",
    amount: 1490,
    invoiceNumber: "INV-2026-089",
    daysOverdue: 3,
  };

  const handleSendTestEmail = () => {
    setIsSendingTest(true);
    setTimeout(() => {
      setIsSendingTest(false);
      addAuditLog({
        event: "dunning.test_email_dispatched",
        category: "settings",
        actor: user?.name || "Admin Operator",
        actorRole: user?.role === "admin" ? "Admin" : "Billing",
        ipAddress: "192.168.1.42 (US-East)",
        target: sampleCustomer.invoiceNumber,
        severity: "info",
        details: `Dispatched test dunning recovery notification for invoice ${sampleCustomer.invoiceNumber} to ${sampleCustomer.email}.`,
      });
      addToast({
        title: "Test Dunning Email Sent",
        description: `Delivered formatted recovery preview to ${sampleCustomer.email}.`,
        type: "success",
      });
    }, 750);
  };

  const handleSaveProtocol = (e: React.FormEvent) => {
    e.preventDefault();
    addAuditLog({
      event: "dunning.protocol_updated",
      category: "settings",
      actor: user?.name || "Admin Operator",
      actorRole: user?.role === "admin" ? "Admin" : "Billing",
      ipAddress: "192.168.1.42 (US-East)",
      target: "Dunning Protocol",
      severity: "info",
      details: `Configured automated dunning recovery: ${maxRetries} retries over ${retryIntervals} days, final action: ${finalAction}.`,
    });
    addToast({
      title: "Dunning Rules Updated",
      description: "Automated payment retry schedule & webhook escalation saved.",
      type: "success",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#E8E6E0] shadow-2xl max-w-2xl w-full p-6 my-8 animate-in zoom-in-95 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E6E0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EBF3EE] text-[#2D5A43] flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Dunning & Payment Recovery</h3>
              <p className="text-[11px] text-stone-500">
                Automated credit card retry intervals and customer retention hooks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSaveProtocol} className="mt-5 space-y-5">
          {/* Recovery Stats highlight */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-[#FAF9F6] border border-[#E8E6E0] rounded-2xl">
              <span className="text-[10px] uppercase font-mono text-stone-500 tracking-wider">
                Automated Recovery
              </span>
              <div className="text-xl font-bold text-[#2D5A43] mt-0.5">78.4%</div>
              <p className="text-[10px] text-stone-400 mt-0.5">Saved before cancellation</p>
            </div>
            <div className="p-3 bg-[#FAF9F6] border border-[#E8E6E0] rounded-2xl">
              <span className="text-[10px] uppercase font-mono text-stone-500 tracking-wider">
                Recovered MRR
              </span>
              <div className="text-xl font-bold text-stone-900 mt-0.5">
                {formatMoneyWithFX(6480)}
              </div>
              <p className="text-[10px] text-stone-400 mt-0.5">Past 90 calendar days</p>
            </div>
            <div className="p-3 bg-[#FAF9F6] border border-[#E8E6E0] rounded-2xl">
              <span className="text-[10px] uppercase font-mono text-stone-500 tracking-wider">
                Smart Retries
              </span>
              <div className="text-xl font-bold text-emerald-700 mt-0.5">Active</div>
              <p className="text-[10px] text-stone-400 mt-0.5">Stripe ML cadence engine</p>
            </div>
          </div>

          {/* Retry Cadence Settings */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Smart Retry Schedule
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Maximum Reattempts
                </label>
                <select
                  value={maxRetries}
                  onChange={(e) => setMaxRetries(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] focus:border-[#2D5A43] focus:bg-white outline-hidden text-stone-900"
                >
                  <option value={2}>2 attempts (Conservative)</option>
                  <option value={3}>3 attempts (Recommended)</option>
                  <option value={4}>4 attempts (Aggressive)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Schedule (Days After Decline)
                </label>
                <input
                  type="text"
                  value={retryIntervals}
                  onChange={(e) => setRetryIntervals(e.target.value)}
                  placeholder="1, 3, 7"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] focus:border-[#2D5A43] focus:bg-white outline-hidden text-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Action If All Retries Fail
              </label>
              <select
                value={finalAction}
                onChange={(e) => setFinalAction(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF9F6] border border-[#E8E6E0] focus:border-[#2D5A43] focus:bg-white outline-hidden text-stone-900"
              >
                <option value="mark_uncollectible">
                  Mark invoice uncollectible & retain subscription in grace period
                </option>
                <option value="cancel">Immediately cancel subscription & revoke service access</option>
                <option value="pause">Pause subscription collection & trigger support webhook</option>
              </select>
            </div>
          </div>

          {/* Email Template Preview */}
          <div className="space-y-2 pt-2 border-t border-[#F0EFEA]">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#2D5A43]" />
                <span>Customer Recovery Email Preview</span>
              </h4>
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={isSendingTest}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2D5A43] hover:text-[#1F4231] hover:underline cursor-pointer disabled:opacity-50"
              >
                <Send className={`w-3 h-3 ${isSendingTest ? "animate-pulse" : ""}`} />
                <span>{isSendingTest ? "Sending..." : "Send Test Email"}</span>
              </button>
            </div>

            {/* Email mock envelope */}
            <div className="rounded-2xl border border-[#E8E6E0] bg-[#FAF9F6] p-4 text-xs space-y-3 font-sans">
              <div className="pb-2 border-b border-[#E8E6E0] space-y-1">
                <div className="flex text-stone-500 text-[11px]">
                  <span className="w-16 font-semibold text-stone-600">To:</span>
                  <span className="text-stone-800 font-mono">
                    {sampleCustomer.name} &lt;{sampleCustomer.email}&gt;
                  </span>
                </div>
                <div className="flex text-stone-500 text-[11px]">
                  <span className="w-16 font-semibold text-stone-600">Subject:</span>
                  <span className="text-stone-900 font-medium">
                    Payment failed for {user?.company || "Workspace"} — Update billing information
                  </span>
                </div>
              </div>

              {/* Email Body Card */}
              <div className="bg-white rounded-xl p-4 border border-[#E8E6E0] shadow-xs space-y-3 text-stone-700 text-xs leading-relaxed">
                <p>Hello {sampleCustomer.name},</p>
                <p>
                  We were unable to process your recurring payment of{" "}
                  <strong>{formatMoneyWithFX(sampleCustomer.amount)}</strong> for invoice{" "}
                  <strong className="font-mono">{sampleCustomer.invoiceNumber}</strong> with your card on file.
                </p>
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-amber-900 flex items-start gap-2 text-[11px]">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    Your workspace is currently in a <strong>{emailGracePeriodDays}-day grace period</strong>.
                    To ensure uninterrupted API access and team licenses, please update your billing method.
                  </div>
                </div>
                <div className="pt-2">
                  <div className="inline-block px-4 py-2 bg-[#2D5A43] text-white font-semibold rounded-xl text-xs text-center shadow-xs">
                    Update Payment Method & Pay {formatMoneyWithFX(sampleCustomer.amount)}
                  </div>
                </div>
                <p className="text-[11px] text-stone-400 pt-2 border-t border-[#F0EFEA]">
                  {user?.company || "Organization"} • Automated Billing Telemetry • Secure 256-bit TLS Gateway
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-[#E8E6E0] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#FAF9F6] border border-[#E8E6E0] rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#2D5A43] text-white rounded-xl text-xs font-semibold hover:bg-[#1F4231] shadow-xs transition-colors"
            >
              Save Dunning Protocol
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
